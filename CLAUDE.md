# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Opinionated JS/TS starter template optimized for AI-assisted development with Claude Code. Everything that exists within the `src` directory is the source with which is used as the template for new projects. Everything else is configuration and tooling used to set up and maintain the project.

## Standards

- Commit messages: 50-char subject in imperative mood, explain WHY in body.
- Plain language first; attach the technical term in parentheses or an "e.g." on first use so the user learns the connections. Skip the gloss once the user has used the term themselves. Conversation only; artifacts keep precise terms.
- Every stated time, date, or duration comes from an objective source checked in-session (`date` via Bash, message/file/git timestamps); when none exists, express order without duration ("earlier in this session", never "an hour ago"). Size work in complexity and scope, never in wall-clock or calendar estimates.
- AI context files (CLAUDE.md, BRAND_DESIGN.md, UI_UX.md, ARCHITECTURE.md) state what is true TODAY in strict present tense. No aspirational language ("we'd like to", "try to") and no preferential language ("prefer", "prioritize", "when possible"): a soft verb leaves the exception to the model's discretion. Write rules as absolutes and document exceptions at point of use.
- Write rules for AI as positive instructions: state the action to take and the concrete check that grounds it, not the behavior to ban; scope each rule to the surfaces it governs; when a rule meets uncertainty, grant explicit permission to say "unknown" rather than guess.
- The docker `ask` gate in `.claude/settings.json` lists every code-executing, destructive, and data-exporting docker verb in both its short and object-command spellings; read-only verbs (`ps`, `logs`, `images`, `inspect`) ride the blanket `Bash` allow. Grow the list by that criterion, and keep the root and `src/` permission lists in lockstep.
- Do not treat memory from previous conversations as gospel. Treat as an ephemeral starting point and verify intelligently often.
- Use LSP tools for code navigation, symbol searches, and diagnostics. Fall back to terminal commands only if LSP unavailable.
- `UI_UX.md` and `BRAND_DESIGN.md` exist only under `src/` as template artifacts; this repo has no UI. Edit them as shipped content, holding them to the AI context file rules above.
- Prefix unused variables with `_` to avoid lint warnings when maintaining backwards compatibility.
- If a question can be answered by exploring the codebase, explore it instead.
- Confirm with the user to address root causes, not symptoms.
- Evidence before completion claims: do not state something passes, builds, or is fixed without running the command that proves it. "Should work" is not "works".
- Treat captured debugging artifacts (HAR files, log dumps, real request/response payloads, screen recordings) as secret-bearing: they routinely contain auth headers, session cookies, and PII. Keep them in a gitignored scratch path, never commit them, and delete them when the investigation ends.
- Shipped shell scripts (`src/scripts/`, skill `scripts/`) stay bash-3.2 compatible: macOS pins `/bin/bash` there permanently, so no associative arrays, `mapfile`/`readarray`, or `${var,,}`. Anything needing bash 4+ isn't portable to stock developer Macs.
- No em-dashes (U+2014) in customer-facing text (UI, emails, marketing, AI prompts). Use commas, periods, or rephrasing instead. Hyphens (U+002D) and en-dashes (U+2013) are fine. Internal dev artifacts (code comments, CLAUDE.md, PRs) exempt.

### Git Control

- Use CLI tools (like `gh` for GitHub) for PR, issue, and remote repository management; fall back to raw git only when no CLI covers the operation.
- Always verify you are on a valid branch before committing.
- Never commit to main.
- AI-created branches are named `<type>/<kebab-slug>` (`type`: `feature` | `bug` | `chore`), matching the captured-task taxonomy; `implement-task` derives this from the task filename, and ad hoc branches follow the same rule.
- `implement-task` builds run in a dedicated git worktree — `scripts/gwt-add.sh --no-open <branch>` creates it, the native `EnterWorktree` tool relocates the session into it — so the main checkout stays on `main`; declining the skill's one confirm falls back to a plain feature branch. Post-merge cleanup is `scripts/gwt-remove.sh <branch>` from the main checkout.

### Markdown

- Keep bullet points and long descriptions as single continuous lines (no line breaks within a bullet); one bullet per line keeps cuts, moves, and diffs atomic.
- Use `- [ ]` for TODO items and `- [x]` for completed items instead of plain bullet points.
- Always wrap code snippets, commands, and technical terms in single backticks: `` `git commit` `` not just git commit.
- Use `###` for section headings with descriptive names (not just "Overview") to improve navigation.
- Use relative links like `[docs](./docs/setup.md)` instead of absolute URLs for repo navigation.
- Use `**bold**` for critical actions/warnings, `*italic*` for subtle emphasis—avoid ALL CAPS.
- Use blockquote alerts for critical info: `> [!WARNING]` for pitfalls, `> [!TIP]` for helpful tips (renders on GitHub and GitLab).

## MCP Tools

- For library and framework docs, query Context7 first (`mcp__plugin_context7_context7__*`) whenever a decision leans on version-specific API surface or framework behavior — one concept per query — and fall back to web search, then web fetch of primary docs, when it lacks the library or returns thin results.
- Use the `linear` MCP for Linear issue, project, and cycle operations (`mcp__linear__*`). Configured at project scope in `.mcp.json`; requires per-user approval and OAuth via `/mcp`.

