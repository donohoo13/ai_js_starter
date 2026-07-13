#!/usr/bin/env node
// PreToolUse guard: blocks Claude from running `git commit` or `git push` while
// on the repo's default branch. Complements the static permissions.deny push
// patterns in settings.json, which cannot see runtime state like the current
// branch. Exit 2 blocks the tool call and surfaces stderr to Claude; exit 0
// allows it. If the hook itself fails to launch (node missing, bad
// $CLAUDE_PROJECT_DIR), Claude Code treats the non-0/non-2 exit as a
// non-blocking error and the command proceeds: fail-open by design, because a
// launch failure that blocked every Bash call would cost more than the missed
// guard, and the static deny rules remain as backstop.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const command = input.tool_input?.command ?? '';
if (!command.includes('git')) process.exit(0);

// Blank quoted spans in one quote-aware pass: content inside quotes is data
// (commit messages, grep patterns) and may hide separators. Two independent
// regex passes mis-pair an apostrophe inside double quotes with a later single
// quote and can swallow a real `git push`. Escaped quotes are not modeled;
// this is a guardrail against honest mistakes, not a shell parser.
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

// Find every git subcommand across shell segments. Newlines separate commands
// exactly like `;` (multi-line Bash calls are how agents routinely batch git),
// and one segment can invoke git more than once, so scan all tokens instead of
// stopping at the first hit. Global flags with values are skipped so
// `git -C sub commit` is still caught; leading `(`/`{` are stripped so a
// subshell-wrapped git is too.
const FLAGS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);
const subcommands = [];
for (const segment of blankQuotes(command).split(/&&|\|\||[;|\n\r]/)) {
  const tokens = segment.trim().split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const bare = tokens[i].replace(/^[({]+/, '');
    if (bare !== 'git' && !bare.endsWith('/git')) continue;
    for (let j = i + 1; j < tokens.length; j++) {
      const token = tokens[j];
      if (token.startsWith('-')) {
        if (FLAGS_WITH_VALUE.has(token)) j++;
        continue;
      }
      subcommands.push(token);
      i = j;
      break;
    }
  }
}

const hit = subcommands.find((s) => s === 'commit' || s === 'push');
if (!hit) process.exit(0);

const cwd = input.cwd || process.cwd();
const git = (args) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 2000, // a hung git (stalled mount) must not hang the whole agent turn
  }).trim();

let current;
try {
  current = git(['branch', '--show-current']);
} catch {
  process.exit(0); // not a git repo (or git unavailable), nothing to guard
}

let defaultBranch = null;
try {
  defaultBranch = git(['symbolic-ref', 'refs/remotes/origin/HEAD']).split('/').pop() || null;
} catch {
  // no origin/HEAD ref (fresh repo, no remote): fall through to name matching
}

const onDefault = defaultBranch
  ? current === defaultBranch
  : current === 'main' || current === 'master';

if (!onDefault) {
  if (!defaultBranch && current) {
    console.error(
      `guard-main: no origin/HEAD ref; guarding only branches named main/master (current: ${current}).`,
    );
  }
  process.exit(0);
}

console.error(
  `Blocked by guard-main hook: \`git ${hit}\` on ${current}. CLAUDE.md: never commit to main; create or switch to a feature branch, or hand the commit to the user via stage-for-commit.`,
);
process.exit(2);
