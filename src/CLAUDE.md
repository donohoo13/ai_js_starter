# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

[project overview]

## Standards

- Commit messages: 50-char subject in imperative mood, explain WHY in body.
- Plain language first; attach the technical term in parentheses or an "e.g." on first use so the user learns the connections. Skip the gloss once the user has used the term themselves. Conversation only; artifacts keep precise terms.
- Every stated time, date, or duration comes from an objective source checked in-session (`date` via Bash, message/file/git timestamps); when none exists, express order without duration ("earlier in this session", never "an hour ago"). Size work in complexity and scope, never in wall-clock or calendar estimates.
- AI context files (`CLAUDE.md`, `BRAND_DESIGN.md`, `UI_UX.md`) state what is true TODAY in strict present tense. No aspirational language ("we'd like to", "try to") and no preferential language ("prefer", "prioritize", "when possible"): a soft verb leaves the exception to the model's discretion. Write rules as absolutes and document exceptions at point of use.
- Write rules for AI as positive instructions: state the action to take and the concrete check that grounds it, not the behavior to ban; scope each rule to the surfaces it governs; when a rule meets uncertainty, grant explicit permission to say "unknown" rather than guess.
- Prose restatement: when an edit to a prose artifact (a markdown document or an inline comment block) would duplicate existing content or deepen structural decay (near-duplicate statements, run-on accretion, orphaned sections), restate the whole artifact in the same change — rewrite it into one coherent statement of its current purpose, preserve the meaning of every existing statement, and report everything merged or dropped — because accreted patches degrade a document faster than any single edit shows. When the edit would contradict an existing statement, surface both versions and let the user pick the survivor before restating; which side is true today is the user's call, never a guess. Append untouched only when the addition is orthogonal to everything already present.
- The docker `ask` gate in `.claude/settings.json` lists every code-executing, destructive, and data-exporting docker verb in both its short and object-command spellings; read-only verbs (`ps`, `logs`, `images`, `inspect`) ride the blanket `Bash` allow. Grow the list by that criterion.
- Do not treat memory from previous conversations as gospel. Treat as an ephemeral starting point and verify intelligently often.
- Use LSP tools for code navigation, symbol searches, and diagnostics. Fall back to terminal commands only if LSP unavailable. LSP is active only when the per-machine server binary is installed (`typescript-language-server` for TS/JS, `pyright` for Python); `scripts/doctor.sh` checks this and prints the fix.
- Follow [@UI_UX.md](UI_UX.md) for all UI/UX design and implementation decisions.
- Follow [@BRAND_DESIGN.md](BRAND_DESIGN.md) for all brand design and implementation decisions.
- Prefix unused variables with `_` to avoid lint warnings when maintaining backwards compatibility.
- Confirm with the user to address root causes, not symptoms.
- For monorepo projects, create a `CLAUDE.md` file nested inside each app/package directory (e.g., `apps/next-app/CLAUDE.md`, `packages/shared/CLAUDE.md`) instead of relying on a single root-level file. This ensures context is specific to each app's dependencies and conventions.
- Evidence before completion claims: do not state something passes, builds, or is fixed without running the command that proves it. "Should work" is not "works".
- No em-dashes (U+2014) in customer-facing text (UI, emails, marketing, AI prompts). Use commas, periods, or rephrasing instead. Hyphens (U+002D) and en-dashes (U+2013) are fine. Internal dev artifacts (code comments, CLAUDE.md, PRs) exempt.
- Create a todo list when working on large complex tasks to track progress and remain on track.

### Project Standards

[project standards]

### Development

