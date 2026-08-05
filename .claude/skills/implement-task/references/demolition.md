# The demolition pass

The procedure `implement-task` runs before the first slice of a task whose frontmatter carries `incumbent: replace`. It exists because measured deletion avoidance is a property of the session holding the code: models locate the right file over 90% of the time and remove the required line about half as often, and roughly a third of otherwise-correct patches wrap old code in a conditional rather than deleting it. A build session that has read the incumbent implementation resists that pull; a build session that never read it has nothing to pull against. **The separate agent context is the mechanism, not a division of labor** — collapsing demolition into the build session keeps the code in context and asks the biased party to resist itself.

Read this file before dispatching the agent, and pass it to the agent by absolute path.

## What the dispatching session does first

1. **Confirm the verdict.** `incumbent: replace` in the task file. Any other value, or none, means no demolition runs — the step-1 gate already refuses the missing case.
2. **Read the linked contract.** Open the task's `design:` artifact and `brief:` before writing the mandate. The overrule set below can only be quoted from documents the dispatcher has actually read, and an empty overrule set tells the agent to preserve every contract it finds.
3. **Capture carve-outs before anything is deleted.** A surface the task explicitly keeps exists only until demolition runs, so screenshot it now with the project's UI verification tool (named in `CLAUDE.md`), cropped to that surface and nothing else, classified before storage per the data-handling rules, stored under `docs/assets/<task-slug>/` and linked from the task file's Design decisions. Never record a carve-out in a design artifact's `source:` frontmatter: that key triggers the build's source-versus-render comparison, so a photograph of the surface being demolished would become the fidelity target its replacement is judged against — the incumbent's curation reintroduced by the very step meant to remove it. The dispatching session captures rather than the agent because it already has the UI tool wired, and driving a running app yields pixels rather than source, so the firewall holds. **Which surface survives is a design decision that arrives with the task** — a session choosing carve-outs here is authoring composition at build time with no design authority.
4. **Write the mandate.** The agent cannot see the conversation, so its prompt carries: the absolute path of the working tree it must operate in (the worktree, never the main checkout — `git rm` targets wherever the agent lands and nothing else pins it), the demolition zone, the carve-out list, the record's absolute path, and every design or brief statement that overrules an incumbent contract, quoted with its location.

## What the agent does

**Scope the zone by evidence, not by feel.** For every candidate file, run LSP find-references on its exported symbols plus a repo-wide grep for string-keyed and dynamic references. Exclusive to the surface being replaced — it dies. Referenced from outside the zone — it survives, and the reference is a line in the record. Zero references alongside dynamic access, feature flags, serialized handler names, or a public API surface is **suspected dead, unverified**: it stays, and it is reported. That is the one brake on ruthlessness, and it is tied to available evidence rather than to how cautious the run feels, because a session told to be ruthless will not reliably feel cautious in the right places.

**Do the archaeology while the code still exists.** `git log` and `git blame` over what is about to disappear is a question no other actor in the chain is positioned to ask. Spolsky's argument that old code encodes hard-won bug fixes is correct and incomplete: it also encodes accidents, and the code alone cannot tell them apart, while its history partly can. A conditional traceable to a fix commit, a linked issue, a test named after a bug, or a comment naming a workaround is earned knowledge. A conditional with no such trail is listed as unexplained, never promoted to a requirement.

**Take the tests with the code.** A green test asserting the old behavior makes keeping the old implementation the only way to stay green, so leaving tests behind traps the build harder than leaving the code would. Before deleting each one, check whether it smuggles a behavioral guarantee (`tdd/SKILL.md` carries the same discipline at appearance-test scope); every guarantee found becomes a record line.

**Return the manifest.** State what dies, what survives and why, what is suspected-dead-unverified, and what the archaeology turned up. The dispatching session relays it before committing anything, because a manifest announced inside a subagent transcript reaches no human in time to matter — an inertness this procedure has to keep designing against rather than assume away.

**Any halt is BLOCKED, not a hiccup to continue past.** Stopping on uncommitted work in the zone, on a mandate that looks wrong, or on a suspected-dead set that blocks the zone each leaves the tree half-demolished; the dispatcher surfaces the report and waits rather than committing a partial demolition and building on it.

**Delete with `git rm`, never `rm`, and never `-f`.** Tracked and unmodified files delete cleanly; the command refuses on uncommitted changes, which is correct, because uncommitted work inside the demolition zone is somebody's work in flight and stops the run. Everything removed stays in the index and in git's object store, which is what makes over-deletion cheap to undo and why erring toward more deletion is the right default. Commented-out code is not a form of deletion; git history is the archive.

## The record

One markdown file at the path the mandate names, under the gitignored `.ai/` scratch namespace, dead when the task lands. It is the only thing that crosses from the demolished code into the build session, so its filter is strict:

> Anything the code alone knows, that no other artifact can state, and no design or brief artifact overrules, written so it cannot be pasted back.

An overrule is a **stated contradiction** in the design or brief, cited by location — silence never overrules. The asymmetry decides it: a wrongly-preserved contract is a visible line someone can challenge, while a wrongly-dropped one breaks an external consumer in production.

Four categories, and nothing else:

- **Boundary contracts** something outside the demolition zone depends on — status codes and which case yields which, nullable fields, ordering guarantees, auth checks. A contract that only ever served the demolished surface dies with it; that is the point of a rebuild.
- **Edge cases with provenance**, each carrying the commit, issue, or comment that earned it. Unsourced conditionals appear under an explicit unexplained heading so the build decides rather than inherits.
- **Suspected dead, unverified** — what was not deleted and why, with the dynamic reference that blocked it. Operationally the most useful section, because neither the type errors nor git history will surface it.
- **Carve-outs** — links to the stored screenshots, naming which surface and breakpoint each covers.

Four things stay out, and the last is the tempting one:

- **Verbatim code.** Git holds it. A code block crossing the firewall rebuilds the anchor the agent boundary exists to remove.
- **Anything the design artifact states.** A copy competes with the artifact for authority and goes stale the moment the artifact is legitimately amended mid-build.
- **Anything the type errors carry.** Two sources of truth for one fact.
- **Structural description of the old surface** — "the page had a header, a filter bar, and a table". This is the incumbent's curation verbatim, which `grill-design` bans at design time; letting it in through the back door at build time defeats everything upstream.

**Every line is phrased as a requirement on the new build, never a description of the old one.** Write "the list endpoint returns 403, not 404, when the caller lacks record access — the mobile client branches on it", not "the old handler checked access first". A description invites reconstruction; a requirement is just a requirement. The rule is also the audit: a line that cannot be phrased as a forward requirement has failed the filter and is cut.

## What demolition leaves behind

The tree does not compile, and that is the deliverable rather than the damage. Lint is per-file so deleted files raise nothing, and deleted tests go with their code, but a whole-program typechecker reports every place something surviving still expects what died — **the connection map**, generated by the compiler instead of inferred by a session, and immune to the incumbent-curation problem that makes prose descriptions poisonous. Record that error set; the slice loop's contract is that it shrinks monotonically and reaches zero before the QA gate.

Stacks with no typechecker get no map, and the agent's own reference audit is the only net. That is weaker, and it is the reason `project-init` treats a missing typechecker as an agenda item rather than a recorded fact.
