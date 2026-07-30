---
type: chore
status: in-progress
created: 2026-07-30
---

# Migrate npx-launched plugin MCP servers to `.mcp.json` transports

## Context

The v1.2.0 Node pin (`devEngines.runtime.version: "24.18.1"`, `onFail: "download"`) collides with how Claude Code launches plugin MCP servers: it spawns them with cwd set to the project root, the `chrome-devtools-mcp` and `context7` plugins both spawn via `npx`, and npm (bundled with Node 24) enforces the cwd project's `devEngines` before running anything, treating `onFail: "download"` as an error. Observed in a live session with ambient Node `v24.17.0`: both plugin servers die instantly with `EBADDEVENGINES` (verbatim in `~/Library/Caches/claude-cli-nodejs/<project>/mcp-logs-plugin-*/`), surfacing only as `-32000` in `/plugin`. The `check-install.mjs` header's accepted-cost paragraph priced this npm behavior for `npm install` only, not the plugin blast radius. Grilled in-session 2026-07-30 with claude-code-guide and research-analyst evidence; all decisions below are user-confirmed.

## Problem

Current behavior: any Claude Code session launched from a shell whose ambient Node differs from the exact pin loses every npx-launched plugin MCP server (`chrome-devtools`, `context7`) with an inscrutable `-32000`, and nothing on the machine names the cause. Desired behavior: these servers run through transports immune to ambient drift (remote HTTP for `context7`, `pnpm dlx` for `chrome-devtools`, since pnpm downloads the pinned runtime rather than erroring), and residual drift becomes a ten-second diagnosis via a warn-only `doctor.sh` line.

## Scope

- In scope (must-have): `context7` remote-HTTP stanza in `.mcp.json` plus plugin removal; `chrome-devtools` same-named `pnpm dlx` stanza shadowing the plugin's server while the plugin stays for its six skills; tool-prefix updates in `.claude/settings.json` permissions, `CLAUDE.md` MCP Tools, and `.claude/agents/research-analyst.md`; `doctor.sh` ambient-vs-`.nvmrc` warning; `check-install.mjs` header accepted-cost sentence; `template-dev.md` disable-list sentence amendment; local (untracked) `.claude/settings.local.json` adjustments; `CHANGELOG.md` entry.
- Out of scope (non-goals, named so the task does not expand silently): the remote-HTTP plugins (cloudflare, posthog) which never touch Node; the LSP plugins; the PostHog `Unauthorized` seen in older logs (separate auth issue); wiring a Context7 API key (documented as escalation only); any change to the Node pin mechanism itself.

## Requirements

- Server names in `.mcp.json` must exactly match the plugin server names (`context7`, `chrome-devtools`) — scope precedence (project beats plugin, matched by name, only the winner connects) is the shadowing mechanism.
- `context7` ships keyless: `{"type": "http", "url": "https://mcp.context7.com/mcp"}`, matching the `clerk-[project]` house pattern for unauthenticated HTTP servers.
- `chrome-devtools` ships as `pnpm dlx chrome-devtools-mcp@1.6.0` (version proven working on the dev machine), matching the `playwright-local`/`firefox-devtools` house pattern.
- Tool prefixes migrate from `mcp__plugin_context7_context7__*` and `mcp__plugin_chrome-devtools-mcp_chrome-devtools__*` to the project-server forms; verify exact post-connect tool names in `/mcp` before landing reference edits rather than assuming them.
- `context7@claude-plugins-official` leaves `enabledPlugins` (it ships nothing but the server); `chrome-devtools-mcp@claude-plugins-official` stays `true` for its skills.
- The `doctor.sh` check compares ambient `node --version` to `.nvmrc`, names both versions and the npx consequence in its warning, stays warn-only (`exit 0`), and stays bash-3.2 compatible.
- `CLAUDE.md` and `template-dev.md` edits load `curate-context` first; the CLAUDE.md `context7` note documents the key escalation path (`Authorization: Bearer` via `${CONTEXT7_API_KEY}` env expansion, never a literal in the committed file).
- Payload change lands with a `CHANGELOG.md` entry (what/why/adaptation notes) and releases as a `vX.Y.Z` tag post-merge per template rules.

## Acceptance criteria

