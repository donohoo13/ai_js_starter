---
type: chore
status: done
created: 2026-07-30
---

# Align linear MCP wiring with its CLAUDE.md claim

## Context

The v1.2.1 review board (three seats converging independently) surfaced this while reviewing the MCP plugin migration branch: the template's Linear guidance and its actual wiring disagree, and the drift predates that branch — it existed on `main`. It survived the migration untouched because the branch's scope was explicitly limited to the `context7` and `chrome-devtools` servers; the branch restored the `linear` plugin to `enabledPlugins` after a dialog-side rewrite dropped it, so the plugin is again the working provider, but the docs still describe a wiring that does not exist.

## Problem

`CLAUDE.md`'s MCP Tools bullet for Linear says the server is "Configured at project scope in `.mcp.json`" and names the tool prefix `mcp__linear__*`, but `.mcp.json` has no `linear` stanza; the actual provider is the `linear@claude-plugins-official` plugin, whose tools carry the prefix `mcp__plugin_linear_linear__*` — the spelling `.claude/settings.json` `permissions.allow` actually grants. Desired: one intended wiring, with the CLAUDE.md bullet, the permission entry, and the provider (plugin entry or `.mcp.json` stanza) all naming the same thing.

## Scope

- In scope (must-have): decide the intended provider, then align the CLAUDE.md bullet, the `permissions.allow` prefix, and the provider config to it; a CHANGELOG entry if the resolution changes payload behavior.
- Out of scope (non-goals, named so the task does not expand silently): any change to the other MCP stanzas or plugins; Linear workflow guidance beyond the wiring facts.

## Requirements

- Claude Code keys MCP OAuth tokens by server name in one machine-global store, so the CLAUDE.md account-bound-server rule requires project-scoped OAuth servers to be named `<service-server>-<slug>` in `.mcp.json`; Linear is account-bound OAuth, which is an argument that a fixed-name plugin is the wrong home for it per the template's own rule.
- A `.mcp.json` resolution would follow the existing boilerplate pattern (`linear-[project]` stanza, per-user `/mcp` OAuth) and would need the plugin dropped from `enabledPlugins` plus the old permission prefix removed, logged in the CHANGELOG.
- A plugin resolution keeps `enabledPlugins` as-is and rewrites the CLAUDE.md bullet to name the plugin and the `mcp__plugin_linear_linear__*` prefix truthfully.
- Whichever way it lands, the CLAUDE.md bullet, the allow-list entry, and the provider must be verified against each other in the same change; this drift existed because they were edited independently.

## Acceptance criteria

- [x] Exactly one Linear provider exists and the CLAUDE.md bullet names it and its real tool prefix — the `linear-[project]` stanza is the provider; the bullet names it, its URL, and the account-bound rationale.
- [x] `permissions.allow` carries only the prefix that provider actually serves — the dead plugin prefix is removed; `[project]` servers are never pre-allowed, matching the clerk/stripe/posthog pattern.
- [x] If payload behavior changed, the CHANGELOG entry records what and why — v1.2.2.

## Dependencies

None; the decision is internal to the template.

## Risks / open questions

- [x] Which wiring is intended — resolved: the `linear-[project]` `.mcp.json` boilerplate stanza, because the fixed-name plugin shares one OAuth token machine-wide against the template's own account-bound rule, and `project-init`'s OAuth-isolation step already offers exactly this shape for Linear detections.
- [x] Does anything beyond CLAUDE.md reference Linear tooling — no: a payload-wide grep found only the two `settings.json` entries and the CLAUDE.md bullet as wiring; every other mention is Linear-the-product prose (brand anchors, `project-init` tracker detection) and stands.
- [x] Live-token re-auth risk — real but small: a machine that OAuth'd the plugin's fixed-name server re-authenticates once per project via `/mcp` against the new name; recorded in the v1.2.2 adaptation notes.

## Design decisions

- Provider is the `linear-[project]` HTTP stanza at `https://mcp.linear.app/mcp` (endpoint verified live: it answers the MCP OAuth 401 challenge with resource metadata that the `/mcp` flow consumes); the plugin leaves `enabledPlugins` and its allow-list prefix goes with it.
- No pre-allowed tool entries for the new server: `[project]`-placeholder names cannot be meaningfully allow-listed in the template, matching the shipped posture for clerk/stripe/posthog.
- The one-account-everywhere posture remains available to instances by keeping the plugin and rewriting the bullet truthfully; the defect fixed here is doc-vs-wiring disagreement, not the plugin's existence.
