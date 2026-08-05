# Rule inventory — `project-init/references/fork-points.md`

Extracted for the v1.7.0 restatement pass. **This is the specification a rewrite builds from.** A fork point missing here is a tailoring step that silently stops happening in every future project. Format: `ID | ARTIFACT | assumption it ships with | the lever when the project differs`. Flags: `[NO LEVER]` states an assumption but no action, `[PROCEDURE]` multi-step so its steps are preserved as sub-lines, `[DUP: file]` has a canonical home elsewhere, `[VERBATIM]` exact wording or path is load-bearing.

Extracted at 4,828 words, after entry `F-31` collapsed into a pointer at the `check-install.mjs` header.

## Maintenance contract, quoted

> The maintained map of every place the shipped suite assumes a platform, tool, or convention. `project-init` reads this during detection instead of re-deriving the suite's anatomy in every project; the drift greps at the bottom catch anything this file has fallen behind on. Maintenance contract: any edit to a skill, agent, hook, or shipped config that changes a coupling below updates this file in the same change.

Entry grammar, stated in the file: _"Each entry: what the artifact assumes today → the tailoring lever when the project differs."_ Ten entries carry no `→` clause, so a reader cannot tell a fork point from a note. That is the structural defect a rewrite fixes.

## Git platform (ships: GitHub + `gh`)

- `F-01` | `ship-pr/SKILL.md` | deepest coupling: "GitHub PR" in description and body, `gh pr create --title --body --base <default-branch>`, structure from `.github/PULL_REQUEST_TEMPLATE.md` auto-loaded at invocation, scaffolded on first use `[PROCEDURE][VERBATIM]` → GitLab: `glab mr create`, `.gitlab/merge_request_templates/`, PR→MR vocabulary throughout; other platforms: their CLI; no remote or solo-on-main: consider removing the skill and its README entry
- `F-02` | `review-board/SKILL.md` | PR scoping uses `gh pr diff <n>` / `gh pr view <n>` `[VERBATIM]` → swap for the platform CLI
- `F-03` | shipped `CLAUDE.md` Git Control | says "CLI tools (like `gh` for GitHub)" → name the real platform and CLI
- `F-04` | `.claude/settings.json` | deny entries hardcode pushes to main → rename if the default branch differs; drop if the team commits to main by design
- `F-05` | `template-feedback/SKILL.md` | **the inverted case**: its `gh issue list`/`gh issue create` target the _template's_ repo, not the instance's platform; retargeting to `glab` severs the feedback channel silently `[PROCEDURE][VERBATIM]` → leave the `gh` calls alone during normal tailoring; tailor only if the template itself moves or is forked, the repo reference changing in lockstep with `sync-template`'s remote; a project wanting no channel deletes the skill, its README section, and its stage-map row together

## Task tracker (ships: the file is the tracker)

