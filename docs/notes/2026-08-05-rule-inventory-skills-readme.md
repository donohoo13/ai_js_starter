# Rule inventory — `.claude/skills/README.md`

Extracted for the v1.7.0 restatement pass. **This is the specification a rewrite builds from.** 365 rules. Extracted at 7,157 words; four blurbs (review-board, implement-task, grill-engineer, grill-design) have since been cut, bringing the file to 6,063.

Flags: `[VERBATIM]` wording quoted by other files, `[DUP: file]` restated from a SKILL.md, `[GENERIC]` standard practice, `[WHY]` the reason is load-bearing.

## Structural elements that must survive

1. **The ASCII flow diagram** (fenced block after `## The chain`). The densest routing artifact in the file and the only part saying something no SKILL.md says. Every routed edge, parenthetical, and terminal (`hard stop`, `stop`, `/capture-task`) survives; the tree layout is what makes it readable. Below the tree sit five ungrouped one-line entries — `/capture-task`, `/diagnose`, `/curate-context`, `/ship-pr`, `primitives under the hood:` — part of the same block.
2. **The stage map table**, 3 columns × 19 data rows, header `Stage | Skill | You type it?`. Every third cell is an invocation rule.
3. **`**ceremony scales with size; engineering discipline never does**`** — quoted verbatim into other skills.
4. **Three bolded gate names**: `**surface gate**`, `**incumbent gate**`, `**human QA gate**` — tokens other skills refer to.
5. **`project-init` must remain its own `##` section**, because that skill's final approved plan item deletes exactly that section.

## The chain

- `R-01` | Describing the suite | One front door for interview sessions, five lenses behind it, a task file carrying work capture→done
- `R-02` | Every skill | The keystone: **ceremony scales with size; engineering discipline never does** `[VERBATIM]`
- `R-03` | Small work | A one-line chore still gets grilled, built test-first, validated; artifacts collapse, never rigor
- `R-04` | Every path from a grilling session into code | Pass three fixed stops
- `R-05` | Work creating or reshaping a user-facing surface | Proceed only with a `grill-design` outcome `[WHY: else composition comes from the API payload by accident]`
- `R-06` | Every scoped task | State `incumbent:` — `none`, `replace`, `extend` `[WHY: a missing verdict is not a quiet extend]`
- `R-07` | An `incumbent: replace` verdict | Run the demolition pass before the first slice `[WHY: a build session holding old code treats a design as a diff request]`
- `R-08` | Finishing any change | Hand the user instructions to see it in action and wait for their verdict
- `R-09` | Until the user has seen it work | Mark nothing done; recommend nothing downstream
- `R-10` | `/diagnose` | The third way into code, carrying the QA gate alone
- `R-11` | A fix outgrowing a repair | Becomes a captured task entering through the same front door

## Diagram content

- `R-12` | `/grill-me @<artifact>` | Route by the file's kind plus status to the next step in its flow
- `R-13` | `grill-initiative` | Initiative doc in `docs/initiatives/` (verbose Direction + thin Portfolio rows), then hard stop
- `R-14` | Initiative pickup | Next queued project, one at a time, into grill-product's brief flow
- `R-15` | Reorientation close where direction contradicts standing docs | Offer a `CLAUDE.md` interim marker and recommend estate reconciliation, both on the user's word
- `R-16` | `grill-design` | Grammar check → design artifact or governed-verdict → hand into `grill-engineer`
- `R-17` | `grill-design` | Also compiles external-tool mockup prompts; the returned mockup re-enters as a supplied design
- `R-18` | `grill-engineer` build-now | `/tdd` → human QA gate → `/stage-for-commit`, the user committing
- `R-19` | Surface work arriving without its outcome | Chain back into `grill-design`
- `R-20` | build-now | States `none`/`extend` in-session; `replace` disqualifies it and routes to spec it
- `R-21` | spec-it | A `docs/tasks` file: `status: scoped`, `incumbent:`, Demolition section when replace, `design:` link `[VERBATIM]`
- `R-22` | `/implement-task` on `replace` | Demolition pass: planner reads and records, executor deletes; type errors are the connection map
- `R-23` | slice loop | `/tdd`, first-render check, commit per slice; connection map shrinks to zero
- `R-24` | End of `/implement-task` | Task-end render pass → human QA gate → `/review-board` offer → `/ship-pr` offer → stop
- `R-25` | `grill-engineer` park-it | `/capture-task`
- `R-26` | `grill-product` | Design docs, ADRs, capture, or nothing; hands up to `grill-initiative` when workstreams decompose into projects
- `R-27` | A grill-product brief | `docs/briefs/` with `status: draft`, plus `initiative:` when portfolio-spawned `[VERBATIM]`
- `R-28` | A single-workstream brief | Seeds `grill-design` when surface-bearing, else `grill-engineer`
- `R-29` | A multi-workstream brief | `/ground-brief` same session → `status: grounded` → a fresh session per workstream, in recommended order
- `R-30` | `grill-research` | Summary writeup, capture, or nothing
- `R-31` | `/capture-task` | Park anything, any time; the file seeds a later `grill-engineer` session
- `R-32` | `/diagnose` | Feedback loop → repro+minimize → ranked hypotheses → fix via `/tdd` + QA gate; no-seam and prevention findings → `/capture-task`
- `R-33` | `/curate-context` | The gate on prescriptive context files; distillation is one entry path; vocabulary, shape, ADRs hand off to `domain-modeling`
- `R-34` | `/ship-pr` | The chain's one door to the remote; offered by implement-task and review-board, run only on the user's word
- `R-35` | The primitives | `grilling`, `domain-modeling`, `tdd`, `skill-creator` run under the hood

