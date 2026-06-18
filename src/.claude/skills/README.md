# OneView Agent Skills

Human-facing map of the skills in this directory. Each skill's own `SKILL.md` is the AI-facing instruction set; this README exists so a developer can see **what exists, when to reach for each one, and how they fit together** without reading every file.

This is the canonical, git-tracked home for the project's skills. These are **project skills**: self-contained and carrying no dependency on any plugin (the superpowers plugin is disabled by default; we vendored the parts we wanted).

## The chain

The chain has a clear line in the sand between **product** (what to build and why) and **engineering** (how to build it). Product owns the PRD; engineering reviews it, specs it, and ships it. Work flows left to right:

```
  PRODUCT  │  ENGINEERING
           │
           │   (tough bug?)
           │    /diagnose ──────────┐
           │                         v
/write-a-prd ─> /prd-feedback ⟲ ─> /write-a-trd ──> /implement-trd ──> /ship-pr
 (the PRD,       (eng feasibility   (the TRD +       (build, in         (draft PR ->
  product        review, loops      vertical         isolation)         review -> QA ->
  altitude,      until accepted;    slices, eng      │                  ready -> CI)
  versioned      writes Eng         altitude)        │                       │
  at source)     Context back)           │           └── /tdd                └── /requesting-code-review
           │           │                 │               (per change)            (the review subagent)
           │     /grill-me (eng frame)    └── absorbs the old /prd-to-issues
           │
/grill-me ─┘  role-parameterized interview primitive — every skill above runs it under its own frame
/grill-with-docs  same interview, but also writes CONTEXT.md + ADRs via /domain-modeling

/capture-task ── file anything to revisit, at any point
/codify ──────── distill the session's durable conventions into the right context file, at any point
```

- `/grill-me` is now a **role-parameterized primitive**, not a front-of-chain step. Each skill invokes it under its own frame (product partner, engineering skeptic, implementer), restating the frame each run so roles don't bleed across a session. Run standalone, it defaults to interviewing the user as an engineering peer. `/grill-with-docs` is the same interview plus glossary/ADR upkeep via `/domain-modeling`.
- `/write-a-prd` (product) generates a product-altitude PRD — problem, users, value, scope, **no implementation** — from a context source the user names (pasted, or pulled from any tracker with an MCP), and writes it back versioned to that source. It runs `/grill-me` in a product frame.
- `/prd-feedback` (engineering) is the iterative bridge: it interrogates the PRD against the real codebase via `/grill-me` in an engineering frame, posts a feasibility verdict (constraints, required tradeoffs, recommended path) back to the PRD's source as a versioned thread, and loops as product revises. When product accepts a version, it writes the **Engineering Context** digest into the PRD and links any binding ADRs.
- `/write-a-trd` (engineering) consumes the accepted PRD + Engineering Context, does the deep codebase dive, and produces the TRD — modules, schema, contracts, test strategy — sliced into vertical tracer bullets with a dependency graph. It lands the TRD as a parent GitHub issue with sub-issues, absorbing what used to be `/prd-to-issues`. One PRD → one TRD → one PR.
- `/implement-trd` builds the slices in dependency order on a single branch, heads-down, surfacing only when truly blocked. It runs `/tdd` per change and hands the branch to `/ship-pr`.
- `/ship-pr` drives a branch from draft PR through the AI review loop (`/requesting-code-review`), a user-QA gate, mark-ready, and CI to green.
- `/capture-task` is the always-available side door: file a bug, feature, or chore as a GitHub issue so it is not forgotten. Its output is shaped to seed `/write-a-prd`.
- `/codify` is the other always-available side door, at the end of work: it distills the few durable conventions a session produced into the narrowest correct context file.

## Chain skills

| Skill                    | Side        | Use it when                                                 | Role                                                       |
| ------------------------ | ----------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `grill-me`               | primitive   | Any skill (or you) needs a relentless framed interview      | Role-parameterized interview to shared understanding       |
| `grill-with-docs`        | primitive   | That interview should also leave a glossary and ADRs behind | `grill-me` + `domain-modeling`, writing docs as it goes    |
| `diagnose`               | front       | A bug needs iterative investigation, not a quick code read  | Root-cause only; hands off to capture/PRD                  |
| `capture-task`           | front       | Anything worth tracking for later (bug/feature/chore)       | Quick-capture to a GitHub issue                            |
| `write-a-prd`            | product     | A product brief needs a structured, versioned PRD           | Product-altitude PRD, sourced + written back to a tracker  |
| `prd-feedback`           | engineering | A PRD needs an engineering feasibility reality check        | Iterative verdict + tradeoffs, looped until accepted       |
| `write-a-trd`            | engineering | An accepted PRD is ready to be specced and sliced           | TRD design + vertical-slice sub-issues with a dep graph    |
| `implement-trd`          | engineering | TRD slices are ready to build                               | Topological TDD implementation, then ship                  |
| `tdd`                    | engineering | Writing any feature or bugfix                               | Red-green-refactor discipline                              |
| `requesting-code-review` | engineering | Work needs review before merge                              | Dispatches the code-reviewer subagent (SOC2 audit comment) |
| `ship-pr`                | engineering | Committed work needs to become a green PR                   | Draft -> review -> QA -> ready -> CI                       |

## Standalone utilities

| Skill             | Use it when                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain-modeling` | Pinning down domain terminology, the ubiquitous language, or recording an architectural decision; maintains `CONTEXT.md` and `docs/adr/`                                                                  |
| `codify`          | A reusable convention emerged worth writing into the right `CLAUDE.md` or a design file (`BRAND_DESIGN.md` / `UI_UX.md`); routes vocabulary and real architectural decisions to `domain-modeling` instead |
| `skill-creator`   | Creating, editing, or evaluating a skill                                                                                                                                                                  |

## Conventions

- Skills compose by invoking each other by name (`/tdd`, `/ship-pr`, `/domain-modeling`, etc.). When you edit one, check its callers and callees in the chain above.
- `/grill-me` is a primitive invoked under a caller-set frame; when you change a calling skill, make sure the frame it passes (role, subject, objective) is still right.
- Keep `SKILL.md` files concise and present-tense. Per-skill depth lives in sibling reference files (e.g. `write-a-prd/references/example-prd.md`, `write-a-trd/references/example-trd.md`, `prd-feedback/references/example-feedback.md`).
- This README is the only human-oriented file here; do not duplicate a skill's full instructions into it. Update the map when a skill's role or the chain's shape changes.
