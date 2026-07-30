# ADR Format

ADRs live in `docs/adr/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc. Create the directory lazily — only when the first ADR is needed. Scan `docs/adr/` for the highest existing number and increment by one.

## Template

```md
---
status: accepted
---

# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

That's it. An ADR can be a single paragraph. The value is in recording _that_ a decision was made and _why_, not in filling out sections.

## Status

Every ADR declares a `status` from the moment it is written. Status is what makes the directory readable one file at a time: whoever opens a single ADR learns whether it still binds without reading its neighbors first.

| status       | what a reader does with it                                                           |
| ------------ | ------------------------------------------------------------------------------------ |
| `proposed`   | Under consideration; not binding yet.                                                |
| `accepted`   | Binding in full.                                                                     |
| `amended`    | Binding except where a later ADR changed it; the amendment note says which part.     |
| `superseded` | Fully retired by a named successor. Stop reading and follow the link.                |
| `deprecated` | Abandoned with no successor. The decision no longer applies and nothing replaced it. |

## Relations

When an ADR changes a decision an earlier ADR made, both files record it in frontmatter, pointing at each other. The link runs both ways because the file a reader opens is usually the older one, and that is the file that has to say it was changed.

Two relations, because retirement is usually partial: most supersession retires one clause and leaves the rest binding, and a single flag would discard decisions still in force.

| on the newer ADR | on the older ADR | use when                                                  |
| ---------------- | ---------------- | --------------------------------------------------------- |
| `supersedes`     | `superseded-by`  | The older decision is retired in full.                    |
| `amends`         | `amended-by`     | Part of the older decision changed; the rest still binds. |

All four take a list of zero-padded ADR numbers, inline (`amends: [0030, 0031]`) or as a YAML block list. The older ADR's `status` moves to `superseded` or `amended` to match.

An `amended` ADR opens with a note naming the successor and the scope of the change, so a reader who lands mid-file knows what is still true:

```md
---
status: amended
amended-by: [0042]
---

> [!NOTE]
> Amended by [ADR 0042](./0042-weekly-membership-evidence.md): the "store only unavailable weeks" storage model below is superseded by a full weekly-membership table. The availability semantics, merged timeline, severity ordering, and identity decisions in this ADR still bind.

# Weekly roster status and availability source
```

Frontmatter carries the relation; the note carries the scope. Splitting them this way keeps the machine-checkable part machine-checkable and leaves "which clause died" in prose, where it belongs — no schema can express it and no reader can act without it.

> [!WARNING]
> This is the skill's own discipline to hold, checked on every ADR write: no ADR ships without a `status`; a `status: superseded` or `amended` names its successor; and a `supersedes`/`amends` claim only lands over an ADR that acknowledges it back. The back-link fields (`superseded-by`, `amended-by`) claim nothing about another file, so they are written freely, and that fixes the order in every case, new corpus or old: annotate the older ADR first, then write the newer one against an acknowledgement that already exists. No hook enforces this; it stays the skill's discipline. A repo that wants it checked mechanically runs a lint over every ADR regardless of who wrote it, which is where a content check belongs.

## Before writing a new ADR, check what it retires

The hook verifies links that were declared; noticing what to declare is the author's job, and it is the whole job — a relation nobody spots is a relation nobody enforces.

Before writing, grep `docs/adr/` for the decision area — the table, the boundary, the technology, the surface this ADR touches — read every hit, and name in the new ADR every existing ADR it changes, whether the change is total (`supersedes`) or partial (`amends`). An ADR that changes nothing says so implicitly by declaring no relations; an ADR that deliberately builds on neighbors without retiring them is worth one sentence saying which ones and why they still hold, because the next author will wonder. When a grep hit is ambiguous — the old ADR might or might not still hold under the new decision — put it to the user rather than guessing; a wrong `superseded` erases a live decision.

## Optional sections

Only include these when they add genuine value. Most ADRs won't need them.

- **Considered Options** — only when the rejected alternatives are worth remembering.
- **Consequences** — only when non-obvious downstream effects need to be called out.

## When to offer an ADR

All three of these must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it — you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** "We're using a monorepo." "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between contexts.** "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, deployment target. Not every library — just the ones whose replacement is a major migration rippling through multiple contexts, not a dependency swap.
- **Boundary and scope decisions.** "Customer data is owned by the Customer context; other contexts reference it by ID only." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "We're using manual SQL instead of an ORM because X." Anything where a reasonable reader would assume the opposite. These stop the next engineer from "fixing" something that was deliberate.
- **Constraints not visible in the code.** "We can't use AWS because of compliance requirements." "Response times must be under 200ms because of the partner API contract."
- **Rejected alternatives when the rejection is non-obvious.** If you considered GraphQL and picked REST for subtle reasons, record it — otherwise someone will suggest GraphQL again in six months.
