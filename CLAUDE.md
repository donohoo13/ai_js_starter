# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Company Overview

[one-line summary of what this product is and for whom]

The full company perspective lives in [docs/company/company-overview.md](./docs/company/company-overview.md): read it when work needs product, customer, or company context. It is narrative only; no rules live there.

## Standards

- Commit messages: 50-char subject in imperative mood, explain WHY in body.
- Plain language first; attach the technical term in parentheses or an "e.g." on first use so the user learns the connections. Skip the gloss once the user has used the term themselves. Conversation only; artifacts keep precise terms.
- Every stated time, date, or duration comes from an objective source checked in-session (`date` via Bash, message/file/git timestamps); when none exists, express order without duration ("earlier in this session", never "an hour ago"). Size work in complexity and scope, never in wall-clock or calendar estimates.
- Every session-closing message, and every mid-session handoff where the user is expected to respond, ends with one consolidated summary in plain language carrying one bullet per open item: a bullet the user decides ends in a direct question with your recommendation and its one-line reasoning attached, and a bullet the user acts on alone states that action plainly. Before sending, read each bullet and name the response it invites — an answer, an action, or nothing — then rewrite or cut every bullet whose answer is "nothing", because a bullet that describes a decision without asking it reads as a status note and leaves the user unable to tell which items are waiting on them.
- AI context files (`CLAUDE.md`, `BRAND_DESIGN.md`, `UI_UX.md`) state what is true TODAY in strict present tense. No aspirational language ("we'd like to", "try to") and no preferential language ("prefer", "prioritize", "when possible"): a soft verb leaves the exception to the model's discretion. Write rules as absolutes and document exceptions at point of use.
- Write rules for AI as positive instructions: state the action to take and the concrete check that grounds it, not the behavior to ban; scope each rule to the surfaces it governs; when a rule meets uncertainty, grant explicit permission to say "unknown" rather than guess.
- Prose restatement: when an edit to a prose artifact (a markdown document or an inline comment block) would duplicate existing content or deepen structural decay (near-duplicate statements, run-on accretion, orphaned sections), restate the whole artifact in the same change — rewrite it into one coherent statement of its current purpose, preserve the meaning of every existing statement, and report everything merged or dropped — because accreted patches degrade a document faster than any single edit shows. When the edit would contradict an existing statement, surface both versions and let the user pick the survivor before restating; which side is true today is the user's call, never a guess. Append untouched only when the addition is orthogonal to everything already present.
- The docker `ask` gate in `.claude/settings.json` lists every code-executing, destructive, and data-exporting docker verb in both its short and object-command spellings; read-only verbs (`ps`, `logs`, `images`, `inspect`) ride the blanket `Bash` allow. Grow the list by that criterion.
- Secret-bearing files are unreadable to AI sessions: the `Read(...)` entries in `.claude/settings.json` `permissions.deny` are the registry, enforced natively for file tools and extended to every Bash verb by the `guard-secret-read` hook. Read env var names from `.env.example` and public config from `wrangler.jsonc`; `.env.example` stays readable because the env deny entries enumerate real secret spellings rather than a wildcard, while vars example files need hyphen spellings (`.dev.vars-example`) — dot spellings (`.dev.vars.example`) match the `.*.vars.*` wildcard and stay blocked. When a command needs a secret value, name the secret and its file, then hand the user a ready-to-run command that references it inline (`FOO="$(grep '^FOO=' .env.production | cut -d= -f2-)" some-cli`); in-session `!` only when the command's output cannot contain the secret, the user's own terminal otherwise, and never a pasted secret value in chat. A new secret-bearing file gains its deny entry and `guard-secret-read` prefilter token in the same change.
- Memory from previous conversations is a hint, not ground truth: verify any remembered file, command, or convention against the current code before acting on it.
- Use LSP tools for code navigation, symbol searches, and diagnostics. Fall back to terminal commands only if LSP unavailable. LSP is active only when the per-machine server binary is installed (`typescript-language-server` for TS/JS, `pyright` for Python); `scripts/setup/doctor.sh` checks this and prints the fix.
- Follow [UI_UX.md](UI_UX.md) for all UI/UX design and implementation decisions.
- Follow [BRAND_DESIGN.md](BRAND_DESIGN.md) for all brand design and implementation decisions.
- Confirm with the user to address root causes, not symptoms.
- Evidence before completion claims: do not state something passes, builds, or is fixed without running the command that proves it. "Should work" is not "works".
- No em-dashes (U+2014) in customer-facing text (UI, emails, marketing, AI prompts). Use commas, periods, or rephrasing instead. Hyphens (U+002D) and en-dashes (U+2013) are fine. Internal dev artifacts (code comments, CLAUDE.md, PRs) exempt.

