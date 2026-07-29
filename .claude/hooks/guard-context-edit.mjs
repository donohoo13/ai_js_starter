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
// session's marker (see transcriptsToSearch). Governance stops at the repo
// boundary (see GOVERNED_ROOTS). Exit 2 blocks the tool call and surfaces
// stderr to Claude; exit 0 allows it. Fail-open: an unreadable transcript or a
// hook launch failure must not lock context files shut.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const rawPath = input.tool_input?.file_path ?? '';
if (!rawPath) process.exit(0);

const cwd = input.cwd || process.cwd();

// Normalize before any predicate. resolve() collapses ../ segments so a
// traversal spelling (.claude/skills/../../CLAUDE.md) matches as the file it
// lands on, not the directory it name-drops; it also anchors a relative
// spelling to the session's cwd rather than wherever the hook happened to
// launch. Backslashes become slashes so a Windows-style path cannot silently
// no-op the guard; matching is lowercased because macOS APFS is
// case-insensitive — a write to claude.md or Readme.md lands on the governed
// inode. (The settings.json prefilter covers the common case variants only;
// arbitrary mixed case reaches this hook solely when the prefilter happens to
// match, which is acceptable for a guardrail.)
const filePath = resolve(cwd, rawPath.replaceAll('\\', '/'));
const lowerPath = filePath.toLowerCase();

// Governance is scoped to the repo, because the arms below match on basename
// and a basename belongs to no project. Without this the guard followed the
// session off the repo entirely and demanded a curate-context run for a
// throwaway CONTEXT.md in the session scratchpad, a /tmp note, or a README.md
// in an unrelated checkout — files no context discipline governs. Three roots
// are in scope: the project dir, the session's cwd (an implement-task worktree
// is a different path than $CLAUDE_PROJECT_DIR, and dropping it would switch
// the guard off for every worktree build), and ~/.claude, which holds the
// user-global CLAUDE.md the arms deliberately reach. node_modules is carved
// back out — a dependency's README.md sits inside the project root but is
// vendored content, not this project's context.
const GOVERNED_ROOTS = [process.env.CLAUDE_PROJECT_DIR, cwd, resolve(homedir(), '.claude')]
  .filter(Boolean)
  .map((root) => resolve(root.replaceAll('\\', '/')).toLowerCase());

const withinRoot = (root) => lowerPath === root || lowerPath.startsWith(`${root}/`);
if (!GOVERNED_ROOTS.some(withinRoot)) process.exit(0);
if (lowerPath.includes('/node_modules/')) process.exit(0);

// Skill-suite files (including .claude/skills/README.md) are guard-skill-edit
// territory; gating them here too would demand two skills for one edit.
if (lowerPath.includes('.claude/skills/')) process.exit(0);

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
// descriptive/imperative seam.
const basename = lowerPath.split('/').pop();
let required = null;
if (lowerPath.includes('docs/adr/')) {
  required = ['domain-modeling'];
} else if (
  basename === 'claude.md' ||
  basename === 'claude.local.md' ||
  basename === 'readme.md' ||
  lowerPath.includes('.claude/rules/')
) {
  required = ['curate-context'];
} else if (basename === 'brand_design.md' || basename === 'ui_ux.md') {
  required = ['curate-context', 'grill-design', 'grill-product'];
} else if (
  basename === 'context.md' ||
  basename === 'context-map.md' ||
  basename === 'architecture.md'
) {
  required = ['domain-modeling'];
}
if (!required) process.exit(0);

const transcriptPath = input.transcript_path;
if (!transcriptPath) process.exit(0);

// A subagent gets its OWN transcript file, so the orchestrator's skill load is
// invisible to it and every delegated context edit blocked — a wave of agents
// whose whole payload is context edits could not run at all, and the only way
// past was for each agent to load the skill itself, which is worse: these are
// human-in-the-loop disciplines and a subagent has no human to gate on.
// Layout is <dir>/<session-id>.jsonl for the session and
// <dir>/<session-id>/subagents/agent-<id>.jsonl for its agents; agents spawned
// at depth 2 land in that same flat subagents/ dir, so one derivation step
// reaches the root session from any depth. Search the agent's own transcript
// and the root session's, never a sibling agent's — sharing across siblings
// would let one agent's load license an unrelated agent's edit.
function transcriptsToSearch(agentPath) {
  const rootMatch = /^(.*)\/([^/]+)\/subagents\/[^/]+\.jsonl$/.exec(
    agentPath.replaceAll('\\', '/'),
  );
  return rootMatch ? [agentPath, `${rootMatch[1]}/${rootMatch[2]}.jsonl`] : [agentPath];
}

const sources = [];
for (const candidate of transcriptsToSearch(transcriptPath)) {
  try {
    sources.push(readFileSync(candidate, 'utf8'));
  } catch {
    // Missing or unreadable: skip this one, judge on whatever else resolved.
  }
}
if (sources.length === 0) process.exit(0); // nothing readable: fail open

// Markers cover both load paths: a Skill tool call ({"skill":"<name>"},
// optionally src:-scoped) and a user-typed /<name> command (<command-name> in
// the transcript). A transcript that merely *mentions* a name in file content
// can false-pass; this is a guardrail against forgetting, not an access
// control.
const transcript = sources.join('\n');
const loaded = required.some(
  (name) =>
    new RegExp(`"skill"\\s*:\\s*"(src:)?${name}"`).test(transcript) ||
    new RegExp(`command-name>\\/?(src:)?${name}<`).test(transcript),
);
if (loaded) process.exit(0);

console.error(
  `Blocked by guard-context-edit hook: ${filePath} is a governed context file. CLAUDE.md: its edits go through ${required.join(' / ')} — invoke the skill (Skill tool), follow its discipline, then retry this edit. Delegating these edits to subagents works once the session that spawns them has loaded the skill.`,
);
process.exit(2);
