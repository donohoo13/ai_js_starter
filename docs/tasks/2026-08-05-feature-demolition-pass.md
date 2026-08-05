---
type: feature
status: in-progress
created: 2026-08-05
incumbent: extend
---

# Add a demolition pass so briefs and designs outrank incumbent code

## Context

Instance sessions repeatedly report the same failure: a brief and a design artifact specify a new direction for an existing feature or surface in detail, and the implementation still lands on the original implementation with small tweaks. The bias is measured. "To Add Is Machine, To Delete Is Human" (arXiv:2607.28887) defines deletion avoidance as the systematic tendency to retain code an intended edit requires removing, and finds across five frontier models on 197 SWE-bench Verified tasks that models locate the correct file over 92% of the time while removing the exact required line only 44.6-51.6% of the time; 29.0% of passing patches used a Guard-and-Go pattern (wrapping old code in a conditional instead of deleting it) and 61.1% of those were larger than the human developer's own fix. "Coding Agents Don't Know When to Act" (arXiv:2605.07769) found that explicit procedure, not stated preference, is what moved the equivalent action bias.

A first implementation landed on this branch and was reviewed by three context-clean seats, which returned 29 confirmed findings. Twelve were patched; the seventeen architectural ones were re-grilled with the user on 2026-08-05 and the mechanism was redesigned. This file records the design as settled after that grilling. The branch predates it and needs the rework described in Slices.

## Problem

Current behavior: no artifact records whether work replaces an existing implementation or extends it, so `implement-task` reads the incumbent code as the strongest signal in context and treats the design as a diff request against it. `implement-task` guards a build that _deviates_ from the design artifact, but keeping the old component and adjusting it never registers as a deviation, so preservation is unmodeled as a failure mode. Every destructive rule in the suite is post-hoc cleanup scoped to blast radius, and the vertical-slice contract leaves no legal place for a destructive step. Desired behavior: the artifact chain records a replacement verdict decided during grilling, `implement-task` refuses to build a task that never made the call, and a replace verdict runs a two-stage demolition agent that deletes the incumbent and its tests before the build session ever reads them.

## Scope

