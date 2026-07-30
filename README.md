# ai_starter

Opinionated AI-first starter template: a Claude Code process suite on a pnpm + Turborepo monorepo skeleton. This is a GitHub template repository — the whole tracked tree is the payload — and simultaneously a project developed in its own right; the rules for working on the template itself live in [.claude/rules/template-dev.md](./.claude/rules/template-dev.md).

## What Ships

- **AI process suite** ([`.claude/`](./.claude/)) — the skill chain (grilling lenses, capture/implement/review flow), review-board agents, guard hooks, and the permission/secrets registry; the human-readable map is [`.claude/skills/README.md`](./.claude/skills/README.md).
- **Context files** ([`CLAUDE.md`](./CLAUDE.md), [`UI_UX.md`](./UI_UX.md), [`BRAND_DESIGN.md`](./BRAND_DESIGN.md)) — AI coding standards plus the design foundations: brand-agnostic UI/UX floors and a brand skeleton filled by `/brand-init`.
- **Monorepo skeleton** — `apps/*` and `packages/*` pnpm workspaces with a Turborepo task graph (`turbo build` / `lint` / `test` / `typecheck`), Prettier + husky pre-commit, and pnpm-only installs enforced at `preinstall`. No example app: the suite ships process, not product code.
- **Setup scripts** ([`scripts/setup/`](./scripts/setup/)) — `doctor.sh` (warn-only LSP binary check, wired into `prepare`), `check-install.mjs` (pnpm-only + Node-major preinstall guard against `.nvmrc`), `gwt-add.sh`/`gwt-remove.sh` (git worktree helpers for parallel AI branches).
- **MCP config** ([`.mcp.json`](./.mcp.json)) — browser-verification servers plus boilerplate stanzas for common services, all launched via `pnpm dlx`.
- **Update channel** ([`CHANGELOG.md`](./CHANGELOG.md) + the `sync-template` skill) — versioned releases instances pull on their own terms.

## Using the Template

Create a new project from it — "Use this template" on GitHub, or:

```bash
gh repo create <your-project> --template donohoo13/ai_starter --private --clone
```

Then run `/project-init` in a Claude Code session there: a one-shot onboarding audit that tailors the suite to the project's platform, stack, and tracker, clears template residue (this README included), stamps the template lineage, and removes itself when done. For an existing repo, copy the payload in by hand (`.claude/` and the sibling context files, scripts, and configs) and run `/project-init` the same way — it detects partial copies and degrades gracefully. This is a starting point, not a framework: add your own apps and packages on top; the AI configuration works regardless of what you build.

First-run network note: the initial `pnpm install` always downloads the pinned Node runtime on a cold pnpm store (`devEngines.runtime` in `package.json`, ~57MB compressed and ~218MB unpacked, fetched from `nodejs.org` even when your ambient Node already matches), so `nodejs.org` reachability is a hard requirement for `pnpm install` rather than a fallback; the store is content-addressed, so extra worktrees reuse it rather than re-downloading, and CI caches it by caching `$(pnpm store path)`. Alpine and other musl-based images provision the pin the same way from `unofficial-builds.nodejs.org` (community musl builds, pinned by integrity hash in the lockfile); deleting the `devEngines` block and letting the base image supply Node remains a supported opt-out. The browser MCP servers resolve their packages through `pnpm dlx` on first session start, and Playwright fetches its Chromium binary (~100MB) on its first launch — one-time, cache-warmed costs after that. Restricted networks need access to the npm registry, `nodejs.org` (plus `unofficial-builds.nodejs.org` on musl), and Playwright's browser CDN.

## Receiving Template Updates

Instances share no git history with the template, so updates are pulled, never pushed. Each release is a `CHANGELOG.md` entry (what, why, adaptation notes) plus a matching `vX.Y.Z` tag; the shipped `sync-template` skill reads the `Template lineage:` stamp `project-init` left in `CLAUDE.md`, fetches the template remote, and walks unapplied releases as an itemized adaptation interview — landing working-tree changes for your review and logging outcomes to `docs/template-sync-log.md`. Run `/sync-template` whenever you want to catch up; skipping releases you don't want is a recorded, first-class outcome.

## Maintaining This Repo

The only prerequisite is pnpm; it provisions the pinned Node itself, so you never install a specific Node by hand.

- **macOS / Linux (Homebrew):** `brew install node pnpm` — Homebrew's pnpm needs a Node present to run.
- **Apple Silicon with no Node yet:** `curl -fsSL https://get.pnpm.io/install.sh | sh -` installs a self-contained pnpm that needs no prior Node (Intel Macs use the Homebrew path above).

```bash
pnpm install      # downloads the pinned Node (devEngines.runtime), dev tooling, husky pre-commit, doctor.sh
pnpm format:check # Prettier check across the repo
```

`pnpm install` downloads the exact Node pinned in `package.json`'s `devEngines.runtime` and runs every `pnpm` command — scripts and `pnpm exec` alike — under it, regardless of the Node on your shell; run one-off Node through `pnpm exec node`, not bare `node`, to stay on the pinned version.

> [!NOTE]
> While the Node pin stays on 24, `corepack enable` is an equivalent way to activate the pinned pnpm from the `packageManager` field. Node 25+ removes Corepack, so a bump off Node 24 must migrate pnpm activation off it — to a direct pnpm install or pnpm's native package-manager management. See the Node-pin rules in [CLAUDE.md](./CLAUDE.md).

Template development rules — payload semantics, the changelog/tag release discipline, what never runs here — live in [.claude/rules/template-dev.md](./.claude/rules/template-dev.md). There is no build or test step: the workspace ships empty by design.

## License

ISC
