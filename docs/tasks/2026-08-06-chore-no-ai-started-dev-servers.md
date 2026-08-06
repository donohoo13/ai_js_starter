---
type: chore
status: done
created: 2026-08-06
incumbent: extend
---

# Ban AI-started dev servers across the process suite

## Context

Instances keep hitting real problems from sessions starting dev servers themselves — most often to feed Playwright verification: orphaned processes, port conflicts with the user's own server, and builds blocked on infrastructure the user never asked the AI to run. A grilling session on 2026-08-06 settled the rule: servers are user-run, always. The suite today does not merely fail to say this — it licenses starts in three places: the CLAUDE.md process-lifecycle rule regulates cleanup of "dev servers... this session started" (implicitly legalizing the start), implement-task's per-slice render check and task-end render pass require screenshots of a live surface mid-build (an implicit mandate), and the QA-gate ban ("never start servers") is scoped only to the handoff moment.

## Problem

Current behavior: a session that needs pixels starts a server, because the render-check steps demand a live surface and nothing forbids the start until QA. Desired behavior: no AI-initiated start of a dev instance, ever, in any process; mid-build validation is typecheck, lint, tests, and a static composition check against the design artifact; live-surface verification happens once, at the end, against a server the user starts; the one legitimate way for a session to get a running app is to hand the user a ready-to-run command and wait.

## Scope

- In scope (must-have): a `guard-dev-server` PreToolUse hook plus its `settings.json` registration and test battery; restating the CLAUDE.md process-lifecycle block and the `playwright-local` line; reworking implement-task's render-check and land-phase sections plus the demolition carve-out capture mechanic; matching edits to grill-engineer's build-now exit, grill-design's capture steps, and diagnose's feedback-loop phase; README skill-blurb updates, `project-init` fork-points entry, and the CHANGELOG entry.
- Nice to have: none.
- Out of scope (non-goals, named so the task does not expand silently): the built-in `run` skill (harness-owned; the CLAUDE.md absolute overrides it, no file to edit); the user-global `~/.claude/CLAUDE.md` twin (separate curate-context edit outside this repo); changes to the static `permissions.deny` list (`Bash(*wrangler*)` already covers `wrangler dev` and stays as-is).

## Requirements

- The ban covers AI-initiated starts of anything that serves the project or its dependencies: app dev instances (`pnpm dev`-type commands), preview and storybook servers, tunnels, and service containers.
- Tooling daemons the harness itself runs (MCP servers, LSP servers) are exempt — rule wording must not catch them.
- The exception is hardened: even a direct user order routes to a user-run command; the session hands the exact command (noting the `!` prefix runs it in-session) and waits, never runs it itself.
- Mid-build validation in implement-task is typecheck, lint, tests, and a static check of the built code against the design artifact's layout, hierarchy, and disclosure plan — no live surface, no screenshots, no Playwright.
- The mid-build checkpoint fires on deviation, never size: a slice that departed from the design artifact (could not follow its plan and improvised, or composed surface the artifact does not govern) stops after the slice completes and offers the user verification; conformant slices continue without stopping.
- The task-end render pass survives as an offer, not a requirement: at land, the session asks the user to start the app and provide the URL; on yes, it drives Playwright against that server (both breakpoints, both themes, judged against artifact, Experience intent, Source fidelity, and `UI_UX.md` floors) and the screenshots ride into QA; on decline, QA proceeds on the script alone with the evidence gap stated plainly.
- Demolition carve-out captures cannot defer (the surface dies), so a `replace` task declaring carve-outs asks the user to start the app at pre-flight; declining falls to the existing prose-fallback ("store nothing and write the carve-out into the task file as prose").
- grill-design reference-implementation screenshots and diagnose feedback loops needing a live app use the same mechanic: hand the command, wait; these sessions are interactive so the ask is natural.
- The hook is a gate, not a seal — same stance as `guard-secret-read`: a script that spawns a server evades the pattern list, and the CLAUDE.md rule is what covers evasion routes, so the rule text stands alone without the hook and the hook text says what to do instead of the blocked command.
- The kill rule survives restated for what remains legal: long-running non-server processes a session starts (watch-mode runners, background jobs) still get killed when no longer needed, with the same two exceptions and reporting duties; dev servers, tunnels, and containers move out of its example list because sessions no longer start them.
- The hook's pattern list is a `project-init` fork point: the template ships common spellings and init tailors them to the instance's real dev commands.
- CLAUDE.md documents the hook in the Standards section the way the secret gate is documented: mechanism, prefilter, and the gap.

## Acceptance criteria

