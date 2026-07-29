#!/usr/bin/env node
// PreToolUse guard: blocks Edit/Write on governed context docs until the skill
// that owns the file family has been loaded this session. CLAUDE.md: every
// prescriptive context-file edit (CLAUDE.md, CLAUDE.local.md, README.md,
// .claude/rules/, BRAND_DESIGN.md, UI_UX.md) goes through curate-context, and
// the descriptive docs (CONTEXT.md, CONTEXT-MAP.md, ARCHITECTURE.md,
// docs/adr/) go through domain-modeling. Skill descriptions alone
// undertrigger, so this hook is the deterministic backstop — same posture as
// guard-skill-edit. Detection greps the session transcript for a load marker
// (Skill tool call or slash command), and a subagent inherits its root
// session's marker (see transcriptsToSearch). Governance stops at the
// repository boundary (see isGoverned). Exit 2 blocks the tool call and
// surfaces stderr to Claude; exit 0 allows it. Fail-open: an unreadable
// transcript or a hook launch failure must not lock context files shut.
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const rawPath = input.tool_input?.file_path ?? '';
if (!rawPath) process.exit(0);

const cwd = input.cwd || process.cwd();

// Containment compares paths, so both sides must be the same spelling of the
// same inode, and path.resolve is purely lexical — it collapses ../ and anchors
// relative paths but never touches the filesystem. On macOS the session's cwd
// arrives already canonical (/private/tmp/...) while a model may write the
// symlinked spelling (/tmp/...); comparing those two drops governance for the
// whole tree. Canonicalize the longest existing prefix and re-append the rest,
// so a Write to a not-yet-existing file still resolves through its real parent
// directory.
function canonical(target) {
  let head = target;
  let tail = '';
  for (;;) {
    try {
      const real = realpathSync.native(head);
      return tail ? resolve(real, tail) : real;
    } catch {
      const parent = dirname(head);
      if (parent === head) return target; // nothing along the path exists
      tail = tail ? `${basename(head)}/${tail}` : basename(head);
      head = parent;
    }
  }
}

// Normalize before any predicate. resolve() collapses ../ segments so a
// traversal spelling (.claude/skills/../../CLAUDE.md) matches as the file it
// lands on, not the directory it name-drops, and anchors a relative spelling to
// the session's cwd rather than wherever the hook happened to launch.
// Backslashes become slashes so a Windows-style path cannot silently no-op the
// guard; matching is lowercased because macOS APFS is case-insensitive — a
// write to claude.md or Readme.md lands on the governed inode. (The
// settings.json prefilter covers the common case variants only; arbitrary mixed
// case reaches this hook solely when the prefilter happens to match, which is
// acceptable for a guardrail.)
const filePath = canonical(resolve(cwd, rawPath.replaceAll('\\', '/')));
const lowerPath = filePath.toLowerCase();

// Skill-suite files (including .claude/skills/README.md) are guard-skill-edit
// territory; gating them here too would demand two skills for one edit.
if (lowerPath.includes('.claude/skills/')) process.exit(0);

// Vendored content sits inside a governed root without being this project's
// context: a dependency's README.md under node_modules, and the marketplace
// and plugin-cache trees under ~/.claude/plugins/ that the ~/.claude root
// would otherwise sweep in — 1,883 README.md files and 6 CLAUDE.md files on
// the development machine, none of them written by the project that would be
// asked to curate them. A project that commits generated docs under dist/ or a
// vendor/ directory extends this list.
if (lowerPath.includes('/node_modules/') || lowerPath.includes('/.claude/plugins/')) {
  process.exit(0);
}