## Artifact lifecycle

- `R-36` | Task frontmatter | `captured` → `scoped` → `in-progress` → `done` `[VERBATIM]`
- `R-37` | A `captured` task | Unknowns explicit as `TBD (needs grilling)` `[VERBATIM]`
- `R-38` | A `scoped` task | Design decisions, test strategy, slices, written during grilling
- `R-39` | Task format | Defined once in `capture-task/assets/task-template.md`; three skills reference it
- `R-40` | A surface-bearing task | Links its design artifact via `design:` `[VERBATIM]`
- `R-41` | Artifact tiers | initiative → brief → task, mirroring Linear, chained upward by `initiative:` and `brief:`
- `R-42` | Raw source material | Verbatim under `docs/assets/<slug>/`, classified before storage
- `R-43` | Any tier | Lower tiers exist without upper ones; most work enters as a one-off brief or task
- `R-44` | Tracking work | No GitHub issues anywhere in the chain — the file is the tracker
- `R-45` | Push and PR | Only through `/ship-pr`, only on the user's word
- `R-46` | `/template-feedback` | The single carve-out outside the chain: files issues against the template repo

## project-init

- `R-47` | `project-init` | One-shot onboarding auditor, run once right after the template lands, never again
- `R-48` | Landing paths | A fresh "Use this template" instance, or the payload copied by hand into an existing repo
- `R-49` | Detection | Git platform, CI, stack, tracker, MCP surface, and secret-candidate files not yet in the deny registry
- `R-50` | The copy path only | Git archaeology recovers a clobbered pre-existing suite as interview talking points
- `R-51` | The interview | `grilling` as onboarding auditor on what a repo cannot answer
- `R-52` | A missing whole-program typechecker | An agenda item branched on adoption cost, not a recorded fact `[WHY: the demolition pass reads the compiler's error set as its connection map]`
- `R-53` | The plan | Itemized, individually approved, across skills, agents, settings, hooks, scripts, and the whole `CLAUDE.md`
- `R-54` | Template residue | Clear the template's own `docs/` artifacts, `CONTEXT.md`/`ARCHITECTURE.md`, `.claude/rules/template-dev.md`
- `R-55` | Before deleting the local `CHANGELOG.md` | Stamp the template lineage into `CLAUDE.md` from it
- `R-56` | project-init | Rewrite `README.md` into the project's own, carrying the template-updates recipe; rename `package.json`
- `R-57` | Single-app destinations | Offer the monorepo collapse
- `R-58` | Validation | Validate the suite's 8-of-10 assumptions against this project and hunt the 2-of-10 misfits
- `R-59` | Outputs | Facts land in `CLAUDE.md`; in-place skill edits are reserved for genuine forks mapped in `fork-points.md`
- `R-60` | project-init | Strictly user-invoked; its final approved plan item deletes the skill and this README section `[VERBATIM]`
- `R-61` | On self-deletion | `sync-template` and `template-feedback` explicitly survive as the long-lived channels to the template
- `R-62` | Later drift | Normal work for `grilling` and `curate-context`, not a re-init

