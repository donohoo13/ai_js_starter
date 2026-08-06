# Fork points — where the suite couples to tools and conventions

The maintained map of every place the shipped suite assumes a platform, tool, or convention. `project-init` reads this during detection instead of re-deriving the suite's anatomy in every project; the drift greps at the bottom catch anything this file has fallen behind on. Maintenance contract: any edit to a skill, agent, hook, or shipped config that changes a coupling below updates this file in the same change.

Each entry: what the artifact assumes today → the tailoring lever when the project differs.

## Git platform (ships: GitHub + `gh`)

- `ship-pr/SKILL.md` — the suite's deepest platform coupling: "GitHub PR" in both its description and its body, `gh pr create --title --body --base <default-branch>`, and PR structure taken from `.github/PULL_REQUEST_TEMPLATE.md`, which it auto-loads at invocation and scaffolds on first use. → fork by platform:
  - GitLab: `glab mr create`, templates at `.gitlab/merge_request_templates/`, and PR→MR vocabulary throughout the skill.
  - Another platform: swap in that platform's CLI and its template path the same way.
  - No remote, or solo-on-main: consider removing the skill and its README entry.
- `review-board/SKILL.md` — PR scoping runs `gh pr diff <n>` and `gh pr view <n>`. → swap both calls for the platform's CLI equivalents.
- shipped `CLAUDE.md` Git Control — says "CLI tools (like `gh` for GitHub)". → name the project's real platform and CLI.
- `.claude/settings.json` — deny entries hardcode pushes to main. → rename the branch when the default differs; drop the entries when the team commits to main by design.
- `template-feedback/SKILL.md` — **the inverted case**: its `gh issue list` and `gh issue create` calls target the _template's_ repo, not the instance's platform, so retargeting them to `glab` severs the feedback channel silently. → treat it as an exception rather than a swap:
  - Leave the `gh` calls alone during normal tailoring.
  - Tailor only when the template itself moves or is forked, changing the repo reference in lockstep with `sync-template`'s remote.
  - A project wanting no channel deletes the skill, its README section, and its stage-map row together.

## Task tracker (ships: the file is the tracker)

- `capture-task/SKILL.md` — captures land in `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`, and the skill never creates platform issues. → with Linear or Jira in play, decide where captures land (the in-repo file stays the recommendation, and mirroring is the common compromise), then rewrite both the destination and the skill's description.
- `implement-task/SKILL.md` — reads `scoped` files from `docs/tasks/`, drives status `scoped → in-progress → done`, gates on the `incumbent:` key, and fills the Demolition section a `replace` verdict creates. → if scoped work lives in the tracker, define how a task file is seeded from an issue; the recommendation is that the file stays the build artifact.
- `grill-engineer/SKILL.md` — its spec-it exit writes to `docs/tasks/`, and briefs seed from `docs/briefs/`. → decide whether task files and briefs also post to the tracker, and to which project.
- `ground-brief/SKILL.md`, `grill-product/SKILL.md` — multi-workstream briefs live at `docs/briefs/` with `status: draft|grounded`; workstream entries link task files, which back-link via `brief:`. → decide where grounded briefs and their links live in a tracker.
- `grill-design/SKILL.md` — designs live at `docs/designs/`, task files back-link via `design:`, and sources are stored under `docs/assets/<artifact-slug>/` and named in `source:` frontmatter, which is what triggers the source-versus-render comparison. → when designs live outside the repo:
  - Keep the in-repo file as the build contract and link out.
  - Keep static exports in-repo where the project's posture allows, because the comparison needs a file to open and a link cannot be diffed.
  - Under a compliance regime, retarget the assets directory to a gitignored path, accepting that the comparison then runs only on machines holding them.
- `grill-initiative/SKILL.md` + `grill-me/SKILL.md` — initiative docs live at `docs/initiatives/`, briefs back-link via `initiative:`, source material sits under `docs/assets/<slug>/`, and `/grill-me @<file>` routes by kind and status. → with a tracker holding initiatives, decide whether the in-repo doc stays the direction authority (recommended: Direction has no tracker equivalent), and keep the routing table aligned with where status lives.
- `ship-pr/SKILL.md` — QA evidence reads `docs/tasks/` status. → keep it aligned with wherever status lives.
- `review-board/SKILL.md` — chair triage sends the two deferrable finding kinds (a pre-existing bug needing investigation, a design tradeoff deserving its own decision) to `/capture-task`. → if captures land in a tracker, name that destination where triage routes them — by the clause, not a step number, which renumbering breaks.
- `.claude/skills/README.md` — states "No GitHub issues anywhere in the chain — the file is the tracker." → restate it to match the structure the project agrees on.
- `docs/adr/` — ADRs stay in the repo regardless of tracker; the status and relation frontmatter defined by `ADR-FORMAT.md` assumes `NNNN-slug.md`, and no hook checks it. → a project keeping ADRs elsewhere retargets the path in `ADR-FORMAT.md` and in `domain-modeling`'s description; a project wanting mechanical checking adds a lint over every ADR rather than a hook, so it covers human-authored ones too.

