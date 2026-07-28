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

First-run network note: the initial `pnpm install` may download the pinned Node runtime (`useNodeVersion` in `pnpm-workspace.yaml`), the browser MCP servers resolve their packages through `pnpm dlx` on first session start, and Playwright fetches its Chromium binary (~100MB) on its first launch — one-time, cache-warmed costs after that. Restricted networks need access to the npm registry, `nodejs.org`, and Playwright's browser CDN.

## Receiving Template Updates

Instances share no git history with the template, so updates are pulled, never pushed. Each release is a `CHANGELOG.md` entry (what, why, adaptation notes) plus a matching `vX.Y.Z` tag; the shipped `sync-template` skill reads the `Template lineage:` stamp `project-init` left in `CLAUDE.md`, fetches the template remote, and walks unapplied releases as an itemized adaptation interview — landing working-tree changes for your review and logging outcomes to `docs/template-sync-log.md`. Run `/sync-template` whenever you want to catch up; skipping releases you don't want is a recorded, first-class outcome.

## Maintaining This Repo

```bash
pnpm install      # dev tooling + husky pre-commit hook (Prettier auto-format) + doctor.sh
pnpm format:check # Prettier check across the repo
```

Template development rules — payload semantics, the changelog/tag release discipline, what never runs here — live in [.claude/rules/template-dev.md](./.claude/rules/template-dev.md). There is no build or test step: the workspace ships empty by design.

## License

ISC
