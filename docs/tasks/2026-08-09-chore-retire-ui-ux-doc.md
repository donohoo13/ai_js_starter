---
type: chore
status: done
created: 2026-08-09
incumbent: extend
---

# Retire UI_UX.md into path-scoped rules and kill grammars

## Context

Every UI change in an instance ends up appending to `UI_UX.md`, and the doc degrades as it grows. The template ships 129 lines of project-agnostic floors; the reference instance (`fantasy_draft_lab`) carries 210, roughly 40% of it project-specific — six grammar sections (Phase Registers, Positional Rank, Rated Metric Rows & Stat Tiles, Comparison Columns, Form Panel Pages, Premium Gates) plus product rules embedded inside the generic sections, including component names, guard-test paths, and a paragraph of one product's domain arithmetic.

Two mechanisms write that content and neither is the file's location. `grill-design/SKILL.md:77` codifies a new grammar into `UI_UX.md` after a single design session — _"every novel surface either fits the doc or grows it"_ — which is an n=1 abstraction in a repo whose own `CLAUDE.md` requires three examples before abstracting and calls one adapter a hypothetical seam. `grill-product/SKILL.md:29` is a second, non-grammar write path into the same file. Meanwhile nothing loads the floors during an ad-hoc UI edit: `CLAUDE.md` says to read the file before any UI/UX decision, and that instruction has no mechanism behind it.

The grilling session settled that grammars are the wrong instrument entirely: once a pattern proves itself, a component is built for it, and the component is the record. A session needs to know what the UI library holds, not maintain a prose sheet describing it.

## Problem

Current behavior:

- `UI_UX.md` is one file mixing universal usability floors, stack-dependent implementation conventions, email-client rules, project design choices presented as floors, and (in instances) per-surface composition grammars and product vocabulary.
- It is never loaded automatically. Only a skill that names it opens it, so the highest-volume UI work — a small ad-hoc edit with no skill loaded — is governed by nothing.
- Two sanctioned exits append to it (`grill-design` grammar codification, `grill-product` design-doc updates), and nothing evicts.
- "Named grammar" is a citation type threaded through the build chain: `grill-engineer`, `capture-task/assets/task-template.md:61`, `implement-task/SKILL.md:186`, `.claude/skills/README.md:98`, and both worked examples.
- Project design choices sit in the floors file rather than the brand doc: `UI_UX.md:11` states mobile-first as a floor, and the reference instance replaced it with desktop-first justified by citing its own `BRAND_DESIGN.md` Layout section.
- `BRAND_DESIGN.md` is named for design while holding audience, positioning, messaging pillars, voice, vocabulary, and anti-goals; the name invites UI content to land elsewhere.
- No ceremony distinguishes a brand identity-token edit (every surface in the product changes) from any other context-file edit.

Desired behavior: universal floors live in a path-scoped rules file that loads on frontend reads and is closed to growth; stack-dependent styling and email rules live in sibling rules files that `project-init` tailors or deletes; project design choices live in `BRANDING.md`; surface vocabulary lives in `CONTEXT.md`; one surface's composition lives in its `docs/designs/` artifact; a reusable composition is a component found by survey. No document accretes per-surface grammar, and no session appends a floor.

## Scope

- In scope (must-have): the three new rules files; `UI_UX.md` deleted with every rule dispositioned; `BRAND_DESIGN.md` renamed to `BRANDING.md` and absorbing the project-choice lines; `grill-design`'s grammar check replaced by a component survey and its codification exit removed; `grill-product`'s design-doc exit narrowed; explicit reads in all four lens skills; the "named grammar" citation vocabulary retired across six files; `curate-context`'s routing, carve-out scope, and identity-tier gate; `project-init` detection and the `fork-points.md` entries; every reference updated to zero; the `CHANGELOG.md` entry with a migration procedure and the version bump.
- Nice to have: a prose mode for the demolition pass, so a future documentation replacement gets a connection map (second time this gap has forced a workaround — see Design decisions).
- Out of scope (non-goals, named so the task does not expand silently): the `ARCHITECTURE.md` conversation, explicitly parked by the user and no longer a dependency now that component discovery globs rather than routing through that doc. Rewriting any floor's technical content — rules move verbatim, with only their home and cross-reference paths changing. Making `brand-init` self-removing (rejected in session: it is already re-runnable and refresh-after-repositioning is a named trigger). Adding a hook to enforce any of this. Building a `docs/designs/` index file.

