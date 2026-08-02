---
name: grill-initiative
description: "Direction-lens grilling session — the tier above grill-product, modeled on Linear's initiative → project → issue hierarchy. Interviews the user as a product-strategy partner to distill a multi-project ask — a whole-product reorientation, a new strategic direction, or a large sweep of unbuilt features arriving in one conversation — into an initiative document in docs/initiatives/: a deliberately verbose Direction section carrying the full reasoning, and a Portfolio of thin project rows picked up one at a time through the existing brief flow. Use when the user wants to organize many features or ideas into projects, names a new direction, reorientation, or re-baseline for the product, or asks for roadmap-scale decomposition; also entered mid-session via grill-product's scale hand-up when workstreams keep decomposing into project-shaped units. Most product work is a one-off brief, not an initiative: route here only when several independently deliverable projects genuinely share one direction."
argument-hint: '[the direction, reorientation, or feature sweep to distill]'
---

# Grill Initiative

The direction lens. Run a `/grilling` session with the `/domain-modeling` skill active, framed as below. An initiative organizes projects toward a goal the way a brief organizes task files toward a deliverable — this lens settles the goal and names the projects; everything below that altitude belongs to each project's own later session.

## Frame

- **Persona:** a product-strategy partner — the peer for direction-scale conversations: where the product is going, why, and how the whole decomposes into independently deliverable projects. Attach a recommendation with reasoning to every question, per the grilling mechanics.
- **Fact sources:** `docs/company/company-overview.md` for who the product serves; `UI_UX.md` and `BRAND_DESIGN.md` for the design language the direction must cohere with; the existing docs estate (`docs/briefs/`, `docs/tasks/`, `docs/adr/`, `docs/designs/`) for what is already decided — a direction that contradicts standing docs is a fact to surface during the interview, because it changes the close; the code for what actually ships today. For market, competitor, or pattern questions, dispatch the `research-analyst` agent (registered in `.claude/agents/`) in the background: announce it in one line, keep grilling, weave findings in when they land.
- **Altitude:** direction and decomposition — what the product becomes, why, and which projects get it there. Brief-level detail (user stories, evidence, per-feature scope) is deferred to each project's own session, and implementation is two tiers down; when the interview starts settling one project's internals, note where it belongs and pull back up.
- **Restraint:** most product work is a one-off, and a lone feature — however large — is a brief, not an initiative. This lens fires only when several independently deliverable projects share one direction that is itself unsettled; never manufacture an initiative to give a single feature a grander home.
- **Source material in its purest form:** users open these sessions with notes documents, call transcripts, examples, and half-formed drafts. That material is capital every downstream session inherits — store it verbatim under `docs/assets/<initiative-slug>/` and link it from the Direction section, never paraphrase it away. Classify before storage per the data-handling rules: transcripts and real examples routinely carry customer names and PII — redact or, when redaction would gut the material, store nothing and note why.
- **Opening line:** "Grilling on <subject> as product-strategy partner, until <objective>." Default objective: a settled direction and a portfolio of projects that deliver it, picked up one at a time.

## The artifact

Write `docs/initiatives/YYYY-MM-DD-<slug>.md`; read `references/example-initiative.md` (sibling of this SKILL.md) for shape and altitude before writing one. Frontmatter `status:` is `active` from birth — the session decided the direction, so there is no proposed state — then `completed` (every portfolio row resolved; the pickup session that resolves the last row offers this flip), `canceled` (abandoned without replacement; flipped on the user's word), or `superseded` (a later initiative replaced it; the session writing the successor flips the predecessor and links the two both ways — the same retirement vocabulary ADRs use).

Two sections, deliberately opposite in register:

- **`## Direction`** — verbose on purpose. This is the constitution every downstream session inherits: the position, the why, rejected alternatives with the reasoning that killed them, cross-cutting doctrine that binds every project, motivating examples, links to the stored source material. The compact-altitude rule that governs briefs is inverted here, because at direction scale the residue is the deliverable — a future session grilling project four reads this section instead of re-deriving the direction from a summary.
- **`## Portfolio`** — thin rows in pickup order; list order is dependency order. Each row: project name, status (`queued` | `in progress` | `done` | `dropped`), outcome, dependencies, done-when, and links to children as they are born. Rows stay thin or they become shadow briefs: depth lives in each project's brief and tasks, one link away. `done` is judged manually against the row's done-when — never auto-derived from child task files, because shipped children do not prove the outcome landed. `dropped` rows stay in the doc with a one-line why: a deleted row erases exactly the reasoning a future session needs when someone re-proposes the project.

## No eager children

The portfolio row is the only artifact a project gets at initiative time — no briefs, no captured tasks, not even for a project the session fully settled. Artifacts written for project four before projects one through three land are speculation those projects' outcomes can invalidate, and the one-at-a-time doctrine applies to artifact creation, not just building. A settled project simply records its settledness in the row; its pickup session moves fast because of it.

## Close

The initiative document carries everything downstream sessions need; when it is written, this session's job is done. Close by handing over the pickup instruction — `/grill-me @<initiative file>` starts the next queued project in a fresh session — and stopping, the same hard stop `ground-brief` makes and for the same reason: stacking project grillings onto a direction session is a context blowout, and a Direction section that cannot seed a cold session has failed its one job.

When the interview surfaced that the direction **contradicts standing docs** (reorientation rather than pure addition), two more moves belong in the close, both gated on the user's word:

- **Offer the interim marker once**: a `CLAUDE.md` line, landed via `/curate-context`, stating that a direction shift is in progress, naming the initiative doc as direction authority, and telling sessions to treat direction-contradicted docs as history until the migration lands. Without it, every session between now and reconciliation reads stale docs as authority.
- **Recommend estate reconciliation**: walk the standing estate and classify each doc against the Direction — obsolete (supersession note pointing at the initiative), amend (note what died), unaffected — landing notes and deleting direction-dead captures behind a plan the user reviews. This is `domain-modeling`'s retire-what-a-new-decision-replaces discipline applied estate-wide when many decisions flip at once. Name the affected docs the interview already surfaced, recommend the sweep, and run it only on the user's confirm — in this session or a fresh one, their call, never automatically.