- [ ] From a shell whose ambient Node deliberately differs from `.nvmrc`, a fresh session connects both `context7` and `chrome-devtools` MCP servers (the failure class this task removes).
- [ ] `/mcp` shows exactly one `chrome-devtools` server, launched via the `pnpm dlx` command, and `/plugin` still lists the chrome-devtools plugin's skills.
- [ ] A Context7 docs query succeeds through the HTTP stanza from a template-dev session (`settings.local.json` deliberately keeps `context7` enabled).
- [ ] `scripts/setup/doctor.sh` warns on a drifted shell naming both versions, prints nothing extra on a matching shell, and exits 0 in both cases.
- [ ] `grep -r "mcp__plugin_context7\|mcp__plugin_chrome-devtools-mcp"` across the payload returns nothing.
- [ ] `pnpm format:check` passes and the `CHANGELOG.md` entry is present.

## Dependencies

Network access for the Context7 endpoint and the first `pnpm dlx` fetch; nothing else external.

## Risks / open questions

- [ ] Shadowing verification: docs state project-over-plugin name precedence, but plugin dedup may be endpoint-based; if both servers spawn, fall back to documenting the per-machine `/mcp` toggle (`disabledMcpServers` in `~/.claude.json`) in the README, or drop the plugin and lose the skills — decide on evidence, not in advance.
- [ ] Context7 keyless rate limits are documented only as "low" with no numbers; if sessions bounce off them, wire the documented key path.
- [ ] `pnpm dlx` under ambient drift is reasoned safe (pnpm downloads on `devEngines` mismatch, never hard-fails) but unmeasured here since template-dev disables those stanzas locally; verify during QA, including first-spawn dlx fetch latency against the 30s MCP connect timeout (a warm cache clears it; retry once if the first connect times out).
- [ ] Disabling the project `chrome-devtools` stanza in `settings.local.json` may un-shadow the plugin server on this machine; harmless either way, note the observed behavior at QA.

## Design decisions

- Transport per server, chosen by what each needs: `context7` is a thin client to Context7's backend, so remote HTTP removes the local process entirely (rate limits are server-side and transport-independent, so stdio would add maintenance for zero limit relief); `chrome-devtools` must run locally to drive Chrome, so it takes the `pnpm dlx` spelling that the template's own `playwright-local` and `firefox-devtools` stanzas already prove out.
- Shadowing over toggling for chrome-devtools: a same-named project stanza overrides the plugin's `npx` spawn by scope precedence with nothing to configure per machine, whereas the only per-server plugin disable is a `/mcp` UI toggle recorded in `~/.claude.json` — not shippable in the payload.
- The fix class is "npm never spawns with project cwd for MCP servers": npm treats `devEngines` `onFail: "download"` as an error while pnpm implements it by downloading, so `pnpm dlx` and remote HTTP are both immune; a `cwd` field workaround does not exist in `.mcp.json` (only `command`/`args`/`env`).
- Drift detection stays because the migration removes only the MCP instance of the failure: any manual `npx` with project cwd still dies the same way, so `doctor.sh` warns (ambient vs `.nvmrc`) and the `check-install.mjs` header's accepted-cost paragraph grows one sentence naming the npx blast radius.
- Template-dev machine keeps Context7: `settings.local.json` adds `chrome-devtools` to `disabledMcpjsonServers` but not `context7`, since the Context7-first docs rule binds template-dev sessions too; the `template-dev.md` sentence claiming sessions here need none of the shipped servers is amended in the same change.
- Reference implementations: `playwright-local` stanza for the dlx pattern, `clerk-[project]` stanza for keyless HTTP.

## Test strategy

This repo ships no application code, so validation is `pnpm format:check`, JSON parse of the edited config files, and the acceptance criteria exercised as manual QA at the real seams (a fresh session's `/mcp` and `/plugin` state, a Context7 query, `doctor.sh` under a drifted and a matching shell). The `check-install.battery.mjs` suite is untouched and must stay green; no new automated harness is added for the one-comparison `doctor.sh` check.

## Slices

- [x] Migrate `context7`: HTTP stanza, drop the plugin from `enabledPlugins`, retarget permissions/CLAUDE.md/research-analyst references to verified tool names (`resolve-library-id`, `query-docs`, confirmed against the live endpoint, server v3.2.5) — demoable as a successful Context7 query from a drifted shell.
- [ ] Shadow `chrome-devtools`: dlx stanza, permissions/CLAUDE.md retargets, local `settings.local.json` update, `template-dev.md` amendment — demoable as a single connected server in `/mcp` with plugin skills intact; carries the shadowing QA check.
- [ ] Drift detection: `doctor.sh` ambient-vs-`.nvmrc` warning plus the `check-install.mjs` header sentence — demoable by running `doctor.sh` under a mismatched shell.
- [ ] Close out: payload-wide grep for stale plugin prefixes, `pnpm format:check`, `CHANGELOG.md` entry — demoable as the green checks themselves.