## Requirements

### The three rules files

- [x] `.claude/rules/ux-standards.md` — the universal floors: `UI_UX.md`'s Standards (minus the project-choice lines below), Surface Composition, Spacing & Whitespace, Motion, Forms, Numeric Entry & Controls, Feedback & Status, Data Tables. Every rule keeps its source citation verbatim.
- [x] `.claude/rules/frontend-styling.md` — the CSS section (rem/em/%/no-px/`clamp()`), the CSS-First standard, and the Tailwind block, which stays marked as inert where the project does not use Tailwind.
- [x] `.claude/rules/transactional-email.md` — the thirteen Transactional Emails rules, unchanged.
- [x] All three carry `paths:` frontmatter. `ux-standards.md` and `frontend-styling.md` scope to component, markup, and style extensions (`tsx,jsx,vue,svelte,astro,html,css,scss,sass,less`) and deliberately exclude bare `.ts`/`.js`, which would collide with `javascript-typescript.md` and load on every backend file. `transactional-email.md` scopes to email template locations.
- [x] Each file opens with the same load-mechanism preamble `javascript-typescript.md:13` carries: the read trigger, and the two routes that miss it (a `Write` creating a new file, and any Bash write).
- [x] `ux-standards.md` states in its own preamble that it is closed to growth: a new UI rule is a project decision belonging in `BRANDING.md`, a surface decision belonging in a `docs/designs/` artifact, or a reusable pattern belonging in a component.

### Project choices moving to BRANDING.md

- [x] `UI_UX.md:11` mobile-first → `BRANDING.md` Layout. Viewport posture is a product decision, which the reference instance demonstrated by replacing the line and citing its own brand doc's Layout section as the justification.
- [x] `UI_UX.md:48` the 8px spacing base with 4px half-steps → `BRANDING.md` Layout (`spacing rhythm`). The floor is "spacing comes from a constrained scale"; the specific base is a project choice.
- [x] `UI_UX.md:54` density is modal → `BRANDING.md` Density, which already exists as a section.
- [x] `UI_UX.md:17` dark elevation → `BRANDING.md` Surfaces, Borders, Shadows, and Gradients, which already states the elevation policy. Resolve the duplication in favor of the brand doc rather than carrying both.
- [x] `UI_UX.md:59-65` motion durations: the research-backed perception bands stay a floor in `ux-standards.md`; the project's chosen durations, easing, and signature transitions stay `BRANDING.md` Motion. Where the two touch, the rules file states the band and the brand doc picks inside it.
- [x] Every remaining Standards line is audited against the same test before it moves: does a different project reasonably choose differently? A yes sends it to `BRANDING.md`.

### The rename

- [x] `BRAND_DESIGN.md` → `BRANDING.md`, content preserved. The doc holds audience, positioning, messaging pillars, voice, vocabulary, and anti-goals, most of which is not design; the name invited UI content to land in the wrong file, and the `BRAND_DESIGN`/`UI_UX` pairing that justified it disappears with this change.
- [x] Every `BRAND_DESIGN.md` reference across the payload updated (19 files carry one).

### grill-design