## brand-init

- `R-63` | Filling `BRAND_DESIGN.md` | `brand-init` is the ceremony and its sole owner
- `R-64` | The session | `grilling` with `domain-modeling` active, framed as a brand partner
- `R-65` | Opening | The mood-board gate over image files in `docs/branding/moodboard/`
- `R-66` | Each image | Distilled through the interview — what draws the user → extracted attributes — never a layout or palette wholesale
- `R-67` | Outputs | Foundations, identity tokens, anchored steering sections, four-part voice, anti-goals harvested from the session's rejections
- `R-68` | A missing or empty board | One confirm: stop-and-curate, or continue with anchor interrogation
- `R-69` | Brand evidence questions | Read `references/brand-research.md`; never re-run the research
- `R-70` | Brand derivation inside `grill-design` | Refused inline, signposted here
- `R-71` | Invocation | User-invoked, never auto-chained, re-runnable as a refresh
- `R-72` | A refresh contradicting the filled doc | Halt for the user's pick, per `curate-context`
- `R-73` | Exit | Write the filled doc through `/curate-context`

## sync-template

- `R-74` | Updating an instance | `sync-template` is the pull-based channel
- `R-75` | Start | Read the `Template lineage:` stamp; fetch the remote with tags namespaced against collision `[VERBATIM]`
- `R-76` | Each release newer than the stamp | Walk it as an itemized adaptation interview
- `R-77` | Each item | Apply clean, adapt to this project's posture, or reject
- `R-78` | A rejection | Record the reason in `docs/template-sync-log.md` so no release gets re-litigated
- `R-79` | The negotiation | Seeded with the release's adaptation notes
- `R-80` | Writes | Working-tree changes only; the user commits; then update the stamp
- `R-81` | Invocation | Strictly user-invoked and child-side; the template never pushes into instances
- `R-82` | Running it in the template repo | Refuse
- `R-83` | A missing stamp on a real instance | First-run onboarding rather than failing
- `R-84` | The release diff | Pathspec-exclude the residue set
- `R-85` | `docs/company/` | Excluded from that exclusion; payload skeleton that stays

## template-feedback

- `R-86` | Reporting a template problem | Turn the complaint plus its producing session into a scrubbed GitHub issue, or decline and say why
- `R-87` | Triggering | Strictly user-invoked via `disable-model-invocation: true` `[WHY: a session appraising its own output never fires or fires as deflection]`
- `R-88` | Validation | Lookup-heavy, two questions as the ceiling
- `R-89` | Lineage check | Already fixed in a newer release → no issue, run `/sync-template`; the most common outcome
- `R-90` | Sync-log check | An already-recorded rejection makes it a known misfit
- `R-91` | Local-fork check | Disclose or rule out a misfire inside an adapted artifact
- `R-92` | After the three checks | Weigh the session trace by what the caller asked it to look into
- `R-93` | Verdict | `defect`, `gap`, `misfit`, `upstream`, `not-the-template`; reaching the last two is the actual work `[VERBATIM]`
- `R-94` | A `misfit` verdict | The highest-value output; grows `fork-points.md` from evidence
- `R-95` | The evidence gate | Does not yield to the caller: no narratable trace, no issue
- `R-96` | The verdict | Stays an overridable recommendation
- `R-97` | The trace | Narrated purely in template vocabulary — most actionable for a context-free receiver, already scrubbed for a public repo
- `R-98` | A trace that cannot be told that way | That is itself the `not-the-template` finding
- `R-99` | Filing | One non-skippable confirm showing the rendered body, after a duplicate search
- `R-100` | Labels | `from-instance` plus a kind label `[VERBATIM]`
- `R-101` | Running it in the template repo | Refuse

## grill-me

