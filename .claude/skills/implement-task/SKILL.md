---
name: implement-task
description: Build a scoped task file from docs/tasks/ slice by slice in a dedicated git worktree (or a non-main branch) — plan, TDD, validate, and commit each slice, keep the task file's status current, and gate done on human QA — never pushing or opening a PR itself. Use when the user points at a task file to build, says "implement this task", "pick up the task we scoped", "build the scoped task", or resumes scoped work in a fresh session.
argument-hint: '[path to a docs/tasks/*.md file, or blank to pick from scoped tasks]'
---

The design is settled before this skill runs: build what the task file specifies and never re-decide architecture. A single-unit task runs the same plan → tdd → validate → commit loop as a ten-slice feature, just once — ceremony scales with size, discipline never does.

## 1. Invocation and gating

Take three snapshots at invocation, in this order:

- Branch: `git branch --show-current`.
- Scoped tasks: `grep -l 'status: scoped' docs/tasks/*.md 2>/dev/null || echo "(none)"`.
- Resumable tasks: `grep -l 'status: in-progress' docs/tasks/*.md 2>/dev/null || echo "(none)"`.
- The snapshots are invocation-time only; re-check live state after any pause or any user action.

Pick the task:

- With a path in `$ARGUMENTS`, read that file.
- With no path, confirm which snapshot task to build; `status: in-progress` ones are resumable.

Gate on readiness, not ceremony:

- `status: scoped` plus concrete acceptance criteria means go.
- Recommend `/grill-me engineer:` and stop when the file is still `captured`, or when `TBD (needs grilling)` appears in Requirements, Acceptance criteria, or Design decisions — an under-specified file gets its requirements invented silently.
- Slices that render or reshape a user-facing surface are buildable only with a `design:` artifact or a governed-verdict recorded in Design decisions.
- With neither present, recommend `/grill-design` and stop; otherwise the surface gets composed from the API payload.

Then run all four `incumbent:` checks:

- Refuse a task file with no `incumbent:` key — a missing key is never a quiet `extend`.
- Refuse an `incumbent:` value outside `none`, `replace`, and `extend`; a placeholder, a capitalization, or a parenthetical decided nothing.
- Never read an invalid value as "not `replace`": that turns the gate's null result into the outcome the gate exists to prevent.
- Refuse `none` or `extend` carrying no one-line why in Design decisions — the why-line is the entire price those verdicts carry.
- Refuse `replace` with no zone named in the Demolition section: there is no boundary to demolish along.

Gate mechanics:

- When any of these checks fails, recommend `/grill-me engineer:`, stop, and name what is missing.
- Apply all four checks to a resumed `in-progress` file exactly as to a `scoped` one — in-flight tasks hide an unexamined verdict longest.
- Every gate check asks only whether the line exists; never weigh whether the reasoning convinces you.
- Never write the key, the why, or the zone yourself — all three are human-in-the-room grilling outputs — route the gap back.

## 2. Workspace

- Never build on `main`.
- Never switch branches in a shared checkout: branch state is checkout-global, so a switch yanks the tree out from under other sessions.
- The default workspace is a dedicated worktree, and this step is the project instruction authorizing the `EnterWorktree` tool.

### Step 1 — derive the branch

- Derive it from the filename: `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` → `<type>/<slug>`.

### Step 2 — reuse an existing worktree

- When `git worktree list` already shows that branch's worktree, enter it with `EnterWorktree` (`path:`) and never recreate it.
- Check for `node_modules` first when entering an existing worktree: `gwt-add.sh` leaves the worktree in place when its install fails.
- With `node_modules` absent, re-run `scripts/setup/gwt-add.sh --no-open <branch>`; it reuses the worktree and retries.

### Step 3 — doc pre-flight