- [x] The grammar check becomes a **component survey**: glob for the project's component library by convention (`**/components/`, `**/ui/`, barrel exports) plus `docs/designs/` for a same-family artifact, then read names and exported prop signatures only. No component bodies, no escalation, no recorded path — a recorded path is a cache with no invalidation, which is the disease being removed, and the template ships an empty workspace so there is no path to record at init time.
- [x] `docs/designs/` is globbed alongside the components because a component only exists after a surface ships: two similar surfaces designed in parallel would otherwise diverge with nothing catching it.
- [x] The **Governed** verdict now means "this surface is an instance of `<component>`" or "this extends the composition in `<artifact>`", not "this is a `<grammar>` extension".
- [x] The **Grammar codification** exit is removed. Four exits become three. The flywheel moves to code, where `CLAUDE.md`'s Rule of Three already governs it and `implement-task`'s completeness audit already runs: the third table gets a `DataTable` component, and no doc mechanism is needed.
- [x] `SKILL.md:23` — the feel-silence clause goes from conditional to unconditional. A component carries structure and never at-rest feel, so every governed-verdict authors its two-to-four intent assertions.
- [x] `SKILL.md:17` — the opening-line taxonomy drops "a grammar codified into `UI_UX.md`" from the legal objectives.
- [x] `SKILL.md:69` — the skeletal-docs stop now triggers on `BRANDING.md` alone; the floors file is never skeletal.
- [x] `SKILL.md:14`, `:48`, `:59`, `:60` — fact sources and cross-references repathed.
- [x] `references/example-design-artifact.md:47`, `:71` — the cited paths sit **inside the rendered artifact text**, so every future artifact copies whatever is written there. Repath both.
- [x] Description frontmatter updated: it names `UI_UX.md` and the grammar check.

### The other three lenses

- [x] `grill-product/SKILL.md:29` — the Design docs exit narrows to `BRANDING.md` only. This is the second sanctioned write path into the floors and closing it is the point of the change; a floors file that `grill-product` can append to is not closed.
- [x] `grill-product`, `grill-design`, `brand-init`, `grill-initiative` each gain an explicit instruction to read `.claude/rules/ux-standards.md` by path. None of them opens a source file, so the glob never fires for any of them, and all four cite the floors today (`grill-product:14`, `grill-design:14`, `brand-init:25` and `:38`, `grill-initiative:14`).
- [x] `curate-context/SKILL.md:12`'s carve-out — the grill lenses may write the design docs mid-interview — stays scoped to `BRANDING.md` and does not follow the floors into the rules file. Extending it would reinstate the write path through a different door.

### The citation vocabulary

"Named grammar" is a citation type in the build chain, not just a `grill-design` concept. Each of these changes to cite a component or a design artifact:

- [x] `capture-task/assets/task-template.md:61` — the Survivors citation.
- [x] `grill-engineer/SKILL.md` — the same sentence in the Survivors spec, plus its two other floor references.
- [x] `implement-task/SKILL.md:186` — judging a governed-verdict line.
- [x] `grill-engineer/references/example-scoped-task.md:65` — the worked governed-verdict cites `UI_UX.md` Surface Composition. This is a change in **kind**, not path: the example teaches the pattern by demonstration, and the new form cites a component.
- [x] `.claude/skills/README.md:98` — the flywheel blurb.
- [x] `implement-task/SKILL.md:63` — the doc pre-flight `git status` path list names both filenames. This is a behavioral check, not prose.
- [x] `implement-task/SKILL.md:151`, `:225` — deep-plan reads and the land render pass.

### curate-context

- [x] `SKILL.md:66` routing — the single highest-leverage line in the change, since it is the decision procedure for where all future UI content lands. It becomes a split by what the rule governs, stated without a count so the enumeration cannot go stale: a project choice → `BRANDING.md`; a stack styling convention → `frontend-styling.md`; a universal floor → nowhere, because `ux-standards.md` is closed and a genuinely missing floor is a `/template-feedback` finding; one surface's composition → a `docs/designs/` artifact via `grill-design`; a pattern proven across three surfaces → a component.
- [x] The identity-tier gate: an edit to `BRANDING.md`'s identity sections (Color System, Typography, Shape, Themes, Logo — the tier the doc's own preamble at `:12` already defines as absolute) first reports its blast radius (grep the token across theme CSS and components, count the surfaces, name the `docs/designs/` artifacts citing it), then asks. Steering-section edits keep normal ceremony. A gate that fires on every brand edit trains the reflexive yes.
- [x] After the confirm, offer `/capture-task` once with the dependency list as the task's requirements — the list is already written, and `CLAUDE.md`'s suggest-once rule governs the offer.
- [x] `SKILL.md:111` em-dash exemption, `SKILL.md:9`, `:59`, and the description all name the doc set.

