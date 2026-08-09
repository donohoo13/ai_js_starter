# Example: an initiative document

A worked initiative for "consolidate three standalone tools into one workspace" — the artifact `grill-initiative` produces when a session settles a multi-project direction. Read it for the register split: the Direction section is deliberately verbose (the constitution downstream sessions inherit — position, rejected alternatives, doctrine, the why behind every call), while Portfolio rows are deliberately thin (a tracker row each; depth lives in the brief and tasks a pickup session creates). If a row is growing user stories or evidence, it has become a shadow brief — move that content down a tier and re-thin the row.

Initiatives live at `docs/initiatives/YYYY-MM-DD-<slug>.md`. Frontmatter `status:` starts `active` (the session decided the direction; there is no proposed state) and ends `completed`, `canceled`, or `superseded` with the successor linked in the doc. Raw source material — the notes document or transcripts that seeded the session — lives verbatim under `docs/assets/<initiative-slug>/`, classified before storage per the data-handling rules, and is linked from Direction rather than paraphrased into it.

Portfolio row grammar: one single-line bullet per project — name, status (`queued` | `in progress` | `done` | `dropped`), outcome, dependencies, done-when, links to children as they are born. List order is pickup order. `done` is judged manually against the row's done-when, never derived from child task files. `dropped` rows stay, each with a one-line why. The pickup instruction is `/grill-me @<this file>`: the router reads the portfolio and starts the next queued project in a fresh session.

---

The initiative file opens with frontmatter:

```yaml
---
status: active
created: YYYY-MM-DD
---
```

# Initiative: Unified workspace

## Direction

### Position

Our three tools (Inbox, Pipeline, Reports) become one workspace with a single login, one navigation frame, and shared record context. A user working a customer moves between conversation, deal state, and history without re-finding the customer in each tool. The tools stop being products and become surfaces.

### Why now

Support and sales teams already run all three side by side — the seed transcripts (linked below) show users describing tab-juggling as their top daily friction, and two churned accounts named "too many places to look" in exit interviews. Meanwhile every competitor in our tier has consolidated; we win on depth per surface, and that advantage is invisible while the surfaces feel like three vendors.

### Rejected alternatives

- **Deep-linking between the standalone tools** (each tool links contextually into the others): rejected because it preserves three logins and three navigation models — the friction users actually named — while adding cross-tool URL contracts we would maintain forever. Kept from it: the record-context handoff idea survives inside the workspace as shared context.
- **Rebuild all three as one new app**: rejected as a multi-quarter freeze on visible progress; the portfolio below reaches the same end state through independently shippable projects, each valuable alone if priorities shift mid-way.
- **Acquiring a shell product**: rejected on brand-coherence grounds after research; the design language in `BRANDING.md` is a differentiator we would lose inside someone else's frame.

### Doctrine

Cross-cutting rules that bind every project below, so no per-project session re-litigates them:

- One login, one session: no surface may introduce its own auth step after the auth project lands.
- The record is the unit of context: every surface renders inside the context of the customer record the user is working, never a tool-global view that loses it.
- No surface regresses during migration: a legacy tool stays fully usable until its replacement surface reaches parity, then retires in the same release that announces it.

### Source material

- [Seed notes](../assets/2026-08-02-unified-workspace/consolidation-notes.md) — the founder's original notes document, verbatim.
- [Support call transcripts](../assets/2026-08-02-unified-workspace/support-calls-redacted.md) — customer names redacted per data handling.

## Portfolio

- **Auth consolidation** — `done` — outcome: one login and one session across all three tools. Depends on: nothing. Done when: legacy per-tool logins are removed and one session reaches all surfaces. Brief: [auth consolidation](../briefs/2026-08-03-auth-consolidation.md).
- **Workspace shell** — `in progress` — outcome: single navigation frame hosting all three tools as surfaces with shared record context. Depends on: auth consolidation. Done when: all three tools are reachable in-shell with record context carried between them. Brief: [workspace shell](../briefs/2026-08-10-workspace-shell.md).
- **Reports as a surface** — `queued` — outcome: Reports rebuilt as a workspace surface reading shared record context. Depends on: workspace shell. Done when: standalone Reports retires at parity.
- **Cross-surface search** — `queued` — outcome: one search across conversations, deals, and history. Depends on: workspace shell. Done when: a record found in search opens with full context in any surface.
- **Mobile companion app** — `dropped` — cut because the seed transcripts show desk-bound usage for all three tools; re-propose only with evidence of mobile demand.