- `R-102` | `grill-me` | User-invoked router, never model-triggered, the one front door
- `R-103` | Input | An explicit lens, a bare lens, a freeform ask whose lens it infers, or an artifact file
- `R-104` | After parsing | Hand off to one of the five lenses
- `R-105` | Each lens | Declares itself in its opening line, so a wrong inference costs one corrective sentence
- `R-106` | `/grill-me @<artifact>` | Read the file — taxonomy home for altitude, frontmatter for lifecycle — and infer the next step
- `R-107` | File-seeded inferences | Active initiative → next queued project; draft multi-workstream brief → `ground-brief`; captured task → scoping; scoped task → `implement-task` offer
- `R-108` | Any inferred route | State the inference in one line before proceeding
- `R-109` | Direction-scale language | Route to `grill-initiative` directly
- `R-110` | A missed initiative route | Costs nothing; grill-product's scale detection hands up mid-session
- `R-111` | First routing check | Settledness of the _what_; a fuzzy or fanning-out ask leads with `grill-product` even in engineering vocabulary `[WHY: mis-routing designs the how of an undecided what]`
- `R-112` | Second check | Surface-shaped: a settled ask reshaping something user-facing routes through `grill-design` first
- `R-113` | grill-design's grammar check | Fast-exits into `grill-engineer` when the docs already govern the surface
- `R-114` | `grill-engineer` as default | Only among settled, surface-free asks; then route once and get out of the way

## grilling

- `R-115` | `grilling` | Relentless one-question-at-a-time interview until shared understanding is reached
- `R-116` | Question order | Biggest decisions first, with a recommendation and reasoning attached to every question
- `R-117` | Facts versus decisions | Look facts up in the codebase; leave decisions with the user
- `R-118` | Boundaries | Open by naming subject and objective; stop when the objective is met; leave nothing behind but the shared understanding
- `R-119` | Invocation | Model-invocable on 'grill' phrases or whenever a plan needs stress-testing before implementation
- `R-120` | An ask fitting a lens | Load that lens skill instead of the bare primitive

## grill-engineer

- `R-121` | `grill-engineer` | The engineering lens, ~8 of 10 sessions; `grilling` with `domain-modeling` active, framed as an implementing-engineer peer
- `R-122` | Ground truth | The codebase for what exists; Context7 (→ web search → web fetch) for how the stack's libraries behave
- `R-123` | At objective-met | One exit question with a size-based recommendation: build now, spec it, park it
- `R-124` | Build now | `/tdd`, validate, human QA gate, `/stage-for-commit`
- `R-125` | Spec it | Evolve or create the `docs/tasks` file, flipping `status: scoped`
- `R-126` | Park it | `/capture-task`
- `R-127` | A pure discussion | Ends with no forced exit
- `R-128` | Authoring a scoped file | Spec-it owns the full depth, with `references/example-scoped-task.md` as the worked example
- `R-129` | A brief from `docs/briefs/` | Can seed the session the same way a captured task can
- `R-130` | A grounded multi-workstream brief | One workstream at a time; spec-it copies that workstream's contracts and records the `brief:` back-link
- `R-131` | Mid-grill fan-out | A named hand-up trigger to `grill-product` `[WHY: this lens's exits are all singular]`
- `R-132` | A surface task's acceptance criteria | Bound by name to the artifact's Experience intent and Source fidelity sections — criteria, not background
- `R-133` | Binding rather than transcribing | Keeps a mid-build artifact amendment from stranding the task on a stale copy
- `R-134` | A task reshaping a user-facing surface | Enters only with a `grill-design` outcome
- `R-135` | Finding neither | Chain into `grill-design` before any engineering
- `R-136` | Every task | Spec-it sets `incumbent:`, deciding whether `implement-task` demolishes first
- `R-137` | The key | Names the mechanism, not the genre of work
- `R-138` | Build-now | States `none` or `extend` out loud, since no task file carries it there
- `R-139` | A `replace` verdict at build-now | Disqualifies that exit, routing back for the zone, branch, and connection map
- `R-140` | `none` and `extend` | Each carries a one-line why; `replace` carries none `[WHY: demolition is the cheapest of the three to write down]`
- `R-141` | A `replace` task | Gets a **Demolition** section with the zone and its carve-outs `[VERBATIM]`
- `R-142` | That section | The one task-file section where file paths belong, and where `implement-task` writes the connection map

## grill-initiative