### project-init and fork-points

- [x] `fork-points.md:142` contradicts this change outright: _"`BRAND_DESIGN.md` skeletal, `UI_UX.md` complete... no init-time edits to either file."_ The entry moves out of "Design and domain files" into "Stack and toolchain" with an inverted rule, since two of the three new files are init-tailored. A stale entry here means init silently skips them.
- [x] Three new `fork-points.md` entries, one per rules file, each naming its tailoring lever: `ux-standards.md` is never content-edited and is deleted whole when the destination has no UI; `frontend-styling.md` has its Tailwind block pruned or swapped for the real styling system; `transactional-email.md` is deleted when the project sends no templated mail.
- [x] Each entry carries the trap `fork-points.md:57` already documents for `javascript-typescript.md`: `.css` and `.html` globs match files in almost any repo, so a no-UI destination activates these files unless they are deleted. A `.vue` glob in a React repo is genuinely free; a `.css` glob in a Python API repo is not.
- [x] `project-init/SKILL.md:36` — detection stops asking whether `UI_UX.md` is skeletal and starts detecting the UI framework and styling system, which is what the content tailoring needs.
- [x] Frontmatter detection is narrow by design: globs ship broad and unconditional, and init adjusts them only for a stack whose templates use an uncovered extension (`.templ`, `.erb`, `.heex`) or a monorepo scoping a rules file to one app's path.
- [x] `project-init/SKILL.md:87` — the closing report's design-doc pointer.
- [x] Per `curate-context/SKILL.md:75`, every new rules file and every `paths:` change lands its `fork-points.md` entry in the same change, with `skill-creator` loaded first because the manifest lives under `.claude/skills/`.

### The CLAUDE.md pointer

- [x] `CLAUDE.md` gains a pointer naming all three rules files, what each is for, and when each loads — so every session carries the context-aware framing before any glob fires. This is not decoration: `curate-context/SKILL.md:74` states that a read-triggered rule either takes a guaranteed placement or names itself in a guaranteed file, so the two uncovered routes have somewhere to read it from. A `Write` creating a new component and any Bash write both reach these paths without triggering the load.
- [x] Model it on the existing precedent at `CLAUDE.md:77`, which does exactly this for `javascript-typescript.md`: the file, its load trigger, and the two routes that miss it, stated in one bullet.
- [x] Structure it as a `#### Frontend and UI` subsection under Development, mirroring the `#### Javascript/Typescript/Node.js` subsection the JS/TS pointer already lives in, while the Standards section keeps a rewritten line for `BRANDING.md` alone (read before any brand decision, not imported, so not in context until a session opens it).
- [x] State each file's purpose in one clause, because the pointer's job is orientation a session gets for free: `ux-standards.md` holds the usability and accessibility floors every surface meets and is closed to growth; `frontend-styling.md` holds this project's styling conventions; `transactional-email.md` holds the email-client rules.
- [x] Record the pointer/file coupling in `fork-points.md` for all three, matching the note already at `fork-points.md:56`: pruning a pointer without deleting its rules file leaves the rules loading with nothing to explain them, and deleting the file without the pointer leaves a pointer at nothing.

### The reference sweep

