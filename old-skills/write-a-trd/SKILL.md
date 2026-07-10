---
name: write-a-trd
description: Turn an accepted PRD into a technical requirements document — the engineering spec. Does the deep codebase dive, designs modules/interfaces/schema/API and a test strategy, slices the work into vertical tracer bullets with a dependency graph, and lands the TRD as a parent engineering issue with sub-issues. Use when a PRD is accepted and ready to build, when the user wants a technical design or implementation plan for a feature, or to break an accepted PRD into engineering work. This is engineering altitude — it consumes the product PRD, it does not restate it.
argument-hint: '[optional: accepted PRD source id/url, or the PRD from context]'
---

# Write a TRD

A TRD is the engineering spec: _how_ we build a thing. It lives at engineering altitude — architecture, modules, schema, contracts, tests, and the slices that deliver it.

It has **two on-ramps**, and the barrier to entry is deliberately low — reach for a TRD whenever engineering work needs a design before it is built, not only after a product PRD:

- **From an accepted PRD (feature path).** A product feature that went through `/write-a-prd` → `/prd-feedback`. Here the TRD consumes the PRD's problem/users/value rather than restating them, and builds on the **Engineering Context** the feasibility loop already settled, so it does not re-litigate feasibility.
- **From a direct engineering seed (bug / chore / tech-debt path).** Work with no product dimension — a diagnosed bug, a refactor, a dependency bump, a captured chore. There is no PRD and none is needed; the seed itself is the requirement. Skip everything below that assumes a PRD (Engineering Context, user-story coverage) and spec straight from the seed.

**The delivery model — one PRD, one TRD, one PR.** The slices below are units of WORK and TRACKING, not units of delivery. `/implement-trd` builds every slice on a single feature branch in dependency order, each slice landing as one or more commits, and the whole branch ships as ONE pull request. Blocked-by relationships encode COMMIT ORDER within that branch, not separate-PR sequencing. Never frame slices as independently-mergeable PRs.

Read `references/example-trd.md` for the shape and altitude before writing one.

## 1. Locate the source

First settle which on-ramp you are on, because it sets what counts as "done designing." The source is the user's responsibility to provide; do not assume a platform.

- **In context** — a PRD (with its `Engineering Context`) or a seed (a captured issue, a diagnosis) is already in this conversation, e.g. `/prd-feedback` just accepted a PRD or `/diagnose` just root-caused a bug. Use it.
- **A named platform** — the user points at where the PRD or seed issue lives. Pull it through that platform's MCP. **If no MCP is connected, stop** and ask the user to paste it or wire the MCP via `/mcp`.
- **Pasted inline** — use it directly.

**Which on-ramp?**

- If the source is a **PRD**, apply the **acceptance gate**: a feature TRD is only worth writing against an _accepted_ PRD. If the PRD is not marked `Accepted` or has an empty `Engineering Context`, it has not been through the feasibility loop — say so and route the user back to `/prd-feedback` first. Designing against an unreviewed PRD means designing against constraints you have not discovered.
- If the source is a **direct engineering seed** (bug, chore, refactor — no product dimension), there is no gate. The seed is the requirement; proceed straight to the deep dive. This is the low-barrier path; do not invent a PRD to satisfy a ceremony.

## 2. Deep dive — as an implementer

This is the truest, deepest exploration in the chain; the feasibility review scoped the problem, now you design the solution against the real code. Invoke `/grill-me` with this frame:

- **Your role:** the implementing engineer designing the build — concrete, decisive, optimizing for a codebase that compiles at every step.
- **Subject:** the source — an accepted PRD and its Engineering Context, or the engineering seed — read against the live codebase.
- **Objective:** a design complete enough that `/implement-trd` can build it slice by slice without re-deciding architecture.
- **Leave behind:** the design and slices of this TRD.

Explore before you design. Do not narrate each file read; do the work, then present:

1. **Reference implementation** — find 1–2 similar features already built. Read the full vertical slice (schema → validation → service → controller → UI).
2. **Touch points** — every file needing changes; read current contents, note existing interfaces/types/signatures.
3. **Shared code** — search shared packages (`@oneview/validation`, `@oneview/types`, `@oneview/utils`) for reusable schemas/types/helpers.
4. **Schema impact** — read current schema, understand relationships/indexes/constraints/migration patterns.
5. **Test infrastructure** — existing test files for the area; test helpers, fixtures, mocking patterns.
6. **Reference checks** — LSP `findReferences` on shared types/schemas/utilities you will modify, to find every consumer.

Actively look for **deep modules** — ones hiding substantial functionality behind a simple, stable interface — since those are what make the implementation testable in isolation.

## 3. Write the TRD

Fill in the template below. Every engineering decision lives here; none of it belongs in the PRD. Do NOT include specific file paths or code snippets — they go stale fast. Describe interfaces and contracts, not line numbers.