### Skills

- Document skill usage concisely inside `src/.claude/skills/README.md` as a human readable reference.
- Use the project skill whose trigger matches the task instead of improvising; improvise only when no skill matches.
- Every change to a skill file — anything under `.claude/skills/` or `src/.claude/skills/` — loads the `skill-creator` skill first, whatever brought the change (a grilling exit, another skill's follow-through, a one-line tweak). It owns the authoring discipline, the gut-check prompt handoff, and the landing checklist (dual-layer sync, README blurbs, fork-points). The `guard-skill-edit` PreToolUse hook denies skill-file edits until it is loaded.
- Task capture is user's responsibility (tracking system, not memory). Suggest `/capture-task` once when user voices actionable asides or conversation drifts. Suggest, never auto-file. One nudge; if user doesn't bite, drop it. Do not use memory for work items.
- Captured tasks land in `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` (`type`: `bug` | `feature` | `chore`), structured per `.claude/skills/capture-task/assets/task-template.md`: frontmatter (`type`, `status: captured`, `created`) plus Context, Problem, Scope, Requirements, Acceptance criteria, Dependencies, Risks / open questions, with unknowns kept explicit as `TBD (needs grilling)`.
- Convention capture is HITL. Suggest `/codify` once when a session surfaces a durable, undocumented convention or debugging gotcha worth writing into a context file (`CLAUDE.md`, `BRAND_DESIGN.md`, `UI_UX.md`). Suggest, never auto-run; one nudge; if user doesn't bite, drop it. Nothing is written without user approval of each candidate.

#### Project VS Template

- Treat the project and template source claude skills as separate.
- Overlap between the project and template source skills requires HITL (human-in-the-loop) confirmation that it is intentional.
- When asked to use a skill, always use the project skill if available, and do not attempt to use the template skill unless specified by the user.
- When asked to create or modify a skill, always clarify if we are doing so for the project or the template.

## Commands

- `pnpm format` / `pnpm format:check` — Prettier write/check across the repo.
- `pnpm install` — installs dev tooling and registers the husky pre-commit hook via the `prepare` script.
- `scripts/gwt-add.sh [--no-open] <branch>` / `scripts/gwt-remove.sh <branch>` — worktree create (env copy, `pnpm install`, Zed unless `--no-open`) and remove (worktree + branch + empty-parent prune); both resolve the main checkout themselves, so they run correctly from inside a worktree, and both flatten branch slashes to dashes for the worktree dir (`feature/foo` → `feature-foo`), keeping the layout one level deep under any branch convention.
- The pre-commit hook (`.husky/pre-commit`) auto-formats staged files with Prettier and re-stages them. There is no build, test, or lint step; the repo contains no application code.

## Architecture

Two-layer meta-repo: `src/` is the product (the payload copied into new projects), everything at the root is tooling for maintaining it. Most AI-context files exist twice, once per layer; do not conflate them.

- **Root layer**: `CLAUDE.md`, `.claude/settings.json`, `.claude/skills/`, `.claude/agents/` govern AI sessions working on the template repo itself.
- **Template layer**: `src/CLAUDE.md`, `src/.claude/`, `src/UI_UX.md`, `src/BRAND_DESIGN.md`, `src/.mcp.json`, `src/docs/adr/`, `src/scripts/` ship into new projects; `CONTEXT.md` and `ARCHITECTURE.md` are created lazily by the domain-modeling skill at the first real entry, so they do not ship. Editing these is editing the product. Claude Code discovers `src/.claude/skills/` as scoped skills (`src:` prefix); use the unscoped project skill unless explicitly working on the template copy (see Project VS Template above).
- `.claude/skills/README.md` is the human-readable map of the skill chain (`/grill-me` router → engineer/product/research lenses → capture/diagnose/implement/review/codify, with `grilling`, `domain-modeling`, and `tdd` as primitives). Read it before editing any skill; skills invoke each other by name, so check callers and callees.
- `.claude/agents/` holds the five `review-*` agents (the review-board seats, each pointing at a checklist in `.claude/skills/review-board/references/`) plus `research-analyst`, the background evidence fetcher dispatched mid-interview by `grill-research` and `grill-product`. Same set mirrored in `src/.claude/agents/`.
- `src/.claude/skills/project-init/` exists only in the template layer (deliberately no root counterpart — the template repo itself never gets inited): a one-shot, self-removing onboarding auditor that tailors the shipped suite to its destination project. Its `references/fork-points.md` is the maintained map of every tool and platform coupling in the payload; any edit that changes a shipped skill's coupling (platform CLI, tracker path, branch model, LSP or plugin dependency) updates that manifest in the same change.
- `scripts/gwt-add.sh` / `gwt-remove.sh` (byte-identical twins shipped in `src/scripts/`) are the git worktree helpers behind implement-task's step-2 checkpoint (worktree at `~/Code/.worktrees/<project>/<branch>` with branch slashes flattened to dashes, env copy, `pnpm install`, opens in Zed unless `--no-open`). `src/scripts/doctor.sh` is the warn-only machine-prerequisite check (LSP server binaries) that new projects wire into `package.json` `prepare`.
