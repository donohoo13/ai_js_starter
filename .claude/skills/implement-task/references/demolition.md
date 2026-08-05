# The demolition pass

The procedure `implement-task` runs before the first slice of a task whose frontmatter carries `incumbent: replace`. It exists because measured deletion avoidance is a property of the session holding the code: models locate the right file over 90% of the time and remove the required line about half as often, and roughly a third of otherwise-correct patches wrap old code in a conditional rather than deleting it. A build session that has read the incumbent implementation resists that pull; a build session that never read it has nothing to pull against.

**Two agent invocations with separate contexts are the mechanism, not a division of labor.** Run 1 reads and decides nothing about survival; run 2 deletes and reads nothing. One agent doing two passes would carry the read pass's sympathy for the code straight into the delete pass, buying planning quality and no protection. Guard-and-Go needs the old code present and a conditional to wrap it in; run 2 has neither, which is why the design removes the action rather than instructing against the inclination — the research is explicit that more instruction increases misjudgment.

Read this file before dispatching either run, and pass it to run 1 by absolute path. Run 2 gets the plan and nothing else, this file included.

## What the dispatching session does first

1. **Confirm the verdict.** `incumbent: replace` in the task file. Any other value, or none, means no demolition runs — the step-1 gate already refuses the missing case, and it never writes the key itself.
2. **Read the linked contract.** Open the task's `design:` artifact and `brief:` before writing the mandate. The overrule set below can only be quoted from documents the dispatcher has actually read, and an empty overrule set tells run 1 to preserve every contract it finds.
3. **Capture carve-outs before anything is deleted.** A surface the task explicitly keeps exists only until demolition runs, so screenshot it now with the project's UI verification tool (named in `CLAUDE.md`), cropped to that surface and nothing else, classified before storage per the data-handling rules, stored under `docs/assets/<task-slug>/` and linked from the task file's Design decisions. Never record a carve-out in a design artifact's `source:` frontmatter: that key triggers the build's source-versus-render comparison, so a photograph of the surface being demolished would become the fidelity target its replacement is judged against — the incumbent's curation reintroduced by the very step meant to remove it. The dispatching session captures rather than an agent because it already has the UI tool wired, and driving a running app yields pixels rather than source, so the firewall holds. **Which surface survives is a design decision that arrives with the task** — a session choosing carve-outs here is authoring composition at build time with no design authority.
4. **Write run 1's mandate.** The agent cannot see the conversation, so its prompt carries: the absolute path of the working tree it must operate in (the worktree, never the main checkout — nothing else pins where a later `git rm` lands), this file's absolute path, the demolition zone at file level, the carve-out list, the record's absolute path under the gitignored `.ai/` namespace, and every design or brief statement that overrules an incumbent contract, quoted with its location.

## Run 1 — the plan and the record

Run 1 reads everything and spares nothing. Its reading produces exactly two outputs, the kill list and the record, and only the kill list can spare a file. Understanding what a file does carries into the record as a forward requirement; it never earns that file a reprieve.

**The zone is the only survival test.** Every file in the zone dies, regardless of how many things reference it. A shared module the design targets is the most common preservation excuse and is explicitly not one: it is exactly what a preservation-biased session protects and exactly what should go. The zone arrives from the task file at file level, decided while a human was in the room, and run 1 neither widens it from a surface name nor narrows it from what the code turns out to do.

**One exemption, checkable by kind rather than judgment.** An artifact whose deletion is not git-recoverable stays — where the file's absence changes state outside the repo, so restoring it later restores nothing. An applied database migration leaves production schema and a fresh `migrate` run permanently divergent; a lockfile pinning published artifacts is the same shape. Nothing else is exempt, and "shared", "widely referenced", and "still used elsewhere" never qualify. Report each exemption by naming the kind that earned it.

**Blast radius is an inventory, not a reprieve.** LSP find-references over the zone's exported symbols plus a repo-wide grep for string-keyed and dynamic references produce the list of everything that will break. Every call site found becomes a forward requirement in the record, and breaking those call sites is the expected outcome: the connection map is what tells the build where to reconnect. A reference run 1 suspects but cannot locate — a route table it cannot parse, a handler name it believes is serialized somewhere — is deleted anyway, with the suspicion written into the record so the build knows where to look.

**Do the archaeology while the code still exists.** `git log` and `git blame` over what is about to disappear is a question no other actor in the chain is positioned to ask. Spolsky's argument that old code encodes hard-won bug fixes is correct and incomplete: it also encodes accidents, and the code alone cannot tell them apart, while its history partly can. A conditional traceable to a fix commit, a linked issue, a test named after a bug, or a comment naming a workaround is earned knowledge. A conditional with no such trail is listed as unexplained, never promoted to a requirement.

**Take the tests with the code.** A green test asserting the old behavior makes keeping the old implementation the only way to stay green, so leaving tests behind traps the build harder than leaving the code would. Every test file covering the zone is on the kill list; before listing each, check whether it smuggles a behavioral guarantee (`tdd/SKILL.md` carries the same discipline at appearance-test scope), and every guarantee found becomes a record line.

Run 1 deletes nothing and edits nothing. It writes exactly one file — the record, at the mandated path — and returns the kill list plus the manifest.

## The relay

