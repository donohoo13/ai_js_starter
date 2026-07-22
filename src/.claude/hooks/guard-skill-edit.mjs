#!/usr/bin/env node
// PreToolUse guard: blocks Edit/Write on files under .claude/skills/ until the
// skill-creator skill has been loaded this session. CLAUDE.md: every skill
// change goes through skill-creator; descriptions alone undertrigger it, so
// this hook is the deterministic backstop. Detection greps the session
// transcript for a skill-creator load marker (Skill tool call or /skill-creator
// command). Exit 2 blocks the tool call and surfaces stderr to Claude; exit 0
// allows it. Fail-open like guard-main: an unreadable transcript or a hook
// launch failure must not lock skill files shut, because a session that loaded
// skill-creator but cannot prove it would be blocked forever.
import { readFileSync } from 'node:fs';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const filePath = input.tool_input?.file_path ?? '';
if (!filePath.includes('.claude/skills/')) process.exit(0);

const transcriptPath = input.transcript_path;
if (!transcriptPath) process.exit(0);

let transcript;
try {
  transcript = readFileSync(transcriptPath, 'utf8');
} catch {
  process.exit(0);
}

// Markers cover both load paths: a Skill tool call ({"skill":"skill-creator"},
// optionally src:-scoped) and a user-typed /skill-creator command
// (<command-name> in the transcript). A transcript that merely *mentions*
// skill-creator in file content can false-pass; this is a guardrail against
// forgetting, not an access control.
const loaded =
  /"skill"\s*:\s*"(src:)?skill-creator"/.test(transcript) ||
  /command-name>\/?(src:)?skill-creator</.test(transcript);
if (loaded) process.exit(0);

console.error(
  `Blocked by guard-skill-edit hook: ${filePath} is a skill file. CLAUDE.md: skill changes go through the skill-creator skill — invoke it (Skill tool, skill: "skill-creator"), follow its discipline, then retry this edit.`,
);
process.exit(2);
