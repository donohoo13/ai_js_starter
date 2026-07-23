# Agent Skills Overview

## The chain

One front door for interview sessions, three lenses behind it, and a task file that carries work from capture to done. Keystone principle, written into the skills verbatim: **ceremony scales with size; engineering discipline never does** — a one-line chore still gets grilled, built test-first, and validated; what collapses for small work is artifacts and process, never rigor. One fixed stop on every implementation path: the **human QA gate** — the session hands the user instructions to see the change in action and waits for their verdict; nothing is marked done and neither `/review-board` nor `/stage-for-commit` gets recommended until the user has seen it work.

```
/grill-me (router)
   ├─> grill-engineer (≈8/10) ──┬─ build now ─> /tdd ─> human QA gate ─> /stage-for-commit (user commits)
   │                            ├─ spec it ──> docs/tasks file (status: scoped)
   │                            │                 └─> /implement-task ─> slice loop (/tdd, commit per slice)
   │                            │                        └─> human QA gate ─> /review-board offer ─> /ship-pr offer ─> stop
   │                            └─ park it ──> /capture-task
   ├─> grill-product ──> design docs / product brief (docs/briefs/) / ADRs / capture / nothing
   └─> grill-research ─> summary writeup / capture / nothing

/capture-task — park anything, any time; the captured file seeds a later grill-engineer session
/diagnose — the bug front door: feedback loop → repro+minimize → ranked hypotheses → fix via /tdd + human QA gate; no-seam and prevention findings → /capture-task
/codify — end-of-session knowledge capture; durable conventions to the narrowest CLAUDE.md or design file, vocabulary, shape facts, and ADRs hand off to domain-modeling
/ship-pr — the one door to the remote: push the branch and open a PR documenting QA and the review-board outcome; offered by implement-task and review-board, run only on the user's word
primitives under the hood: grilling, domain-modeling, tdd, frontend-design, skill-creator
```

The task file lifecycle lives in its frontmatter: `captured` (filed, unknowns explicit as `TBD (needs grilling)`) → `scoped` (grilled; design decisions, test strategy, and slices written) → `in-progress` → `done`. The shared format is defined once in `capture-task/assets/task-template.md` and referenced by capture-task, grill-engineer, and implement-task. No GitHub issues anywhere in the chain — the file is the tracker; push and PR happen only through `/ship-pr`, only on the user's word.

## project-init

One-shot onboarding auditor, run once right after the template payload (`.claude` and its sibling files — `CLAUDE.md`, `.mcp.json`, `scripts/`, the design and domain docs — in whole or in part) lands in a destination project, and never again: detects the git platform, CI, stack, tracker, and MCP surface — including git archaeology to recover a clobbered pre-existing partial suite as interview talking points — then interviews the user via `grilling` as an onboarding auditor on everything a repo cannot answer (tracker shape, compliance posture, team composition), and applies an itemized, individually approved tailoring plan across skills, agents, `settings.json`, hooks, `scripts/doctor.sh`, and the whole `CLAUDE.md`. Validates the suite's 8-of-10 best-practice assumptions against this project and hunts the 2-of-10 misfits; facts land in `CLAUDE.md`, in-place skill edits are reserved for genuine behavioral forks mapped in `project-init/references/fork-points.md`. Strictly user-invoked, and its final approved plan item is deleting itself — this section included; later drift (a tracker adopted mid-project, a platform migration) is normal work for `grilling` and `codify`, not a re-init.

## grill-me

User-invoked router (never model-triggered) and the one front door for grilling sessions: parses an explicit lens argument (`/grill-me engineer: <ask>`), a bare lens, or a freeform ask whose lens it infers, then hands off to `grill-engineer`, `grill-product`, or `grill-research`. The lens skill declares itself in its opening line, so a wrong inference costs one corrective sentence. When an ask names a user-facing outcome without deciding what it should be, it leads with `grill-product` so the _what_ is settled before `grill-engineer` builds the _how_ — still one routing decision, the lens chain carries the rest. Routes once and gets out of the way.

## grilling

Relentless one-question-at-a-time interview that walks the decision tree of a plan, request, or captured task until shared understanding is reached: biggest decisions first, a recommendation with reasoning attached to every question, facts looked up in the codebase while decisions stay with the user. Opens by naming subject and objective, stops when the objective is met, and leaves nothing behind beyond the shared understanding in conversation. Model-invocable on 'grill' trigger phrases or whenever a plan needs stress-testing before implementation. The lens skills run it under their own frames; an ask that fits an engineering, product, or research lens loads that lens skill instead of this bare primitive.

## grill-engineer

