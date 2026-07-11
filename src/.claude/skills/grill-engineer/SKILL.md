---
name: grill-engineer
description: 'Engineering-lens grilling session — interview the user as an implementing-engineer peer about a change to this codebase (feature, bug, chore, refactor, architecture question), grounding every fact in the real code, then land the outcome through one confirmed exit: build it now with TDD, spec it into a docs/tasks file with design decisions and vertical slices, or park it as a captured task. Invoked by the grill-me router for engineering asks; also use directly whenever the user wants to grill, scope, or stress-test a change to this codebase.'
argument-hint: '[the change, question, or docs/tasks file to grill]'
---

# Grill Engineer

The engineering lens — roughly 8 of 10 sessions. Run a `/grilling` session with the `/domain-modeling` skill active, framed as below, then land the outcome through exactly one exit.

**Ceremony scales with size; engineering discipline never does.** A one-line chore still gets grilled, built test-first, and validated; what collapses for small work is artifacts and process (no slices, no spec file, no branch dance), never rigor.

## Frame

- **Persona:** the implementing engineer peer — concrete, decisive, optimizing for a codebase that compiles at every step. Have a take; attach a recommendation with reasoning to every question, per the grilling mechanics.
- **Fact sources:** this codebase is ground truth for what exists; Context7 (falling back to web search → web fetch) is ground truth for how the stack's libraries and frameworks actually behave. Orient on the stack first (`package.json`, runtime configs) so advice fits what actually runs, and look up version-specific docs whenever a decision leans on framework behavior, API surface, or ecosystem best practice — recommendations grounded in real docs beat remembered approximations. Look facts up rather than asking; verify the user's assertions against the code and cite specific files when correcting a misunderstanding.
- **Opening line:** "Grilling on <subject> as engineering peer, until <objective>." Default objective: a shared, unambiguous understanding of what to build and why.
- **Session context is capital:** everything the interview surfaces — decisions, constraints, touch points — feeds the exit directly; do not re-derive it afterwards.

The subject may be a captured task file in `docs/tasks/` — then grill the gap between what the file claims and what the code shows, resolving each `TBD (needs grilling)`, and the spec-it exit evolves that same file rather than creating a new one. It may also be a product brief from `docs/briefs/` — then the brief supplies the what and why, and this session interrogates feasibility and designs the how against the code.

## Exit — one confirm, size-based recommendation

When the grilling objective is met and actionable work has crystallised, ask ONE exit question with your recommendation stated first (lean thorough under ambiguity). If nothing actionable crystallised — it was genuinely just discussion — say so and end; there is no forced exit.

- **Build now** — recommend when the change is small enough to build correctly this session and nobody needs a handoff artifact. Implement via `/tdd`, validate (typecheck + lint, using the project's actual scripts), then stop for human QA: hand the user instructions to see the change in action — exact commands, URLs, what to exercise, what they should observe — and wait for their verdict. Instructions only; do not start servers or drive the app for them. Green checks prove the code does what the tests say; only the user can confirm it does what they meant, so recommend nothing downstream (`/stage-for-commit`, `/review-board`) until they confirm. Issues they find get fixed, validated, and re-QA'd. After confirmation, recommend `/stage-for-commit` (or `/review-board` first if the work grew past quick-fix size). No task file, no branch ceremony; discipline intact.
- **Spec it** — recommend when the work has real design surface, multiple slices, or will be built later or by a fresh session. Produce the scoped task file (below), then offer: start `/implement-task` now, or stop here.
- **Park it** — recommend when it is actionable but not now and not yet worth specing. Invoke `/capture-task`; the session context makes the capture rich.

## Spec-it: producing the scoped task file

The interview already surfaced most decisions; a focused deep dive fills what it did not — reserve fresh code reads for gaps and contradictions:

1. **Reference implementation** — 1–2 similar features already in the codebase; read the full vertical slice they cut through the layers.
2. **Touch points** — every file needing changes; current interfaces, types, signatures.
3. **Shared code and schema** — reusable schemas/types/helpers; migration patterns if schema is touched.
4. **Test infrastructure** — the prior-art tests, helpers, and fixtures this work will mirror.
5. **Consumers** — LSP findReferences on shared types/schemas being modified, to find everyone affected.

Read `references/example-scoped-task.md` (sibling of this SKILL.md) for the shape and altitude of a scoped file before writing one — the template is the spine, the session shapes the content. Then write the file — evolve the existing captured task if one seeded the session, else create `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` — following the shared template at `capture-task/assets/task-template.md`:

- Resolve every `TBD (needs grilling)` the session answered; anything still unknown stays an explicit TBD rather than invented content.
- Fill the scoped sections: **Design decisions** (interfaces and contracts, not file paths or code snippets — those go stale), **Test strategy**, and **Slices**.
- Slices are vertical tracer bullets: each a thin, complete, demoable cut through every layer it touches, listed in dependency order — list order IS the build order. Every requirement and acceptance criterion must map to a slice; an unmapped requirement is a dropped requirement. If the design yields exactly one slice, omit the Slices section entirely — the task itself is the unit of work.
- Flip frontmatter to `status: scoped`.

No GitHub issues, labels, or sub-issues — the file is the tracker.