- [x] `CLAUDE.md` — the remaining references: the AI-context-files list, the read-before-any-UI-decision rule (which becomes accurate for the first time, since the rules files actually load), and the `curate-context` routing list.
- [x] `README.md:8` — the Context files bullet.
- [x] `.claude/skills/README.md` — five references (`:39`, `:92`, `:98`, `:150`, `:152`) plus the `grill-design` and `grill-product` blurbs.
- [x] `.claude/rules/template-dev.md` — two references, including the steering-doc enumeration in the version-references rule.
- [x] `review-board/references/correctness.md:7` and `.claude/agents/review-correctness.md:16` — both carry the same doc roster, so both change.
- [x] `brand-init/references/brand-research.md` and `grill-initiative/references/example-initiative.md` — `BRAND_DESIGN.md` mentions.
- [x] `CHANGELOG.md` past entries are **not** touched: `template-dev.md` designates the changelog a history record, and version-stamped provenance is what history records are for.

### Release

- [x] `CHANGELOG.md` v2.5.0 entry: what, why, and adaptation notes carrying a **migration procedure**, not a summary. `sync-template` Phase 2 shows an instance "delete `UI_UX.md`" as one diff item; an instance whose copy has accreted its own grammars needs to be told which sections go to `CONTEXT.md` as vocabulary, which become components, which are project choices bound for `BRANDING.md`, and which are floors that already exist in the new rules file. The reference instance is exactly this case and is the test the notes have to pass.
- [x] `package.json` `version` → 2.5.0.

## Acceptance criteria

- [x] `grep -rn "UI_UX" --include="*.md" . | grep -v "^docs/" | grep -v "^CHANGELOG.md"` returns zero hits. Payload baseline on `main`: 44.
- [x] `grep -rn "BRAND_DESIGN" --include="*.md" . | grep -v "^docs/" | grep -v "^CHANGELOG.md"` returns zero hits. Payload baseline on `main`: 38.
- [x] Both exclusions are anchored `^docs/` and `^CHANGELOG.md` with no `./` prefix, because `grep -r .` emits bare relative paths on this platform; a `^./` anchor silently matches nothing and reports history files as payload defects.
- [x] A written disposition table accounts for all 129 lines of `UI_UX.md`: each line lands in one of the three rules files, in `BRANDING.md`, or is dropped with a stated reason. No line is unaccounted for.
- [x] No payload file outside `CHANGELOG.md` describes a surface grammar as a codifiable artifact or cites one as a citation type.
- [x] Each of the three rules files has a `fork-points.md` entry naming its tailoring lever and its pointer coupling.
- [x] `CLAUDE.md` names all three rules files, states what each is for in one clause, and states the load trigger plus the two routes that miss it — so a session that never opens a matching file still knows the rules exist and why.
- [x] `grill-product`, `grill-design`, `brand-init`, and `grill-initiative` each carry an explicit instruction to read `.claude/rules/ux-standards.md` by path.
- [x] `pnpm format:check` passes.
- [x] `grep -rniE 'v[0-9]'` over the payload's steering docs is clean, per the template's pre-release rule.
- [x] Every deletion is reported to the user before it lands, per `CLAUDE.md`'s context-file rule.

## Dependencies

- [x] User review of the 129-line disposition table before the split lands. This is the single point of failure: a floor lost in the split is lost silently, and the rules carry WCAG and accessibility requirements.
- [x] User approval of the `curate-context:66` routing rewrite, which decides where all future UI content lands.

## Risks / open questions

- [x] Losing a rule in the split is the realistic failure mode and it fails silently. Mitigations: the disposition table is reviewed before the write, the original stays in git, and the reference-sweep grep is mechanical.
- [ ] Reviewing this change seats a **four-seat** documentation board: `review-board/SKILL.md:52` seats security when the changed artifact is a control surface, and a `paths:` glob deciding whether a rule loads is enforcement.
- [x] `grill-design`'s fast exit gets slower in a young project: no components exist, so every early surface runs a full interview. This is correct rather than a regression — today a project can feel governed at n=1 with no component behind the grammar — but it is a real cost worth naming to instances.
- [x] The shallow-only survey can produce a governed-verdict against a component that turns out not to fit. Caught at build time by `implement-task`'s surface gate and human QA; costs a wasted slice, not a shipped mistake. Escalation-on-hit was considered and declined in session.
- [x] `BRANDING.md` and the existing `docs/branding/moodboard/` path that `brand-init` gates on now share vocabulary. Not a collision, but worth one look during the rename.

