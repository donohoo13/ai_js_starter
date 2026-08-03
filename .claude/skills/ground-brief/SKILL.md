---
name: ground-brief
description: Engineering grounding pass over a multi-workstream product brief in docs/briefs/ — audits each workstream's feasibility against the real code, writes the cross-workstream contracts that keep each workstream grillable in isolation, recommends a grilling order, and flips the brief from draft to grounded. Use immediately after a grill-product session writes a decomposed brief (chained in the same session), or standalone when the user points at a draft brief with a Workstreams section — "ground this brief", "run the grounding pass", "is this split actually buildable". Declines single-workstream briefs; those seed their feasibility session through the grill-me router (grill-design first when surface-bearing, else grill-engineer), which owns feasibility for one position.
argument-hint: '[path to a draft brief in docs/briefs/]'
---

# Ground Brief

The engineering reconciliation step between a product-pure brief and the isolated workstream grillings it seeds. The brief's workstreams were split on UI/UX seams with engineering deliberately ignored; this pass reads the real code and adds the engineering layer that lets each workstream be grilled and built one at a time in fresh sessions. It is an audit with a feedback loop, not an interview: read, analyze, present, get approval, write. The session AI does the code reading; the user makes the decisions the analysis surfaces.

## Preconditions

- The subject is a brief at `docs/briefs/` with `status: draft` and two or more workstreams. On a single-workstream brief, decline and point at `/grill-me @<brief path>` — the router runs feasibility for one position `grill-design`-first when it is surface-bearing, else through `grill-engineer` — because feasibility for one position is that session's job, and a pass here would duplicate it.
- When chained from the `grill-product` session that wrote the brief, the conversation residue (why the seams fell where they did, rejected splits) is live — use it when judging re-splits. Standalone invocation works from the brief alone; the pass reads harder instead.

## The pass

Read the brief, then the code each workstream would touch, at orientation depth — enough to judge feasibility and find the seams, not to design implementations; design belongs to each workstream's own grilling. Produce three things per workstream:

- **Feasibility** — is it buildable as split? Name the risky bit (the unknown API, the missing capability, the surface two workstreams both touch) rather than a bare verdict.
- **Contracts** — what this workstream must leave behind for later workstreams to be grillable and buildable in isolation: interfaces promised, data made available, decisions that must not be re-opened. Contracts are a few interface-level bullets; a contract that needs a spec has dropped to implementation altitude and belongs in the workstream's own grilling.
- **Order** — a recommended grilling order with the dependency reasoning attached; list order is the pickup order.

## Re-splits

When the code contradicts the product split — two workstreams share one surface and splitting doubles the work, or a "small" workstream hides the hardest engineering — surface it as a decision with the cost attached: "as split, X costs Y; re-cutting costs Z." Never redraw product lines silently; the split is a product decision the user owns. An accepted re-split updates the Workstreams section as part of the write below.

## Present, then write

Present the full grounding — per-workstream feasibility, contracts, order, any re-split proposals — and get one approval before touching the file. On approval:

- Append an `## Engineering grounding` section to the brief: a subsection per workstream (feasibility note, its contracts) and the grilling order.
- Apply any accepted re-splits to the Workstreams section.
- Flip frontmatter `status: draft` → `status: grounded`. This flip is the one brief fact later sessions cannot derive from its children; everything else about progress they read from the task files the workstream entries link.

## Close — hard stop

The grounded brief now carries everything the workstream sessions need; this session's residue is spent capital. Close by handing the user the pickup instructions and stopping: each workstream is grilled in a **fresh session** — `/grill-me @<brief path>` picks up the next workstream in the recommended order, or `/grill-me <workstream> from <brief path>` names one (the router sends a surface-bearing workstream through `grill-design` first) — one at a time. Do not continue into a workstream grilling here: stacking grillings onto this session is the context blowout the pass exists to prevent, and a pass that leaves the workstream sessions needing this window's warmth has failed its one job.
