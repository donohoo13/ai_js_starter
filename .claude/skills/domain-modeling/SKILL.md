---
name: domain-modeling
description: Build and sharpen a project's domain model and its context docs. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, document or update a repo's or context's engineering shape in an ARCHITECTURE.md ("document the architecture", "how does this repo fit together", "update the architecture docs"), or when another skill needs to maintain the domain model or its context docs.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the _active_ discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely _reading_ `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

The model lives in three kinds of docs, each with exactly one job: `CONTEXT.md` holds the **language** (a glossary, nothing else), `docs/adr/` holds the **decisions** (why X over Y, with the reasoning frozen at the moment of choice and the status maintained as later decisions retire it), and `ARCHITECTURE.md` holds the **shape** (what exists and how it is wired, kept current). Keeping the jobs separate is what keeps each doc trustworthy — a fact filed in the wrong kind of doc is never found again. The `guard-context-edit` PreToolUse hook enforces the ownership: edits to any of the three doc kinds are denied until this skill is loaded, and the prescriptive files (`CLAUDE.md`, `README.md`, the design docs) belong to `curate-context` the same way.

## File structure

Most repos have a single context:

```
/
├── CONTEXT.md
├── ARCHITECTURE.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `CONTEXT-MAP.md` exists at the root, the repo has multiple contexts. The map points to where each one lives; the root `ARCHITECTURE.md` holds the system topology and each context carries its own shape doc:

```
/
├── CONTEXT-MAP.md                    ← the domain map: which contexts exist, how they relate
├── ARCHITECTURE.md                   ← the engineering map: apps, who calls whom, where data lives
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   ├── ARCHITECTURE.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       ├── ARCHITECTURE.md
│       └── docs/adr/
```

The two maps usually coincide but are keyed independently: `CONTEXT-MAP.md` follows the _domain_ (bounded contexts), while the `ARCHITECTURE.md` layout follows the repo's _engineering_ shape — a monorepo with several apps or deployable units gets a root topology doc plus per-context shape docs even if no `CONTEXT-MAP.md` exists yet.

Create all three doc kinds lazily. A three-term glossary is already useful, so `CONTEXT.md` starts when the first term resolves and `docs/adr/` when the first ADR is needed — and `ARCHITECTURE.md` follows the same law: a single load-bearing invariant with its why attached orients better than no doc at all, so the shape doc starts when the first real shape-fact exists and grows fact by fact from there. The rule that never relaxes is **no stubs** — empty scaffolding inviting fill-in, defined canonically in the Growth section of [ARCHITECTURE-FORMAT.md](./ARCHITECTURE-FORMAT.md). One true fact standing alone is not a stub; it is the doc growing the way `CONTEXT.md` grows. When the user wants the whole map at once, the survey bootstrap in [ARCHITECTURE-FORMAT.md](./ARCHITECTURE-FORMAT.md) authors it in one pass.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Challenge against the shape doc

When an ask conflicts with a boundary, flow, or invariant documented in `ARCHITECTURE.md`, surface the conflict as a decision instead of designing around it: "This crosses the documented invariant that billing is the only writer of invoice rows — it exists because X. Crossing it is a real option; here is what it costs." The doc is orientation, not a wall — silently designing within the boundary hides a real option from the user, and silently designing through it breaks the map; either way a decision that belongs to the user got taken for them. A crossing the user chooses is usually hard to reverse, surprising without context, and a genuine trade-off — the ADR bar below — and the shape doc itself updates only when the new shape lands with the code, per the maintenance contract.

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Maintain the architecture docs

`ARCHITECTURE.md` at a context root is that context's engineering-shape reference — the orientation a fresh session would otherwise need a deep dive to rebuild. Format, altitude rules, the growth rule, and the maintenance contract live in [ARCHITECTURE-FORMAT.md](./ARCHITECTURE-FORMAT.md); read it before creating or editing one.

Two triggers bring this skill to a shape doc:

- **Authoring** — the user asks to document the architecture of the repo, an app, or a package. Run the survey bootstrap from the format doc: a full sweep that maps the whole context in one pass.
- **Shape change** — work in this session added a module, moved a boundary, changed a data flow, or rewired who-calls-whom. Update the owning context's doc in the same pass, and the root doc if cross-context topology moved. When the owning context has no `ARCHITECTURE.md`, create it with that one shape-fact — the same move as writing `CONTEXT.md`'s first term. During a pure design conversation, hold off: the doc records shape only once it is real — the intent and its reasoning belong in an ADR, and the shape update lands with the code that lands it.

Boundary discipline: `ARCHITECTURE.md` states what _is_ (descriptive); `CLAUDE.md` states what to _do_ (imperative). When a fact has both forms — "billing is the only writer of invoice rows" vs "never write invoice rows outside billing" — the shape statement in `ARCHITECTURE.md` is canonical and `CLAUDE.md` points at it instead of restating it. Vocabulary stays in `CONTEXT.md`; the why of a hard decision goes to an ADR; `ARCHITECTURE.md` links out to those, it does not absorb them.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).

### Retire what a new ADR replaces, in the same change

A new decision usually changes an old one, and the retirement lands in the same change so the two ADRs never disagree about which of them binds. Before writing an ADR, grep `docs/adr/` for its decision area (the table, boundary, technology, or surface it touches), read every hit, and name each ADR this one changes in frontmatter: `supersedes` when the old decision is retired whole, `amends` when part of it survives. The retired ADR gets the reciprocal field, a matching `status`, and a note saying which part died. Partial is the common case, so reach for `amends` first and reserve `supersedes` for an ADR that has nothing left standing.

Ambiguity here belongs to the user, not to a guess: when a grep hit might or might not still hold under the new decision, put the question to them, because a wrong `supersedes` erases a decision that is still in force. The `guard-adr-links` hook enforces the link once it is declared; noticing what to declare is this skill's job. Field vocabulary and the note format are in [ADR-FORMAT.md](./ADR-FORMAT.md).