The engineering lens (roughly 8 of 10 sessions): runs `grilling` with `domain-modeling` active, framed as an implementing-engineer peer with the codebase as ground truth for what exists and Context7 (falling back to web search → web fetch) as ground truth for how the stack's libraries actually behave. At objective-met it asks one exit question with a size-based recommendation — build now (`/tdd`, validate, human QA gate, then `/stage-for-commit`), spec it (evolve or create the docs/tasks file with design decisions, test strategy, and vertical tracer-bullet slices, flipping `status: scoped`), or park it (`/capture-task`) — and pure discussions simply end with no forced exit. Carries the old write-a-trd guts (deep dive, design, slicing) as spec-it behavior, minus all GitHub ceremony, with `references/example-scoped-task.md` as the worked example of a scoped file's shape and altitude. A product brief from `docs/briefs/` can seed the session the same way a captured task can.

## grill-product

The product/design lens: runs `grilling` with `domain-modeling` active, framed as a product-design partner grounded in `UI_UX.md`, `BRAND_DESIGN.md`, the existing UI code, and web research into named design patterns, accessibility standards, and published UX findings — recommendations come from real-world evidence, never invented UI/UX concepts, and stay at design altitude (what and why, never how). Web-evidence questions dispatch the `research-analyst` agent (`.claude/agents/research-analyst.md`) in the background so the interview continues in real time while sourced claims arrive. Exits offer only what crystallised: design-doc updates, a product brief in `docs/briefs/` (shaped by `references/example-product-brief.md`, evidence-grounded and implementation-free, later seeding a grill-engineer session), an ADR, a captured task, or nothing.

## grill-research

The research lens: runs `grilling` framed as a research analyst, facts sourced via Context7 → web search → primary docs, with no build pressure by construction — it never steers toward implementing in this codebase. Anything past a quick Context7 pull dispatches the `research-analyst` agent (`.claude/agents/research-analyst.md`) in the background — announced in one line, results woven in when they land — so the interview never stalls on a fetch. Exits: a summary writeup (suggest `docs/notes/`), a captured task if an actionable idea emerged, or nothing, which is the normal case and counts as success.

## implement-task

The fresh-session resume door: reads a `scoped` task file from `docs/tasks/`, refuses to build on main or on under-specified files (those get routed back to a grilling first), runs a doc pre-flight before the tree splits — uncommitted docs and context files lingering from earlier sessions get one offer to stage them with a ready-to-paste commit message, so the user can commit on `main` and the new branch inherits them — then moves the session into a dedicated worktree (`scripts/gwt-add.sh --no-open` + `EnterWorktree`, one confirm; declining falls back to a plain feature branch in the checkout), then builds slice by slice — deep plan, `/tdd`, validate (typecheck and single test files regularly; never the full suite mid-task), commit per slice with the task file's checkboxes riding along — flipping status `scoped → in-progress → done`. DONE and DONE_WITH_CONCERNS continue automatically; only BLOCKED stops. Runs the full test suite once at the very end, then stops at the human QA gate — a QA script the user runs to see the change in action, with nothing marked `done` until they confirm — then offers `/review-board` (recommending yes for anything non-trivial) and stops before any push or PR.

## tdd

Test-driven development discipline: red before green, one seam at a time, tests only at pre-agreed public seams, with the anti-pattern catalog (implementation-coupled, tautological, horizontal slicing) in sibling reference files. Invoked under the hood by grill-engineer's build-now exit and implement-task's slice loop; also triggers directly whenever a feature or bug fix a test can lock down is being implemented, even when nobody says test-first.

## frontend-design

Design-quality primitive for anything user-facing: reads the project's `BRAND_DESIGN.md` / `UI_UX.md` (plus app-level overrides and the theme CSS, the source of truth for token values) before proposing anything, spends creativity only on the axes those docs leave free, and holds every build to an objective quality floor — interaction states, 150–300ms motion with `prefers-reduced-motion`, real form labels, layout stability, SVG-not-emoji icons, both-theme contrast, keyboard access. On greenfield projects with skeletal docs it derives the first token system and offers once to codify it back into the design docs. Invoked by implement-task's deep-plan step for UI-surface slices; also triggers directly on any build-or-restyle-UI request.

## skill-creator

The skill-authoring primitive and the mandated path for any change under `.claude/skills/`: a CLAUDE.md rule plus wire-ins in grill-engineer's build-now exit and implement-task's deep plan load it, and the `guard-skill-edit` PreToolUse hook denies skill-file edits until it is loaded. Carries the authoring discipline — trigger-accurate third-person descriptions, progressive disclosure with references one hop deep, why-over-MUSTs style, rewrite-accreted-prose — with limits, frontmatter keys, and sources in `skill-creator/references/skill-quality.md`, and closes every substantive change with a gut-check handoff: test prompts the user runs in a fresh session, because the authoring session is too warm to prove cold-start triggering. Every change lands with its checklist: project/template dual-layer sync, README blurb updates, and fork-points coupling checks. It never runs tests itself — evaluation is the user's fresh session, not the author's warm one.