The dispatching session relays run 1's plan and manifest into its own stream before dispatching run 2: what dies, what the git-recoverability exemption spared and by which kind, what the blast-radius inventory found, and what the archaeology turned up. A manifest announced inside a subagent transcript reaches no human in time to matter, which is an inertness this procedure has to keep designing against rather than assume away.

**It is a window, not a gate.** Nothing waits on a confirm; the user can interrupt while it scrolls. A per-file confirmation would trade away the speed that makes demolition worth doing, and the manifest landing in the main stream is also how the dead-code reporting obligation gets met, since the record itself is never committed.

## Run 2 — delete and commit

Run 2 receives the working tree's absolute path, the kill list, and the commit message. It receives no design artifact, no record, no archaeology, and no reasoning — nothing that would let it evaluate what it is removing, because evaluating is what run 1 already did with the code in front of it.

**Delete with `git rm`, never `rm`, and never `-f`.** Tracked and unmodified files delete cleanly; the command refuses on uncommitted changes, which is correct, because uncommitted work inside the demolition zone is somebody's work in flight and stops the run. Everything removed stays in git's object store, which is what makes over-deletion cheap to undo and why erring toward more deletion is the right default. Commented-out code is not a form of deletion; git history is the archive.

Run 2 then commits the red state under its own explicitly-named message and runs the project's typechecker, returning that error set verbatim. It opens no file it deletes and writes no replacement code: a helpful stub or shim reintroduces exactly the anchor the split exists to remove.

**Any halt is BLOCKED, not a hiccup to continue past.** Run 1 stopping on a mandate that looks wrong, or run 2 stopping on uncommitted work in the zone, leaves the tree half-demolished; the dispatcher surfaces the report and waits rather than committing a partial demolition and building on it.

## The record

One markdown file at the path the mandate names, under the gitignored `.ai/` scratch namespace, dead when the task lands. It is the only thing that crosses from the demolished code into the build session, so its filter is strict:

> Anything the code alone knows, that no other artifact can state, and no design or brief artifact overrules, written so it cannot be pasted back.

An overrule is a **stated contradiction** in the design or brief, cited by location — silence never overrules. The asymmetry decides it: a wrongly-preserved contract is a visible line someone can challenge, while a wrongly-dropped one breaks an external consumer in production.

Five categories, and nothing else:

- **Boundary contracts** something outside the demolition zone depends on — status codes and which case yields which, nullable fields, ordering guarantees, auth checks. A contract that only ever served the demolished surface dies with it; that is the point of a rebuild.
- **Blast-radius call sites**, each named with the requirement it places on the replacement. The record carries what the caller needed; the connection map carries the file and line that stopped compiling. Both, deliberately — they are different facts about the same site, and the exclusion below bans copying the compiler's text, not naming the consumer.
- **Suspected references nobody located**, each naming the suspicion and where it was hunted. Operationally the most useful section, because neither the type errors nor git history will surface a route table or an i18n key.
- **Edge cases with provenance**, each carrying the commit, issue, or comment that earned it. Unsourced conditionals appear under an explicit unexplained heading so the build decides rather than inherits.
- **Carve-outs** — links to the stored screenshots, naming which surface and breakpoint each covers.

Four things stay out, and the last is the tempting one:

- **Verbatim code.** Git holds it. A code block crossing the firewall rebuilds the anchor the agent boundary exists to remove.
- **Anything the design artifact states.** A copy competes with the artifact for authority and goes stale the moment the artifact is legitimately amended mid-build.
- **The typechecker's own output.** Two sources of truth for one fact; the connection map is already that fact's home.
- **Structural description of the old surface** — "the page had a header, a filter bar, and a table". This is the incumbent's curation verbatim, which `grill-design` bans at design time; letting it in through the back door at build time defeats everything upstream.

**Every entry names an artifact and states a requirement on the new build — never a conclusion about the old one's shape.** Name the consumer, the commit, the issue, the test, the grep that found it, and say what the replacement owes it: "`apps/mobile/src/record.ts:88` branches on 403 versus 404 from the list endpoint, so the replacement distinguishes them" rather than "the old handler checked access first". This is the review board's Actions contract applied to demolition, and for the same reason: a rule phrased as "never describe the old surface" is passed by rewording, so the rule binds what an entry must contain instead. It is also the audit — an entry with no artifact and no forward requirement has failed the filter and is cut.

## What demolition leaves behind

The tree does not compile, and that is the deliverable rather than the damage. Lint is per-file so deleted files raise nothing, and deleted tests go with their code, but a whole-program typechecker reports every place something surviving still expects what died — **the connection map**, generated by the compiler instead of inferred by a session, and immune to the incumbent-curation problem that makes prose descriptions poisonous. The dispatcher records that error set in the task file's Design decisions, where the session resuming tomorrow can find it; the slice loop's contract is that it shrinks monotonically and reaches zero before the QA gate.

Stacks with no typechecker get no map, and run 1's blast-radius inventory is the only net. That is weaker, and it is the reason `project-init` treats a missing typechecker as an agenda item rather than a recorded fact. The map is incomplete even where it exists: nav entries, i18n keys, feature flags, route tables, and CI path filters produce no type errors, which is what the suspected-references section of the record is for.