- `R-143` | `grill-initiative` | The direction lens one tier above grill-product, per Linear's hierarchy
- `R-144` | The session | `grilling` with `domain-modeling` active, framed as a product-strategy partner
- `R-145` | A multi-project ask | Distilled into one `docs/initiatives/YYYY-MM-DD-<slug>.md`, shaped by `references/example-initiative.md`
- `R-146` | The `## Direction` section | Verbose on purpose: the constitution downstream sessions inherit `[WHY: at direction scale the residue is the deliverable]` `[VERBATIM]`
- `R-147` | Doctrine in Direction | Product constraints only; artifact types, homes, and owning skills stay the skills' own
- `R-148` | The `## Portfolio` section | Thin project rows in pickup order with status, outcome, dependencies, done-when `[VERBATIM]`
- `R-149` | Row status | `done` judged manually; `dropped` rows kept with their why
- `R-150` | Source material at this scale | Verbatim under `docs/assets/<slug>/`, classified before storage
- `R-151` | At initiative time | No eager children; briefs and tasks arrive at pickup, one project at a time
- `R-152` | The close | A hard stop, like `ground-brief`
- `R-153` | A direction contradicting standing docs | Also offer the interim marker and recommend the reconciliation sweep, on the user's word
- `R-154` | The sweep | Classify every standing ADR, task, brief, and design against the Direction
- `R-155` | Entering | Explicit direction-scale asks, or grill-product's scale hand-up
- `R-156` | A lone feature | Never manufacture an initiative; most product work is a one-off brief

## grill-product

- `R-157` | `grill-product` | The product/design lens; `grilling` with `domain-modeling` active, framed as a product-design partner
- `R-158` | Grounding | `UI_UX.md`, `BRAND_DESIGN.md`, the existing UI code, and web research into named patterns and published findings
- `R-159` | Recommendations | From real-world evidence, never invented UI/UX concepts
- `R-160` | Altitude | What and why, never how
- `R-161` | Web-evidence questions | Dispatch `research-analyst` in the background so the interview continues
- `R-162` | Exits | Only what crystallised: design-doc updates, a brief, an ADR, a capture, or nothing
- `R-163` | A brief | `docs/briefs/`, shaped by `references/example-product-brief.md`, evidence-grounded, implementation-free, `status: draft`
- `R-164` | A brief replacing something shipping | State that plainly in Position `[WHY: a silent brief gets read against existing code downstream]`
- `R-165` | Fog-plus-fan-out | Detect mid-session; confirm with a one-line naming
- `R-166` | After that confirm | Consolidate the feature set: split workstreams on UI/UX seams with restraint
- `R-167` | A settled workstream entry | Capture and link it on the spot
- `R-168` | A single-workstream brief | Seed the next lens in-session: `grill-design` when surface-bearing, else `grill-engineer`
- `R-169` | A multi-workstream brief | Chain into `ground-brief` same session, then stop hard
- `R-170` | Workstreams decomposing into projects | Name initiative scale and, on the nod, hand up in-session with residue intact

## grill-design

- `R-171` | `grill-design` | The composition lens between product and engineering
- `R-172` | Altitude | What a surface looks like — decision job, intent, hierarchy, per-breakpoint layout, controls, disclosure — never how it is built
- `R-173` | Every session opening | The grammar check against `UI_UX.md`
- `R-174` | A governed surface | Exit in minutes with a stated verdict into `grill-engineer`
- `R-175` | An ungoverned or strained surface | Full composition interview, writing `docs/designs/YYYY-MM-DD-<slug>.md`
- `R-176` | The artifact | Shaped by `references/example-design-artifact.md`; linked via `design:`; `implement-task` builds to it
- `R-177` | Both hand-off exits when the surface ships | State whether the composition replaces or extends it `[WHY: cheapest in the session holding new against old]`
- `R-178` | Writing `incumbent:` | `grill-engineer` remains the single writer
- `R-179` | Every artifact | Falsifiable Experience intent assertions the render checks judge feel against
- `R-180` | A supplied design | Additionally runs the fidelity contract
- `R-181` | The source | Classified before storage, stored under `docs/assets/`, recorded in `source:`
- `R-182` | Before any doc validation | Transcribe working qualities into a Source fidelity inventory, never by reference to the incumbent surface
- `R-183` | Intent and conflicts | Derive intent from the source; weigh every doc-conflict cut against the inventory out loud
- `R-184` | Before adoption | Re-examine the cumulative composition against the source once
- `R-185` | Every settled surface-bearing ask | Routes here; the skip is a stated, auditable verdict `[WHY: judgment-gated design passes demonstrably undertrigger]`
- `R-186` | The mockup path | From a grilled position only, never an ungrilled idea
- `R-187` | A mockup prompt | One per surface: the feature's facts plus distilled brand non-negotiables, never pasted doc contents
- `R-188` | The validated mockup | Re-enters through the fidelity contract
- `R-189` | Web-evidence questions | Dispatch `research-analyst` in the background
- `R-190` | An unsettled what mid-interview | Hand up to `grill-product`
- `R-191` | Skeletal design docs | Stop with a one-line signpost to `brand-init`; derivation is never an inline side effect
- `R-192` | A genuinely new grammar | A one-time `/curate-context` offer into `UI_UX.md` `[WHY: the flywheel that makes future surfaces arrive governed]`