### Project Standards

<!-- Project-specific code rules that fit no narrower home; curate-context routes here when no other section owns the rule. -->

[project standards]

### Development

- Follow the Rule of Three: first occurrence, write it naturally; second, keep the duplicate (don't abstract yet); third, refactor into an abstraction — three examples expose the real commonality and prevent wrong abstractions. Break the rule when the abstraction is obvious and clearly named or the duplication will certainly grow; choose duplication over the wrong abstraction, never fear the right one.
- Build deep modules: a lot of behavior reachable through a small, stable interface, not shallow ones whose interface is nearly as complex as what they hide. Depth is leverage (behavior a caller gets per unit of interface it must learn), not implementation size, so hide more behind fewer entry points rather than padding the body. Judge a suspected-shallow module (a thin wrapper, a one-caller helper, a pass-through layer) with the deletion test: delete it and inline its body at the call site; if that duplicates real complexity across callers it earned its interface and stays, and if the complexity just relocates intact to one caller the interface pays for nothing, so inline it. Example: a one-call-site `formatName(u)` returning `` `${u.first} ${u.last}` `` is shallow, so inline it; a `pricing` module centralizing rounding, tax, and discount order across checkout, invoices, and refunds is deep, since deleting it duplicates that logic three ways.
- Test at the interface, not past it: callers and tests cross the same seam. Extracting internals into pure functions is fine, but making them the test surface is not, because the bug usually lives in how they are called and a test that bypasses the call site verifies the fragment, not the behavior. When code is hard to test, reshape its public interface instead of reaching around it. Example: when an order total comes out wrong, test `checkout(cart)` and assert the resulting charge, not a `computeTotal(items)` pulled out of it, since the miscalculation is normally in how `checkout` assembles the `items` it passes.
- Introduce a seam only when something actually varies across it: one adapter is a hypothetical seam, two are a real one. A port or interface with a single implementation and no second caller in sight is speculative indirection, not decoupling. Example: extracting a `Notifier` interface for a lone `EmailNotifier` earns nothing; add the seam when a second implementation (an SMS notifier, or a test double you genuinely need) exists, not in anticipation of one.
- Handle operational errors (invalid input, network/DB timeouts) gracefully through normal error paths; programmer errors (bugs, missing state, impossible combinations) crash fast and loudly. At trust boundaries and function entry, assert invariants, reject impossible inputs, and use exhaustive `switch`/discriminated unions so unhandled cases fail immediately — these fail-fast checks are reserved for programmer errors, never expected operational failures.
- Don't propose a bug fix from reading code alone. If a bug can't be root-caused by inspection, reproduce it and prove the cause before changing code.
- Never leave stubs, TODO comments, or placeholder logic in delivered code unless explicitly asked to scaffold. Finish the implementation.
- When a change orphans code (a replaced implementation, an unused export, a bypassed branch), verify deadness with LSP find-references plus a repo-wide grep for dynamic or string-keyed references, and report every orphan to the user. Remove verified-dead code inside the change's own blast radius in the same change — delete, never comment out; git history is the archive — and offer `/capture-task` when the removal outgrows the change. Zero references alongside dynamic access, feature flags, serialized handler names, or a public API surface is "suspected dead, unverified": report it, never remove it unprompted.
- Treat captured debugging artifacts (HAR files, log dumps, real request/response payloads, screen recordings) as secret-bearing: they routinely contain auth headers, session cookies, and PII. Keep them in a gitignored scratch path, never commit them, and delete them when the investigation ends.
- Kill every long-running process this session started (dev servers, watch-mode runners, tunnels, containers) once the active task no longer needs it, and never kill a process the session did not start. Two exceptions keep a process alive: the user directs it, or killing it loses state the task still needs (in-memory DB contents, an in-progress job or write); a slow restart is not lost state. An exercised exception is reported immediately: what is running, its port or PID, and the kill command. Nothing AI-started survives the human QA handoff or session end unreported; QA scripts state anything still running and how to stop it.
- Shipped shell scripts (`scripts/`, skill `scripts/`) stay bash-3.2 compatible: macOS pins `/bin/bash` there permanently, so no associative arrays, `mapfile`/`readarray`, or `${var,,}`. Anything needing bash 4+ isn't portable to stock developer Macs.
- Ad-hoc Bash tool commands run under zsh, not bash: zsh does not word-split an unquoted `$VAR` but does split an unquoted `$(cmd)`, so `for p in $(get_pids)` iterates per item while `PIDS=$(get_pids); for p in $PIDS` iterates once over the whole string. Split explicitly with `${=PIDS}` or a zsh array, or run anything longer than one line through `bash -c`; `printf '%s\n' $PIDS` does not fix it, since `printf` inherits the same non-split. Shipped scripts are unaffected, carrying a `#!/usr/bin/env bash` shebang. Verify the result rather than the exit status, because this failure mimics success: `kill` on a space-joined string errors into an `|| echo 'already gone'` branch that reads as a clean teardown.
- Structure tests using AAA: Arrange (setup), Act (execute), Assert (verify). Keep these sections visually separated
- Use environment variables for configuration (ports, DB URLs, secrets). Never hardcode sensitive values.

#### Python

- Always run Python through `uv` (`uv run …`, `uv add …`) — never a bare `python3`, `pip`, or an activated venv — so the env syncs from `uv.lock` first.
- Use `ruff` for lint/format.

#### Javascript/Typescript/Node.js

- Use `pnpm` as the package manager; in monorepos its workspace support (`pnpm-workspace.yaml`) beats npm/yarn.
- Run local package bins through `pnpm exec` and one-off remote tools through `pnpm dlx`, never `npx`; installs are pnpm-only, enforced with the Node-major pin by the `preinstall` guard (`scripts/setup/check-install.mjs`). AI sessions are the stated exception: `Bash(pnpm dlx*)` and `Bash(npx*)` are deny-listed, so a session needing a one-off remote tool hands the user a ready-to-run `pnpm dlx` command for their own terminal.
- Retarget the Node pin as a set, never a file: `.nvmrc` (exact version, read by the guard, CI `setup-node`, and nvm/fnm, never by pnpm itself), `engines.node` (`>=X.Y.Z <X+1`), and `devEngines.runtime.version` (the same exact version, never a range) change together, then `pnpm install` and commit the regenerated `pnpm-lock.yaml`; `scripts/setup/check-install.mjs` fails the install on drift between the first three, and its header comment carries the mechanism and the causal reasoning behind each choice (the measurements themselves live in the CHANGELOG), so read that header before changing how the pin works rather than rediscovering why a range or `useNodeVersion` fails.
- Run one-off Node commands through `pnpm exec node`, never bare `node`, so they execute on the version pinned in `devEngines.runtime` instead of the shell's ambient Node; `pnpm run` scripts already run under the pinned runtime on pnpm 11, and bare `node` is reserved for when the ambient version is deliberately wanted.
- pnpm honors the `packageManager` pin itself (pnpm 11 self-switches to it), and Corepack, bundled through Node 24 and removed from Node 25+, is a second way to activate that pin; the README quickstart installs pnpm directly rather than depending on Corepack. Retargeting the Node major to 25 or newer is the trigger to migrate any Corepack-based activation in the same change: a contributor or CI step relying on `corepack enable` loses it there, so move to a direct pnpm install or pnpm's native package-manager management.
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
- Enable TypeScript `strict: true` in `tsconfig.json`. Define explicit interfaces/types for all data structures, API payloads, and function parameters; type genuinely-unknown data as `unknown` and narrow it — `any` never ships.
- In monorepos, use `Turborepo` for build orchestration (caching, task pipelines, parallel execution); `package.json` scripts route through the `turbo` CLI (`turbo build`, `turbo lint`).

### Git Control

- Use CLI tools (like `gh` for GitHub) for PR, issue, and remote repository management; fall back to raw git only when no CLI covers the operation.
- Commit only from a non-main branch: check `git branch --show-current` before every commit and branch first when on `main`.
- AI-created branches are named `<type>/<kebab-slug>` (`type`: `feature` | `bug` | `chore`), matching the captured-task taxonomy; `implement-task` derives this from the task filename, and ad hoc branches follow the same rule.
- `implement-task` builds run in a dedicated git worktree — `scripts/setup/gwt-add.sh --no-open <branch>` creates it, the native `EnterWorktree` tool relocates the session into it — so the main checkout stays on `main`; declining the skill's one confirm falls back to a plain feature branch. Post-merge cleanup is `scripts/setup/gwt-remove.sh <branch>` from the main checkout.

### Markdown

- Keep bullet points and long descriptions as single continuous lines (no line breaks within a bullet); one bullet per line keeps cuts, moves, and diffs atomic.
- Use `- [ ]` for TODO items and `- [x]` for completed items instead of plain bullet points.
- Always wrap code snippets, commands, and technical terms in single backticks: `` `git commit` `` not just git commit.
- Use `###` for section headings with descriptive names (not just "Overview") to improve navigation.
- Use relative links like `[docs](./docs/setup.md)` instead of absolute URLs for repo navigation.
- Use `**bold**` for critical actions/warnings, `*italic*` for subtle emphasis—avoid ALL CAPS.
- Use blockquote alerts for critical info: `> [!WARNING]` for pitfalls, `> [!TIP]` for helpful tips (renders on GitHub and GitLab).
- Escape literal pipes in table cells as `\|`, including inside backticks: `|` separates columns regardless of code spans, so `` `a || b` `` silently adds phantom columns.
- Use a list rather than a table when cells run past about one line; long-form content reads better and cannot break the table grammar.

## MCP Tools

<!-- Menu of vetted, working entries for commonly-used servers. project-init or manual curation prunes to the servers this project actually runs; a bullet for an absent server is a menu line to delete, not a fact about this project. -->

- Account-bound OAuth MCP servers are project-scoped in `.mcp.json` and named `<service-server>-<slug>` using the project MCP slug documented in this section: Claude Code keys MCP OAuth tokens by server name in one machine-global store, so a fixed-name server shares one token across every project on the machine. When a server's authenticated session binds to a single service instance and the project needs several — a Stripe session is scoped to one account and one environment — create one entry per instance, extending the name with the instance discriminator (`stripe-<slug>-sandbox`, `stripe-<slug>-live`): each entry carries its own token and reaches exactly its instance. A server whose session can instead roam instances gets pinned per entry at the URL (PostHog's `?project_id=`). Fixed-name plugin or user-level servers are for unauthenticated or single-account services only. Never re-auth a shared fixed-name server from inside a project, and never deduplicate the project-suffixed servers into a shared one.
- Use `playwright-local` MCP server for UI/UX verification (more reliable than plugin) (`mcp__playwright-local__*`).
- Use Chrome DevTools (`mcp__chrome-devtools__*`, the `chrome-devtools` `pnpm dlx` entry in `.mcp.json`) for performance traces and heap analysis; the project entry shadows the plugin's npx-spawned server by name, and the `chrome-devtools-mcp` plugin stays enabled for its skills only. A first connect on a cold pnpm cache can exceed the MCP connect timeout while `dlx` fetches the package; reconnect once via `/mcp` before diagnosing anything deeper.
- Use Firefox DevTools (`mcp__firefox-devtools__*`, the `firefox-devtools` entry in `.mcp.json`) for Firefox-specific rendering and compatibility verification; Chrome DevTools stays the primary for performance traces and heap analysis.
- For library and framework docs, query Context7 first (`mcp__context7__*`, the keyless `context7` HTTP entry in `.mcp.json`) whenever a decision leans on version-specific API surface or framework behavior — one concept per query — and fall back to web search, then web fetch of primary docs, when it lacks the library or returns thin results. If keyless rate limits start rejecting queries, add a free API key as an `Authorization: Bearer` header on that entry via `${CONTEXT7_API_KEY}` env expansion, never a literal key in the committed file.
- Use the `linear` MCP for Linear issue, project, and cycle operations (`mcp__linear__*`). Configured at project scope in `.mcp.json`; requires per-user approval and OAuth via `/mcp`.
- Use the Stripe MCP server (`stripe-[project]-[environment]` boilerplate in `.mcp.json`, hosted at `https://mcp.stripe.com`) for account-bound Stripe work: one authenticated session is scoped to a single Stripe account and a single environment (live mode or a sandbox), so keep one entry per account-environment pair the project touches, each authenticated separately via `/mcp` OAuth (or a restricted API key as a Bearer header where OAuth is unavailable). The `stripe` plugin MCP (`mcp__plugin_stripe_stripe__*`) is for docs search and read-only lookups only.
- Use the Clerk MCP server (`clerk-[project]` in `.mcp.json`, hosted at `https://mcp.clerk.com/mcp`) for Clerk SDK code snippets and implementation patterns; its two tools (`clerk_sdk_snippet`, `list_clerk_sdk_snippets`) are the source of truth for in-code Clerk usage. The server is docs-only and unauthenticated: connect without OAuth and skip `/mcp` authenticate, which fails on a 404 because the server exposes no OAuth endpoints. Instance management (user/org/session lookup, instance config, env keys, webhooks) lives outside this server; reach for the `clerk` CLI, the `@clerk/agent-toolkit.
- Use PostHog (`mcp__plugin_posthog_posthog__*`) for product analytics: event/insight queries, error tracking, session recordings, feature flags, and SQL over product data (project `[project]`, id `[id]`). Reach for it when a question is about user behavior, adoption, funnels, or production errors rather than code. A PostHog session is not instance-bound — `switch-organization`/`switch-project` let it roam everything its credential reaches — so per-project isolation comes from the `posthog-[project]` boilerplate in `.mcp.json`, which pins the server URL with `?project_id=[id]` (the pin removes both switch tools); a project-scoped personal API key (`phx_`, Bearer header) hardens the same boundary.
- Use the Cloudflare MCP server (`cloudflare-[project]` in `.mcp.json`) for every Cloudflare task except Cloudflare Images, which has no OAuth scope at any tier and is reachable only from the dashboard: live Workers/Workflows/R2/D1/KV/Queues/Hyperdrive/Durable Objects state, Workers Observability logs, and documentation search. Its three tools are `docs` (semantic doc search), `search` (query the OpenAPI spec), and `execute` (run JavaScript calling `cloudflare.request()` against any of ~2,500 endpoints). Read-only by default; mutations need explicit authorization. Requires per-user OAuth via `/mcp` against the project's Cloudflare account; fall back to the dashboard or `wrangler` when absent.
- Use the Neon MCP server (`neon-[project]`, project-scoped in `.mcp.json`) for every Neon Postgres task it can perform, never the `neon-postgres@neon` plugin's generically-named `neon` server; the plugin stays enabled only for its `neon`, `neon-postgres`, and `neon-postgres-branches` skills. Data writes to the production branch are forbidden; staging is a long-lived branch off production, kept to mimic production for testing.

### Skills

- Use the project skill whose trigger matches the task instead of improvising, and improvise only when no skill matches; per-skill roles and usage live in [the skills README](.claude/skills/README.md). When unsure which skill fits, read it before reaching for one.
- Skill-file edits (anything under `.claude/skills/`) load `skill-creator` first, whatever brought the change; the `guard-skill-edit` PreToolUse hook denies the edit until it is loaded.
- Context-file edits load their owning skill first — `curate-context` for the prescriptive files (`CLAUDE.md`, `CLAUDE.local.md`, `README.md`, `.claude/rules/`, `BRAND_DESIGN.md`, `UI_UX.md`), `domain-modeling` for the descriptive ones (`CONTEXT.md`, `CONTEXT-MAP.md`, `ARCHITECTURE.md`, `docs/adr/`) — and no hook enforces this, so the instruction is the whole mechanism. Every addition, change, and deletion earns its place against one test: name what a future session does differently because the line exists, and cut it when the answer is nothing. A line already enforced by config, already stated in a skill or tool description, or already implied by a broader rule in the same file is duplication every future session pays for, so strengthen the existing line instead of adding a sibling. Deletions carry the same burden as additions and are stated to the user before they land, never silent.
- Domain vocabulary, architectural decisions, and engineering shape live OUTSIDE this file: glossaries in `CONTEXT.md` (or per-context `CONTEXT.md` indexed by a root `CONTEXT-MAP.md`), decisions in `docs/adr/`, and shape in `ARCHITECTURE.md` (see Architecture / Tech Stack below). Read them for ubiquitous language and orientation, treating `ARCHITECTURE.md` claims as verify-before-act and a documented boundary an ask conflicts with as a decision to surface with its cost, never a constraint to silently design within.
- Task capture is the user's responsibility, tracked in task files, never in memory. Suggest `/capture-task` once when the user voices an actionable aside or the conversation drifts, and `/curate-context` at most once when a durable lesson surfaces; suggest, never auto-run, and if the user doesn't bite, drop it.

## Data handling

- Logs never carry secrets, credentials, or customer PII; payloads and debug detail are fine once scrubbed of those. Security-relevant events (auth, CRUD on org-scoped objects, security settings changes) log: user id, IP, timestamp, action, object.
- Production or customer data never enters fixtures or test environments without anonymization.
- Restricted material (keys, secrets, vulnerability and pentest reports) never leaves the machine: not into external services, artifacts, or issue trackers.

## Commands

- `scripts/setup/doctor.sh` — warn-only check that the machine has the LSP server binaries Claude Code's plugins need (`typescript-language-server` for TS/JS, `pyright` for Python); wired into `package.json` `prepare` so every `pnpm install` self-reports gaps. It informs, never blocks.
- `pnpm format` / `pnpm format:check` — Prettier write/check across the repo; the pre-commit hook (`.husky/pre-commit`) auto-formats staged files with `pnpm exec prettier` and re-stages them.
- Workspace tasks route through Turborepo across `apps/*` and `packages/*`: `turbo build` / `turbo lint` / `turbo test` / `turbo typecheck`.
- `scripts/setup/gwt-add.sh [--no-open] <branch>` / `scripts/setup/gwt-remove.sh <branch>` — worktree create (env copy, `pnpm install`, Zed unless `--no-open`) and remove (worktree + branch + empty-parent prune); both resolve the main checkout themselves, so they run correctly from inside a worktree, and both flatten branch slashes to dashes for the worktree dir (`feature/foo` → `feature-foo`), keeping the layout one level deep under any branch convention.

## Architecture / Tech Stack

- The descriptive shape lives in `ARCHITECTURE.md` (root doc = system topology; per-context docs beside each app or package), maintained by the `domain-modeling` skill per its `ARCHITECTURE-FORMAT.md`. This section holds the imperative rules and gotchas for changing the code, pointing at shape facts rather than restating them.

## Deployment

[deployment targets, environments, and release process]