## Branch model and ceremony (ships: never commit to main, team of >1)

- `.claude/hooks/guard-main.mjs` + its hook wiring — blocks commits on main. → a solo-on-main team removes both.
- shipped `CLAUDE.md` — says "Never commit to main." → calibrate the wording to the real branch model.
- `implement-task/SKILL.md` — refuses to build on main. → the same calibration.
- `diagnose/SKILL.md` — Phase 4 names the branch ceremony with `guard-main` as its backstop. → solo-on-main teams drop or reword that sentence.
- `stage-for-commit/SKILL.md` — already main-friendly, so it is usually untouched. → where PRs are mandatory, reframe it from commit-on-main to stage-on-branch feeding `/ship-pr`.
- `ship-pr/SKILL.md` — refuses to run on the default branch, so it only makes sense under a branch-based flow. → nothing to fork on its own; the refusal follows whatever branch-model call the entries above settle, and a project with no remote or a solo-on-main flow removes the skill under the Git platform entry rather than loosening the refusal.
- shipped `CLAUDE.md` Git Control + `implement-task` step 1 — AI branch naming is `<type>/<kebab-slug>`, derived from the task filename. → a project with an incumbent convention swaps both the `CLAUDE.md` line and the derivation; the gwt scripts need no tailoring, since they flatten slashes to dashes.

## Worktree isolation (ships: in-repo `.claude/worktrees`, Zed, pnpm)

