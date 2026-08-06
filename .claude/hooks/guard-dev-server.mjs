#!/usr/bin/env node
// PreToolUse guard: blocks Claude from starting dev servers, preview servers,
// tunnels, or service containers — servers are user-run, per CLAUDE.md. The
// deny message routes the session to the sanctioned behavior: hand the user
// the ready-to-run command and wait. A gate, not a seal: a script that spawns
// a server evades the pattern list, and the CLAUDE.md rule covers what
// patterns cannot. The settings.json prefilter matches the whole tool-call
// payload (cwd and description included), not the command alone: over-match
// costs one node spawn, under-match silently drops a block, so broad is the
// deliberate direction. Exit 2 blocks the tool call and surfaces stderr to
// Claude; exit 0 allows it. If the hook itself fails to launch, Claude Code
// treats the non-0/non-2 exit as a non-blocking error and the command
// proceeds: fail-open by design, same trade as guard-main.
import { readFileSync } from 'node:fs';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const command = input?.tool_input?.command ?? '';
if (!command) process.exit(0);

// Quote handling: a quoted span usually hides data (commit messages, echo
// text) and may contain separators, so spans are dropped before segment
// splitting — except a span that is one bare word (`pnpm run "dev"`), which
// is kept: a single word cannot hide a separator, and dropping it blinds the
// scan to quoted script names. An unterminated quote re-scans its tail as
// unquoted text — the input is not the well-formed shell this models, and
// failing toward inspection beats silently skipping the rest of a multiline
// batch. Escaped quotes are not modeled.
function blankQuotes(cmd) {
  let out = '';
  let quote = null;
  let span = '';
  let openIndex = -1;
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
        if (/^[\w.:@/-]+$/.test(span)) out += span;
      } else {
        span += ch;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      span = '';
      openIndex = i;
      continue;
    }
    out += ch;
  }
  if (quote !== null) out += blankQuotes(cmd.slice(openIndex + 1));
  return out;
}

// Wrapper binaries that pass their tail through unchanged; skipped (with
// their flags) before resolving the command, same as env assignments.
const WRAPPERS = new Set(['env', 'nohup', 'time', 'command', 'setsid', 'exec']);
// Script runners: their server-ish script arguments are what start servers.
const RUNNERS = new Set(['pnpm', 'npm', 'yarn', 'bun', 'turbo']);
// Runner subcommands that manage or inspect packages rather than run scripts;
// a segment like `pnpm add vite` or `npm view vite` names a server binary
// without starting anything.
const RUNNER_PACKAGE_OPS = new Set([
  'add',
  'install',
  'i',
  'remove',
  'rm',
  'uninstall',
  'update',
  'up',
  'upgrade',
  'outdated',
  'audit',
  'why',
  'list',
  'ls',
  'link',
  'unlink',
  'patch',
  'config',
  'store',
  'licenses',
  'publish',
  'pack',
  'view',
  'info',
  'show',
  'search',
  'docs',
  'help',
  'explain',
  'create',
  'init',
]);
// Script names that start servers when a runner invokes them.
const SERVER_SCRIPTS = new Set(['dev', 'start', 'serve', 'preview']);
// Binaries whose invocation is a server unless the first non-flag argument
// names a non-serving mode (build).
const SERVER_UNLESS = new Map([
  ['vite', new Set(['build'])],
  ['storybook', new Set(['build'])],
]);
// Binaries that serve only under specific subcommands.
const SERVER_SUBCOMMANDS = new Map([
  ['next', new Set(['dev', 'start'])],
  ['astro', new Set(['dev', 'preview'])],
  ['remix', new Set(['dev'])],
  ['nuxt', new Set(['dev', 'preview'])],
  ['expo', new Set(['start'])],
  ['wrangler', new Set(['dev'])],
  ['supabase', new Set(['start'])],
  ['cloudflared', new Set(['tunnel'])],
  ['webpack', new Set(['serve'])],
]);
// Binaries whose whole job is serving or tunneling: any invocation blocks.
const ALWAYS_SERVER = new Set([
  'ngrok',
  'webpack-dev-server',
  'http-server',
  'live-server',
  'serve',
]);

function isServerScript(token) {
  if (SERVER_SCRIPTS.has(token)) return true;
  return token.includes(':') && SERVER_SCRIPTS.has(token.split(':', 1)[0]);
}

