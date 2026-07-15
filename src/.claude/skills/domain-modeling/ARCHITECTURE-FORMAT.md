# ARCHITECTURE.md Format

An `ARCHITECTURE.md` is a context's engineering-shape reference: the current topology, boundaries, flows, and invariants that a fresh session would otherwise need a deep dive to rebuild. It is descriptive and present-tense — a map of what is, never a spec of what should be. Its readers are AI sessions orienting before they touch the context and humans onboarding onto it; both treat its claims like session memory — sound orientation, verified against the code before any load-bearing edit. When doc and code disagree, the code is the truth and the doc is the bug: fix it in the same change.

## Two altitudes

- **Root `ARCHITECTURE.md`** (repos with several apps or deployable units): the system topology — what the units are, who calls whom over what (HTTP, RPC, queue, events, shared DB), where each kind of data lives, and how dev topology differs from deployed topology. No module-level interior detail; that belongs to each context's own doc.
- **Per-context `ARCHITECTURE.md`** (beside each app or package's code): that context's mechanics — what it is, where it fits, its module map, key flows, boundaries, invariants, and gaps.
- **Single-context repos**: one root file carries both altitudes and stays lean.

In a multi-context repo the per-context "Where it fits" section shrinks to a sentence or two plus a link to the root doc — the neighborhood is drawn once at the root, not reconstructed pairwise in every context.

## Structure

```md
# {Context} Architecture

{One-sentence header naming this as the shape reference, plus links out: the
imperative rules in CLAUDE.md, the decisions in docs/adr/, sibling
ARCHITECTURE.md docs, and the root doc if one exists.}

## What it is

{One paragraph: runtime shape (service, SPA, worker, library), stack, and how
it deploys. Include identity gotchas — a deploy name that differs from the
directory name belongs here, not in tribal memory.}

## Where it fits

{Callers and callees, in a short paragraph. Multi-context repos: a sentence
plus a link to the root doc.}

## Directory map

{One line per top-level module: the responsibility it owns, not the files it
contains. Name the spine first — the entrypoint or assembly file a reader
should open before anything else ("read it first").}

## Key flows

{The 2–5 flows that explain most of the behavior, each a short numbered path
naming the modules crossed and the data touched.}

## Boundaries and invariants

{What this context owns exclusively (data, secrets, queues), what it exposes,
what it consumes. Shape facts a reader cannot see in any single file, each
with its why attached.}

## Known gaps

{Present-tense factual debts with their rationale. Never plans, wishes, or
roadmap items — a planned refactor appears only as today's fact about what is
still true.}

## Related docs

{CLAUDE.md, ADRs, guides, sibling shape docs.}
```

Every section after the header and "What it is" is optional — include what the context has earned; a section with nothing non-obvious to say stays out.

## Rules

- **The drift half-life test.** Before writing a line, ask how long it stays true and what it costs when it goes stale. An inter-service contract (an RPC method table, a middleware order whose sequence is load-bearing) earns enumeration: it changes rarely and deliberately, and getting it wrong is expensive. Counts ("~37 controllers"), rosters (a list of all twelve workflows by name), and "currently only X" phrasings go stale the week someone adds one, and each stale line teaches readers to distrust the doc. State the bias ("client state is deliberately small"), not the census.
- **Never duplicate what one `ls` or grep answers.** The doc's job is what the filesystem _cannot_ say at a glance: topology, ownership, ordering, whys. If a line restates directory contents or a count, cut it.
- **One canonical home per fact.** A fact shared by two contexts — a secret boundary, a shared bucket, an RPC contract — is written in full exactly once, in the context that owns it, and linked from everywhere else. Duplicated statements diverge on the first update, and a reader cannot tell which copy is current.
- **Attach the why to every invariant.** "Endpoints are ingested sequentially" invites a helpful parallelization; "sequentially — concurrent ingestion caused OOM" defends itself. An invariant without its reason gets cleaned up by the first session that doesn't know it is load-bearing.
- **Descriptive, present tense, true today.** The doc states what is, in the indicative mood. Imperative rules live in `CLAUDE.md`; when a fact has both forms, the shape statement here is canonical and `CLAUDE.md` points at it.
- **Length is a feature.** A per-context doc past ~150 lines has stopped being a quick glance. Over the cap, cut inventory first; flows and invariants never.

## Survey bootstrap

Never create an `ARCHITECTURE.md` lazily or as a stub — a shape doc orients in one pass or not at all. To author one for a context with existing code:

1. **Read the spine**: the entrypoint, the manifests, and the runtime/deploy config (`wrangler.jsonc`, `Dockerfile`, `vite.config.*`, CI deploy steps) — deploy config is where identity gotchas and binding topology live.
2. **Trace the key flows** end to end: the 2–5 paths that explain most of the behavior.
3. **Read the boundaries**: service contracts, bindings, schema ownership, who holds which secrets, what is shared with siblings.
4. **Mine the existing record**: `CLAUDE.md` rules and ADRs whose underlying shape-facts belong here, dev-vs-prod differences, name mismatches.

For a multi-context repo, fan out one research agent per context plus one for the root topology, then synthesize the set together — writing the per-context docs and the root doc in one pass is what lets every shared fact get its one canonical home from the start. A greenfield context gets its doc when its first real shape exists (an entrypoint and one flow), not at scaffold time.

## Maintenance

The doc is updated by the session that changes the shape, in the same change: a new module, a moved boundary, a changed data flow, a new or removed dependency between contexts. Two nets enforce this — `implement-task` runs a shape check before its QA gate, and the review board's correctness seat treats a diff that contradicts the doc as a finding (either the code is wrong or the doc must be updated in that change). Renames and refactors that move no boundary touch nothing here — that is what the responsibility-not-inventory rule buys.
