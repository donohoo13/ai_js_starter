#!/usr/bin/env node
// PreToolUse guard: blocks Claude from running `git commit` or `git push` while
// on the repo's default branch, with one narrow exemption for publishing an
// existing tag (see isTagOnlyPush below) so the release process stays reachable.
// Complements the static permissions.deny push patterns in settings.json, which
// cannot see runtime state like the current branch. Exit 2 blocks the tool call and surfaces stderr to Claude; exit 0
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
      subcommands.push({ name: token, args: tokens.slice(j + 1) });
      i = j;
      break;
    }
  }
}

const hits = subcommands.filter((s) => s.name === 'commit' || s.name === 'push');
if (hits.length === 0) process.exit(0);

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

// Publishing a release tag is the one push that belongs on the default branch:
// the repo's release process puts vX.Y.Z on the default branch's tip, and a tag
// ref moves no commits onto it, so blocking it would forbid a workflow this repo
// mandates while protecting nothing. The exemption is deliberately narrow — the
// ref must resolve to a tag that already exists locally and must not also name a
// branch, so an ambiguous or invented name falls through to the block. Anything
// that could move a branch or rewrite a published tag (force, --mirror, --all,
// --follow-tags, deletes, src:dst refspecs) stays blocked.
const PUSH_ESCALATIONS = new Set([
  '--force',
  '-f',
  '--force-with-lease',
  '--force-if-includes',
  '--mirror',
  '--all',
  '--follow-tags',
  '--delete',
  '-d',
  '--prune',
]);

function isTagOnlyPush(args) {
  // Stop at the first redirection: `git push origin v1.0.1 2>&1 | tail` reaches
  // here as tokens ending in `2>&1`, which would otherwise be read as a refspec,
  // fail the tag lookup, and block a legitimate publish. Git forbids `<` and `>`
  // in ref names, so nothing after one can be a ref. Pipes and `&&` are already
  // segment separators upstream.
  const redirect = args.findIndex((token) => /[<>]/.test(token) || token === '&');
  const effective = redirect === -1 ? args : args.slice(0, redirect);

  const positionals = [];
  let sawTagsFlag = false;

  for (const token of effective) {
    if (token.startsWith('-')) {
      if (token === '--tags') sawTagsFlag = true;
      else if (PUSH_ESCALATIONS.has(token)) return false;
      continue;
    }
    positionals.push(token);
  }

  // First positional is the remote; everything after it is a refspec.
  const refs = positionals.slice(1);
  if (refs.some((ref) => ref.includes(':'))) return false; // deletes and src:dst
  if (refs.length === 0) return sawTagsFlag; // `git push origin --tags`

  return refs.every((ref) => {
    const name = ref.replace(/^refs\/tags\//, '');
    try {
      git(['rev-parse', '--verify', '--quiet', `refs/tags/${name}`]);
    } catch {
      return false; // not an existing tag
    }
    try {
      git(['rev-parse', '--verify', '--quiet', `refs/heads/${name}`]);
      return false; // also a branch name: ambiguous, refuse
    } catch {
      return true;
    }
  });
}

const blocked = hits.find((h) => h.name === 'commit' || !isTagOnlyPush(h.args));
if (!blocked) process.exit(0);

const detail =
  blocked.name === 'push'
    ? ' Only publishing an existing tag (`git push <remote> <tag>` or `--tags`) is exempt here.'
    : '';
console.error(
  `Blocked by guard-main hook: \`git ${blocked.name}\` on ${current}. CLAUDE.md: never commit to main; create or switch to a feature branch, or hand the commit to the user via stage-for-commit.${detail}`,
);
process.exit(2);