## 4. Slice into vertical tracer bullets

Break the design into **tracer-bullet** slices. Each slice is a thin vertical cut through ALL layers end-to-end (schema, API, UI, tests), NOT a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer it touches.
- A completed slice is demoable or verifiable on its own.
- Prefer many thin slices over few thick ones.
</vertical-slice-rules>

Tag each slice **HITL** (needs human interaction during implementation — an architectural decision, a design review, a prod/migration action only the user can do) or **AFK** (implementable unattended). Prefer AFK where possible. HITL/AFK describes interaction needs on the shared branch; it does not imply separate delivery.

**Coverage check.** Every requirement in the source must map to at least one slice — PRD user stories on the feature path, or the seed's described behavior / repro / acceptance on the engineering path. List anything uncovered and either add a slice or note explicitly why it is deferred. An unmapped requirement is a dropped requirement.

**Single-slice check.** If the design yields exactly one slice, decomposition adds nothing. Ask the user: create one sub-issue anyway for separate tracking, or skip sub-issues and let the parent TRD issue be the single work unit (`/implement-trd` handles both).

## 5. Land the TRD and slices as issues

Engineering work is tracked where engineering works — GitHub — separate from the PRD's product source. The TRD becomes a **parent issue**; each slice becomes a **sub-issue**.

First ensure the `trd` label exists:

```bash
gh label list --json name --jq '.[] | select(.name == "trd")' | grep -q trd || \
  gh label create trd --description "Technical requirements doc — engineering spec, decomposed into Task sub-issues" --color 1D76DB
```

Then:

1. Create the **parent TRD issue** — `gh issue create --title "<title>" --body "<filled TRD template>" --label trd`. The body links back to the PRD source/url so the product context is one click away, never duplicated.
2. Create a **sub-issue per slice** in dependency order (blockers first, so you can reference real numbers) using the sub-issue template below.
3. Set metadata via `/gh-cli` (the `gh` CLI has no `--type` or relationship fields). In one batched pass: look up repo issue type IDs; fetch node IDs for the TRD + all sub-issues; set types (parent TRD → **Feature**, or **Bug** for a bug-fix TRD; sub-issues → **Task**); add `addSubIssue` parent/child links; add `addBlockedBy` links (`issueId` = blocked, `blockingIssueId` = blocker).

<subissue-template>
## Parent TRD

#<trd-issue-number>

## What to build

A concise description of this vertical slice — the end-to-end behavior, not layer-by-layer implementation. Reference sections of the parent TRD rather than duplicating them.

## Acceptance criteria

- [ ] Concretely verifiable criterion 1
- [ ] Concretely verifiable criterion 2

## Blocked by

- Blocked by #<issue-number> (commit order on the shared branch), or "None — can start immediately".

## Requirements addressed

Feature path: PRD user stories by number (via the TRD). Engineering path: the seed behavior/repro this slice resolves.

- User story 3 / "fixes the null deref on empty cart"
- User story 7
  </subissue-template>

**Acceptance criteria must be objectively checkable** — not "works correctly" or "handles edge cases," but specific, testable outcomes a reviewer can tick off.

## 6. Hand off

The TRD and its slices are in context and on GitHub. Invoke `/implement-trd`, which topologically sorts the slices and builds them on one branch via `/tdd`, then ships one PR via `/ship-pr`.

<trd-template>

# TRD: <title>

## Source

**Feature path:** link to the accepted PRD (source/url) and the version this TRD builds on; do not restate the product content. **Engineering path:** link to or summarize the seed (the captured issue, the diagnosis) — the bug, chore, or refactor this TRD addresses.

## Engineering Context

**Feature path:** the constraints, tradeoffs, and chosen path carried from the accepted PRD's Engineering Context, plus links to any binding ADRs in `docs/adr/`. **Engineering path:** the relevant findings (e.g. the proven root cause from `/diagnose`) and any constraints discovered during the deep dive. This is the settled ground the design assumes.

## Architecture & Modules

The modules to build or modify and their interfaces (signatures and contracts, not file paths). Call out deep modules and where the seams are. The reference implementation being followed.

## Schema Changes

Tables/columns/indexes/constraints to add or alter, relationships, and the migration approach. "None" if no schema impact.

## API Contracts

Endpoints/RPC added or changed: shape of request and response, validation, error cases, auth/permission rules.

## Test Strategy

What gets tested and at what level (only external behavior, not implementation details), which modules carry tests, and the prior-art tests in the codebase being mirrored.

## Vertical Slices

The ordered slice list — for each: title, HITL/AFK, blocked-by, and the PRD user stories it covers. This is the dependency graph `/implement-trd` topologically sorts.

## Risks & Open Engineering Questions

Technical risks and anything still unresolved at the engineering level. Distinct from product open questions, which belong to the PRD.

</trd-template>

$ARGUMENTS
