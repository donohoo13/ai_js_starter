# ai_js_starter

Opinionated JS/TS starter template optimized for AI-assisted development with Claude Code. The repo is two layers: everything under [`src/`](./src/) is the product — the payload copied into new projects — and everything at the root is tooling for maintaining that payload.

## What Ships

- **AI process suite** ([`src/.claude/`](./src/.claude/)) — the skill chain (grilling lenses, capture/implement/review flow), review-board agents, guard hooks, and permission lists; the human-readable map is [`src/.claude/skills/README.md`](./src/.claude/skills/README.md).
- **Context files** ([`src/CLAUDE.md`](./src/CLAUDE.md), [`src/UI_UX.md`](./src/UI_UX.md), [`src/BRAND_DESIGN.md`](./src/BRAND_DESIGN.md)) — AI coding standards plus the design foundations: brand-agnostic UI/UX floors and a brand skeleton filled by `/brand-init`.
- **Setup scripts** ([`src/scripts/setup/`](./src/scripts/setup/)) — `doctor.sh` (warn-only LSP binary check), `gwt-add.sh`/`gwt-remove.sh` (git worktree helpers for parallel AI branches), `check-node-version.mjs` (preinstall Node-major guard).
- **MCP config** ([`src/.mcp.json`](./src/.mcp.json)) — browser-verification servers plus boilerplate stanzas for common services.

## Using the Template

Copy the payload — the contents of `src/` (the `.claude` directory and its sibling files) — into the destination project's root, then run `/project-init` there: a one-shot onboarding audit that tailors the suite to the project's platform, stack, and tracker, and removes itself when done. This is a starting point, not a framework: add your own tooling (TypeScript, React, Node, etc.) on top; the AI configuration works regardless of what you build.

## Maintaining This Repo

```bash
pnpm install      # dev tooling + husky pre-commit hook (Prettier auto-format)
pnpm format:check # Prettier check across the repo
```

The root `CLAUDE.md`, `.claude/skills/`, and `.claude/agents/` govern AI sessions working on the template itself; there is no build or test step because the repo contains no application code.

## License

ISC
