# Fork points — where the suite couples to tools and conventions

The maintained map of every place the shipped suite assumes a platform, tool, or convention. `project-init` reads this during detection instead of re-deriving the suite's anatomy in every project; the drift greps at the bottom catch anything this file has fallen behind on. Maintenance contract: any edit to a skill, agent, hook, or shipped config that changes a coupling below updates this file in the same change.

Each entry: what the artifact assumes today → the tailoring lever when the project differs.

## Git platform (shipped assumption: GitHub + `gh`)

- `ship-pr/SKILL.md` — the deepest coupling: description and body say "GitHub PR", mechanics run `gh pr create --title --body --base <default-branch>`, structure comes from `.github/PULL_REQUEST_TEMPLATE.md` (auto-loaded at invocation by a `cat` bang command, scaffolded on first use if absent), and the routed-around failure mode is described as "a bare `gh pr create`". → GitLab: `glab mr create`, `.gitlab/merge_request_templates/`, PR→MR vocabulary throughout; other platforms: their CLI; no remote or solo-on-main: consider removing the skill and its README entry entirely.
- `review-board/SKILL.md` — PR-number scoping uses `gh pr diff <n>` / `gh pr view <n>`. → swap for the platform CLI equivalents.
- `CLAUDE.md` (shipped) Git Control section — "CLI tools (like `gh` for GitHub)". → name the real platform and CLI.
- `.claude/settings.json` — `deny` entries hardcode pushes to `main`. → rename if the default branch differs; drop if the team commits to main by design.

## Task tracker (shipped assumption: the file is the tracker)

- `capture-task/SKILL.md` — captures land in `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`; explicitly never creates platform issues. → with Linear/Jira: decide where captures land (in-repo file stays the recommended default; mirroring to the tracker with agreed team/project/labels is the common compromise) and rewrite the capture destination and description accordingly.
- `implement-task/SKILL.md` — reads `scoped` files from `docs/tasks/`, carries status frontmatter `scoped → in-progress → done`, dynamic context greps `docs/tasks/*.md`. → if scoped work lives in the tracker, define how a task file is seeded from a tracker issue (recommend the file remains the build artifact; the tracker links to it).
- `grill-engineer/SKILL.md` — spec-it exit writes `docs/tasks/`; product briefs seed from `docs/briefs/`. → decide whether specs/briefs also post to the tracker, and to which project/team.
- `ship-pr/SKILL.md` — QA evidence reads `docs/tasks/` status. → keep aligned with wherever task status actually lives.
- `.claude/skills/README.md` — "No GitHub issues anywhere in the chain — the file is the tracker." → restate to match the agreed structure.
- ADRs (`docs/adr/`) stay in repo regardless of tracker; recommend against moving them.

## Branch model and ceremony (shipped assumption: never commit to main, team of >1)

- `.claude/hooks/guard-main.mjs` + the `PreToolUse` hook wiring in `settings.json` — blocks commits on main. → solo-on-main teams remove both.
- `CLAUDE.md` (shipped) — "Never commit to main." → calibrate to the real branch model.
- `implement-task/SKILL.md` — refuses to build on main. → same calibration.
- `diagnose/SKILL.md` — the Phase 4 landing names the shipped branch ceremony: a deliberately chosen non-main branch where the team flow requires one, with the `guard-main` hook as the backstop it pre-empts. → solo-on-main teams removing guard-main drop or reword that sentence; projects with a different default branch calibrate the wording with the rest of this section.
- `stage-for-commit/SKILL.md` — already main-friendly (user commits themselves); usually untouched. → where PRs are mandatory, reframe from commit-on-main to stage-on-branch feeding `/ship-pr`.
- `ship-pr/SKILL.md` — refuses to run on the default branch; existence only makes sense with branch-based flow.
- `CLAUDE.md` (shipped) Git Control + `implement-task/SKILL.md` step 1 — AI branch naming defaults to `<type>/<kebab-slug>` (`feature` | `bug` | `chore`, the captured-task taxonomy), implement-task deriving it from the task filename. → projects with an incumbent convention (Linear auto-branches `user/eng-123-slug`, conventional-commit `feat/` prefixes, team-name prefixes — detection reads `git branch -r`) swap the CLAUDE.md line and the derivation to match; `gwt-add.sh`/`gwt-remove.sh` need no tailoring for naming — they flatten branch slashes to dashes for worktree dirs, so the layout stays one level deep under any convention.

## Worktree isolation (shipped assumption: worktrees at `~/Code/.worktrees`, Zed, pnpm)