- [x] `guard-dev-server.mjs` exits 2 with an instructive message on `pnpm dev`, `npm run dev`, `yarn dev`, `turbo dev`, `vite`, `vite dev`, `vite preview`, `next dev`, `astro dev`, `remix dev`, `storybook`, `ngrok`, `cloudflared tunnel`, and `docker compose up`, including inside compound commands (`cd app && pnpm dev`) and `run_in_background` calls, and exits 0 on non-server commands containing similar substrings (`pnpm devtools-check`, `git commit -m "fix dev server docs"`).
- [x] The hook is registered in `settings.json` under the existing `PreToolUse` Bash matcher with a `case` prefilter consistent with the sibling hooks, and fails open on launch failure exactly as `guard-main` documents.
- [x] `scripts/test/guard-dev-server.battery.mjs` covers the block and allow cases above by piping crafted tool-call JSON through the command string registered in `settings.json` (read live, so prefilter and hook cannot drift apart unseen), asserting exit codes and stderr fragments, and passes via `pnpm exec node scripts/test/guard-dev-server.battery.mjs`; CI runs it and fires on `.claude/hooks/**` changes.
- [x] CLAUDE.md states the ban as an absolute, restates the process-lifecycle block per the prose-restatement rule, scopes the `playwright-local` line to user-started servers, and documents the hook; no CLAUDE.md line still implies a session may start a server.
- [x] implement-task's SKILL.md carries no mid-build live-surface requirement: the per-slice render check is replaced by the static artifact check plus the off-plan checkpoint, the land phase poses the render pass as an offer with the user-started server mechanic, and the QA gate keeps its existing instructions-only language.
- [x] The demolition reference asks for a user-started app at pre-flight when carve-outs are declared and falls back to prose on decline.
- [x] grill-engineer's build-now exit, grill-design's capture steps, and diagnose's feedback-loop phase each state the hand-the-command mechanic where their flows need a live app.
- [x] A repo-wide grep for the old licensing language (`this session started (dev servers`, mid-build screenshot mandates, unscoped Playwright verification) returns only history records (`CHANGELOG.md`, `docs/tasks/`, `docs/adr/`, `docs/notes/`).
- [x] `.claude/skills/README.md` blurbs, `project-init`'s fork-points reference, and `CHANGELOG.md` reflect the change.
- [x] `pnpm format:check` passes.

## Dependencies

None external; edits span CLAUDE.md, `.claude/hooks/`, `.claude/settings.json`, `.claude/skills/`, and `scripts/test/` only.

## Risks / open questions

- [ ] Pattern-list false positives: a project script legitimately named `dev` that is not a server (`pnpm dev:codegen`) would be blocked; the shipped list matches the bare-server spellings narrowly and the fork point exists precisely so instances tune it. Not a blocker.
- [ ] Prose-restatement blast radius: the CLAUDE.md process-lifecycle block and implement-task's render sections are load-bearing and heavily cross-referenced; each edit follows the owning skill (curate-context, skill-creator) and the grep criterion catches stragglers.

## Design decisions

- `incumbent: extend`: every touched doc, hook registration, and skill evolves in place behind its existing interface; no file dies and nothing is demolished.
- Boundary (grilled): banned = AI-initiated starts of dev instances, preview/storybook servers, tunnels, service containers; exempt = harness tooling daemons (MCP, LSP); the exception is hardened — user-directed starts become user-run commands, with the session handing the command and waiting.
- Enforcement (grilled): instruction + hook, matching the repo's two-tier precedent; the hook makes the common case mechanical, the CLAUDE.md absolute covers what patterns cannot, and the deny message routes to the correct behavior rather than merely refusing.
- Checkpoint trigger (grilled): deviation-based, never size-based — off-plan slices stop and offer verification, conformant slices run through; "off-plan" means the build departed from the design artifact's layout/hierarchy/disclosure plan or composed surface the artifact does not govern.
- Render pass (grilled): survives at land as an offer against a user-started server; decline is legitimate and leaves QA on the script with the gap stated, because the alternative silently converts an offer into a requirement.
- Hook shape: follows `guard-main.mjs` — stdin JSON, quote-blanking, segment splitting on `&&`/`||`/`;`/newlines so compound commands are caught, exit 2 with stderr for block, fail-open on launch failure, `case` prefilter in `settings.json` to keep the per-call cost near zero.
- Test shape: follows `scripts/test/check-install.battery.mjs` — a dependency-free battery asserting exit codes and message fragments, run via `pnpm exec node`.

## Test strategy

The hook is the only executable surface: its battery pipes crafted `{tool_input: {command}}` JSON to the real hook file and asserts exit code plus stderr fragment per case, mirroring `check-install.battery.mjs`'s fixture style at the hook's actual interface (stdin in, exit code out) — never unit-testing its internal parsing helpers. Doc edits are validated by the acceptance-criteria grep sweep and `pnpm format:check`; the `turbo` tasks no-op on the empty workspace per template rules.

## Slices

- [x] `guard-dev-server.mjs` + `settings.json` registration + test battery — the enforcement layer, demoable by piping a `pnpm dev` payload and watching it block.
- [x] CLAUDE.md restatement: the ban as an absolute, the process-lifecycle block rewritten, the `playwright-local` line scoped, the hook documented (loads `curate-context`).
- [x] implement-task SKILL.md + demolition reference: static artifact check, off-plan checkpoint, offered land-phase render pass, pre-flight carve-out ask (loads `skill-creator`).
- [x] grill-engineer build-now, grill-design capture steps, diagnose feedback loop: hand-the-command mechanic (loads `skill-creator`).
- [x] README blurbs + fork-points entry + CHANGELOG entry — the propagation layer, closing the grep criterion.