- `F-06` | `capture-task/SKILL.md` | captures land in `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`; never creates platform issues `[VERBATIM]` → with Linear/Jira decide where captures land (in-repo file stays recommended; mirroring is the common compromise), then rewrite destination and description
- `F-07` | `implement-task/SKILL.md` | reads `scoped` files from `docs/tasks/`; status `scoped → in-progress → done`, the `incumbent:` key it gates on, the Demolition section a `replace` verdict fills `[VERBATIM]` → if scoped work lives in the tracker, define how a task file is seeded from an issue (recommend the file stays the build artifact)
- `F-08` | `grill-engineer/SKILL.md` | spec-it writes `docs/tasks/`; briefs seed from `docs/briefs/` → decide whether task files and briefs also post to the tracker, and to which project
- `F-09` | `ground-brief/SKILL.md`, `grill-product/SKILL.md` | multi-workstream briefs at `docs/briefs/` with `status: draft|grounded`; workstream entries link task files which back-link via `brief:` `[VERBATIM]` → decide where grounded briefs and their links live in a tracker
- `F-10` | `grill-design/SKILL.md` | designs at `docs/designs/`, tasks back-link via `design:`, sources stored under `docs/assets/<artifact-slug>/` in `source:` frontmatter, triggering the source-versus-render comparison `[PROCEDURE][VERBATIM]` → designs elsewhere: keep the in-repo file as the build contract and link out; keep static exports in-repo where posture allows, because the comparison needs a file to open and a link cannot be diffed; under a compliance regime retarget the assets dir to a gitignored path, accepting that the comparison then runs only on machines holding them
- `F-11` | `grill-initiative/SKILL.md` + `grill-me/SKILL.md` | initiative docs at `docs/initiatives/`, briefs back-link via `initiative:`, source material under `docs/assets/<slug>/`, `/grill-me @<file>` routes by kind and status `[VERBATIM]` → with a tracker holding initiatives, decide whether the in-repo doc stays direction authority (recommended, Direction has no tracker equivalent) and keep the routing table aligned with where status lives
- `F-12` | `ship-pr/SKILL.md` | QA evidence reads `docs/tasks/` status → keep aligned with wherever status lives
- `F-13` | `review-board/SKILL.md` | Step 3 sends the two deferrable finding kinds to `/capture-task` → if captures land in a tracker, name that destination in Step 3
- `F-14` | `.claude/skills/README.md` | states "No GitHub issues anywhere in the chain — the file is the tracker." `[VERBATIM]` → restate to match the agreed structure
- `F-15` | `docs/adr/` | ADRs stay in repo regardless of tracker; status and relation frontmatter from `ADR-FORMAT.md` assumes `NNNN-slug.md`; no hook checks it `[VERBATIM]` → projects with ADRs elsewhere retarget the path in `ADR-FORMAT.md` and `domain-modeling`'s description; a project wanting mechanical checking adds a lint over every ADR rather than a hook, so it covers human-authored ones too

## Branch model and ceremony (ships: never commit to main, team of >1)

- `F-16` | `guard-main.mjs` + its hook wiring | blocks commits on main → solo-on-main teams remove both
- `F-17` | shipped `CLAUDE.md` | "Never commit to main." → calibrate to the real branch model
- `F-18` | `implement-task/SKILL.md` | refuses to build on main → same calibration
- `F-19` | `diagnose/SKILL.md` | Phase 4 names the branch ceremony with guard-main as its backstop → solo-on-main teams drop or reword that sentence
- `F-20` | `stage-for-commit/SKILL.md` | already main-friendly; usually untouched → where PRs are mandatory, reframe from commit-on-main to stage-on-branch feeding `/ship-pr`
- `F-21` | `ship-pr/SKILL.md` | refuses to run on the default branch; only makes sense with branch-based flow `[NO LEVER]`
- `F-22` | shipped `CLAUDE.md` Git Control + `implement-task` step 1 | AI branch naming `<type>/<kebab-slug>`, derived from the task filename `[VERBATIM]` → projects with an incumbent convention swap the `CLAUDE.md` line and the derivation; the gwt scripts need no tailoring, since they flatten slashes to dashes

## Worktree isolation (ships: `~/Code/.worktrees`, Zed, pnpm)

- `F-23` | `gwt-add.sh` / `gwt-remove.sh` | base `$HOME/Code/.worktrees/<project>/<branch>` with slashes flattened, env copy covers `.env.local` only, install is `pnpm install`, editor launch is `zed` `[VERBATIM]` → retarget the install command to the stack, extend the env-copy list, swap or drop the editor launch, relocate the base path if the machine layout differs
- `F-24` | `implement-task` step 2 | worktree via `gwt-add.sh --no-open` plus `EnterWorktree`; doc pre-flight watches `docs/**` plus the context files `[VERBATIM]` → projects dropping the scripts revert to the ask-for-a-branch escape hatch; retarget the pre-flight path list when docs live elsewhere
- `F-25` | shipped `CLAUDE.md` Git Control | the worktree rule authorizes the `EnterWorktree` tool → keep in lockstep with whether the flow ships
- `F-26` | `ship-pr/SKILL.md` | names `gwt-remove.sh <branch>` as post-merge cleanup `[VERBATIM]` → same lockstep

## Stack and toolchain (ships: TS/JS with pnpm, Python with uv)

