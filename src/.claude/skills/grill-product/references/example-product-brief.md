# Example: a product brief

A worked brief for "real-time presence indicators showing which teammates are viewing a record" — the artifact grill-product's brief exit produces when a session lands a durable product position. Read it for the altitude: it says what the user needs, why it wins, and what evidence supports it, with **zero implementation** — no transport choice, no store, no schema, no polling-vs-push. If your draft names a technology or a data structure, you have dropped altitude; feasibility gets interrogated against the real codebase later — by the `ground-brief` pass on a multi-workstream brief, then by the `grill-engineer` session each workstream seeds.

The sections below are a spine, not a form to fill: the grilling session shapes them. A brief about a visual refresh might swap User stories for before/after design principles; a positioning brief might lean entirely on Evidence and Out of scope. Keep what sharpens the position, drop what pads it. What never flexes: the problem is stated from the user's side, claims are grounded in named evidence rather than invented UX concepts, and open questions stay explicit.

Briefs live at `docs/briefs/YYYY-MM-DD-<slug>.md` and open with two frontmatter lines: `status` (`draft` when the product session writes it; only the `ground-brief` pass ever flips it to `grounded`) and `created`. Progress never lives in the frontmatter — it is read from the task files the workstream entries link.

The Workstreams section appears only when the session's fan-out detection fired — the position decomposes into two or more outcomes that could ship independently. Split on UI/UX seams, never engineering seams (reconciling the split with engineering reality is `ground-brief`'s job), and split with restraint: the fewest workstreams that make product sense. Each entry is one outcome-altitude line carrying its own settledness call — a settled workstream links the task file captured for it; an unsettled one names what its future grilling must resolve. The `## Engineering grounding` section that appears after the pass is `ground-brief`'s to write; a product session never adds engineering context to a brief.

---

The brief file opens with frontmatter:

```yaml
---
status: draft
created: YYYY-MM-DD
---
```

# Product brief: Record presence

## Problem

When several teammates work the same customer record, they collide: two people edit the same field, or one reaches out to a customer a colleague is already handling. Nothing today signals that someone else is on the same record, so the team discovers collisions after they happen — duplicate work, mixed messages to customers, eroded trust in the data.

## Position

While viewing a record, a user sees at a glance which teammates are viewing it right now: presence appears the moment someone opens the record and clears when they leave. The user can tell, without asking in chat, whether they are about to step on someone's work. This surfaces presence; it deliberately does not enforce anything.

## User stories

1. As a support agent, I want to see which teammates are viewing a record I open, so I can avoid duplicating outreach already in progress.
2. As an agent, I want my own presence to clear when I navigate away, so I do not appear to be holding a record I have left.
3. As an agent, I want to recognize who is present by name and face, so I can reach the right colleague directly.
4. As an agent on a sensitive record, I want presence to respect existing access rules, so no one learns about a record they could not already open.
5. As a team lead, I want to see when multiple agents converge on the same record, so I can rebalance workload. (Secondary — see Workstreams.)

## Evidence

- Avatar-stack presence is a well-established pattern users already read correctly as "here now" (Google Docs, Figma, Notion); no novel UI concept is needed, which lowers both design and adoption risk.
- Presence-without-locking matches how collaborative tools converged after early edit-lock designs frustrated users; awareness beats enforcement for this class of collision.
- Internal signal: support-team retros repeatedly raise double-contact incidents on shared records (link the retro notes when filing a real brief).

## Workstreams

Presence on the open record (stories 1–4) is the core value — that is where collisions happen. The lead's aggregate view (story 5) is valuable but secondary, and it is a different surface with a different user; that UI/UX seam is the split.

- [Record presence](../tasks/YYYY-MM-DD-feature-record-presence.md) — presence on the open record (stories 1–4). Settled: captured and linked.
- Team presence overview — the lead's aggregate view of convergence (story 5). Unsettled: its grilling must resolve where the view lives and what "converging" means before it is buildable.

## Out of scope

- Editing locks or any enforcement — this surfaces presence, it does not prevent concurrent edits.
- Presence anywhere other than an open record and the lead's overview (no list-level presence in this brief).
- History of who viewed a record in the past; this is about _now_, not an audit trail.

## Open questions

- How fresh does "now" need to feel to be useful — is a short lag acceptable, or does collision-avoidance require it to feel instantaneous? (Has engineering cost implications; the engineering session answers what freshness actually costs.)
- Should presence ever surface at the record-list level later, or is the open record the permanent boundary?

## Hand-off

A draft brief carries no engineering context by design. A single-workstream brief goes straight to `/grill-me engineer:` seeded by the brief — feasibility, trade-offs, and design happen there against the real codebase, landing as a scoped task file in `docs/tasks/`. A multi-workstream brief like this one goes through `/ground-brief` first: the pass audits the split against the code, writes cross-workstream contracts and a grilling order into `## Engineering grounding`, and flips the status to `grounded`; each workstream is then grilled in its own fresh session, in the recommended order.
