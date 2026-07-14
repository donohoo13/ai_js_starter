# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

[project overview]

## Standards

- Be concise but maintain clear grammar. Commit messages: 50-char subject in imperative mood, explain WHY in body.
- AI context files (CLAUDE.md, BRAND_DESIGN.md, UI_UX.md) state what is true TODAY in strict present tense. No aspirational language ("we'd like to", "try to"). Document exceptions at point of use, not by softening rules.
- Do not treat memory from previous conversations as gospel. Treat as an ephemeral starting point and verify intelligently often.
- Use LSP tools for code navigation, symbol searches, and diagnostics. Fall back to terminal commands only if LSP unavailable. LSP is active only when the per-machine server binary is installed (`typescript-language-server` for TS/JS, `pyright` for Python); `scripts/doctor.sh` checks this and prints the fix.
- Follow @UI_UX.md for all UI/UX design and implementation decisions.
- Follow @BRAND_DESIGN.md for all brand design and implementation decisions.
- Prefix unused variables with `_` to avoid lint warnings when maintaining backwards compatibility.
- Confirm with the user to address root causes, not symptoms.
- For monorepo projects, create a `CLAUDE.md` file nested inside each app/package directory (e.g., `apps/next-app/CLAUDE.md`, `packages/shared/CLAUDE.md`) instead of relying on a single root-level file. This ensures context is specific to each app's dependencies and conventions.
- Evidence before completion claims: do not state something passes, builds, or is fixed without running the command that proves it. "Should work" is not "works".
- No em-dashes (U+2014) in customer-facing text (UI, emails, marketing, AI prompts). Use commas, periods, or rephrasing instead. Hyphens (U+002D) and en-dashes (U+2013) are fine. Internal dev artifacts (code comments, CLAUDE.md, PRs) exempt.

### Project Standards

[project standards]

### Development

