# Rule inventory — `implement-task/SKILL.md`

Extracted for the v1.7.0 restatement pass. **This is the specification a rewrite builds from.** A rule missing here is a rule that disappears from the product. Format: `ID | WHEN it applies | WHAT to do`, with flags — `[VERBATIM]` wording is load-bearing, `[ORDER]` position in a sequence matters, `[DUP: file]` stated elsewhere, `[WHY]` the reason keeps the rule from being argued around.

Extracted at 4,184 words; the file is 3,358 after section 3's collapse into `references/demolition.md`.

## Invocation and gating

- `R-01` | Frontmatter | `name: implement-task`, `argument-hint: '[path to a docs/tasks/*.md file, or blank to pick from scoped tasks]'` `[VERBATIM]`
- `R-02` | Frontmatter description | Triggers: pointing at a task file, "implement this task", "pick up the task we scoped", "build the scoped task", resuming scoped work fresh `[VERBATIM]`
- `R-03` | Always | The design is settled — build what the task file specifies; never re-decide architecture
- `R-04` | A single-unit task | Same plan → tdd → validate → commit loop as a ten-slice feature, run once `[WHY: ceremony scales with size, discipline never does]`
- `R-05` | At invocation | Snapshot the branch with `git branch --show-current` `[VERBATIM][ORDER]`
- `R-06` | At invocation | Snapshot scoped tasks: `grep -l 'status: scoped' docs/tasks/*.md 2>/dev/null || echo "(none)"` `[VERBATIM]`
- `R-07` | At invocation | Snapshot resumable tasks: same grep for `status: in-progress` `[VERBATIM]`
- `R-08` | After any pause or user action | Re-check live state; snapshots are invocation-time only
- `R-09` | A path in `$ARGUMENTS` | Read that file `[VERBATIM]`
- `R-10` | No path given | Confirm which snapshot task to build; in-progress ones are resumable
- `R-11` | Gating | `status: scoped` plus concrete acceptance criteria means go — gate on readiness, not ceremony `[DUP: task-template.md]`
- `R-12` | File still `captured`, or `TBD (needs grilling)` in Requirements, Acceptance criteria, or Design decisions | Recommend `/grill-me engineer:` and stop `[VERBATIM][WHY: under-specified files get requirements invented silently]`
- `R-13` | Slices render or reshape a user-facing surface | Buildable only with a `design:` artifact or a governed-verdict in Design decisions `[DUP: task-template.md]`
- `R-14` | Neither present | Recommend `/grill-design` and stop `[WHY: else the surface gets composed from the API payload]`
- `R-15` | No `incumbent:` key | Refuse — a missing key is never a quiet `extend`
- `R-16` | `incumbent:` outside `none`/`replace`/`extend` | Refuse; a placeholder, capitalization, or parenthetical decided nothing `[VERBATIM]`
- `R-17` | An invalid value | Never read it as "not `replace`" — that turns the gate's null result into the outcome it prevents
- `R-18` | `none`/`extend` with no one-line why in Design decisions | Refuse `[WHY: the why-line is the entire price those verdicts carry]`
- `R-19` | `replace` with no zone in the Demolition section | Refuse — no boundary to demolish along
- `R-20` | Any demolition check fails | Recommend `/grill-me engineer:`, stop, name what is missing
- `R-21` | A resumed `in-progress` file | Apply all four checks exactly as on a `scoped` one `[WHY: in-flight tasks hide an unexamined verdict longest]`
- `R-22` | Every gate check | Check the line exists; never weigh whether the reasoning convinces you `[VERBATIM]`
- `R-23` | A gate gap | Never write the key, the why, or the zone yourself; route it back `[WHY: all three are human-in-the-room grilling outputs]`

## Workspace

