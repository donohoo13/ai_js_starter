# Skill Quality Reference

Distilled from Anthropic's Agent Skills best-practices guide (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), the Claude Code skills reference (code.claude.com/docs/en/skills), and the Agent Skills engineering post (anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills). When guidance here surprises, verify against those sources; they move faster than this file.

## Frontmatter

- The Agent Skills standard requires exactly two fields, `name` and `description`; everything else is optional extension.
- `name`: ≤64 chars, lowercase letters, numbers, and hyphens only; no XML tags; must not contain "anthropic" or "claude". Gerund form is preferred for new skills (`processing-pdfs`, not `pdf-processor`, never `helper`/`utils`).
- `description`: non-empty, ≤1024 chars, no XML tags. Claude Code truncates the skill-listing text at 1,536 chars.
- In Claude Code project skills the command name comes from the directory name; frontmatter `name` is display-only. Plugin skills differ: there `name` sets the command's last segment.
- Claude Code extensions, all optional: `argument-hint` (autocomplete hint), `arguments` (named argument list backing `$name` placeholders), `disable-model-invocation: true` (manual `/name` invocation only), `user-invocable: false` (hidden from the `/` menu), `allowed-tools` / `disallowed-tools` (turn-scoped tool grants and blocks), `model` (turn-scoped model override), `context: fork` plus `agent` (run in a subagent), `hooks` (skill-scoped lifecycle hooks).
- Malformed frontmatter YAML loads the body with empty metadata: `/name` still works but the skill never model-triggers. `claude --debug` surfaces the parse error.

## Description craft

- Third person only ("Processes X", "Use when Y") — first or second person causes discovery problems.
- State both what the skill does and when to use it; the description is the only trigger signal among potentially 100+ skills.
- Name the concrete trigger contexts: file paths, phrases, task shapes. Include session-state triggers ("when editing files under X") alongside user-intent triggers ("when the user asks for Y") so mid-task situations fire, not just explicit requests.
- Specificity beats pushiness: "use whenever X, Y, or Z, even if the user never says W" earns its place only when each listed context is real.

## Structure

- Three-level progressive disclosure: metadata (always in context) → SKILL.md body (loaded on trigger) → bundled files (loaded on demand, zero cost until read).
- Body under 500 lines; treat ~150 as the comfortable ceiling for a focused skill.
- References exactly one level deep from SKILL.md — no reference→reference chains; a nested file may get head-previewed and its content missed.
- Table of contents for any reference file past ~100 lines.
- Multi-domain skills organize by variant (`references/aws.md`, `references/gcp.md`) so a session reads only the branch it needs.
- `scripts/` for deterministic repeated work, `assets/` for files used in output, `references/` for knowledge. Ship a script when test sessions keep independently writing the same helper.

## Writing style

- Imperative voice; explain why over bare MUSTs — all-caps ALWAYS/NEVER and rigid structure are a yellow flag that the reasoning is missing.
- Match freedom to fragility: heuristic prose where many approaches work, a parameterized script where one pattern is preferred, an exact no-argument script where sequence deviation breaks things.
- Every bundled file states its mode: run ("Run `scripts/x.py`") vs read ("See `references/x.md` for the schema").
- No time-sensitive statements ("after August", "the new API"); park deprecated material in an explicitly labeled old-patterns section instead of interleaving it.
- Generalize past the motivating example; a skill overfit to the session that inspired it is useless everywhere else.

## Gut-check prompt craft

- Write prompts a real user would type: concrete file names, a line of backstory, casual phrasing, occasional typos. Abstract category labels ("Format this data") test nothing.
- Make prompts substantive enough that a session would genuinely benefit from consulting a skill; trivial one-step asks don't trigger skills regardless of description quality.
- Should-trigger set: vary phrasing and formality, include cases that never name the skill or its file type, and include one where this skill competes with a neighboring skill and should win.
- Should-not-trigger set: near-misses only — adjacent domains, shared keywords, contexts where another tool is correct. Obviously irrelevant negatives test nothing.
- State the expected behavior for every prompt so the user can judge pass or fail without interpreting.