- `F-27` | shipped `CLAUDE.md` | Python and JS/TS sections, pnpm/Turborepo guidance, all bracketed placeholders → prune absent stacks, add the real conventions, resolve every placeholder; `implement-task` discovers validate commands here, so accuracy is load-bearing
- `F-28` | `docs/company/company-overview.md` | bracketed narrative skeleton the Company Overview section points at; descriptive only → fill with the user during init, never invent; a project with no company framing deletes the doc and rewrites that section
- `F-29` | whole-program typecheck command | the demolition pass passes it to the executor and records the error set as the connection map → a stack without one loses the map and falls back to the blast-radius inventory; `project-init` raises the gap and branches on adoption cost
- `F-30` | `doctor.sh` | warn-only LSP binary checks gated on TS and Python manifests, wired into `prepare`; its comment block maps other languages to plugins and binaries → retarget to the detected stack; on the copy path, wire into the destination's install lifecycle
- `F-31` | `check-install.mjs` | preinstall guard failing non-pnpm installs and wrong Node majors; assumes a repo-root `.nvmrc` and the shipped `preinstall` wiring; hard-fails on drift between the first three mirror sites `[PROCEDURE][VERBATIM][DUP: the script's own 73-line header]` → retarget the pin in all four sites together (`.nvmrc`, `engines.node`, `devEngines.runtime.version` exact never a range, regenerated `pnpm-lock.yaml`); never pin through `useNodeVersion`; read the script header before changing how the pin works; review any `node@runtime:` lockfile diff by hand for host and integrity; deleting `devEngines` is a supported opt-out; a non-pnpm shop is a deliberate fork; declining deletes the file and the `preinstall` script together
- `F-32` | `check-install.mjs` engineStrict gate | hard-fails `engineStrict: true` alongside `devEngines.runtime` only on pnpm `<=10` or unparseable `[VERBATIM]` → pnpm 11+ instances may keep both; pnpm `<=10` keeps them apart or upgrades
- `F-33` | `package.json` + workspace + `turbo.json` + `apps/`/`packages/` | private pnpm workspace root with a Turborepo task graph, Prettier + husky, pnpm-only installs, no `npx` anywhere `[PROCEDURE]` → single-app destinations take the collapse offer; every destination renames `name`; on the copy path an existing `package.json` merges rather than clobbers
- `F-34` | `.claude/settings.json` `enabledPlugins` | typescript-lsp and pyright-lsp enabled → enable the detected languages' plugins, disable dead ones

## MCP servers, plugins, and agents