- In scope (must-have): the `incumbent:` frontmatter key and its decision rule; `grill-engineer` setting it at spec-it and holding an in-session verdict on build-now; `implement-task` gating on its absence and running demolition as step zero; `implement-task/references/demolition.md`; the two-stage `demolition` agent; the type-error connection map and the shrinking red-state contract; the record's filter, categories, and artifact-bound phrasing; upstream cascade prose in `grill-product` and `grill-design`; `tdd` run-scope statement; `project-init` typechecker detection; `.gitignore` scratch path, `fork-points.md` couplings, skills `README.md`, and the `CHANGELOG.md` entry at `v1.6.0`.
- Out of scope (non-goals, named so the task does not expand silently): any change to how slices are authored beyond the red-state contract; demolition for documents or context files (`grill-initiative`'s estate reconciliation owns that); rollback tooling beyond git; `/diagnose`, which elevates a non-trivial fix to a captured task rather than absorbing demolition logic; measuring whether the mechanism reduces Guard-and-Go rates, which needs usage this change does not have.

## Requirements

- `incumbent:` is required frontmatter on every task file at `status: scoped`, taking exactly one of `none`, `replace`, or `extend`; captures omit the key entirely alongside the scoped sections.
- The key names the mechanism, never the genre of work: a refactor rewriting a module behind an unchanged interface is `replace`, a rename-only refactor is `extend`. It is orthogonal to `type:`.
- `none` and `extend` each carry a one-line why in Design decisions; `replace` carries none. Both no-demolition verdicts cost the same, so neither is the cheap default, and the ruthless option is the cheapest to declare.
- The demolition verdict is decided only during a grilling session, as a precursor to building. `implement-task` never writes the key and has no say in the decision. Its step-1 gate stops the build and routes back to a grilling on three conditions, on a `scoped` file and a resumed `in-progress` one alike: a missing key, a value outside the three tokens (a leftover placeholder or a parenthetical decided nothing either, and reading it as "not `replace`" makes the gate's null result the outcome it exists to prevent), and a `replace` verdict carrying no zone.
- A `replace` verdict disqualifies `grill-engineer`'s build-now exit, which recommends spec-it and stops. Demolition needs a zone drawn with the user, a branch to commit its red state on, and a task file to hold the connection map, and build-now creates none of the three; work whose incumbent dies is not work small enough to skip the artifact.
- Demolition runs as two separate agent invocations with separate contexts. Run 1 reads and produces the plan and the record; run 2 receives only the plan, deletes, and commits. The executor never reads the code it deletes, so Guard-and-Go is not in its action space.
- Run 1's reading produces exactly two outputs, and only one of them can spare anything: the kill list, and the record. Understanding what code does carries into the record as a forward requirement and never earns a file a reprieve.
- The zone is the only survival test. Every file in the zone dies regardless of how many things reference it; a shared module the design targets is the most common preservation excuse and is explicitly not one.
- The zone lives in a `## Demolition` section of the task file at file level, written by `grill-engineer`'s spec-it exit with the user in the room, never inferred by an agent from a surface name and never drawn by the build session, which would have to read the incumbent to do it. That section is the one place in the task file where paths belong, and it is also where `implement-task` writes the connection map, the record's path, and the `demolition: done` marker.
- Anything the task keeps stays out of the zone; a carve-out never spares a file. A carve-out covers only a surface preserved inside a file the zone kills, earning a screenshot and a forward requirement while its file still dies — reading it as a reprieve would put a second survival test beside the zone.
- Carve-out capture carries `grill-design`'s fidelity guards verbatim: seeded or anonymized data only, the user's say-so before an authenticated or production surface, redaction or re-rendering when real data is present, and storing nothing when neither is possible, because `docs/assets/` is a committed path. A declared carve-out whose capture produced nothing is BLOCKED, since an empty list and a failed capture are indistinguishable downstream.
- `.claude/skills/`, `.claude/agents/`, and `.claude/hooks/` paths enter a zone only on the user's written authorization in the task file, and the dispatcher loads `skill-creator` before dispatching where it is given. The AI process suite is not application code, and `git rm` from a subagent reaches it past `guard-skill-edit` (matcher `Edit|Write`) and past the slice loop's `skill-creator` rule, which runs a step later.
- One exemption, checkable by kind rather than judgment: artifacts whose deletion is not git-recoverable, where the file's absence changes state outside the repo — an applied database migration, a lockfile pinning published artifacts. Nothing else is exempt, and "shared" never qualifies.
- `find-references` and a repo-wide grep produce the blast-radius inventory, not reprieves: every call site that will break becomes a forward requirement in the record and surfaces as a type error in the connection map. Breaking other parts of the app is the expected outcome, because the connection map is what tells the build where to reconnect.
- A reference the agent suspects but cannot locate is deleted anyway and written into the record as a forward requirement naming the suspicion.
- Tests for the demolished surface are deleted with it; before deleting each, check whether it smuggles a behavioral guarantee, and every guarantee found becomes a record line.
- The record admits only material passing this filter: anything the code alone knows, that no other artifact can state, and no design or brief artifact overrules. An overrule is a stated contradiction cited by location; silence preserves.
- Record entries name artifacts and state no conclusion about the old surface's shape, the same discipline the review board's Actions contract uses, because a rule satisfied by rewriting a sentence is a rewrite test rather than a filter.
- The record excludes verbatim code, anything the design artifact states, anything the type errors carry, and structural description of the old surface.
- The record is session-scoped scratch at `.ai/demolition/<task-slug>.md`, gitignored and never committed, its path recorded in the task file so a resumed session can reopen it. The obligation to report orphans to the user is met by the manifest landing in the main session's stream during the run.
- Run 1's manifest lands in the dispatching session's stream before run 2 is dispatched: visible and interruptible, never a gate that waits. All six of run 1's returns get relayed, the suspected-reference list included, since no compiler regenerates it.
- Demolition commits its own explicitly-named red state; each subsequent slice shrinks the recorded type-error set and introduces no error outside its own scope; the set is zero before the human QA gate. A red edge closes by reconnecting its call site to the new interface or the slice reports BLOCKED, never by re-creating what died: a module at the old path re-exporting the old names closes every error at once and ships the incumbent as a permanent adapter.
- Run 2 receives the project's typecheck command in its mandate rather than discovering it, holding `Bash` and no file-reading tool, and returns the command and exit code alongside the error set. A guessed command exits clean or errors on a missing script, both of which read downstream as "no typechecker" and produce an absent connection map that satisfies every remaining check.
- Step 3 skips the pass when a `demolition: done` marker is present, since a resumed `replace` task is indistinguishable from a fresh one at the gate and re-dispatching deletes the replacement already built into the zone.
- Per-slice validate does not require a green project typecheck while the connection map is non-empty; lint and the slice's own test files stay green per slice.
- `tdd` states its execution scope: the tests covering the seam under test plus its direct consumers, lint on touched files, full suite once at the end — dependency-shaped, not directory-depth-shaped.
- `project-init` treats a missing project typechecker as a cost-branched agenda item.
- Every slice touching `.claude/skills/` loads `skill-creator` first, and the change lands with README blurbs, `fork-points.md` couplings, gut-check prompts, and a `CHANGELOG.md` entry.

## Acceptance criteria

- [ ] A fresh session scoping a code-touching task through `grill-engineer` asks the incumbent question and writes one of the three values, with `none` and `extend` each carrying a one-line why.
- [ ] `implement-task` refuses and routes to a grilling, on both `scoped` and resumed `in-progress` files, for a missing `incumbent:` key, a value outside the three tokens, and a `replace` task with no zone — writing none of them itself.
- [ ] A `grill-engineer` session landing on `replace` declines the build-now exit and recommends spec-it.
- [ ] A `replace` task's Demolition section carries the zone and carve-outs at spec time, and the connection map, record path, and `demolition: done` marker after the pass runs.
- [ ] Re-running `implement-task` on a task whose Demolition section carries `demolition: done` skips the pass and enters the slice loop.
- [ ] A zone naming a `.claude/skills/` path stops unless the task file records the user's authorization.
- [ ] `implement-task` pointed at an `incumbent: replace` task dispatches run 1, relays its plan and manifest into the session stream, then dispatches run 2 with the plan alone; the build session's context never contains the demolished implementation's body.
- [ ] A demolition over a module referenced from three surviving call sites deletes it, and all three call sites appear in the record as forward requirements and in the connection map as type errors.
- [ ] A demolition over a zone containing an applied migration leaves the migration and reports the exemption by kind.
- [ ] A reference the agent suspects but cannot locate results in deletion plus a record entry naming the suspicion.
- [ ] The record contains no code blocks, names artifacts rather than stating conclusions about the old surface, and does not survive the session.
- [ ] A boundary contract the design artifact explicitly contradicts is absent from the record; one the design is silent on is present.
- [ ] After demolition on a TypeScript project the recorded type-error set is non-empty, each slice reduces it, and it reaches zero before the QA gate.
- [x] `grep -rn "incumbent:" .claude/skills docs` shows the key in the task template, `grill-engineer`, and the scoped-task example, with no stale genre vocabulary anywhere.
- [x] `pnpm format:check` passes, README blurbs and stage map match shipped behavior, `fork-points.md` carries the couplings, and the `CHANGELOG.md` entry is present at `v1.6.0`.
- [ ] Gut-check prompts run in fresh sessions confirm each edited skill triggers and behaves as intended.

## Dependencies

None external. Carve-out screenshots use the project's UI verification tool, inert on projects with no UI.

## Risks / open questions

- [ ] Whether a subagent inherits the session's permission decisions is unverified for both shipped shapes: run 1 declares `Bash, Read, Grep, Glob, Write, LSP` and must write its record outside the tracked tree, run 2 declares `Bash` only and must delete and commit. If a subagent cannot delete cleanly, the fallback is the main session executing run 1's kill list, which keeps the mandate and loses only the executor's context separation.
- [ ] The zone boundary is the one judgment the design cannot mechanize. It comes from the task file at file level for that reason, but a zone drawn too narrowly at scoping time still under-deletes silently.
- [ ] `git show HEAD~1` reaches the whole incumbent on the commit demolition itself creates, and git history has to stay reachable for recovery, so the leak cannot be closed. The slice loop's deep-plan step now names it and points at the connection map and the record's blast-radius entries as the sanctioned substitutes, but that is an instruction against an available action — the weak form of control by this design's own argument. Treat it as accepted and open.
- [ ] The connection map is incomplete by construction: nav entries, i18n keys, feature flags, route tables, and CI path filters produce no type errors. Run 1's blast-radius grep is the only net for those.
- [x] `git rm` runs under the `Bash` matcher and bypasses `guard-skill-edit`, which matches `Edit|Write` only, and step 3 runs before the slice loop's `skill-creator` rule so that backstop misses too. Closed by scope rather than by the hook: `.claude/skills/`, `.claude/agents/`, and `.claude/hooks/` paths enter a zone only on the user's written authorization, and where authorized the dispatcher loads `skill-creator` before dispatching. The process suite is not application code and is never demolished wholesale without the user saying so.
- [ ] No published source addresses whether splitting demolition from construction across agent contexts helps or hurts; the reasoning is sound and unvalidated. Treat the first real runs as evidence.
- [ ] Separate finding, not part of this task: `/diagnose` Phase 4 goes straight to `/tdd` regardless of fix size, with no rule elevating a non-trivial fix to a captured task carrying its own recommendation. Worth its own capture.

## Design decisions

- The verdict is decided in grilling and nowhere else. Implementation executes or stops; giving the build session any say hands the call to the party carrying the measured bias.
- The key names the mechanism rather than the genre, because `implement-task` needs one fact — does the incumbent survive — and genre words map onto both answers depending on scope.
- Two agent invocations rather than one agent doing two passes. A single context carries the read pass's sympathy for the code into the delete pass, so the split would buy planning quality and no protection. Run 2 receives the plan and nothing else, so it has no relationship with what it deletes.
- Reading is made safe by removing the output the bias needs rather than by instructing against it. Run 1 can express doubt only by writing a record entry, never by sparing a file; run 2 cannot write code at all. Guard-and-Go requires the old code present and a conditional to wrap it in, and neither is available. The research is explicit that more instruction increases misjudgment, so the design removes the action rather than arguing with the inclination.
- Nothing survives by being referenced. A shared module used in three places and targeted by the design is exactly what a preservation-biased session protects and exactly what should go; the surviving call sites are the work list, not the objection. This reverses an earlier draft that made an outside reference a reprieve and thereby encoded the fallacy as rigor.
- The only exemption is git-recoverability, the one case where deletion is genuinely irreversible: an applied migration leaves production schema and a fresh `migrate` run permanently divergent, and restoring the file un-applies nothing. Stated as a kind so it cannot be argued into covering shared code.
- The manifest lands in the dispatching session's stream rather than inside a subagent transcript, which is what makes it visible at all; it is a window, not a gate, because a confirm on every file trades away the speed that makes demolition worth doing.
- Record entries name artifacts and state no conclusion, borrowing the review board's Actions contract: a rule phrased as "never say X" is passed by rephrasing, so the rule binds what an entry must contain rather than what it must avoid.
- The record is session scratch because a task that outlives its session has other problems, and accommodating that case adds durable-artifact machinery for an edge case that should not recur.
- Type errors are the demolition-to-build handoff, generated by the compiler rather than inferred by a session, and immune to the incumbent-curation problem that makes prose descriptions of the old surface poisonous.
- `/diagnose` is untouched: its job is diagnosis, and a fix outgrowing a repair belongs in a captured task with its own recommendation rather than absorbing demolition logic. The skills README's "fixed stops on every implementation path" narrows to name the paths it actually covers.
- This task is `incumbent: extend`: every edit adds behavior to skills whose current instructions stay correct, and the two new files are net-new surface rather than successors.
- Reference implementations: `grill-design`'s fidelity contract for the store-classify-transcribe sequence; `grill-initiative`'s estate reconciliation for planned destruction presented as a reviewable classification; `tdd`'s check-before-delete discipline at test scope; `review-board`'s Actions contract for artifact-bound entries; `research-analyst.md` for the read-only agent shape.

## Test strategy

This repo ships no application code, so validation is `pnpm format:check` plus the acceptance criteria exercised as manual QA, with `skill-creator`'s gut-check handoff standing in for an automated suite: each slice touching a skill closes with fresh-session test prompts. The mechanism is exercised end to end against a real `incumbent: replace` task in an instance rather than simulated here. Payload-wide greps stand in for consumer checks, since LSP find-references does not reach markdown.

## Slices

The branch carries eight commits predating the redesign. Slices 1, 2, 6, and 7 landed and survive; the discipline and build wiring were built to the old single-agent design and need rewriting.

- [x] The label exists and gets set: `incumbent:` in the task template, the decision rule in `grill-engineer`'s spec-it, the in-session verdict on build-now, the key in `example-scoped-task.md`.
- [x] The build refuses without it: `implement-task` step 1 gate, extended during the patch pass to resumed `in-progress` files.
- [x] Rebase onto `main` and renumber: five files conflict with the merged `v1.5.0` work, and the `CHANGELOG.md` entry plus `package.json` move to `1.6.0` since `1.5.0` is taken. Then two amendments to the landed slices — `implement-task` states it never writes the key, and `none` carries a one-line why alongside `extend`.
- [x] Rewrite the discipline and the agent to two stages: `implement-task/references/demolition.md` carrying the zone-is-the-only-survival-test rule, the git-recoverability exemption, the blast-radius inventory, the record's filter and artifact-bound phrasing, and the manifest relay; `.claude/agents/demolition.md` split into a read-only planner and a plan-only executor.
- [x] Rewrite the build wiring: `implement-task` step 3 dispatching run 1, relaying the plan, dispatching run 2, then the named red commit, the connection map recorded in the task file, and the per-slice validate change.
- [x] The upstream cascade: `grill-design`'s surface verdict and `grill-product`'s brief prose. `grill-initiative` needed no edit.
- [x] The validation contracts: `tdd`'s execution scope, `project-init`'s typechecker agenda item, the `fork-points.md` entry.
- [x] Close out: skills README blurbs, chain diagram, stage map, the narrowed fixed-stops claim, remaining `fork-points.md` couplings, stale-vocabulary greps, `pnpm format:check`, the `v1.6.0` CHANGELOG entry, and the gut-check prompt set.
