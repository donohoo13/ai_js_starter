#!/usr/bin/env node
// PreToolUse guard: blocks Edit/Write on governed context docs until the skill
// that owns the file family has been loaded this session. CLAUDE.md: every
// prescriptive context-file edit (CLAUDE.md, CLAUDE.local.md, README.md,
// .claude/rules/, BRAND_DESIGN.md, UI_UX.md) goes through curate-context, and
// the descriptive docs (CONTEXT.md, CONTEXT-MAP.md, ARCHITECTURE.md,
// docs/adr/) go through domain-modeling. Skill descriptions alone
// undertrigger, so this hook is the deterministic backstop — same posture as
// guard-skill-edit. Detection greps the session transcript for a load marker
// (Skill tool call or slash command). Exit 2 blocks the tool call and
// surfaces stderr to Claude; exit 0 allows it. Fail-open: an unreadable
// transcript or a hook launch failure must not lock context files shut.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const rawPath = input.tool_input?.file_path ?? '';
if (!rawPath) process.exit(0);

// Normalize before any predicate. resolve() collapses ../ segments so a
// traversal spelling (.claude/skills/../../CLAUDE.md) matches as the file it
// lands on, not the directory it name-drops; backslashes become slashes so a
// Windows-style path cannot silently no-op the guard; matching is lowercased
// because macOS APFS is case-insensitive — a write to claude.md or Readme.md
// lands on the governed inode. (The settings.json prefilter covers the common
// case variants only; arbitrary mixed case reaches this hook solely when the
// prefilter happens to match, which is acceptable for a guardrail.)
const filePath = resolve(rawPath.replaceAll('\\', '/'));
const lowerPath = filePath.toLowerCase();

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

let transcript;
try {
  transcript = readFileSync(transcriptPath, 'utf8');
} catch {
  process.exit(0);
}

// Markers cover both load paths: a Skill tool call ({"skill":"<name>"},
// optionally src:-scoped) and a user-typed /<name> command (<command-name> in
// the transcript). A transcript that merely *mentions* a name in file content
// can false-pass; this is a guardrail against forgetting, not an access
// control.
const loaded = required.some(
  (name) =>
    new RegExp(`"skill"\\s*:\\s*"(src:)?${name}"`).test(transcript) ||
    new RegExp(`command-name>\\/?(src:)?${name}<`).test(transcript),
);
if (loaded) process.exit(0);

console.error(
  `Blocked by guard-context-edit hook: ${filePath} is a governed context file. CLAUDE.md: its edits go through ${required.join(' / ')} — invoke the skill (Skill tool), follow its discipline, then retry this edit.`,
);
process.exit(2);