- `R-24` | Always | Never build on `main`
- `R-25` | A shared checkout | Never switch branches `[WHY: branch state is checkout-global; a switch yanks the tree from other sessions]`
- `R-26` | Default | The workspace is a dedicated worktree
- `R-27` | Step 1 | Derive the branch from the filename: `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` → `<type>/<slug>` `[VERBATIM][ORDER]`
- `R-28` | `git worktree list` already shows that branch's worktree | Enter with `EnterWorktree` (`path:`); never recreate `[ORDER]`
- `R-29` | Entering an existing worktree | Check for `node_modules` first `[WHY: gwt-add.sh leaves the worktree in place when its install fails]`
- `R-30` | `node_modules` absent | Re-run `scripts/setup/gwt-add.sh --no-open <branch>`; it reuses the worktree and retries
- `R-31` | Step 3 doc pre-flight | Check `git status` for uncommitted `docs/**`, `CLAUDE.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `UI_UX.md`, `BRAND_DESIGN.md`, `.claude/**` `[VERBATIM][ORDER]`
- `R-32` | The pre-flight | Read the tree, never session memory `[WHY: the session that wrote the docs is usually already gone]`
- `R-33` | Doc files found | One offer: stage exactly those paths, hand back a commit message, wait for the user to commit on `main`
- `R-34` | The pre-flight | Inline `stage-for-commit`'s behavior; never invoke that skill `[WHY: it stages only its own session's work]`
- `R-35` | Offer declined | Proceed; the rest stays behind by the user's choice
- `R-36` | Non-doc dirt in `git status` | Name it, never stage it — it may be another session's work in flight
- `R-37` | Step 4, no worktree yet | One confirm naming the branch and `$HOME/Code/.worktrees/<project>/<branch>`, slashes flattened to dashes `[VERBATIM]`
- `R-38` | On yes | Verify the checkout is on `main` first; parked elsewhere → surface and wait `[ORDER][WHY: seeds the worktree from the wrong tree]`
- `R-39` | On yes | Run `gwt-add.sh --no-open`, then enter via `EnterWorktree` `[ORDER]`
- `R-40` | Always | This step is the project instruction authorizing the `EnterWorktree` tool
- `R-41` | `gwt-add.sh` exits non-zero | Surface its output and stop rather than entering `[WHY: every check in that tree then fails unrelated to the task]`
- `R-42` | Step 5 | The task file must exist on the new branch before the slice loop `[ORDER]`
- `R-43` | Pre-flight commit landed | The task file is already on the branch
- `R-44` | Task file still untracked | `mkdir -p docs/tasks` in the worktree and move it over
- `R-45` | Confirm declined | The user creates or picks a feature branch; build there, trusting any non-main branch
- `R-46` | `gwt-add.sh` or `EnterWorktree` unavailable | Same fallback
- `R-47` | Always | Teardown is never this skill's job; `gwt-remove.sh` is the user's post-merge job

## Demolition (dispatcher obligations only; the procedure lives in `references/demolition.md`)

- `R-48` | `incumbent: replace` | Run the pass before the first slice `[DUP: demolition.md]`
- `R-49` | `none`/`extend` | Straight to the slice loop
- `R-50` | The pass | Two dispatches, separate contexts — a planner that reads, an executor that deletes; neither optional nor collapsible `[DUP: demolition.md]`
- `R-51` | Before dispatching | Read `references/demolition.md` in full `[ORDER]`
- `R-52` | A `demolition: done` line in the Demolition section | The pass already ran; skip to the slice loop `[VERBATIM][ORDER]`
- `R-53` | Grounding R-52 | Re-dispatching over a zone now holding replacement slices deletes this task's own finished work
- `R-54` | After run 1 returns | Read the record and nothing else; never open the code about to die
- `R-55` | Before dispatching run 2 | Relay run 1's plan and manifest into this session's stream, in full `[ORDER]`
- `R-56` | Grounding R-55 | It lands here so a human sees it and the dead-code reporting obligation is met; the record is never committed
- `R-57` | After run 2 returns | Write the compiler errors into the Demolition section as the connection map
- `R-58` | Same write | Add the `demolition: done` marker and the record's path beside it `[VERBATIM]`
- `R-59` | Grounding R-57/R-58 | Demolition is where file paths legitimately live; Design decisions bans them, so a later grilling would strip the map
- `R-60` | An empty error set, or no typechecker on a stack known to be typed | A stop, not a pass — the command never ran, and an absent map satisfies every downstream check while enumerating nothing

## The slice loop

- `R-61` | Slices section present | List order is build order, dependency-ordered at scoping time `[DUP: task-template.md]`
- `R-62` | No Slices section | The whole task is one unit; run the loop once against Design decisions and Acceptance criteria
- `R-63` | Before starting | Flip to `status: in-progress`; it rides along in the first slice's commit `[VERBATIM][ORDER]`
- `R-64` | Slice validated and committed | DONE; continue automatically `[VERBATIM]`
- `R-65` | Committed with a doubt worth surfacing | DONE_WITH_CONCERNS; note it and continue `[VERBATIM]`
- `R-66` | Missing context, contradictory requirements, an un-root-caused failure | BLOCKED; stop, surface, wait `[VERBATIM]`
- `R-67` | The task file itself wrong | Also BLOCKED — surface it, never silently redesign
- `R-68` | Step 1 | Deep plan is a focused read-in, not a fresh design `[ORDER]`
- `R-69` | Deep plan | Re-read the slice against Design decisions and Test strategy; read the touch points' current code
- `R-70` | Deep plan | Confirm shared types and consumers with LSP findReferences
- `R-71` | After a demolition | Never `git show` the incumbent off the red commit; work from the connection map and the record
- `R-72` | A red edge naming a contract neither covers | DONE_WITH_CONCERNS or a question, never a history dive
- `R-73` | End of deep plan | Present files, sequence, test seams, risks, then "Proceeding unless you interrupt." `[VERBATIM]`
- `R-74` | That plan | A window to course-correct, not an approval gate
- `R-75` | A slice touching anything a user sees | Read the `design:` artifact, `UI_UX.md`, `BRAND_DESIGN.md`, and the app's theme CSS before planning
- `R-76` | Reading token values | The app's theme CSS is the source of truth
- `R-77` | The build must deviate from the artifact | Surface it — BLOCKED, or DONE_WITH_CONCERNS for minor drift; never a silent redesign `[WHY: at build time the payload's shape is louder than the task]`
- `R-78` | Experience intent and Source fidelity sections | The build's judging contract; the build session never edits them
- `R-79` | A render cannot satisfy them | Surface the conflict; never adjust the contract to fit the render
- `R-80` | A ratified deviation | Record it in the task file and carry it into QA
- `R-81` | Later render passes | Judge against the artifact plus recorded ratifications; only `grill-design` amends the artifact
- `R-82` | A slice changing anything under `.claude/skills/` | Load `skill-creator` here `[VERBATIM]`
- `R-83` | Step 2 | Build with `/tdd` — red before green, one seam at a time `[ORDER]`
- `R-84` | Step 3 | The project's own typecheck (where one exists), lint, format, plus the slice's test files `[ORDER]`
- `R-85` | A connection map still open | A green project typecheck is not the per-slice bar
- `R-86` | Map open | Every slice shrinks the error set and introduces nothing outside its own scope
- `R-87` | A widening or unexplained set | A real regression; "it is red anyway" never becomes cover
- `R-88` | Map open | Shrinking is not the goal; reconnecting is `[VERBATIM]`
- `R-89` | A red edge | Closes by wiring its call site to the new interface, or stays open and the slice reports BLOCKED
- `R-90` | A module at the old path re-exporting old names | Refuse it — that ships the incumbent as a permanent adapter
- `R-91` | Every slice | Lint and the slice's own tests stay green `[WHY: deleted files raise no lint errors and deleted tests went with their code]`
- `R-92` | Any stack | Discover lint, format, and test commands from `CLAUDE.md` and the project manifest; never assume a toolchain
- `R-93` | While building | Run cheap checks and single test files regularly
- `R-94` | Inside the slice loop | Never the full suite
- `R-95` | Checks failing | Fix iteratively until clean
- `R-96` | The slice that first makes a surface renderable | Add a render check `[ORDER]`
- `R-97` | Render check | Screenshot at mobile and desktop widths with the UI tool named in `CLAUDE.md`
- `R-98` | Render check | Judge against the artifact's hierarchy, breakpoint plan, and disclosure plan
- `R-99` | Artifact records Experience intent or a Source fidelity inventory | Judge against those too
- `R-100` | Intent assertions in a governed-verdict line | Judge the same way
- `R-101` | Render check | Also judge against `UI_UX.md`'s floors
- `R-102` | Composition failures | Fix before the slice commits `[WHY: caught at slice 2 costs one fix; at QA it costs a redesign]`
- `R-103` | `source:` names a stored export | Diff each render against the export covering that breakpoint `[VERBATIM]`
- `R-104` | Resolving `source:` | Repo-root paths under `docs/assets/`; anything outside is refused, not read `[VERBATIM]`
- `R-105` | The comparison | Judges density, hierarchy, scale, content, fill of space — the qualities the inventory names
- `R-106` | The comparison | Never palette, token, or theme conformance `[WHY: a mock in the wrong theme fails forever and gets rationalized away]`
- `R-107` | A drift verdict | Cites the inventory line or intent assertion it violates
- `R-108` | Logic-only slices | Skip the render check
- `R-109` | A later slice changing composition | Re-run it
- `R-110` | Step 4 | Verify the branch again before staging `[ORDER]`
- `R-111` | Commit | Stage by explicit path: the slice's files plus the updated task file with checkboxes ticked
- `R-112` | Commit | The message names the slice's behavior
- `R-113` | Step 5, after multi-file changes | Completeness audit: schemas, constant maps, import references updated consistently `[ORDER]`
- `R-114` | Completeness audit | Verify orphaned code per the `CLAUDE.md` dead-code rule — removed or reported, never silently left

## Land

- `R-115` | Precondition | All slices DONE, every acceptance criterion checked, any connection map at zero `[ORDER]`
- `R-116` | Land | Run the full test suite — its first run, catching cross-slice regressions single-file runs cannot see
- `R-117` | A suite failure | A real regression: fix and amend or commit before proceeding
- `R-118` | Suite green | Run the shape check when the task added a module, moved a boundary, changed a data flow, or rewired a cross-context dependency `[ORDER]`
- `R-119` | Shape check | Load `domain-modeling`, which owns `ARCHITECTURE.md` writes `[ORDER]`
- `R-120` | Shape check | Update the owning `ARCHITECTURE.md` per `ARCHITECTURE-FORMAT.md`, then commit
- `R-121` | No `ARCHITECTURE.md` yet | Create it with that one shape fact; a one-fact doc is valid, a stub is not
- `R-122` | No shape change | No edit
- `R-123` | Shape current and any surface touched | Run the task-end render pass `[ORDER]`
- `R-124` | Task-end pass | Screenshot every touched surface at both breakpoints and in both themes `[WHY: theme drift is cheapest to batch here]`
- `R-125` | Task-end pass | Judge against the artifact, Experience intent and Source fidelity included
- `R-126` | `source:` names a stored export | Same scoped comparison — inventory qualities, never palette or theme
- `R-127` | Task-end pass | Judge against the design docs and fix what fails
- `R-128` | User-ratified deviations | Not failures
- `R-129` | Task-end pass | Its screenshots ride into the QA handoff `[WHY: the user reviews evidence, not promises]`
- `R-130` | Render pass clean | Human QA gate `[ORDER]`
- `R-131` | QA gate | Hand over a script: exact commands, URLs, actions, with observations mapped to acceptance criteria
- `R-132` | QA gate | Stop and wait for their verdict
- `R-133` | A stored source design | The handoff leads with the source-versus-build comparison `[ORDER]`
- `R-134` | QA gate | Instructions only — never start servers or drive the app for the user
- `R-135` | Always | Nothing downstream is recommended until the user has seen it work
- `R-136` | Issues surfaced at QA | Back through the slice loop, then re-run the full suite before handing back an updated QA script
- `R-137` | QA confirmed | Flip `status: done` and commit the flip `[VERBATIM][ORDER]`
- `R-138` | After the flip | Ask once: run `/review-board` before shipping? Recommend yes for anything non-trivial `[WHY: author overconfidence is what the board catches]`
- `R-139` | Alongside | Name capture candidates the build surfaced so they land or get declined before shipping
- `R-140` | After the review-board call resolves | Close with a one-line `/ship-pr` offer when a remote exists, then stop `[ORDER]`
- `R-141` | `/ship-pr` | Offer only; never invoke it
- `R-142` | Always | Never push or open a PR from this skill
- `R-143` | Always | Never create GitHub issues; the task file is the tracker and one commit per slice is the audit trail

## Literal strings a rewrite must not alter

Frontmatter and status tokens: `status: scoped`, `status: in-progress`, `status: done`, `captured`, `incumbent:`, `none`, `replace`, `extend`, `design:`, `source:`, `brief:`. Markers matched literally: `demolition: done`, `TBD (needs grilling)`. Slice states: `DONE`, `DONE_WITH_CONCERNS`, `BLOCKED`. User-facing string: `Proceeding unless you interrupt.` Task-file section names: Requirements, Acceptance criteria, Design decisions, Demolition, Slices, Test strategy. Design-artifact sections: Experience intent, Source fidelity.

## Contradictions found at extraction

1. **Suite "first and only run" versus the post-QA loop-back** — resolved in v1.7.0; the suite now re-runs after a post-QA fix (`R-136`).
2. **Read-the-reference before checking the marker** — resolved in v1.7.0; the marker check moved first (`R-52`).
3. **The empty-error-set stop lived only in the reference** — resolved in v1.7.0; it sits beside the write instruction (`R-60`).
4. **Instruction-against-an-action, self-acknowledged** — the file names the tension (`references/demolition.md` argues that removing the action beats instructing against the inclination) and states the leak rather than closing it. **Unresolved.** A rewrite that drops the acknowledgement leaves a bare instruction the reference itself calls the weak form of control.