- `F-35` | `.mcp.json` | ships `supabase-local`, `playwright-local`, `firefox-devtools` (version-pinned, `pnpm dlx`, `START_URL` neutral), plus boilerplate HTTP stanzas for Clerk, Cloudflare, Stripe, PostHog, named per the isolation norm; plain JSON only — `.mcp.jsonc` is not discovered and comments kill every server in the file (verified against `claude mcp list`) `[PROCEDURE][VERBATIM]` → add the project's servers; delete `supabase-local` when unused; remove the browser servers with no UI; point `START_URL` at the real dev URL; treat any still-placeholder stanza as an accident to flag, since `enableAllProjectMcpServers` auto-approves it
- `F-36` | OAuth account isolation | no account-bound servers pre-configured; a fixed-name server carries one authenticated session wherever it appears, so isolation comes from the name `[PROCEDURE][VERBATIM]` → per service, ask one-account-everywhere or per-project; per-project answers get the isolation package: suffixed servers, `deny` entries for the shared variant's account-bound tools, no allow wildcards, and a destination `CLAUDE.md` bullet naming the servers and the two never-rules copied verbatim
- `F-37` | project MCP slug | the suffix's only job is uniqueness `[PROCEDURE]` → reuse a codified slug; else derive a short distinctive one, never the full repo name; confirm cross-project uniqueness with the user; codify it; one slug per project
- `F-38` | Cloudflare | one unified HTTP server with `docs`/`search`/`execute`, replacing the older per-product set `[PROCEDURE][VERBATIM]` → rename with the slug or delete; extend only on demonstrated need; docs search stays on the plugin, being unauthenticated; deny the plugin's account-bound tools when a Cloudflare plugin is present
- `F-39` | `.claude/settings.json` `enabledPlugins` | `chrome-devtools-mcp` enabled for its skills, its own server running alongside the project entry since plugins match by endpoint `[VERBATIM]` → disable unused plugins; keep the tracker's stanza in step
- `F-40` | `.claude/settings.json` `permissions.allow` | wildcards for the browser servers, Context7's two tools named individually, the Cloudflare docs tool → keep allows in lockstep with the servers that exist
- `F-41` | the eight `review-*.md` agents | all declare `Bash, Read, Grep, Glob, LSP`; the three documentation seats never need it; checklists are stack-neutral `[VERBATIM]` → verify tool viability; add checklist content only on a clear project signal, as its own plan item
- `F-42` | `demolition-planner.md` + `demolition-executor.md` | two dispatches from `implement-task` step 3; the planner reads and records, the executor holds `Bash` alone and deletes via `git rm` without `-f` `[PROCEDURE][VERBATIM]` → verify tool viability; a project relocating AI scratch retargets `.ai/demolition/<task-slug>.md` in four files together; a project relocating `docs/assets/` retargets the carve-out destination; narrowed `permissions` are confirmed against the executor's delete and the planner's write; keep the executor at `Bash` knowing the grant narrows temptation rather than capability; the same gap runs the other way, since `git rm` reaches `.claude/skills/**` past `guard-skill-edit`
- `F-43` | `research-analyst.md` | declares Context7 tools, WebSearch, WebFetch; already instructs fallback `[NO LEVER]` → nothing breaks without Context7, but keep the keyless entry since three lenses cite it
- `F-44` | shipped `CLAUDE.md` MCP Tools section | a menu of vetted working entries, declared as such by the section's HTML comment; a bullet for an absent server is a menu line, not a fact → prune to the servers the project runs and resolve the placeholders; the vetted wording is the value, so delete whole lines rather than rewording survivors
- `F-45` | `implement-task/SKILL.md` | render checks screenshot via the UI tool the `CLAUDE.md` MCP section names → projects with no UI leave the checks inert; a different tool is renamed in `CLAUDE.md`, which the skill reads at runtime

## Compliance posture (ships: none)

- `F-46` | `review-board/SKILL.md` | seat-skipping allows dropping security when a change has no security surface `[PROCEDURE]` → under a compliance regime make the security seat non-skippable; decide the documentation case knowingly, either seating security alongside the doc reviewers or recording that the doc board carries no security lens by design
- `F-47` | `ship-pr/SKILL.md` | tolerates process gaps; "Not run." is valid `[VERBATIM]` → under audit requirements tighten the nudge to a hard stop
- `F-48` | `.claude/settings.json` | ask/deny lists → tighten per the mined policy documents
- `F-49` | `CLAUDE.md` | (inverted: lever only, no shipped assumption) → gains the concrete rules mined from real policy docs, never a bare framework name
- `F-50` | `grill-engineer/SKILL.md`, `stage-for-commit/SKILL.md` | build-now lands on `/stage-for-commit` with the user committing directly → under a PR-required model, reroute to a branch feeding `/review-board` and `/ship-pr`
- `F-51` | shipped `CLAUDE.md` Data handling | generic logging/PII/fixture rules with a self-contained field list → mine the project's real policy documents and extend the field list, in the same pass that hardens review-board/ship-pr and revisits `F-10`
- `F-52` | `tdd/SKILL.md`, `implement-task/SKILL.md` | untouched by default `[NO LEVER]` → add evidence requirements only on a clear in-project signal

## Secrets protection (ships: env-file conventions)

- `F-53` | `.claude/settings.json` `permissions.deny` | the paired `Read(...)` and `Edit(...)` entries are the single registry, enforced natively and extended to Bash by `guard-secret-read`; example env files stay readable by omission; vars example files need hyphen spellings because dot spellings match the `.*.vars.*` wildcard, which stays broad since wrangler env names are user-defined `[VERBATIM]` → init's secret sweep appends the project's uncovered files; a project using dot spellings renames them rather than loosening the wildcard
- `F-54` | `guard-secret-read.mjs` + its Bash hook entry | token-matches any verb against the registry, with an inline `case` prefilter listing the registry's substrings → every appended deny entry lands with a matching prefilter token in the same edit
- `F-55` | shipped `CLAUDE.md` Standards secrets bullet | the block as fact, the inline-substitution protocol, the `!` output test, the same-change maintenance clause → keep in lockstep; a project removing the hook removes the bullet's hook clause