## ground-brief

- `R-193` | `ground-brief` | The engineering reconciliation pass between a product-pure brief and the workstream grillings it seeds
- `R-194` | Reading | The brief and the code each workstream would touch, at orientation depth
- `R-195` | Outputs | Per-workstream feasibility with the risky bit named, cross-workstream contracts, a recommended order
- `R-196` | Code contradicting the split | Surface a re-split proposal with costs; never redraw product lines silently
- `R-197` | The write | Gated by one HITL approval
- `R-198` | On approval | Append `## Engineering grounding`, apply accepted re-splits, flip `status: draft → grounded` `[VERBATIM]`
- `R-199` | `status: grounded` | The one brief fact not derivable from child task files
- `R-200` | Invocation | Chained from grill-product's brief exit, or standalone on a draft `[WHY: judging re-splits needs the interview residue]`
- `R-201` | A single-workstream brief | Decline; it seeds through the router
- `R-202` | The close | Hard stop with pickup instructions, one workstream per fresh session

## grill-research

- `R-203` | `grill-research` | The research lens; `grilling` framed as a research analyst with no build pressure
- `R-204` | Sourcing | Context7 → web search → primary docs
- `R-205` | Anything past a quick pull | Dispatch `research-analyst` in the background, announced in one line
- `R-206` | Exits | A summary writeup (suggest `docs/notes/`), a capture, or nothing — the normal case, counting as success

## implement-task

See `docs/notes/2026-08-05-rule-inventory-implement-task.md` for the full 143-rule inventory. The README's blurb carries only: the resume door and its four refusals, the doc pre-flight, the worktree, the demolition pass on `replace`, the slice loop and its three states, Land's suite/render-pass/QA-gate sequence, and the never-push rule.

## tdd

- `R-235` | `tdd` | Red before green, one seam at a time, tests only at pre-agreed public seams `[GENERIC]`
- `R-236` | Each cycle | A dependency-bounded neighborhood: the seam's tests plus direct consumers, lint on touched files; full suite once at the end
- `R-237` | Anti-patterns | Implementation-coupled, tautological, horizontal slicing; cataloged in sibling references
- `R-238` | UI seams | Layout, appearance, and composition are never test targets `[WHY: jsdom computes no layout, so tests are design-blind]`
- `R-239` | View logic and behavioral contracts | Full discipline; appearance belongs to the artifact and render checks
- `R-240` | Appearance-shaped tests in touched files | Cleaned up in the same change, re-expressed at a behavior seam where they smuggle a real guarantee
- `R-241` | Invocation | Under the hood from build-now and the slice loop; also directly whenever a test can lock something down

## skill-creator

- `R-242` | Any change under `.claude/skills/` | `skill-creator` is the mandated path
- `R-243` | The `guard-skill-edit` hook | Denies `Edit` and `Write` on those paths until it loads `[VERBATIM]`
- `R-244` | The matcher | Reaches those two tool names only, so a Bash write lands ungated
- `R-245` | Authoring discipline | Trigger-accurate third-person descriptions, progressive disclosure one hop deep, why-over-MUSTs, rewrite-accreted-prose
- `R-246` | Limits, frontmatter keys, sources | `references/skill-quality.md`
- `R-247` | Every substantive change | Close with a gut-check handoff of test prompts for a fresh session `[WHY: the authoring session is too warm to prove cold-start triggering]`
- `R-248` | Every skill change | Lands with its checklist: README blurb and fork-points coupling checks
- `R-249` | skill-creator | Never runs tests itself; evaluation is the user's fresh session

## review-board