- Check `git status` for uncommitted `docs/**`, `CLAUDE.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `UI_UX.md`, `BRAND_DESIGN.md`, and `.claude/**` changes.
- Read the tree for this, never session memory: the session that wrote the docs is usually already gone.
- On finding doc files, make one offer — stage exactly those paths, hand back a commit message, and wait for the user to commit on `main`.
- Inline `stage-for-commit`'s behavior here and never invoke that skill, which stages only its own session's work.
- On a declined offer, proceed; the rest stays behind by the user's choice.
- Name any non-doc dirt in `git status` and never stage it — it may be another session's work in flight.

### Step 4 — create the worktree

- With no worktree yet, ask for one confirm naming the branch and `.claude/worktrees/<branch>` inside the main checkout, slashes flattened to dashes — the harness's default worktree home, so `EnterWorktree` raises no extra approval prompt.
- On yes, verify the checkout is on `main` first; a checkout parked elsewhere seeds the worktree from the wrong tree, so surface that and wait.
- Then run `gwt-add.sh --no-open` and enter via `EnterWorktree`.
- When `gwt-add.sh` exits non-zero, surface its output and stop rather than entering: every check in that tree then fails for reasons unrelated to the task.

### Step 5 — put the task file on the branch

- The task file must exist on the new branch before the slice loop starts.
- A landed pre-flight commit already put it there.
- A task file still untracked needs `mkdir -p docs/tasks` in the worktree and a move across.

### Fallback and teardown

- A declined confirm means the user creates or picks a feature branch; build there, trusting any non-`main` branch.
- An unavailable `gwt-add.sh` or `EnterWorktree` takes the same fallback.
- Teardown is never this skill's job; `gwt-remove.sh` is the user's post-merge job.

## 3. Demolition dispatch

The procedure lives in `references/demolition.md`. This section carries only the dispatcher's own obligations.

- `incumbent: none` and `incumbent: extend` go straight to the slice loop.
- `incumbent: replace` runs the pass before the first slice.

Check the marker before reading anything else:

- A `demolition: done` line in the task file's Demolition section means the pass already ran.
- Trust it only whole: `done` beside a non-empty connection map (or a recorded no-typechecker fallback) — the two committed artifacts.
- A marker missing its map is a halted pass wearing a finished one's clothes — treat it as `BLOCKED` and read `references/demolition.md` `## Recovery` before touching the tree.
- No marker is not proof that no pass ran: check `git log <default-branch>..HEAD --grep='^demolition: <task-slug>'` before dispatching, because a session that died between run 2's red commit and the write that lays the marker down leaves a fully demolished tree wearing an untouched one's clothes. A hit there is `BLOCKED` into that same Recovery section — never a fresh dispatch, which re-plans over files that are already gone and strands the record the pointer write never recorded.
- Both bounds carry weight: an unscoped grep reaches every demolition ever merged to the default branch, so it fires on some other task's red commit and blocks this one permanently, and the Recovery it routes to would revert a commit this task never made. The range keeps the search on this branch and the slug keeps it on this task.
- The record path beside the marker is worktree-local scratch (the gitignored `.ai/` namespace), so a path that no longer resolves after a fresh clone or new worktree is a degradation to note in the running summary, never a halt signal.
- With the marker whole, skip straight to the slice loop.
- A resumed task looks identical to a fresh one from step 1's gate, and re-dispatching over a zone that now holds two slices of the replacement deletes this task's own finished work — the executor sees paths, the planner has no way to say "these are new", and the relay is a window nobody is guaranteed to be watching.

Dispatch:

- Read `references/demolition.md` in full before dispatching.
- The pass is two dispatches in separate contexts — a planner that reads, an executor that deletes — neither optional nor collapsible.
- After run 1 returns, read the record and nothing else; never open the code about to die.
- That last line instructs against an action rather than removing it, which `references/demolition.md` itself calls the weak form of control; the leak is named here rather than closed.
- Relay run 1's plan and manifest into this session's stream, in full, before dispatching run 2.
- The relay lands here so a human sees it and the dead-code reporting obligation is met; the record is never committed.

Judge the returned error set before writing anything into the task file:

- An empty set, or a report of no typechecker on a stack you know is typed, is a stop rather than a pass — the command never ran, and an absent map satisfies every downstream check while enumerating nothing.
- The gate sits before the write because a marker laid down first survives the stop: the next session would find `demolition: done` on a pass that never completed.
- Only once the set passes that judgment (or the stack is verifiably untyped, recorded as such), write the compiler errors into the task file's Demolition section as the connection map.
- Add the `demolition: done` marker and the record's path beside it in that same write.
- Demolition is where file paths legitimately live; Design decisions bans them precisely because they go stale, so a later grilling session evolving the file would strip the map out.
- The session resuming this task tomorrow has no other copy, and a map living only in this context makes Land's zero-errors condition trivially true for whoever picks it up.

## 4. The slice loop

- With a Slices section, list order is build order — it was dependency-ordered at scoping time.
- With no Slices section, the whole task is one unit: run the loop once against Design decisions and Acceptance criteria.
- Flip the file to `status: in-progress` before starting; it rides along in the first slice's commit.

Report one state per slice:

- `DONE` — validated and committed; continue automatically.
- `DONE_WITH_CONCERNS` — committed with a doubt worth surfacing; note it and continue.
- `OFF_PLAN` — validated and committed, but the artifact check judged the slice off-plan; record the deviation in the task file, stop, and offer verification per Step 3.
- `BLOCKED` — missing context, contradictory requirements, or an un-root-caused failure; stop, surface, wait.
- A task file that is itself wrong is also `BLOCKED`: surface it, never silently redesign.

### Step 1 — deep plan

- The deep plan is a focused read-in, not a fresh design.
- Re-read the slice against Design decisions and Test strategy, and read the current code at the touch points.
- Confirm shared types and consumers with LSP `findReferences`.
- After a demolition, never `git show` the incumbent off the red commit; work from the connection map and the record.
- A red edge naming a contract neither covers is a `DONE_WITH_CONCERNS` or a question, never a history dive.
- Close the plan by presenting files, sequence, test seams, and risks, then `Proceeding unless you interrupt.`
- That plan is a window to course-correct, not an approval gate.

For a slice touching anything a user sees:

- Read the `design:` artifact, `UI_UX.md`, `BRAND_DESIGN.md`, and the app's theme CSS before planning.
- The app's theme CSS is the source of truth for token values.
- When the build must deviate from the artifact, surface it and never redesign silently, because at build time the payload's shape is louder than the task: a deviation that blocks the slice is `BLOCKED`, and a buildable one lands through Step 3's off-plan checkpoint.
- The artifact's Experience intent and Source fidelity sections are the build's judging contract, and the build session never edits them.
- When a render cannot satisfy them, surface the conflict; never adjust the contract to fit the render.
- Record a ratified deviation in the task file and carry it into QA.
- Judge the land render pass against the artifact plus recorded ratifications; only `grill-design` amends the artifact.
- A slice changing anything under `.claude/skills/` loads `skill-creator` here.

### Step 2 — build

- Build with `/tdd`: red before green, one seam at a time.

### Step 3 — validate

- Run the project's own typecheck (where one exists), lint, format, plus the slice's test files.
- Discover the lint, format, and test commands from `CLAUDE.md` and the project manifest; never assume a toolchain.
- Run cheap checks and single test files regularly while building.
- Do not run the full test suite here; it is slow, and its job is at Land and again after any post-QA fix, never mid-slice.
- Fix failing checks iteratively until clean.
- Lint and the slice's own tests stay green on every slice, because deleted files raise no lint errors and deleted tests went with their code.

With a connection map still open:

- A green project typecheck is not the per-slice bar.
- Every slice shrinks the error set and introduces nothing outside its own scope.
- A widening or unexplained set is a real regression; "it is red anyway" never becomes cover.
- Shrinking is not the goal; reconnecting is.
- A red edge closes by wiring its call site to the new interface, or it stays open and the slice reports `BLOCKED`.
- Refuse a module at the old path re-exporting old names — that ships the incumbent as a permanent adapter.

Artifact check, on every slice that composes or reshapes a surface:

- Judge the built code statically against the `design:` artifact: the structure delivers its hierarchy, breakpoint plan, and disclosure plan.
- Judge a governed-verdict line against its named grammar and `UI_UX.md`'s floors the same way.
- The slice's report names the verdict — on-plan or off-plan — so an unstated verdict reads as an unrun check, never as conformance.
- Mid-build uses no session-started server and no self-served pixels: on-plan slices defer all pixel judgment (Experience intent, Source fidelity) to the land render pass.
- An on-plan slice continues without stopping, whatever its size: the artifact already blessed its composition.
- An off-plan slice — one that departed from the artifact's plan and improvised, or composed surface the artifact does not govern — reports `OFF_PLAN`: write the deviation into the task file, commit, then stop and offer verification. Off-plan is the trigger, never size, because a large change that follows the plan needs no steering and a small unsanctioned improvisation festers until QA.
- An accepted offer is the one mid-build pixel check: the user starts the app — hand the command carrying the worktree's absolute path — and the session runs the land render pass's mechanic scoped to the deviated surface.
- A declined offer leaves the deviation recorded, and the loop continues.
- Logic-only slices skip the check.

### Step 4 — commit

- Verify the branch again before staging.
- Stage by explicit path: the slice's files plus the updated task file with checkboxes ticked.
- The commit message names the slice's behavior.

### Step 5 — completeness audit

- After multi-file changes, audit that schemas, constant maps, and import references were updated consistently.
- Verify orphaned code against the `CLAUDE.md` dead-code rule — removed or reported, never silently left.

## 5. Land

Preconditions: all slices `DONE` (an `OFF_PLAN` slice counts once its offer was answered), every acceptance criterion checkable without pixels checked — render-judged criteria (Experience intent, Source fidelity) are ticked by the land render pass or human QA, never ahead of them — and any connection map at zero.

- Run the full test suite — its first run, catching cross-slice regressions single-file runs cannot see.
- A suite failure is a real regression: fix it and amend or commit before proceeding.

Shape check, once the suite is green:

- Run it when the task added a module, moved a boundary, changed a data flow, or rewired a cross-context dependency.
- Load `domain-modeling`, which owns `ARCHITECTURE.md` writes.
- Update the owning `ARCHITECTURE.md` per `ARCHITECTURE-FORMAT.md` — and the root topology doc as well when the change rewired a cross-context dependency — then commit.
- With no `ARCHITECTURE.md` yet, create it with that one shape fact; a one-fact doc is valid, a stub is not.
- No shape change means no edit.

Land render pass, once shape is current and any surface was touched — offered, never assumed:

- One app start serves this pass and the QA gate together: hand the start command carrying the worktree's absolute path (`cd <worktree> && <dev command>` — a terminal sitting in the main checkout serves `main`, not the branch), ask for the URL, and offer to run the pass before the user begins their own QA.
- Confirm the served app is the branch build before screenshotting; screenshots of the wrong tree enter QA as evidence of code the branch does not contain.
- On yes, screenshot every touched surface at both breakpoints and in both themes with the UI tool named in `CLAUDE.md` — theme drift is cheapest to batch here.
- Judge against the artifact, Experience intent and Source fidelity included, and against the design docs and `UI_UX.md`'s floors; fix what fails.
- When `source:` names a stored export, diff each render against the export covering that breakpoint — resolved as repo-root paths under `docs/assets/`, anything outside refused, not read.
- The comparison judges density, hierarchy, scale, content, and fill of space; never palette, token, or theme conformance, because a mock in the wrong theme fails forever and gets rationalized away.
- A drift verdict cites the inventory line or intent assertion it violates.
- User-ratified deviations are not failures.
- Its screenshots ride into the QA handoff, because the user reviews evidence, not promises.
- On decline, QA proceeds on the script alone, and the decline plus its evidence gap are written into the task file — the handoff message dies with the session, and a later `/ship-pr` session reads only the file — because a declined pass is legitimate and a hidden one is not.

Human QA gate, once the render pass is clean or declined:

- Hand over a script: exact commands, URLs, and actions, with observations mapped to acceptance criteria.
- Lead the handoff with the source-versus-build comparison when the task has a stored source design.
- Stop and wait for their verdict.
- Give instructions only; never start servers or drive the app for the user.
- Recommend nothing downstream until the user has seen it work.
- Issues surfaced at QA go back through the slice loop, then re-run the full suite before handing back an updated QA script.

Close:

- On QA confirmed, flip `status: done` and commit the flip.
- Ask once after the flip whether to run `/review-board` before shipping, recommending yes for anything non-trivial: author overconfidence is what the board catches.
- Name the capture candidates the build surfaced alongside that ask, so they land or get declined before shipping.
- Close with a one-line `/ship-pr` offer once the review-board call resolves and a remote exists, then stop.
- `/ship-pr` is an offer only; never invoke it.
- Never push or open a PR from this skill.
- Never create GitHub issues; the task file is the tracker and one commit per slice is the audit trail.