function nonFlag(tokens) {
  return tokens.filter((token) => !token.startsWith('-'));
}

// Returns the offending spelling when the segment starts a server, else null.
function findServerStart(segment) {
  const tokens = segment
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[({]+/, '').replace(/[)}]+$/, ''))
    .filter(Boolean);
  let start = 0;
  while (start < tokens.length) {
    const token = tokens[start];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(token)) {
      start++;
      continue;
    }
    if (WRAPPERS.has(token)) {
      start++;
      while (start < tokens.length && tokens[start].startsWith('-')) start++;
      continue;
    }
    break;
  }
  if (start >= tokens.length) return null;

  const bin = tokens[start].split('/').pop();
  const args = tokens.slice(start + 1);
  const positionals = nonFlag(args);

  if (ALWAYS_SERVER.has(bin)) return bin;

  if (SERVER_UNLESS.has(bin)) {
    return positionals.length > 0 && SERVER_UNLESS.get(bin).has(positionals[0]) ? null : bin;
  }

  if (SERVER_SUBCOMMANDS.has(bin)) {
    return positionals.length > 0 && SERVER_SUBCOMMANDS.get(bin).has(positionals[0])
      ? `${bin} ${positionals[0]}`
      : null;
  }

  if (
    (bin === 'python' || bin === 'python2' || bin === 'python3') &&
    args.includes('http.server')
  ) {
    return `${bin} -m http.server`;
  }

  if (bin === 'docker' || bin === 'podman') {
    if (positionals[0] === 'compose' && positionals.includes('up')) return `${bin} compose up`;
    if (positionals[0] === 'start') return `${bin} start`;
    const detachedOrPublished = args.some(
      (t) =>
        t === '--detach' ||
        t === '--publish' ||
        t.startsWith('--publish=') ||
        (/^-[a-zA-Z]+$/.test(t) && (t.includes('d') || t.includes('p'))),
    );
    if (positionals[0] === 'run' && detachedOrPublished) return `${bin} run (detached/published)`;
    return null;
  }
  if (bin === 'docker-compose') {
    return positionals.includes('up') ? 'docker-compose up' : null;
  }

  if (RUNNERS.has(bin)) {
    for (let i = 0; i < positionals.length; i++) {
      const token = positionals[i];
      if (token === 'run' || token === bin) continue;
      if (RUNNER_PACKAGE_OPS.has(token)) return null;
      if (isServerScript(token)) return `${bin} ${token}`;
      if (ALWAYS_SERVER.has(token)) return `${bin} ${token}`;
      if (SERVER_UNLESS.has(token)) {
        const next = positionals[i + 1];
        return next !== undefined && SERVER_UNLESS.get(token).has(next) ? null : `${bin} ${token}`;
      }
      if (SERVER_SUBCOMMANDS.has(token) && SERVER_SUBCOMMANDS.get(token).has(positionals[i + 1])) {
        return `${bin} ${token} ${positionals[i + 1]}`;
      }
    }
  }

  return null;
}

// `bash -c` payloads are code, not data — CLAUDE.md itself prescribes
// `bash -c` for multiline work — so quoted payloads are rescanned rather
// than blanked. Escaped quotes inside a payload truncate the extraction;
// gate, not seal.
function extractShellPayloads(cmd) {
  const payloads = [];
  const re = /\b(?:bash|sh|zsh|dash|ksh)\b[^\n;|&]*?\s-c\s+(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = re.exec(cmd)) !== null) payloads.push(match[1] ?? match[2]);
  return payloads;
}

function scanCommand(cmd, depth = 0) {
  for (const segment of blankQuotes(cmd).split(/&&|\|\||[;|\n\r]/)) {
    const hit = findServerStart(segment);
    if (hit) return hit;
  }
  if (depth < 3) {
    for (const payload of extractShellPayloads(cmd)) {
      const hit = scanCommand(payload, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

const offender = scanCommand(command);
if (!offender) process.exit(0);

console.error(
  `Blocked by guard-dev-server hook: \`${offender}\` starts a server, and servers are user-run (CLAUDE.md). Hand the user the ready-to-run command for their own terminal (the ! prefix runs it in-session) and wait; run verification only against a server the user started.`,
);
process.exit(2);