See `docs/notes/2026-08-05-rule-inventory-review-board.md` for the full 117-rule inventory. The README's blurb carries only: scope, the two seat sets and how they are chosen, the doc board's floor and fixed depth, the mode dial, the two gates, the chair's verdicts, dispositions by provenance, the `review:` record commit, and the HITL close.

## capture-task

- `R-288` | `capture-task` | Quick-capture a bug, feature idea, or chore as `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`
- `R-289` | Unknowns | Explicit as `TBD (needs grilling)` rather than invented `[VERBATIM]`
- `R-290` | Interviewing | None; mine the conversation for error text, paths, decisions already made
- `R-291` | Why it matters | A fresh session picks the task up cold
- `R-292` | Every capture | Starts at `status: captured`, omitting the scoped sections
- `R-293` | An actionable aside or drift | Suggest capture once; fixing now is `/diagnose`
- `R-294` | Filing | Never auto-file; if the user doesn't bite, drop it

## diagnose

- `R-295` | `diagnose` | The bug front door for anything broken the user wants understood or fixed now
- `R-296` | Before any theorizing | Build a red-capable feedback loop — the phase that _is_ the skill
- `R-297` | Next | Reproduce and minimize until every element of the repro is load-bearing `[GENERIC]`
- `R-298` | Then | Test 3–5 ranked falsifiable hypotheses with one-variable probes
- `R-299` | Landing the fix | Regression test via `/tdd` at a correct seam, QA gate, a `/review-board` recommendation when it outgrew quick-fix size
- `R-300` | Where the team flow requires one | A deliberately chosen non-main branch
- `R-301` | "No correct seam exists" | A first-class finding: document it and hand to `/capture-task`
- `R-302` | "Cannot build a loop" | A first-class finding: stop and ask for an artifact or environment rather than guessing
- `R-303` | Post-fix | Prevention gaps → `/capture-task`; a durable gotcha earns one `/curate-context` nudge
- `R-304` | Phases | Skipped only when explicitly justified; a symptom is not a root cause `[GENERIC]`
- `R-305` | Invocation | "diagnose", "debug this", or any broken report to investigate now; parking stays `/capture-task`

## stage-for-commit

- `R-306` | `stage-for-commit` | Stage exactly this session's changed files by explicit path, never `git add -A`
- `R-307` | After staging | Hand back a commit message and stop: no commit, no branch, no push, no AI attribution
- `R-308` | Before writing the message | Prove the staged set with `git diff --cached --stat`
- `R-309` | Files another session staged | Leave in the index and flag them `[WHY: a git commit takes the whole index]`
- `R-310` | Same-file collisions with unrecognized hunks | Surface for the user to decide
- `R-311` | Invocation | End of a quick chore/feature/bug
- `R-312` | build-now landing | Only after human-QA confirmation; never auto-chained from an implementation

## ship-pr

- `R-313` | `ship-pr` | The PR landing and the chain's only door to the remote
- `R-314` | The PR body | Summary, QA evidence, Review board section
- `R-315` | The Review board section | Findings by verdict, what was addressed with fix commits, what was dismissed with recorded reasons
- `R-316` | No review data | "Not run." is a valid, self-indicting entry `[VERBATIM]`
- `R-317` | Structure | From `.github/PULL_REQUEST_TEMPLATE.md`, scaffolded on first use
- `R-318` | Review data source order | The `review:` record commit, then session context, then "Not run."
- `R-319` | Hard stops | Mechanical only: default branch, no remote, dirty tree
- `R-320` | Process gaps | One nudge, then the truth in the PR body `[WHY: a skill that blocks on process gets routed around]`
- `R-321` | The PR | No AI attribution; the user is author of record
- `R-322` | Invocation | Strictly user-invoked and conditional by invocation, not configuration
- `R-323` | Other skills | Never run it automatically; a one-line offer at most
- `R-324` | Before touching the remote | One confirm showing the exact title and body
- `R-325` | `draft` as an argument | Open a draft PR

## domain-modeling