// Path family → skills whose load marker opens it. Basename matching makes the
// guard monorepo-wide (nested per-package CLAUDE.md/README.md) and reaches the
// user-global ~/.claude/CLAUDE.md; path-scoped rule files under .claude/rules/
// are prescriptive rules by another delivery mechanism, so they get the same
// gate. The docs/adr/ check runs before the basename arms: everything in an
// ADR directory — its index README.md included — is domain-modeling's, and the
// README arm would otherwise claim it for curate-context, which refuses to
// write there. Design docs also open to the grill lenses that legitimately
// write them mid-session. Descriptive docs accept only domain-modeling —
// deliberately not curate-context — so the hook enforces the handoff at the
// descriptive/imperative seam. This dispatch runs before the containment test
// below because it is pure string work and rejects the common case cheaply:
// the settings.json prefilter matches the whole payload, so it forwards every
// edit whose *content* merely mentions a governed basename.
const basenameOf = lowerPath.split('/').pop();
let required = null;
if (lowerPath.includes('docs/adr/')) {
  required = ['domain-modeling'];
} else if (
  basenameOf === 'claude.md' ||
  basenameOf === 'claude.local.md' ||
  basenameOf === 'readme.md' ||
  lowerPath.includes('.claude/rules/')
) {
  required = ['curate-context'];
} else if (basenameOf === 'brand_design.md' || basenameOf === 'ui_ux.md') {
  required = ['curate-context', 'grill-design', 'grill-product'];
} else if (
  basenameOf === 'context.md' ||
  basenameOf === 'context-map.md' ||
  basenameOf === 'architecture.md'
) {
  required = ['domain-modeling'];
}
if (!required) process.exit(0);

// Governance is scoped to the repository, because the arms above match on
// basename and a basename belongs to no project. Unscoped, the guard follows
// the session off the repo entirely and demands a curate-context run for a
// throwaway CONTEXT.md in the session scratchpad, a /tmp note, or a README.md
// in an unrelated checkout — files no context discipline governs.
//
// Two tests, cheapest first. The lexical roots cover the ordinary case: the
// project dir, the session's cwd, and ~/.claude, which holds the user-global
// CLAUDE.md the arms deliberately reach. On a miss, git identity decides,
// because two checkouts of one repository are one governance domain and
// neither root contains the other: gwt-add.sh puts worktrees at
// $HOME/Code/.worktrees/<project>/<branch>, a sibling of the main checkout
// rather than a child, and implement-task sits in exactly that state while it
// creates a worktree from the main checkout. A main checkout has a .git
// directory; a worktree has a .git file pointing at <main>/.git/worktrees/
// <name>; both reduce to the same common directory. Read that from the
// filesystem rather than shelling out to git, and only after the dispatch
// above has already accepted the file, so the common path pays nothing.
const GOVERNED_ROOTS = [process.env.CLAUDE_PROJECT_DIR, cwd, resolve(homedir(), '.claude')]
  .filter(Boolean)
  .map((root) => canonical(resolve(root.replaceAll('\\', '/'))).toLowerCase());

const withinRoot = (root) => lowerPath === root || lowerPath.startsWith(`${root}/`);

