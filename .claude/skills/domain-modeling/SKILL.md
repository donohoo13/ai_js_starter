---
name: domain-modeling
description: Build and sharpen a project's domain model and its context docs. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, document or update a repo's or context's engineering shape in an ARCHITECTURE.md ("document the architecture", "how does this repo fit together", "update the architecture docs"), or when another skill needs to maintain the domain model or its context docs.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the _active_ discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely _reading_ `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

The model lives in three kinds of docs, each with exactly one job: `CONTEXT.md` holds the **language** (a glossary, nothing else), `docs/adr/` holds the **decisions** (why X over Y, frozen at the moment of choice), and `ARCHITECTURE.md` holds the **shape** (what exists and how it is wired, kept current). Keeping the jobs separate is what keeps each doc trustworthy — a fact filed in the wrong kind of doc is never found again.

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

Create `CONTEXT.md` and `docs/adr/` lazily — a three-term glossary is already useful, so create the glossary when the first term resolves and the ADR directory when the first ADR is needed. `ARCHITECTURE.md` is deliberately not lazy: a shape doc with one flow in it orients nobody, so it is born whole from a survey pass or not at all — see the survey bootstrap in [ARCHITECTURE-FORMAT.md](./ARCHITECTURE-FORMAT.md). Born whole does not license silence: when a shape change lands in a context with no `ARCHITECTURE.md`, the shape-change trigger below obliges a one-nudge bootstrap offer.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

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

`ARCHITECTURE.md` at a context root is that context's engineering-shape reference — the orientation a fresh session would otherwise need a deep dive to rebuild. Format, altitude rules, the survey bootstrap, and the maintenance contract live in [ARCHITECTURE-FORMAT.md](./ARCHITECTURE-FORMAT.md); read it before creating or editing one.

Two triggers bring this skill to a shape doc:

- **Authoring** — the user asks to document the architecture of the repo, an app, or a package. Run the survey bootstrap from the format doc; never leave a stub to fill in later.
- **Shape change** — work in this session added a module, moved a boundary, changed a data flow, or rewired who-calls-whom. Update the owning context's doc in the same pass, and the root doc if cross-context topology moved. During a pure design conversation, hold off: the doc records shape only once it is real — the intent and its reasoning belong in an ADR, and the shape update lands with the code that lands it. When the owning context has no `ARCHITECTURE.md`, offer the survey bootstrap right then, in the same suggest-once idiom capture-task and codify use: one nudge, decline drops it for the session — never a stub, never silence. The moment a shape delta has nowhere to land is the cheapest survey moment; most of the context the bootstrap needs is already loaded. On decline with a task file in play, record the exact phrase `ARCHITECTURE.md bootstrap declined` plus the un-landed delta as one line in the task file — provenance that keeps future re-offers informed (greppable across `docs/tasks/`), never an incremental seed.

Boundary discipline: `ARCHITECTURE.md` states what _is_ (descriptive); `CLAUDE.md` states what to _do_ (imperative). When a fact has both forms — "billing is the only writer of invoice rows" vs "never write invoice rows outside billing" — the shape statement in `ARCHITECTURE.md` is canonical and `CLAUDE.md` points at it instead of restating it. Vocabulary stays in `CONTEXT.md`; the why of a hard decision goes to an ADR; `ARCHITECTURE.md` links out to those, it does not absorb them.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
