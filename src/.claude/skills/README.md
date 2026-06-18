# OneView Agent Skills

Human-facing map of the skills in this directory. Each skill's own `SKILL.md` is the AI-facing instruction set; this README exists so a developer can see **what exists, when to reach for each one, and how they fit together** without reading every file.

This is the canonical, git-tracked home for the project's skills. These are **project skills**: self-contained and carrying no dependency on any plugin (the superpowers plugin is disabled by default; we vendored the parts we wanted).

## The chain

Most product work flows through one path, start to finish:

```
                 (tough bug?)
                  /diagnose ──────────┐
                                       v
/grill-me ──────────> /write-a-prd ──> /prd-to-issues ──> /implement-prd ──> /ship-pr
/grill-with-docs ────^  (the PRD)       (vertical slices)   (build, in        (draft PR ->
 (interview; also                                            isolation)        review -> QA ->
  writes CONTEXT.md +                                            │             ready -> CI)
  ADRs via                                                       │                  │
  /domain-modeling)                                              └── /tdd           └── /requesting-code-review
                                                                     (per change)       (the review subagent)

/capture-task ── file anything to revisit, at any point
/codify ──────── distill the session's durable conventions into the right context file, at any point
```

- **Start** with `/grill-me` (interview a plan to shared understanding) or `/diagnose` (root-cause a bug too hard to read from the code). Both are front-of-chain precursors. Use `/grill-with-docs` instead of `/grill-me` when the interview should also leave durable artifacts behind: it runs the same relentless interview but maintains the glossary (`CONTEXT.md`) and architectural decision records (`docs/adr/`) as you go, via `/domain-modeling`.
- `/write-a-prd` turns shared understanding into a PRD issue. It skips re-interviewing if `/grill-me` already ran, and splits genuinely independent features into separate PRDs.
- `/prd-to-issues` slices one PRD into vertical-slice sub-issues. Sub-issues are tracking/commit units, not delivery units: one PRD ships as ONE pull request, with each sub-issue landing as commits on the shared PRD branch.
- `/implement-prd` builds the sub-issues in dependency order on a single feature branch, heads-down, surfacing only when truly blocked. It runs `/tdd` per change and hands the one branch to `/ship-pr` for the one PR.
- `/ship-pr` drives a branch from draft PR through the AI review loop (`/requesting-code-review`), a user-QA gate, mark-ready, and CI to green.
- `/capture-task` is the always-available side door: file a bug, feature, or chore as a GitHub issue so it is not forgotten. Its output is shaped to seed `/write-a-prd`.
- `/codify` is the other always-available side door, at the end of work: it distills the few durable conventions a session produced into the narrowest correct context file.

## Chain skills

| Skill                    | Use it when                                                 | Role                                                       |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `grill-me`               | You have a plan/design to stress-test before building       | Interview to shared understanding                          |
| `grill-with-docs`        | That interview should also leave a glossary and ADRs behind | `grill-me` + `domain-modeling`, writing docs as it goes    |
| `diagnose`               | A bug needs iterative investigation, not a quick code read  | Root-cause only; hands off to capture/PRD                  |
| `capture-task`           | Anything worth tracking for later (bug/feature/chore)       | Quick-capture to a GitHub issue                            |
| `write-a-prd`            | A feature/fix needs a real spec                             | PRD issue, seeded by grill-me or a capture                 |
| `prd-to-issues`          | A PRD is big enough to slice                                | Vertical-slice sub-issues with a dependency graph          |
| `implement-prd`          | Sub-issues are ready to build                               | Topological TDD implementation, then ship                  |
| `tdd`                    | Writing any feature or bugfix                               | Red-green-refactor discipline                              |
| `requesting-code-review` | Work needs review before merge                              | Dispatches the code-reviewer subagent (SOC2 audit comment) |
| `ship-pr`                | Committed work needs to become a green PR                   | Draft -> review -> QA -> ready -> CI                       |

## Standalone utilities

| Skill             | Use it when                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain-modeling` | Pinning down domain terminology, the ubiquitous language, or recording an architectural decision; maintains `CONTEXT.md` and `docs/adr/`                                                                  |
| `codify`          | A reusable convention emerged worth writing into the right `CLAUDE.md` or a design file (`BRAND_DESIGN.md` / `UI_UX.md`); routes vocabulary and real architectural decisions to `domain-modeling` instead |
| `skill-creator`   | Creating, editing, or evaluating a skill                                                                                                                                                                  |

## Conventions

- Skills compose by invoking each other by name (`/tdd`, `/ship-pr`, `/domain-modeling`, etc.). When you edit one, check its callers and callees in the chain above.
- Keep `SKILL.md` files concise and present-tense. Per-skill depth lives in sibling reference files (e.g. `domain-modeling/CONTEXT-FORMAT.md`, `domain-modeling/ADR-FORMAT.md`).
- This README is the only human-oriented file here; do not duplicate a skill's full instructions into it. Update the map when a skill's role or the chain's shape changes.

```

```