- Follow the **Rule of Three** ("Three strikes and you refactor"):
  - First time: Write it naturally
  - Second time: Duplicate is fine (don't abstract yet)
  - Third time: Refactor into an abstraction
  - Reason: Prevents premature abstraction; with 3 examples, commonalities are clearer and you avoid wrong abstractions
  - Break the rule if: The abstraction is obvious and clearly named, or duplication will definitely grow. Choose duplication over the _wrong_ abstraction, but don't fear _right_ abstractions.
- Build deep modules: a lot of behavior reachable through a small, stable interface, not shallow ones whose interface is nearly as complex as what they hide. Depth is leverage (behavior a caller gets per unit of interface it must learn), not implementation size, so hide more behind fewer entry points rather than padding the body. Judge a suspected-shallow module (a thin wrapper, a one-caller helper, a pass-through layer) with the deletion test: delete it and inline its body at the call site; if that duplicates real complexity across callers it earned its interface and stays, and if the complexity just relocates intact to one caller the interface pays for nothing, so inline it. Example: a one-call-site `formatName(u)` returning `` `${u.first} ${u.last}` `` is shallow, so inline it; a `pricing` module centralizing rounding, tax, and discount order across checkout, invoices, and refunds is deep, since deleting it duplicates that logic three ways.
- Test at the interface, not past it: callers and tests cross the same seam. Extracting internals into pure functions is fine, but making them the test surface is not, because the bug usually lives in how they are called and a test that bypasses the call site verifies the fragment, not the behavior. When code is hard to test, reshape its public interface instead of reaching around it. Example: when an order total comes out wrong, test `checkout(cart)` and assert the resulting charge, not a `computeTotal(items)` pulled out of it, since the miscalculation is normally in how `checkout` assembles the `items` it passes.
- Introduce a seam only when something actually varies across it: one adapter is a hypothetical seam, two are a real one. A port or interface with a single implementation and no second caller in sight is speculative indirection, not decoupling. Example: extracting a `Notifier` interface for a lone `EmailNotifier` earns nothing; add the seam when a second implementation (an SMS notifier, or a test double you genuinely need) exists, not in anticipation of one.
- Operational errors (invalid input, DB timeout) = handle gracefully. Programmer errors (bugs, missing state) = crash and restart.
- At trust boundaries and function entry, validate aggressively: assert invariants, reject impossible inputs, and use exhaustive `switch`/discriminated unions so unhandled cases fail fast and loudly.
- Reserve these fail-fast checks for programmer errors (missing state, impossible combinations); handle expected operational errors (user input, network failures, etc.) through normal, graceful error handling.
- Don't propose a bug fix from reading code alone. If a bug can't be root-caused by inspection, reproduce it and prove the cause before changing code.
- Never leave stubs, TODO comments, or placeholder logic in delivered code unless explicitly asked to scaffold. Finish the implementation.
- When a change orphans code (a replaced implementation, an unused export, a bypassed branch), verify deadness with LSP find-references plus a repo-wide grep for dynamic or string-keyed references, and report every orphan to the user. Remove verified-dead code inside the change's own blast radius in the same change — delete, never comment out; git history is the archive — and offer `/capture-task` when the removal outgrows the change. Zero references alongside dynamic access, feature flags, serialized handler names, or a public API surface is "suspected dead, unverified": report it, never remove it unprompted.
- Treat captured debugging artifacts (HAR files, log dumps, real request/response payloads, screen recordings) as secret-bearing: they routinely contain auth headers, session cookies, and PII. Keep them in a gitignored scratch path, never commit them, and delete them when the investigation ends.
- Kill every long-running process this session started (dev servers, watch-mode runners, tunnels, containers) once the active task no longer needs it, and never kill a process the session did not start. Two exceptions keep a process alive: the user directs it, or killing it loses state the task still needs (in-memory DB contents, an in-progress job or write); a slow restart is not lost state. An exercised exception is reported immediately: what is running, its port or PID, and the kill command. Nothing AI-started survives the human QA handoff or session end unreported; QA scripts state anything still running and how to stop it.
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
- Enable TypeScript `strict: true` in `tsconfig.json`. Define explicit interfaces/types for all data structures, API payloads, and function parameters. Avoid `any`.
- In Monorepo projects, use `pnpm` (faster installs via pnpm-workspace.yaml, better workspace support than npm/yarn) and `Turborepo` for build orchestration (caching, task pipelines, parallel execution). Configure `package.json` scripts to use Turborepo's `turbo` CLI (e.g., `turbo build`, `turbo lint`).

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

- Use `playwright-local` MCP server for UI/UX verification (more reliable than plugin) (`mcp__playwright_local__*`).
- Use Chrome DevTools plugin for performance traces and heap analysis (`mcp__chrome_devtools__*`).
- Use Firefox DevTools plugin (`mcp__firefox_devtools__*`) for Firefox-specific rendering and compatibility verification; Chrome DevTools stays the primary for performance traces and heap analysis.
- For library and framework docs, query Context7 first (`mcp__plugin_context7_context7__*`) whenever a decision leans on version-specific API surface or framework behavior — one concept per query — and fall back to web search, then web fetch of primary docs, when it lacks the library or returns thin results.
- Use the `linear` MCP for Linear issue, project, and cycle operations (`mcp__linear__*`). Configured at project scope in `.mcp.json`; requires per-user approval and OAuth via `/mcp`.
- The `stripe` MCP (`mcp__plugin_stripe_stripe__*`) is for docs search and read-only lookups only.
- For any Clerk auth task (auth state, user/org/session lookup, instance config, env keys, webhook integration), use the `clerk` MCP server (checked into `.mcp.json`, enabled for everyone); the `mcp__clerk__*` tools are the source of truth for in-code SDK snippets. (There is no `clerk` skill.)
- Account-bound OAuth MCP servers are project-scoped in `.mcp.json` and named `<service-server>-<slug>` using the project MCP slug documented in this section: Claude Code keys MCP OAuth tokens by server name in one machine-global store, so a fixed-name server shares one token across every project on the machine. Fixed-name plugin or user-level servers are for unauthenticated or single-account services only. Never re-auth a shared fixed-name server from inside a project, and never deduplicate the project-suffixed servers into a shared one.
- Use PostHog (`mcp__plugin_posthog_posthog__*`) for product analytics: event/insight queries, error tracking, session recordings, feature flags, and SQL over product data (project "[]", id ``). Reach for it when a question is about user behavior, adoption, funnels, or production errors rather than code.

### Skills

- Use the project skill whose trigger matches the task instead of improvising, and improvise only when no skill matches; per-skill roles and usage live in [the skills README](.claude/skills/README.md). When unsure which skill fits, read it before reaching for one.
- Every change to a skill file (anything under `.claude/skills/`) loads the `skill-creator` skill first, whatever brought the change (a grilling exit, another skill's follow-through, a one-line tweak). It owns the authoring discipline, the gut-check prompt handoff, and the landing checklist (README blurb, fork-points where `project-init` ships). The `guard-skill-edit` PreToolUse hook denies skill-file edits until it is loaded.
- `/grilling` is the interview primitive: a relentless, one-question-at-a-time session that resolves the decision tree of a plan, request, or captured task before implementation — facts get looked up in the codebase, decisions are put to the user. `/grill-me` (user-invoked only, never model-triggered) wraps it with the `domain-modeling` skill so glossary entries and ADRs are captured as decisions crystallise.
- Domain vocabulary, architectural decisions, and engineering shape live OUTSIDE this file: glossaries in `CONTEXT.md` (or per-context `CONTEXT.md` indexed by a root `CONTEXT-MAP.md`), decisions in `docs/adr/`, and shape in `ARCHITECTURE.md` (root doc = system topology; per-context docs beside each app or package). Read them for ubiquitous language and orientation, treating `ARCHITECTURE.md` claims as verify-before-act and a documented boundary an ask conflicts with as a decision to surface with its cost, never a constraint to silently design within; invoke the `domain-modeling` skill (or `/grill-me`, which wraps it) to change the model or the shape docs.
- Task capture is user's responsibility (tracking system, not memory). Suggest `/capture-task` once when user voices actionable asides or conversation drifts. Suggest, never auto-file. One nudge; if user doesn't bite, drop it. Do not use memory for work items.
- Captured tasks land in `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` (`type`: `bug` | `feature` | `chore`), structured per `.claude/skills/capture-task/assets/task-template.md`: frontmatter (`type`, `status: captured`, `created`) plus Context, Problem, Scope, Requirements, Acceptance criteria, Dependencies, Risks / open questions, with unknowns kept explicit as `TBD (needs grilling)`.
- Convention capture is HITL. Suggest `/codify` once when a session surfaces a durable, undocumented convention or debugging gotcha worth writing into a context file (`CLAUDE.md`, `BRAND_DESIGN.md`, `UI_UX.md`). Suggest, never auto-run; one nudge; if user doesn't bite, drop it. Nothing is written without user approval of each candidate.

## Commands

- `scripts/doctor.sh` — warn-only check that the machine has the LSP server binaries Claude Code's plugins need (`typescript-language-server` for TS/JS, `pyright` for Python); wire it into `package.json` `prepare` so every `pnpm install` self-reports gaps. It informs, never blocks.
- `scripts/gwt-add.sh [--no-open] <branch>` / `scripts/gwt-remove.sh <branch>` — worktree create (env copy, `pnpm install`, Zed unless `--no-open`) and remove (worktree + branch + empty-parent prune); both resolve the main checkout themselves, so they run correctly from inside a worktree, and both flatten branch slashes to dashes for the worktree dir (`feature/foo` → `feature-foo`), keeping the layout one level deep under any branch convention.

## Architecture / Tech Stack

- The descriptive shape lives in `ARCHITECTURE.md` (root doc = system topology; per-context docs beside each app or package), maintained by the `domain-modeling` skill per its `ARCHITECTURE-FORMAT.md`. This section holds the imperative rules and gotchas for changing the code, pointing at shape facts rather than restating them.

## Deployment
