# Agent Skills Overview

## The chain

One front door for interview sessions, three lenses behind it, and a task file that carries work from capture to done. Keystone principle, written into the skills verbatim: **ceremony scales with size; engineering discipline never does** — a one-line chore still gets grilled, built test-first, and validated; what collapses for small work is artifacts and process, never rigor.

```
/grill-me (router)
   ├─> grill-engineer (≈8/10) ──┬─ build now ─> /tdd ─> /stage-for-commit (user commits)
   │                            ├─ spec it ──> docs/tasks file (status: scoped)
   │                            │                 └─> /implement-task ─> slice loop (/tdd, commit per slice)
   │                            │                        └─> /review-board offer ─> stop (user pushes/PRs)
   │                            └─ park it ──> /capture-task
   ├─> grill-product ──> design docs / product brief (docs/briefs/) / ADRs / capture / nothing
   └─> grill-research ─> summary writeup / capture / nothing

/capture-task — park anything, any time; the captured file seeds a later grill-engineer session
/codify — end-of-session knowledge capture; durable conventions to the narrowest CLAUDE.md or design file, vocabulary and ADRs hand off to domain-modeling
primitives under the hood: grilling, domain-modeling, tdd, frontend-design
```

The task file lifecycle lives in its frontmatter: `captured` (filed, unknowns explicit as `TBD (needs grilling)`) → `scoped` (grilled; design decisions, test strategy, and slices written) → `in-progress` → `done`. The shared format is defined once in `capture-task/assets/task-template.md` and referenced by capture-task, grill-engineer, and implement-task. No GitHub issues anywhere in the chain — the file is the tracker; push and PR are always the user's move.

## grill-me

User-invoked router (never model-triggered) and the one front door for grilling sessions: parses an explicit lens argument (`/grill-me engineer: <ask>`), a bare lens, or a freeform ask whose lens it infers, then hands off to `grill-engineer`, `grill-product`, or `grill-research`. The lens skill declares itself in its opening line, so a wrong inference costs one corrective sentence. Routes once and gets out of the way.

## grilling

Relentless one-question-at-a-time interview that walks the decision tree of a plan, request, or captured task until shared understanding is reached: biggest decisions first, a recommendation with reasoning attached to every question, facts looked up in the codebase while decisions stay with the user. Opens by naming subject and objective, stops when the objective is met, and leaves nothing behind beyond the shared understanding in conversation. Model-invocable on 'grill' trigger phrases or whenever a plan needs stress-testing before implementation. The lens skills run it under their own frames.

## grill-engineer

The engineering lens (roughly 8 of 10 sessions): runs `grilling` with `domain-modeling` active, framed as an implementing-engineer peer with the codebase as ground truth for what exists and Context7 (falling back to web search → web fetch) as ground truth for how the stack's libraries actually behave. At objective-met it asks one exit question with a size-based recommendation — build now (`/tdd`, validate, `/stage-for-commit`), spec it (evolve or create the docs/tasks file with design decisions, test strategy, and vertical tracer-bullet slices, flipping `status: scoped`), or park it (`/capture-task`) — and pure discussions simply end with no forced exit. Carries the old write-a-trd guts (deep dive, design, slicing) as spec-it behavior, minus all GitHub ceremony, with `references/example-scoped-task.md` as the worked example of a scoped file's shape and altitude. A product brief from `docs/briefs/` can seed the session the same way a captured task can.

## grill-product

The product/design lens: runs `grilling` with `domain-modeling` active, framed as a product-design partner grounded in `UI_UX.md`, `BRAND_DESIGN.md`, the existing UI code, and web research into named design patterns, accessibility standards, and published UX findings — recommendations come from real-world evidence, never invented UI/UX concepts, and stay at design altitude (what and why, never how). Exits offer only what crystallised: design-doc updates, a product brief in `docs/briefs/` (shaped by `references/example-product-brief.md`, evidence-grounded and implementation-free, later seeding a grill-engineer session), an ADR, a captured task, or nothing.

## grill-research

The research lens: runs `grilling` framed as a research analyst, facts sourced via Context7 → web search → primary docs, with no build pressure by construction — it never steers toward implementing in this codebase. Exits: a summary writeup (suggest `docs/notes/`), a captured task if an actionable idea emerged, or nothing, which is the normal case and counts as success.

## implement-task

The fresh-session resume door: reads a `scoped` task file from `docs/tasks/`, refuses to build on main or on under-specified files (those get routed back to a grilling first), then builds slice by slice — deep plan, `/tdd`, validate (typecheck and single test files regularly; never the full suite mid-task), commit per slice with the task file's checkboxes riding along — flipping status `scoped → in-progress → done`. DONE and DONE_WITH_CONCERNS continue automatically; only BLOCKED stops. Runs the full test suite once at the very end, then offers `/review-board` (recommending yes for anything non-trivial) and stops before any push or PR.

## tdd

Test-driven development discipline: red before green, one seam at a time, tests only at pre-agreed public seams, with the anti-pattern catalog (implementation-coupled, tautological, horizontal slicing) in sibling reference files. Invoked under the hood by grill-engineer's build-now exit and implement-task's slice loop; also directly invocable for any ad-hoc test-first work.

## frontend-design

Design-quality primitive for anything user-facing: reads the project's `BRAND_DESIGN.md` / `UI_UX.md` (plus app-level overrides and the theme CSS, the source of truth for token values) before proposing anything, spends creativity only on the axes those docs leave free, and holds every build to an objective quality floor — interaction states, 150–300ms motion with `prefers-reduced-motion`, real form labels, layout stability, SVG-not-emoji icons, both-theme contrast, keyboard access. On greenfield projects with skeletal docs it derives the first token system and offers once to codify it back into the design docs. Invoked by implement-task's deep-plan step for UI-surface slices; also triggers directly on any build-or-restyle-UI request.

