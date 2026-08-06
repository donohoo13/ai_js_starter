#!/usr/bin/env node
// PreToolUse guard: blocks Claude from starting dev servers, preview servers,
// tunnels, or service containers — servers are user-run, per CLAUDE.md. The
// deny message routes the session to the sanctioned behavior: hand the user
// the ready-to-run command and wait. A gate, not a seal: a script that spawns
// a server evades the pattern list, and the CLAUDE.md rule covers what
// patterns cannot. Exit 2 blocks the tool call and surfaces stderr to Claude;
// exit 0 allows it. If the hook itself fails to launch, Claude Code treats the
// non-0/non-2 exit as a non-blocking error and the command proceeds:
// fail-open by design, same trade as guard-main.
import { readFileSync } from 'node:fs';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const command = input.tool_input?.command ?? '';
if (!command) process.exit(0);

// Blank quoted spans in one quote-aware pass: content inside quotes is data
// (commit messages, echo text) and may mention server commands. Same
// single-pass approach as guard-main; escaped quotes are not modeled.
function blankQuotes(cmd) {
  let out = '';
  let quote = null;
  for (const ch of cmd) {
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    out += ch;
  }
  return out;
}

// Script runners: their dev-ish script arguments are what start servers.
const RUNNERS = new Set(['pnpm', 'npm', 'yarn', 'bun', 'turbo']);
// Runner subcommands that manage packages rather than run scripts; a segment
// like `pnpm add vite` installs a server binary without starting anything.
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
]);
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
const ALWAYS_SERVER = new Set(['ngrok', 'webpack-dev-server', 'http-server', 'live-server']);

function isDevScript(token) {
  return token === 'dev' || token.startsWith('dev:');
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
  while (start < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[start])) start++;
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

  if ((bin === 'docker' || bin === 'podman') && positionals[0] === 'compose') {
    return positionals.includes('up') ? `${bin} compose up` : null;
  }
  if (bin === 'docker-compose') {
    return positionals.includes('up') ? 'docker-compose up' : null;
  }

  if (RUNNERS.has(bin)) {
    if (positionals.length > 0 && RUNNER_PACKAGE_OPS.has(positionals[0])) return null;
    for (let i = 0; i < positionals.length; i++) {
      const token = positionals[i];
      if (token === 'run' || token === 'exec' || token === bin) continue;
      if (isDevScript(token)) return `${bin} ${token}`;
      if (ALWAYS_SERVER.has(token)) return `${bin} ${token}`;
      if (SERVER_UNLESS.has(token)) {
        const next = positionals[i + 1];
        if (next === undefined || !SERVER_UNLESS.get(token).has(next)) return `${bin} ${token}`;
      }
      if (SERVER_SUBCOMMANDS.has(token) && SERVER_SUBCOMMANDS.get(token).has(positionals[i + 1])) {
        return `${bin} ${token} ${positionals[i + 1]}`;
      }
    }
  }

  return null;
}

let offender = null;
for (const segment of blankQuotes(command).split(/&&|\|\||[;|\n\r]/)) {
  offender = findServerStart(segment);
  if (offender) break;
}

if (!offender) process.exit(0);

console.error(
  `Blocked by guard-dev-server hook: \`${offender}\` starts a server, and servers are user-run (CLAUDE.md). Hand the user the ready-to-run command for their own terminal (the ! prefix runs it in-session) and wait; run verification only against a server the user started.`,
);
process.exit(2);