- `scripts/setup/gwt-add.sh` / `scripts/setup/gwt-remove.sh` — base path is `.claude/worktrees/<branch>` inside the main checkout with branch slashes flattened (the harness's default worktree home, so `EnterWorktree` raises no extra approval prompt; both `.gitignore` and `.prettierignore` exclude it, and `gwt-remove.sh` still finds pre-move worktrees under `~/Code/.worktrees`), the env copy covers `.env.local` only, the install is `pnpm install`, and the editor launch is `zed`. → retarget the install command to the stack, extend the env-copy list, swap or drop the editor launch, and relocate the base path when the machine layout differs.
- `implement-task` step 2 — creates the worktree via `scripts/setup/gwt-add.sh --no-open` plus `EnterWorktree`, and its doc pre-flight watches `docs/**` plus the context files. → a project dropping the scripts reverts to the ask-for-a-branch escape hatch; retarget the pre-flight path list when docs live elsewhere.
- shipped `CLAUDE.md` Git Control — the worktree rule is what authorizes the `EnterWorktree` tool. → keep it in lockstep with whether the worktree flow ships at all.
- `ship-pr/SKILL.md` — names `scripts/setup/gwt-remove.sh <branch>` as post-merge cleanup. → the same lockstep.

## Stack and toolchain (ships: TS/JS with pnpm, Python with uv)

- `CLAUDE.md` (shipped) — Python section, Company Overview/`[project standards]`/Architecture/Deployment placeholders, and a pointer bullet to `.claude/rules/javascript-typescript.md`. → prune sections for absent stacks, add the real stack's conventions, resolve every placeholder; `implement-task` discovers validate commands from this file, so its accuracy is load-bearing. Pruning the JS/TS pointer means deleting the rules file it points at, per the entry below — a pointer removed on its own leaves the rules loading with nothing to explain them.
- `.claude/rules/javascript-typescript.md` (shipped) — seventeen pnpm/Turborepo/TypeScript/Node conventions, `paths:`-scoped to source extensions plus the manifests the pin rules govern (`package.json`, `tsconfig.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`). The globs match files every instance ships regardless of stack — `package.json` and the suite's own `.mjs` hooks and scripts — so the file activates in a destination with no JavaScript unless it is deleted. → delete the file and its `CLAUDE.md` pointer together when the destination has no JS/TS; a destination carrying several stacks gets one `paths:`-scoped rules file per stack rather than one shared file, since the globs are what make the scoping work.
- `docs/company/company-overview.md` — a bracketed narrative skeleton that the Company Overview section points at; descriptive only. → fill it with the user during init, never invent it; a project with no company framing deletes the doc and rewrites that section.
- whole-program typecheck command — the demolition pass hands it to the executor and records the resulting error set as the build's connection map. → a stack without one loses the map and falls back to the blast-radius inventory; `project-init` raises the gap and branches on adoption cost — cheap wiring lands inline, a real migration goes out as a captured task, and a project that declines keeps the weaker net deliberately.
- `scripts/setup/doctor.sh` — warn-only LSP binary checks gated on the TS and Python manifests, wired into `prepare`; its comment block maps other languages to their plugins and binaries. → retarget it to the detected stack, and on the copy path wire it into the destination's install lifecycle.
- `scripts/setup/check-install.mjs` — a `preinstall` guard that fails non-pnpm installs and wrong Node majors, assumes a repo-root `.nvmrc` and the shipped `preinstall` wiring, and hard-fails on drift between the first three mirror sites. The script's own header is the canonical explanation; read it before changing how the pin works. → move or drop the pin:
  - Retarget it in all four sites together: `.nvmrc`, `engines.node`, `devEngines.runtime.version` (exact, never a range), and a regenerated `pnpm-lock.yaml`.
  - Never pin through `useNodeVersion`.
  - Review any `node@runtime:` lockfile diff by hand for host and integrity.
  - Deleting `devEngines` is a supported opt-out.
  - A non-pnpm shop is a deliberate fork; declining deletes the file and the `preinstall` script together.
- `scripts/setup/check-install.mjs` engineStrict gate — hard-fails `engineStrict: true` alongside `devEngines.runtime` only on pnpm `<=10` or when the version is unparseable. → pnpm 11+ instances may keep both; a pnpm `<=10` instance keeps them apart or upgrades.
- `package.json` + workspace + `turbo.json` + `apps/`/`packages/` — a private pnpm workspace root with a Turborepo task graph, Prettier and husky, pnpm-only installs, and no `npx` anywhere. → shape it to the destination:
  - A single-app destination takes the collapse offer.
  - Every destination renames `name`.
  - On the copy path, an existing `package.json` merges rather than clobbers.
- `.claude/settings.json` `enabledPlugins` — typescript-lsp and pyright-lsp are enabled. → enable the detected languages' plugins and disable the dead ones.

## MCP servers, plugins, and agents

- `.mcp.json` — ships `supabase-local`, `playwright-local`, and `firefox-devtools` (version-pinned, `pnpm dlx`, neutral `START_URL`), plus boilerplate HTTP stanzas for Clerk, Cloudflare, Stripe, and PostHog named per the isolation norm. Plain JSON only: `.mcp.jsonc` is not discovered, and comments kill every server in the file (verified against `claude mcp list`). → tailor the server set:
  - Add the project's own servers.
  - Delete `supabase-local` when unused.
  - Remove the browser servers when the project has no UI.
  - Point `START_URL` at the real dev URL.
  - Treat any still-placeholder stanza as an accident to flag, since `enableAllProjectMcpServers` auto-approves it.
- OAuth account isolation — no account-bound servers ship pre-configured, and a fixed-name server carries one authenticated session wherever it appears, so isolation comes from the name. → ask per service whether the account is one-account-everywhere or per-project:
  - A per-project answer gets the full isolation package: suffixed servers, `deny` entries for the shared variant's account-bound tools, and no allow wildcards.
  - The destination `CLAUDE.md` gains a bullet naming the servers and carrying the two never-rules copied verbatim.
- project MCP slug — the suffix's only job is uniqueness. → derive and codify one:
  - Reuse a slug the project has already codified.
  - Otherwise derive a short distinctive one, never the full repo name.
  - Confirm cross-project uniqueness with the user, then codify it.
  - One slug per project.
- Cloudflare — one unified HTTP server exposing `docs`, `search`, and `execute`, replacing the older per-product set. → rename or remove it:
  - Rename it with the project slug, or delete it.
  - Extend it only on demonstrated need.
  - Docs search stays on the plugin, which is unauthenticated.
  - Deny the plugin's account-bound tools when a Cloudflare plugin is present.
- `.claude/settings.json` `enabledPlugins` — `chrome-devtools-mcp` is enabled for its skills, and its own server runs alongside the project entry, since plugins match by endpoint. → disable the plugins the project does not use, and keep the corresponding `.mcp.json` stanza in step.
- `.claude/settings.json` `permissions.allow` — wildcards for the browser servers, Context7's two tools named individually, the Cloudflare docs tool, and `WebFetch` scoped to `code.claude.com` only. → keep the allows in lockstep with the servers that actually exist in the destination.
- the eight `review-*.md` agents — all declare `Bash, Read, Grep, Glob, LSP`, though the three documentation seats never need `Bash`; the checklists are stack-neutral. → verify tool viability against the destination, and add checklist content only on a clear project signal, as its own plan item.
- `demolition-planner.md` + `demolition-executor.md` — two dispatches from `implement-task` step 3: the planner reads and records, and the executor holds `Bash` alone and deletes via `git rm` without `-f`. → verify tool viability, then:
  - A project relocating AI scratch retargets `.ai/demolition/<task-slug>.md` in four files together.
  - A project relocating `docs/assets/` retargets the carve-out destination.
  - Narrowed `permissions` are confirmed against the executor's delete and the planner's write.
  - Keep the executor at `Bash`, knowing the grant narrows temptation rather than capability; the same gap runs the other way, since `git rm` reaches `.claude/skills/**` past `guard-skill-edit`.
- `research-analyst.md` — declares the Context7 tools, WebSearch, and WebFetch, and already instructs the fallback when Context7 comes up short. → nothing to fork; nothing breaks without Context7, but keep the keyless entry, since three lenses cite it.
- shipped `CLAUDE.md` MCP Tools section — a menu of vetted working entries, declared as such by the section's HTML comment, so a bullet for an absent server is a menu line rather than a fact. → prune it to the servers the project runs and resolve the placeholders; the vetted wording is the value, so delete whole lines rather than rewording the survivors.
- `implement-task/SKILL.md` — the land render pass (and `grill-engineer`'s build-now check) screenshots through whichever UI tool the `CLAUDE.md` MCP section names, against a server the user starts; the per-slice artifact check is static and screenshot-free. → a project with no UI leaves the passes inert; a different tool is renamed in `CLAUDE.md`, which the skill reads at runtime.

## Compliance posture (ships: none)

- `review-board/SKILL.md` — seat-skipping allows dropping the security seat when a code change has no security surface; on the documentation board the security seat sits as a fourth whenever the document tells a reader to handle credentials, customer data, or outbound transfer, so the lever there is the trigger condition rather than the seat's existence. → under a compliance regime, make the security seat non-skippable on the code board and drop the documentation board's trigger condition so it sits on every prose change, since a runbook telling an operator to paste a credential into a chat window is a real finding no other doc seat owns.
- `ship-pr/SKILL.md` — tolerates process gaps; "Not run." is a valid answer. → under audit requirements, tighten the nudge into a hard stop.
- `.claude/settings.json` — the ask and deny lists as shipped. → tighten them per the policy documents mined from the project, e.g. broader secret-path deny globs, and outbound-transfer tools moved behind `ask`.
- `CLAUDE.md` — the inverted case: lever only, no shipped assumption. → it gains the concrete rules mined from real policy documents, never a bare framework name.
- `grill-engineer/SKILL.md`, `stage-for-commit/SKILL.md` — the build-now path lands on `/stage-for-commit` with the user committing directly. → under a PR-required model, reroute it to a branch feeding `/review-board` and `/ship-pr`.
- shipped `CLAUDE.md` Data handling — generic logging, PII, and fixture rules with a self-contained field list. → mine the project's real policy documents and extend the field list, in the same pass that hardens `review-board` and `ship-pr` and revisits the `grill-design` assets entry.
- `tdd/SKILL.md`, `implement-task/SKILL.md` — untouched by default. → add evidence requirements only on a clear in-project signal.

## Dev-server ban (ships: servers are user-run)

- `.claude/hooks/guard-dev-server.mjs` + its Bash hook entry — denies the common dev-instance, tunnel, and container spellings (`pnpm dev`/`start`/`serve`/`preview` and kin, `vite`, `storybook`, `ngrok`, `docker compose up`, `docker run -d`); the inline `case` prefilter lives in the hook's command string in `.claude/settings.json`. → tailor the pattern sets to the instance's real dev commands: add project script names that start servers, narrow patterns that collide with legitimate non-server scripts (`dev:*` names like `pnpm dev:codegen` ship blocked), and land every pattern edit with its matching prefilter token in that `settings.json` `case` in the same edit — `scripts/test/guard-dev-server.battery.mjs` executes through the registered command string, so a missing token fails the battery rather than shipping silently.
- shipped `CLAUDE.md` Development servers-are-user-run bullet — states the ban, the hand-the-command mechanic, and the hook's gate-not-seal gap. → keep it in lockstep with the hook; a project that genuinely wants AI-started servers removes the hook, its wiring, and the bullet together, never just one.

## Secrets protection (ships: env-file conventions)

- `.claude/settings.json` `permissions.deny` — the paired `Read(...)` and `Edit(...)` entries are the single registry, enforced natively and extended to Bash by `guard-secret-read`; example env files stay readable by omission, and vars example files need hyphen spellings because dot spellings match the `.*.vars.*` wildcard, which stays broad since wrangler env names are user-defined. → init's secret sweep appends the project's uncovered files; a project using dot spellings renames them rather than loosening the wildcard.
- `.claude/hooks/guard-secret-read.mjs` + its Bash hook entry — token-matches any verb against the registry; the inline `case` prefilter listing the registry's substrings lives in the hook's command string in `.claude/settings.json`, so the hook body never needs per-project edits. → every appended deny entry lands with a matching prefilter token in that `settings.json` `case` in the same edit.
- shipped `CLAUDE.md` Standards secrets bullet — states the deny block as fact and carries the inline-substitution protocol, the `!` output test, and the same-change maintenance clause. → keep it in lockstep with the registry; a project removing the hook removes the bullet's hook clause.

## Design and domain files (init reads, never interviews on)

- `BRAND_DESIGN.md` skeletal, `UI_UX.md` complete — both are read at runtime by the grill lenses, and `brand-init` is the sole path for filling the brand skeleton. → report a pointer to `/brand-init` and retarget the mood-board directory if docs live elsewhere; no init-time edits to either file.
- `CONTEXT.md`, `ARCHITECTURE.md`, `docs/adr/` — `domain-modeling` territory, all growing lazily from their first real entry. → nothing to fork at init; report a pointer and write nothing — no invented glossary entries, no stub architecture docs.
- `curate-context/SKILL.md` + the `CLAUDE.md` context-edit rule — together they are the whole mechanism routing prescriptive edits, and no hook backs it, so both must name the destination's real doc names. → confirm the layout matches the repo shape and that both places match what the destination calls its docs.

## Neutral by design — reproduce as-is

> `grilling`, `grill-me`, `grill-product`, `grill-design`, `grill-research`, `brand-init`, `domain-modeling`, `tdd`, `skill-creator` — mechanics are platform- and stack-agnostic on purpose (`brand-init`'s one path coupling, the mood-board directory, is manifested in Design and domain files above); they inherit tailoring through the context files. Fork one of these only on demonstrated need from the interview, never speculatively. `skill-creator`'s `guard-skill-edit` PreToolUse hook ships as neutral machinery alongside `guard-main`.

## Template lineage and updates

- `sync-template/SKILL.md` — assumes the template at `donohoo13/ai_starter`, a `Template lineage:` stamp in `CLAUDE.md`, the changelog release format with matching tags, and a sync log at `docs/template-sync-log.md`. → retarget or cut the channel:
  - A forked template retargets the repo reference.
  - Relocate the sync log if docs live elsewhere.
  - Cutting the channel deletes the skill, its README section and stage-map row, and the stamp together.
  - Its Phase 1 pathspec exclusion mirrors the residue set `project-init` clears, so the two lists move together.
- `CHANGELOG.md`, `.claude/rules/template-dev.md`, the template's own `docs/` artifacts — template residue in any instance, which init clears once the stamp lands. → nothing to fork; a residue file surviving in an already-inited project is leftover to delete on sight.

## Drift greps

Run over `.claude/skills`, `.claude/agents`, `.claude/rules`, `.claude/settings.json`, `.claude/hooks`, `scripts/`, and the shipped `CLAUDE.md`; anything matching outside the entries above is drift — treat it as an unmanifested fork point and handle it like any other finding.

- Platform: `grep -rniE 'github|gitlab|\bgh\b|\bglab\b|pull_request|merge_request'`
- Tracker: `grep -rniE 'linear|jira|docs/tasks|docs/briefs|docs/designs|docs/initiatives|docs/assets'`
- Branch model: `grep -rniE '\bmain\b|default branch|guard-main'`
- Toolchain: `grep -rniE 'pnpm|\buv\b|prettier|eslint|ruff|turbo'`
- Infra: `grep -rniE 'lsp|context7|playwright|chrome-devtools|doctor|husky|prepare|worktree|gwt|zed|oauth|cloudflare|mcp slug|guard-secret|guard-dev-server|\.vars'`
- Lineage: `grep -rniE 'sync-template|lineage|changelog|template-dev|turbo|check-install'`