## review-board

Multi-agent code review: spawns parallel specialist reviewers (correctness, security, reliability, maintainability, performance/operations), each a registered agent in `.claude/agents/review-*.md` with its own checklist in `review-board/references/`, over the branch diff vs `main` plus uncommitted changes (args can scope to a PR number, commit range, or paths). An optional leading mode argument scales the board by shifting each seat's model tier rather than flattening to one model: `quality` runs full-file reads with Opus everywhere except maintainability on Sonnet (top tier buys nothing on checklist-shaped review), the default `balanced` tiers seats Opus (correctness/security — misses cost most, findings need intent/threat modeling), Sonnet (reliability/performance), Haiku (maintainability) with read depth decided per seat, and `speed` runs diff-first with Sonnet on correctness/security (their misses are the point of even a quick pass) and Haiku on the rest. The chair always runs on the session model, and seat-skipping (only when a category has no surface in the change) applies in every mode. Small self-contained diffs can use a lite three-seat board in `balanced`. The session AI then acts as chair: dedupes findings, verifies each against the actual code, renders a confirmed/plausible/rejected verdict with reasoning, and presents a consolidated report per `review-board/references/output-format.md`.

Strictly human-in-the-loop: the report ends with "which findings should I address?" and nothing is fixed until the user picks. Invoke for pre-PR/pre-merge reviews, security passes, or any "review my changes" request.

## capture-task

Quick-captures a unit of work (bug, feature idea, or chore) as a structured task file at `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`, built from `capture-task/assets/task-template.md` with every unknown kept explicit as `TBD (needs grilling)` rather than invented. No interviewing: it mines the current conversation for context (error text, file paths, decisions already made) so a fresh session can pick the task up cold with `/grill-me engineer:` or `/grill-engineer`. Captures always start at `status: captured` and omit the template's scoped-work sections — those arrive when grill-engineer scopes the task.

Suggest it once when the user voices an actionable aside, reports something broken mid-flow, or drifts into "we should do X later" territory. Never auto-file; if the user doesn't bite, drop it.

## stage-for-commit

Stages exactly the files changed during the current session by explicit path (never `git add -A`) and hands back a ready-to-paste commit message, then stops: no commit, no branch, no push, no AI attribution — the user is the committer. Proves the staged set with `git diff --cached --stat` before writing the message, and is concurrent-session aware: files another session already staged stay in the index and get flagged in the handoff (a `git commit` takes the whole index), and same-file collisions with unrecognized hunks are surfaced for the user to decide instead of silently staged.

Invoke at the end of a quick chore/feature/bug when the user wants to commit the work themselves — "stage my changes", "ready to commit", "write me a commit message for this". Also the landing step for grill-engineer's build-now exit.

## domain-modeling

Builds and sharpens the project's domain model as design happens: challenges terms against the `CONTEXT.md` glossary, sharpens fuzzy language, stress-tests relationships with concrete scenarios, cross-references claims with code, and updates `CONTEXT.md` inline the moment a term resolves. Offers ADRs sparingly — only for decisions that are hard to reverse, surprising without context, and real trade-offs. Active inside grill-engineer and grill-product sessions.

## codify

Retrospective knowledge capture, the learn step the chain otherwise lacks: distills a finished conversation down to the few durable lessons a future session genuinely could not infer, attributes every friction point to prompt-steering (A), an undocumented convention (B), or a plain model error (C), and codifies only the (B)s — verified against the actual code, then routed to the narrowest correct file (nearest enclosing `CLAUDE.md` for operational and code conventions, `BRAND_DESIGN.md` / `UI_UX.md` for brand and UI foundations, layout discovered at runtime since template and spawned projects differ). Domain vocabulary and hard-to-reverse decisions hand off to `domain-modeling` (`CONTEXT.md` / `docs/adr/`); anything domain-modeling already captured inline counts as documented. Presents the full deliberation — codify, reject, hand off — and writes nothing until the user approves each candidate. "Nothing worth codifying" is a valid and common outcome.

Strictly HITL and never a session-end ritual: user-invoked ("codify", "add this to CLAUDE.md", "capture this convention") or suggested at most once when a session surfaces a genuine candidate — if the user doesn't bite, drop it.

## stage map

| Stage                 | Skill                                                              | You type it?                                          |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| Interview (any lens)  | `grill-me` → `grill-engineer` / `grill-product` / `grill-research` | Yes — the front door                                  |
| Park for later        | `capture-task`                                                     | Yes, or suggested once mid-flow                       |
| Build scoped work     | `implement-task`                                                   | Yes — the resume door                                 |
| Test-first discipline | `tdd`                                                              | Rarely — invoked under the hood                       |
| UI/visual design      | `frontend-design`                                                  | Rarely — triggers on UI work or via implement-task    |
| Interview mechanics   | `grilling`                                                         | Rarely — lens skills run it                           |
| Glossary + ADRs       | `domain-modeling`                                                  | Rarely — active inside lens sessions                  |
| Pre-merge review      | `review-board`                                                     | Yes, or offered by implement-task                     |
| Hand back a commit    | `stage-for-commit`                                                 | Yes, or the build-now landing                         |
| Codify lessons        | `codify`                                                           | Yes, or suggested once when a durable lesson surfaces |