## Design decisions

**`incumbent: extend`** — no demolition pass runs, and the reasoning is precedent rather than convenience. `docs/tasks/2026-08-05-chore-payload-accuracy-and-restatement-pass.md:137` settled the same question for a payload sweep of nearly identical shape: the pass is safe for code only when a design artifact outranks the incumbent, and a document is its own specification, so deleting it first destroys the only spec available. That binds harder here, because this change relocates 129 sourced rules mostly verbatim, and `references/demolition.md:80-85` forbids the record from carrying verbatim content or any structural description of what died. The pass is built to prevent exactly the transfer this change needs. `UI_UX.md` is deleted inside slice 1, after its content has been written into its new homes — a move, not a demolition.

**The gap this exposes, for the second time.** The `incumbent:` key conflates "the old content dies" with "run the demolition pass", and the pass is code-shaped: its connection map is a typechecker's error set, which markdown does not have. The 2026-08-05 task recorded this at `:131` and nobody closed it. Capture a prose mode rather than working around it a third time.

**The connection map exists anyway.** `grep -rn "UI_UX"` over the payload returns 44 hits on `main`, and `BRAND_DESIGN` returns 38. Both reaching zero is mechanically checkable and serves the same function the compiler's error set serves for code: it enumerates every place something surviving still expects what moved. The scoping session's first count said 61 because its exclusions were anchored `^./docs/` while `grep -r .` emits bare relative paths here, so history files counted as payload — the exact shape of failure this repo's evidence rule exists to catch, found by the number moving the wrong way after slice 1.

**Three files, split by who tailors them, not by topic.** `ux-standards.md` is never touched by init and ships identical everywhere; `frontend-styling.md` is content-pruned to the real styling system; `transactional-email.md` is deleted or kept whole. Three init behaviors justify three files. One combined file would force init to surgically edit a document it otherwise has no business opening, and would drag email rules into every `.tsx` read in a project that sends no mail.

**Globs ship broad; init tailors content.** A glob that matches nothing costs nothing, so `.vue` in a React repo is free and needs no detection. What needs detection is which styling system is real. The exception is genuine: `.css` and `.html` are near-universal, so a no-UI destination must delete the files, which is a fork-point rather than a glob adjustment.

**Discovery, not a cache.** Any maintained inventory of components is a grammar sheet under a different name — same staleness, same accretion. The only project-specific fact recorded is nothing at all: the survey globs by convention. A path would be a cache, and the template ships an empty workspace, so a greenfield project has no path to record at init time anyway.

**Shallow survey only.** Names and exported prop signatures, never component bodies. `grill-design` works at composition altitude, so "does a comparison grid exist and what does it accept" is the whole question. Escalation-on-hit was proposed and declined; the residual risk is recorded in Risks.

**The tier split already exists, so the write gate reuses it.** `BRAND_DESIGN.md:12-13` defines identity sections as absolute and steering sections as anchored judgment, and sessions already read the doc through that split. Reusing it for write ceremony costs one rule instead of a new taxonomy.

**`brand-init` stays re-runnable and does not self-remove.** Its description already states it, and `SKILL.md:9` names a brand refresh after repositioning as a trigger. `project-init` self-removes because tailoring happens once; brand refreshes recur, and a repositioning is exactly when the whole doc needs re-deriving coherently rather than line-editing into a half-old, half-new state.

**No hook enforces any of this.** Consistent with the rest of the suite's context-file routing: the skill descriptions and the `CLAUDE.md` rule are the whole mechanism, which is why both name paths explicitly.

## Test strategy