function repoIdentity(startDir) {
  let dir = startDir;
  for (;;) {
    const marker = resolve(dir, '.git');
    let stat = null;
    try {
      stat = statSync(marker);
    } catch {
      stat = null;
    }
    if (stat?.isDirectory()) return marker.toLowerCase();
    if (stat?.isFile()) {
      try {
        const pointer = /^gitdir:\s*(.+)$/m.exec(readFileSync(marker, 'utf8'));
        if (pointer) {
          const gitDir = resolve(dir, pointer[1].trim());
          const worktreeAt = gitDir.indexOf('/worktrees/');
          return (worktreeAt === -1 ? gitDir : gitDir.slice(0, worktreeAt)).toLowerCase();
        }
      } catch {
        // unreadable pointer: treat this level as unmarked and keep walking up
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function isGoverned() {
  if (GOVERNED_ROOTS.some(withinRoot)) return true;
  const sessionRepo = repoIdentity(cwd);
  return sessionRepo !== null && repoIdentity(dirname(filePath)) === sessionRepo;
}
if (!isGoverned()) process.exit(0);

const transcriptPath = input.transcript_path;
if (!transcriptPath) process.exit(0);

// A subagent gets its OWN transcript file, so the orchestrator's skill load is
// invisible to it and every delegated context edit blocked — a wave of agents
// whose whole payload is context edits could not run at all, and the only way
// past was for each agent to load the skill itself, which is worse: these are
// human-in-the-loop disciplines and a subagent has no human to gate on.
// Layout is <dir>/<session-id>.jsonl for the session and, beneath it,
// <dir>/<session-id>/subagents/agent-<id>.jsonl for a directly spawned agent or
// <dir>/<session-id>/subagents/workflows/wf_<id>/agent-<id>.jsonl for one
// spawned by a workflow — so the segment count after subagents/ varies and the
// pattern must not pin it. Search the agent's own transcript and the root
// session's; a sibling agent's transcript is never read directly.
function transcriptsToSearch(agentPath) {
  const rootMatch = /^(.*)\/([^/]+)\/subagents\/.+\.jsonl$/.exec(agentPath.replaceAll('\\', '/'));
  return rootMatch ? [agentPath, `${rootMatch[1]}/${rootMatch[2]}.jsonl`] : [agentPath];
}

// A candidate that is simply absent is ordinary — a non-subagent path derives
// no root, and transcripts appear as sessions start. A candidate that exists
// but cannot be read is not: the root transcript is the only source carrying an
// orchestrator's marker, so treating an EACCES on it as "no marker" would block
// an edit the session is entitled to make. Fail open on any non-ENOENT error,
// which is what the header promises.
const sources = [];
let unreadable = false;
for (const candidate of transcriptsToSearch(transcriptPath)) {
  try {
    sources.push(readFileSync(candidate, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') unreadable = true;
  }
}
if (sources.length === 0 || unreadable) process.exit(0);

// Markers cover both load paths, and both are matched as structured records
// rather than as substrings. A Skill tool call is an assistant record carrying
// a tool_use block named Skill whose input.skill is the skill (optionally
// src:-scoped). A user-typed /<name> has two recorded shapes and both must be
// accepted: built-in CLI commands arrive as a system record with subtype
// local_command carrying a top-level content string, while skill and custom
// commands arrive as a user record whose message.content is a plain string —
// checking only the first shape misses every slash-command load and blocks the
// sessions that used one. Both shapes put the command tags at the head of that
// string, and requiring them there is what separates a real invocation from a
// user who merely pasted the tag text. A string message.content also excludes
// tool results, which are always content arrays.
//
// Substring matching cannot tell a load from a mention, and the mention case is
// not hypothetical: writing this guard's own test fixture — a file whose text
// contains <command-name>/curate-context</command-name> — put that string in
// the session transcript and switched the guard off for the rest of the
// session. Reading the root session's transcript would widen every such
// false-pass from one agent to every agent of that session, so the two changes
// belong together. Requiring the enclosing record to be the right kind rejects
// file content, tool results, and quoted examples, because all of them ride
// inside records of some other shape.
function markerInRecord(line, name) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    return false; // a partial trailing write, or not a record at all
  }
  if (record?.type === 'assistant' && Array.isArray(record.message?.content)) {
    for (const block of record.message.content) {
      if (block?.type !== 'tool_use' || block.name !== 'Skill') continue;
      const skill = block.input?.skill;
      if (skill === name || skill === `src:${name}`) return true;
    }
  }
  let commandText = null;
  if (
    record?.type === 'system' &&
    record.subtype === 'local_command' &&
    typeof record.content === 'string'
  ) {
    commandText = record.content;
  } else if (record?.type === 'user' && typeof record.message?.content === 'string') {
    commandText = record.message.content;
  }
  if (commandText === null) return false;
  if (!/^\s*<command-(message|name|args)>/.test(commandText)) return false;
  return new RegExp(`<command-name>\\/?(src:)?${name}<\\/command-name>`).test(commandText);
}

// Parse only the lines that could possibly match. A transcript is an
// append-only JSONL that grows without bound, so parsing every line — or
// splitting the whole file into an array of them — costs far more than seeking
// to each occurrence of the name and parsing just the record around it. Each
// source is scanned separately rather than concatenated, for the same reason.
function loadedIn(text, name) {
  let from = 0;
  let lastStart = -1;
  for (;;) {
    const hit = text.indexOf(name, from);
    if (hit === -1) return false;
    const start = text.lastIndexOf('\n', hit) + 1;
    const end = text.indexOf('\n', hit);
    if (start !== lastStart) {
      lastStart = start;
      if (markerInRecord(text.slice(start, end === -1 ? undefined : end), name)) return true;
    }
    if (end === -1) return false;
    from = end + 1;
  }
}

const loaded = required.some((name) => sources.some((text) => loadedIn(text, name)));
if (loaded) process.exit(0);

console.error(
  `Blocked by guard-context-edit hook: ${filePath} is a governed context file. CLAUDE.md: its edits go through ${required.join(' / ')} — invoke the skill (Skill tool), follow its discipline, then retry this edit. Delegating these edits to subagents works once the session that spawns them has loaded the skill.`,
);
process.exit(2);