- `scripts/gwt-add.sh` / `scripts/gwt-remove.sh` — worktree base is `$HOME/Code/.worktrees/<project>/<branch>` with branch slashes flattened to dashes (a machine-layout assumption), env copy covers `.env.local` only, install is `pnpm install`, editor launch is `zed` (`--no-open` skips it). → retarget the install command to the detected stack (`uv sync`, `npm install`, ...), extend the env-copy list to the project's real env files, swap `zed` for the team's editor CLI or drop the launch, and relocate the base path if the machine layout differs.
- `implement-task/SKILL.md` — step 2 defaults to a worktree via `scripts/gwt-add.sh --no-open` plus the native `EnterWorktree` tool, deriving the branch as `<type>/<slug>` from the task filename, and its doc pre-flight watches `docs/**` plus the context files (`CLAUDE.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `UI_UX.md`, `BRAND_DESIGN.md`, `.claude/**`) for uncommitted work to offer staging before the branch is cut. → projects that drop the scripts or the worktree flow revert step 2 to the ask-for-a-branch escape hatch (already its decline path); solo-on-main teams removing branch ceremony remove this with it; retarget the pre-flight's path list when docs live elsewhere (platform tracker, different doc roots).
- `CLAUDE.md` (shipped) Git Control — the worktree rule is what authorizes the `EnterWorktree` tool under its usage gate. → keep in lockstep with whether the worktree flow ships.
- `ship-pr/SKILL.md` — the close names `scripts/gwt-remove.sh <branch>` as post-merge cleanup. → same lockstep.

## Stack and toolchain (shipped assumption: TS/JS with pnpm, Python with uv)

- `CLAUDE.md` (shipped) — Python and Javascript/Typescript sections, pnpm/Turborepo guidance, `[project overview]`/`[project standards]`/Architecture/Deployment placeholders. → prune sections for absent stacks, add the real stack's conventions, resolve every placeholder; `implement-task` discovers validate commands from this file, so its accuracy is load-bearing.
- `scripts/doctor.sh` — warn-only LSP binary checks gated on TS and Python manifests; its comment block maps other languages to official plugins and binaries. → retarget the checks to the detected stack and wire into the manifest's install lifecycle (`package.json` `prepare`, or the stack's equivalent).
- `.claude/settings.json` `enabledPlugins` — `typescript-lsp` and `pyright-lsp` enabled. → enable the detected languages' LSP plugins, disable dead ones.

## MCP servers, plugins, and agents

- `.mcp.json` — ships `playwright-local` only. → add the project's servers; remove playwright if the project has no UI to verify.
- **OAuth account isolation** (shipped assumption: no account-bound OAuth servers pre-configured) — Claude Code keys MCP OAuth tokens by server name in one machine-global store, so a fixed-name server (every plugin and user-level server) shares a single token across every project on the machine; the shipped `CLAUDE.md` MCP Tools section states the norm: account-bound OAuth servers land project-scoped in `.mcp.json`, named `<service-server>-<slug>`. → for each account-bound OAuth service detection finds (plugin or user-level — Cloudflare, Linear, Stripe, ...), ask whether the user holds one account everywhere or per-project accounts; one-account services stay on the shared fixed-name server, per-project services get the isolation package: project-scoped suffixed servers in `.mcp.json`, `deny` entries in `settings.json` for the shared variant's account-bound tools (only when that shared variant actually exists), no `permissions.allow` wildcards for the suffixed servers (account-bound writes prompt by design), and a destination `CLAUDE.md` bullet naming the servers, the account they are OAuth'd to, and the two never-rules from the shipped `CLAUDE.md` MCP Tools norm bullet, copied verbatim rather than paraphrased.
- **Project MCP slug** — the suffix's only job is uniqueness in the machine-global token store. → reuse the project's codified slug if `CLAUDE.md` already carries one; else derive a short distinctive slug (initials or a natural shortening, never the full repo name) and confirm cross-project uniqueness with the user — only they know their other checkouts; codify the confirmed slug in the destination `CLAUDE.md` MCP Tools section; one slug per project, reused across all its suffixed servers.
- **Cloudflare (worked instance)** — default set of four HTTP servers: `cloudflare-<slug>` (`https://mcp.cloudflare.com/mcp`), `cloudflare-bindings-<slug>` (`https://bindings.mcp.cloudflare.com/mcp`), `cloudflare-builds-<slug>` (`https://builds.mcp.cloudflare.com/mcp`), `cloudflare-observability-<slug>` (`https://observability.mcp.cloudflare.com/mcp`), all `"type": "http"`. → trim servers the project cannot use (no Workers Builds CI → drop builds) and extend from Cloudflare's catalog on demonstrated need (radar, browser-rendering, AI gateway); docs search stays on the plugin — it is unauthenticated, so the isolation rule does not apply; when a Cloudflare plugin is present at any level, deny its account-bound tools in project `settings.json` (`mcp__plugin_cloudflare_cloudflare-api__execute`, `mcp__plugin_cloudflare_cloudflare-bindings__*`, `mcp__plugin_cloudflare_cloudflare-builds__*`, `mcp__plugin_cloudflare_cloudflare-observability__*`).
- `.claude/settings.json` `enabledPlugins` — `linear` and `context7` enabled, `chrome-devtools-mcp` enabled. → match reality: disable unused, add the tracker actually in use.
- `.claude/settings.json` `permissions.allow` — wildcards for context7, playwright-local, chrome-devtools, linear MCP tools. → keep allows in lockstep with the servers that exist, so tool calls do not stall on prompts.
- `agents/review-*.md` (five) — declare `Bash, Read, Grep, Glob, LSP`; LSP works only with the language plugin enabled plus the per-machine binary (doctor's whole job). Checklists in `review-board/references/` are stack-neutral best practice. → verify tool viability; add checklist content only on a clear project signal (e.g. a payments integration justifies a PCI note in security), proposed as its own plan item.
- `agents/research-analyst.md` — declares Context7 MCP tools, WebSearch, WebFetch; already instructs fallback when Context7 is absent. → if Context7 is not connected, nothing breaks, but consider enabling the plugin since three grill lenses cite it as the primary fact source.
- `CLAUDE.md` (shipped) MCP Tools section — names playwright-local, chrome-devtools, context7. → rewrite to the project's actual server list.

## Compliance posture (shipped assumption: none)

- `review-board/SKILL.md` — seat-skipping allows dropping the security seat when a change has no security surface. → under a compliance regime, make the security seat non-skippable.
- `ship-pr/SKILL.md` — tolerates process gaps ("Not run." is valid; one nudge, then the truth). → under audit requirements the PR body is evidence: tighten the nudge to a hard stop for missing QA/review.
- `.claude/settings.json` — `ask`/`deny` lists. → tighten per the mined policy documents (e.g. deny reads on broader secret paths, ask on outbound network tools).
- `CLAUDE.md` — gains the concrete rules mined from real policy docs (secrets handling, data classification, audit expectations), never a bare framework name.
- `grill-engineer/SKILL.md`, `stage-for-commit/SKILL.md` — the build-now exit lands on `/stage-for-commit` with the user committing directly, and stage-for-commit frames committing on main as the normal case. → under a compliance regime (or any PR-required branch model) direct commits are not plausible: reroute the build-now landing to a branch feeding `/review-board` and `/ship-pr`, and reframe stage-for-commit as staging on the working branch.
- `tdd/SKILL.md`, `implement-task/SKILL.md` — untouched by default; add evidence requirements only on a clear in-project signal.

## Design and domain files (init reads, never interviews on)

- `BRAND_DESIGN.md` — skeletal on arrival; `UI_UX.md` — brand-agnostic usability standards, complete on arrival. `frontend-design` and `grill-product` read both at runtime, so the brand skeleton self-heals as the project fleshes it out. → report pointer to `/grill-me product`; no init-time edits.
- `CONTEXT.md`, `ARCHITECTURE.md`, `docs/adr/` — `domain-modeling` territory; monorepos may warrant the `CONTEXT-MAP.md` + root `ARCHITECTURE.md` layout it documents, and all three grow lazily from their first real entry, with the survey bootstrap in `domain-modeling/ARCHITECTURE-FORMAT.md` available when a brownfield destination wants the whole shape map in one pass. → report pointer; no invented glossary entries, no stub architecture docs.
- `codify/SKILL.md` — routes conventions to the nearest enclosing `CLAUDE.md`; the shipped monorepo convention (nested per-app `CLAUDE.md`) affects where that lands. → confirm the layout matches the repo shape.

## Neutral by design (rarely forked)

`grilling`, `grill-me`, `grill-product`, `grill-research`, `domain-modeling`, `tdd`, `frontend-design`, `skill-creator` — mechanics are platform- and stack-agnostic on purpose; they inherit tailoring through the context files. Fork one of these only on demonstrated need from the interview, never speculatively. `skill-creator`'s dual-layer sync line self-deactivates outside the template meta-repo, and its `guard-skill-edit` PreToolUse hook (settings.json entry + `.claude/hooks/guard-skill-edit.mjs`) ships as neutral machinery alongside `guard-main`.

## Drift greps

Run over `.claude/skills`, `.claude/agents`, `.claude/settings.json`, `.claude/hooks`, and the shipped `CLAUDE.md`; anything matching outside the entries above is drift — treat it as an unmanifested fork point and handle it like any other finding.

- Platform: `grep -rniE 'github|gitlab|\bgh\b|\bglab\b|pull_request|merge_request'`
- Tracker: `grep -rniE 'linear|jira|docs/tasks|docs/briefs'`
- Branch model: `grep -rniE '\bmain\b|default branch|guard-main'`
- Toolchain: `grep -rniE 'pnpm|\buv\b|prettier|eslint|ruff|turbo'`
- Infra: `grep -rniE 'lsp|context7|playwright|chrome-devtools|doctor|husky|prepare|worktree|gwt|zed|oauth|cloudflare|mcp slug'`