No test runner for prose. Three checks stand in, at the seam a reader actually crosses, following the method the 2026-08-05 task established:

- **The disposition table** is the primary check on content preservation: every one of the 129 lines mapped to a destination before anything is written, reviewed by the user, and diffed against the new files after.
- **Behavioral diff on `grill-design`**, the one skill whose behavior genuinely changes rather than being repathed. Scenario questions written **before** the rewrite and derived from the old file, so the test cannot be shaped to fit the new one; one agent answers from the old file only, another from the new file only, neither seeing the other. Compare answers, not prose.
- **Mechanical greps** as the connection map: the two reference sweeps to zero, the grammar-vocabulary sweep, the `v[0-9]` pre-release sweep, and `pnpm format:check`.

## Slices

- [x] The new homes: three rules files written from the disposition table (`docs/notes/2026-08-09-ui-ux-disposition.md`, all 129 lines mapped and the five judgment calls approved before the write), the project-choice lines moved into the brand doc's bracketed prompts, `BRAND_DESIGN.md` → `BRANDING.md`, `UI_UX.md` deleted. Rule counts land exactly on the table: 55 / 10 / 12, and 83 original bullets = 77 relocated + 5 moved to the brand doc + 1 dropped as a duplicate of `BRANDING.md`'s Surfaces section. Red state: 43 `UI_UX` and 38 `BRAND_DESIGN` payload references outstanding.
- [x] `curate-context`: the routing rewrite (split by what the rule governs, no count stated), the carve-out scoped to `BRANDING.md` with `ux-standards.md` named as closed, the identity-tier blast-radius gate with its capture offer and its unrun-check clause, the em-dash list, and the description. `skill-creator`'s landing checklist pulled the skills `README.md` blurb into this slice rather than leaving it for the sweep.
- [x] `grill-design`: component survey plus `docs/designs/` glob replacing the grammar check, codification exit removed (four exits to three, with the absence explained rather than left silent), intent assertions unconditional on the governed path, skeletal-docs trigger narrowed to `BRANDING.md` with an empty component library routed to Ungoverned instead, an explicit read of the rules file added since no glob fires for this lens, and `references/example-design-artifact.md` repathed inside its rendered artifact text. Skills `README.md` blurb updated with it per `skill-creator`'s checklist.
- [x] The other three lenses: `grill-product`'s exit narrowed to `BRANDING.md` with the closed-floors reason stated inline, explicit floor reads in `grill-product`, `brand-init`, and `grill-initiative`, and the skills `README.md` chain diagram, router description, and three blurbs repathed off the grammar vocabulary.
- [x] The citation chain: `grill-engineer` (Survivors citation, governed-verdict binding, build-now floors, surface-gate wording), `capture-task/assets/task-template.md`, `references/example-scoped-task.md`'s governed-verdict rewritten to cite a component rather than a doc section, and `implement-task`'s four sites including the pre-flight path list, which now leans on its existing `.claude/**` entry to cover the rules files.
- [x] `project-init` and `fork-points.md`: the `:142` entry narrowed to `BRANDING.md` and pointed at Stack and toolchain, three new rules-file entries there with the glob-universality trap and the pointer coupling named, a fifth entry covering the one case where init edits `paths:` rather than content, framework and styling-system detection in Phase 1, and the closing report pointer.
- [x] The `CLAUDE.md` pointer: a `#### Frontend and UI` subsection naming the three rules files, their purposes, and their load trigger, plus the rewritten Standards line for `BRANDING.md`; the pointer coupling recorded in `fork-points.md` for all three.
- [x] The reference sweep to zero: `CLAUDE.md`'s remaining references, `README.md`, the skills `README.md`, `template-dev.md`, `review-board/references/correctness.md`, `.claude/agents/review-correctness.md`, `brand-research.md`, and `example-initiative.md`. Both greps hit zero here.
- [x] `CHANGELOG.md` v2.5.0 with the migration procedure for diverged instances, and the version bump.