- `R-326` | `domain-modeling` | Challenge terms against the glossary, sharpen fuzzy language, stress-test relationships, cross-reference with code
- `R-327` | An ask conflicting with a documented boundary | Surface as a user decision with its cost, never a silent constraint
- `R-328` | The moment a term resolves | Update `CONTEXT.md` inline
- `R-329` | Ownership | All three doc kinds: `CONTEXT.md`, `docs/adr/`, `ARCHITECTURE.md`
- `R-330` | `ARCHITECTURE.md` | Root topology plus per-context docs, created lazily, one true shape-fact at a time, never a stub
- `R-331` | The user wanting the whole map at once | Run the survey bootstrap
- `R-332` | Format and growth rules | `domain-modeling/ARCHITECTURE-FORMAT.md`
- `R-333` | Offering ADRs | Sparingly — hard to reverse, surprising without context, a real trade-off
- `R-334` | A new ADR | Retire what it replaces in the same change
- `R-335` | Every ADR | Declare a `status` from the five tokens `[VERBATIM]`
- `R-336` | A new decision | Grep its area and name what it changes via `supersedes` or `amends`
- `R-337` | The retired ADR | Gets the reciprocal field plus a note on which clause died
- `R-338` | Choosing | `amends` is the default reach; partial retirement is the common case
- `R-339` | Linkage and ownership | Stated rather than enforced — the description, `ADR-FORMAT.md`, and the `CLAUDE.md` rule
- `R-340` | Noticing what to declare | The skill's job; an ambiguous grep hit goes to the user rather than a guess
- `R-341` | Activation | Inside grill-engineer and grill-product sessions, and on "document the architecture"
- `R-342` | Shape updates otherwise | With the code that changes the shape: `implement-task`'s end-of-task check; review-board's correctness seat flags a contradicting diff

## curate-context

- `R-343` | Governs | Every `CLAUDE.md`/`CLAUDE.local.md`, every `README.md`, `.claude/rules/`, `BRAND_DESIGN.md`/`UI_UX.md`
- `R-344` | Any edit to those | Load it first, whatever brought the edit
- `R-345` | Design docs | Also accept a loaded grill lens; `.claude/skills/` stays `skill-creator`'s
- `R-346` | Descriptive docs | Go to `domain-modeling`, holding the seam from both sides
- `R-347` | Enforcement | No hook; the skill descriptions and the `CLAUDE.md` rule are the whole mechanism, which is why both name paths explicitly
- `R-348` | Every edit | Ceremony scales with the edit while discipline never does
- `R-349` | A new rule | The full pipeline: attribution, admission bar, routing, drafting, net-growth judgment
- `R-350` | Attribution | Prompt-steering (A) / undocumented convention (B) / model error (C) — only the (B)s survive
- `R-351` | The bar | Reject anything already enforced by config, documented in a skill, subsumed, or generic
- `R-352` | Routing | Narrowest correct file; the test is who executes it
- `R-353` | Brand and UX foundations | The design docs; discover layout at runtime
- `R-354` | The finished edit | Judge net line growth whole, zero being the benchmark
- `R-355` | Corrections | Verify against the code and land lean; surface deletions, never silent
- `R-356` | Model-proposed candidates | Per-candidate approval; no model-invented content lands unseen
- `R-357` | User-directed edits | Apply on the ask, after the bar's pushback
- `R-358` | The apply step | Appends by default, and is the point-of-use exception to the prose restatement rule
- `R-359` | A near-duplicate | Strengthen the existing bullet
- `R-360` | A contradiction | Halt for the user to pick the survivor
- `R-361` | A decayed target file | Flag as a restatement candidate rather than appending again
- `R-362` | Any pass | "Nothing worth writing" is valid and common
- `R-363` | Distillation triggers | One entry path, suggested at most once, never as a session-end ritual
- `R-364` | The file-triggered path | The common one; fires whether or not anyone said the word

## stage map

- `R-365` | The table | Answers "You type it?" per stage; those answers are the per-skill invocation contract

## Contradictions found at extraction

1. **"Append-only" versus three non-append behaviors** in the curate-context blurb — resolved in v1.7.0 (`R-358`).
2. **The diagram's curate-context list omitted `CLAUDE.local.md` and `.claude/rules/`** while the section says the mechanism works _because_ paths are named explicitly — resolved in v1.7.0.
3. **Only one of two surviving template channels named** — resolved in v1.7.0 (`R-61`).
4. **Reconciled in-text, keep the reconciliation**: "No GitHub issues anywhere in the chain" versus `/template-feedback` filing issues, resolved by "the single carve-out sits outside the chain entirely"; and grill-design stating replace-or-extends versus `incumbent:` being grill-engineer's, resolved by "grill-engineer remains the single writer". Dropping either reconciling clause creates a real contradiction.