## review-board

Multi-agent code review: spawns parallel specialist reviewers (correctness, security, reliability, maintainability, performance/operations), each a registered agent in `.claude/agents/review-*.md` with its own checklist in `review-board/references/`, over the branch diff vs the detected default branch plus uncommitted changes (args can scope to a PR number, commit range, or paths). An optional leading mode argument scales the board by shifting each seat's model tier rather than flattening to one model: `quality` runs full-file reads with Opus everywhere except maintainability on Sonnet (top tier buys nothing on checklist-shaped review), `balanced` tiers seats Opus (correctness/security — misses cost most, findings need intent/threat modeling), Sonnet (reliability/performance), Haiku (maintainability) with diff-first reads that escalate to full files per seat only on named triggers (unauthored code, cross-module contracts, security surface, tangled diff, concurrency), and `speed` runs diff-first with Sonnet on correctness/security (their misses are the point of even a quick pass) and Haiku on the rest. With no mode given the session AI never silently defaults: gate 1 opens with two recommendations — mode and depth posture — each reasoned from what it implemented this session and its own likely blind spots, then gate 2 confirms board composition; an explicit mode argument is respected as given, with at most a one-time reconsider case voiced at gate 2. The chair always runs on the session model, and seat-skipping (only when a category has no surface in the change) applies in every mode. Small self-contained diffs can use a lite three-seat board in `balanced`. The session AI then acts as chair: dedupes findings, verifies each against the actual code, renders a confirmed/plausible/rejected verdict with reasoning, and presents a consolidated report per `review-board/references/output-format.md`. After the human gate resolves on a branch other than the default, the chair leaves an always-empty `review:` record commit — mode, verdicts, addressed and dismissed findings with the user's one-line reasons — pinning the board's outcome to the exact tree it reviewed, which is what `/ship-pr` later reads; it closes with a one-line `/ship-pr` offer when a remote exists.

Strictly human-in-the-loop: the report ends with "which findings should I address?" and nothing is fixed until the user picks. Invoke for pre-PR/pre-merge reviews, security passes, or any "review my changes" request.

## capture-task

Quick-captures a unit of work (bug, feature idea, or chore) as a structured task file at `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`, built from `capture-task/assets/task-template.md` with every unknown kept explicit as `TBD (needs grilling)` rather than invented. No interviewing: it mines the current conversation for context (error text, file paths, decisions already made) so a fresh session can pick the task up cold with `/grill-me engineer:` or `/grill-engineer`. Captures always start at `status: captured` and omit the template's scoped-work sections — those arrive when grill-engineer scopes the task.

Suggest it once when the user voices an actionable aside, reports something broken they want parked rather than fixed now (fixing now is `/diagnose`), or drifts into "we should do X later" territory. Never auto-file; if the user doesn't bite, drop it.

## diagnose

The bug front door for anything broken the user wants understood or fixed now: a phased diagnosis discipline for hard or complicated bugs — build a red-capable feedback loop before any theorizing (the phase that _is_ the skill; no red-capable command, no hypotheses), reproduce and minimize until every element of the repro is load-bearing, test 3–5 ranked falsifiable hypotheses with one-variable probes, then land the fix through the chain: regression test via `/tdd` at a correct seam, human QA gate, a `/review-board` recommendation when the fix outgrew quick-fix size, and the usual commit exits — on a deliberately chosen non-main branch where the team flow requires one. Two findings are first-class rather than failures: "no correct seam exists" (the architecture prevents locking the bug down — documented and handed to `/capture-task`) and "cannot build a loop" (stop and ask for an artifact or environment rather than guessing). Post-fix, architectural prevention gaps go to `/capture-task` and a durable debugging gotcha earns one `/codify` nudge. Skip phases only when explicitly justified; a symptom is not a root cause.

Invoke on "diagnose", "debug this", "root-cause this", or any broken/failing/slow report the user wants investigated now — parking it for later stays `/capture-task`.

## stage-for-commit

Stages exactly the files changed during the current session by explicit path (never `git add -A`) and hands back a ready-to-paste commit message, then stops: no commit, no branch, no push, no AI attribution — the user is the committer. Proves the staged set with `git diff --cached --stat` before writing the message, and is concurrent-session aware: files another session already staged stay in the index and get flagged in the handoff (a `git commit` takes the whole index), and same-file collisions with unrecognized hunks are surfaced for the user to decide instead of silently staged.

Invoke at the end of a quick chore/feature/bug when the user wants to commit the work themselves — "stage my changes", "ready to commit", "write me a commit message for this". Also the landing step for grill-engineer's build-now exit, but only after the user's human-QA confirmation — never auto-chained straight from an implementation.

## ship-pr