- Follow the **Rule of Three** ("Three strikes and you refactor"):
  - First time: Write it naturally
  - Second time: Duplicate is fine (don't abstract yet)
  - Third time: Refactor into an abstraction
  - Reason: Prevents premature abstraction; with 3 examples, commonalities are clearer and you avoid wrong abstractions
  - Break the rule if: The abstraction is obvious and clearly named, or duplication will definitely grow. Prefer duplication over the _wrong_ abstraction, but don't fear _right_ abstractions.
- Operational errors (invalid input, DB timeout) = handle gracefully. Programmer errors (bugs, missing state) = crash and restart.
- At trust boundaries and function entry, validate aggressively: assert invariants, reject impossible inputs, and use exhaustive `switch`/discriminated unions so unhandled cases fail fast and loudly.
- Reserve these fail-fast checks for programmer errors (missing state, impossible combinations); handle expected operational errors (user input, network failures, etc.) through normal, graceful error handling.
- Don't propose a bug fix from reading code alone. If a bug can't be root-caused by inspection, reproduce it and prove the cause before changing code.
- Treat captured debugging artifacts (HAR files, log dumps, real request/response payloads, screen recordings) as secret-bearing: they routinely contain auth headers, session cookies, and PII. Keep them in a gitignored scratch path, never commit them, and delete them when the investigation ends.
- Shipped shell scripts (`scripts/`, skill `scripts/`) stay bash-3.2 compatible: macOS pins `/bin/bash` there permanently, so no associative arrays, `mapfile`/`readarray`, or `${var,,}`. Anything needing bash 4+ isn't portable to stock developer Macs.
- Structure tests using AAA: Arrange (setup), Act (execute), Assert (verify). Keep these sections visually separated
- Use environment variables for configuration (ports, DB URLs, secrets). Never hardcode sensitive values.

#### Python

- Always run Python through `uv` (`uv run …`, `uv add …`) — never a bare `python3`, `pip`, or an activated venv — so the env syncs from `uv.lock` first.
- Use `ruff` for lint/format.

#### Javascript/Typescript/Node.js

- Use `pnpm` as the package manager.
- Use `async/await` with `try/catch` for error handling. Never use callbacks for async operations.
- Always use `===` for equality checks. Never use `==`—it coerces types and causes unexpected results.
- Never nest ternary expressions; a ternary's branches must not themselves be ternaries. Use early-return guards, an `if`/`else if` chain, or a lookup map/`switch` when there are more than two outcomes. A single-level ternary for one binary choice is fine.
- Use `const` by default. Use `let` only when reassignment is needed (e.g., loops). Never use `var`.
- Import/require modules at the top of the file, outside of functions. This avoids blocking requests and catches errors early.
- Always throw `Error` objects (or classes extending `Error`), never strings. Add useful properties like `code` to custom errors.
- Use ESLint for code quality and bug detection, Prettier for formatting. Configure them to work together without conflicts.
- Register process.on('unhandledRejection') to catch unhandled promise rejections—errors that would otherwise be swallowed.
- Name all functions, including callbacks and closures. Anonymous functions make debugging and profiling harder.
- Validate function/API arguments upfront using a library like Zod. Fail fast instead of letting bad data propagate.
- Enable TypeScript `strict: true` in `tsconfig.json`. Define explicit interfaces/types for all data structures. Avoid `any`.
- Define explicit interfaces/types for all data structures, API payloads, and function parameters. Avoid `any`.
- In Monorepo projects, use `pnpm` (faster installs via pnpm-workspace.yaml, better workspace support than npm/yarn) and `Turborepo` for build orchestration (caching, task pipelines, parallel execution). Configure `package.json` scripts to use Turborepo's `turbo` CLI (e.g., `turbo build`, `turbo lint`).

### Git Control

- Prioritize using CLI tools (like `gh` for GitHub) for PR, issue, and remote repository management over raw git commands when available.
- Always verify you are on a valid branch before committing.
- Never commit to main.

### Markdown

- Keep bullet points and long descriptions as single continuous lines (no line breaks within a bullet). This ensures `cmd+x` cuts the entire bullet point instead of just one visual line.
- Use `- [ ]` for TODO items and `- [x]` for completed items instead of plain bullet points.
- Always wrap code snippets, commands, and technical terms in single backticks: `` `git commit` `` not just git commit.
- Use `###` for section headings with descriptive names (not just "Overview") to improve navigation.
- Use relative links like `[docs](./docs/setup.md)` instead of absolute URLs for repo navigation.
- Use `**bold**` for critical actions/warnings, `*italic*` for subtle emphasis—avoid ALL CAPS.
- Use blockquote alerts for critical info: `> [!WARNING]` for pitfalls, `> [!TIP]` for helpful tips (renders on GitHub and GitLab).

## MCP Tools

- Use `playwright-local` MCP server for UI/UX verification (more reliable than plugin) (`mcp__playwright_local__*`).
- Use Chrome DevTools plugin for performance traces and heap analysis (`mcp__chrome_devtools__*`).
- Use Context7 for context gathering when applicable (`mcp__context7__*`).

### Skills

- Use project skills when applicable instead of improvising; per-skill roles and usage live in [the skills README](.claude/skills/README.md). When unsure which skill fits, read it before reaching for one.
- `/grilling` is the interview primitive: a relentless, one-question-at-a-time session that resolves the decision tree of a plan, request, or captured task before implementation — facts get looked up in the codebase, decisions are put to the user. `/grill-me` (user-invoked only, never model-triggered) wraps it with the `domain-modeling` skill so glossary entries and ADRs are captured as decisions crystallise.
- Domain vocabulary and architectural decisions live OUTSIDE this file: glossaries in `CONTEXT.md` (or per-context `CONTEXT.md` indexed by a root `CONTEXT-MAP.md`) and decisions in `docs/adr/`. Read them for ubiquitous language; invoke the `domain-modeling` skill (or `/grill-me`, which wraps it) to change the model.
- Task capture is user's responsibility (tracking system, not memory). Suggest `/capture-task` once when user voices actionable asides or conversation drifts. Suggest, never auto-file. One nudge; if user doesn't bite, drop it. Do not use memory for work items.
- Captured tasks land in `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` (`type`: `bug` | `feature` | `chore`), structured per `.claude/skills/capture-task/assets/task-template.md`: frontmatter (`type`, `status: captured`, `created`) plus Context, Problem, Scope, Requirements, Acceptance criteria, Dependencies, Risks / open questions, with unknowns kept explicit as `TBD (needs grilling)`.
- Convention capture is HITL. Suggest `/codify` once when a session surfaces a durable, undocumented convention or debugging gotcha worth writing into a context file (`CLAUDE.md`, `BRAND_DESIGN.md`, `UI_UX.md`). Suggest, never auto-run; one nudge; if user doesn't bite, drop it. Nothing is written without user approval of each candidate.

## Commands

- `scripts/doctor.sh` — warn-only check that the machine has the LSP server binaries Claude Code's plugins need (`typescript-language-server` for TS/JS, `pyright` for Python); wire it into `package.json` `prepare` so every `pnpm install` self-reports gaps. It informs, never blocks.

## Architecture / Tech Stack

## Deployment