## Design and domain files (init reads, never interviews on)

- `F-56` | `BRAND_DESIGN.md` skeletal, `UI_UX.md` complete | both read at runtime by the grill lenses; `brand-init` is the sole path for filling the brand skeleton `[VERBATIM]` → report a pointer to `/brand-init`; retarget the mood-board directory if docs live elsewhere; no init-time edits
- `F-57` | `CONTEXT.md`, `ARCHITECTURE.md`, `docs/adr/` | `domain-modeling` territory, all growing lazily from their first real entry `[NO LEVER]` → report a pointer; no invented glossary entries, no stub architecture docs
- `F-58` | `curate-context/SKILL.md` + the `CLAUDE.md` context-edit rule | together the whole mechanism routing prescriptive edits; no hook backs it, so both must name the destination's real doc names `[VERBATIM]` → confirm the layout matches the repo shape and that both places match what the destination calls its docs

## Template lineage and updates

- `F-59` | `sync-template/SKILL.md` | assumes the template at `donohoo13/ai_starter`, a `Template lineage:` stamp in `CLAUDE.md`, the changelog release format with matching tags, and a sync log at `docs/template-sync-log.md` `[PROCEDURE][VERBATIM]` → a forked template retargets the repo; relocate the sync log if docs live elsewhere; cutting the channel deletes the skill, its README section and stage-map row, and the stamp together; its Phase 1 pathspec exclusion mirrors the residue set `project-init` clears, so the two lists move together
- `F-60` | `CHANGELOG.md`, `.claude/rules/template-dev.md`, the template's own `docs/` artifacts | template residue in any instance; init clears them after the stamp lands `[NO LEVER]` → nothing to fork; a residue file in an already-inited project is leftover to delete on sight

## Neutral by design — reproduce as-is

> `grilling`, `grill-me`, `grill-product`, `grill-design`, `grill-research`, `brand-init`, `domain-modeling`, `tdd`, `skill-creator` — mechanics are platform- and stack-agnostic on purpose (`brand-init`'s one path coupling, the mood-board directory, is manifested in Design and domain files above); they inherit tailoring through the context files. Fork one of these only on demonstrated need from the interview, never speculatively. `skill-creator`'s `guard-skill-edit` PreToolUse hook ships as neutral machinery alongside `guard-main`.

## Drift greps — reproduce exactly

Run over `.claude/skills`, `.claude/agents`, `.claude/settings.json`, `.claude/hooks`, `scripts/`, and the shipped `CLAUDE.md`; anything matching outside the entries above is drift.

- Platform: `grep -rniE 'github|gitlab|\bgh\b|\bglab\b|pull_request|merge_request'`
- Tracker: `grep -rniE 'linear|jira|docs/tasks|docs/briefs|docs/designs|docs/initiatives|docs/assets'`
- Branch model: `grep -rniE '\bmain\b|default branch|guard-main'`
- Toolchain: `grep -rniE 'pnpm|\buv\b|prettier|eslint|ruff|turbo'`
- Infra: `grep -rniE 'lsp|context7|playwright|chrome-devtools|doctor|husky|prepare|worktree|gwt|zed|oauth|cloudflare|mcp slug|guard-secret|\.vars'`
- Lineage: `grep -rniE 'sync-template|lineage|changelog|template-dev|turbo|check-install'`

## Section skeleton

Intro (purpose + maintenance contract) → entry grammar → Git platform (5) → Task tracker (10) → Branch model (7) → Worktree isolation (4) → Stack and toolchain (8) → MCP servers, plugins, agents (11) → Compliance posture (7) → Secrets protection (3) → Design and domain files (3) → Neutral by design (prose) → Template lineage (2) → Drift greps.