The PR landing for branch-based work, and the chain's only door to the remote: pushes the current non-main branch and opens a GitHub PR whose body documents how the work was produced — Summary, QA evidence, and a Review board section reporting findings by verdict, what was addressed (with fix commits), and what was dismissed with the user's recorded reasons; "Not run." is a valid, self-indicting entry. Structure comes from `.github/PULL_REQUEST_TEMPLATE.md` (scaffolded on first use if missing, shipped in the template payload); review data comes from the `review:` record commit on the branch, falling back to session context, then to "Not run." Hard stops are mechanical only — on the default branch, no remote, dirty tree; process gaps (no review, unverified QA) get one nudge and then the truth in the PR body, because a skill that blocks on process gets routed around and the paper trail is lost exactly when it mattered. No AI attribution on the PR — the user is the author of record.

Strictly user-invoked and conditional by invocation, not configuration: solo projects committing to main simply never touch it, and no skill ever runs it automatically — implement-task and review-board close with a one-line offer at most. One confirm (exact title and body shown) before anything touches the remote; `draft` as an argument opens a draft PR.

## domain-modeling

Builds and sharpens the project's domain model as design happens: challenges terms against the `CONTEXT.md` glossary, sharpens fuzzy language, stress-tests relationships with concrete scenarios, cross-references claims with code, and updates `CONTEXT.md` inline the moment a term resolves. Owns all three context-doc kinds — `CONTEXT.md` (language), `docs/adr/` (decisions), and `ARCHITECTURE.md` (engineering shape: a root topology doc plus per-context shape docs, created lazily and grown one true shape-fact at a time, never a stub, with an on-demand survey bootstrap when the user wants the whole map in one pass; format, growth, and maintenance contract in `domain-modeling/ARCHITECTURE-FORMAT.md`). Offers ADRs sparingly — only for decisions that are hard to reverse, surprising without context, and real trade-offs. Active inside grill-engineer and grill-product sessions and directly on "document the architecture" asks; shape updates otherwise land with the code that changes the shape (implement-task's end-of-task shape check; review-board's correctness seat treats a contradicting diff as a finding).

## codify

Retrospective knowledge capture, the learn step the chain otherwise lacks: distills a finished conversation down to the few durable lessons a future session genuinely could not infer, attributes every friction point to prompt-steering (A), an undocumented convention (B), or a plain model error (C), and codifies only the (B)s — verified against the actual code, then routed to the narrowest correct file (nearest enclosing `CLAUDE.md` for operational and code conventions, the user-global `~/.claude/CLAUDE.md` for user-natured collaboration and register preferences, `BRAND_DESIGN.md` / `UI_UX.md` for brand and UI foundations, layout discovered at runtime since template and spawned projects differ). Domain vocabulary and hard-to-reverse decisions hand off to `domain-modeling` (`CONTEXT.md` / `ARCHITECTURE.md` / `docs/adr/`); anything domain-modeling already captured inline counts as documented. Presents the full deliberation — codify, reject, hand off — and writes nothing until the user approves each candidate. "Nothing worth codifying" is a valid and common outcome.

Strictly HITL and never a session-end ritual: user-invoked ("codify", "add this to CLAUDE.md", "capture this convention") or suggested at most once when a session surfaces a genuine candidate — if the user doesn't bite, drop it.

## stage map

| Stage                                | Skill                                                              | You type it?                                           |
| ------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------ |
| First-run tailoring                  | `project-init`                                                     | Yes — once, right after copying the template           |
| Interview (any lens)                 | `grill-me` → `grill-engineer` / `grill-product` / `grill-research` | Yes — the front door                                   |
| Park for later                       | `capture-task`                                                     | Yes, or suggested once mid-flow                        |
| Diagnose a bug                       | `diagnose`                                                         | Yes — "diagnose"/"debug this", fix-it-now bug reports  |
| Build scoped work                    | `implement-task`                                                   | Yes — the resume door                                  |
| Test-first discipline                | `tdd`                                                              | Rarely — invoked under the hood                        |
| UI/visual design                     | `frontend-design`                                                  | Rarely — triggers on UI work or via implement-task     |
| Skill authoring                      | `skill-creator`                                                    | Rarely — loads on any skill-file edit (hook-enforced)  |
| Interview mechanics                  | `grilling`                                                         | Rarely — lens skills run it                            |
| Context docs (glossary, shape, ADRs) | `domain-modeling`                                                  | Rarely — lens sessions, or "document the architecture" |
| Pre-merge review                     | `review-board`                                                     | Yes, or offered by implement-task                      |
| Hand back a commit                   | `stage-for-commit`                                                 | Yes, or the build-now landing (after human QA)         |
| Ship a PR                            | `ship-pr`                                                          | Yes, or offered once by implement-task / review-board  |
| Codify lessons                       | `codify`                                                           | Yes, or suggested once when a durable lesson surfaces  |
