---
name: review-board
description: Multi-agent review board. Spawns parallel specialist reviewers — five code seats (correctness, security, reliability, maintainability, performance/operations) or three documentation seats (flow continuity, coherence, adversarial), chosen by what the change touches — then renders its own confirmed/plausible/rejected verdict on every finding and waits for the human to pick what gets addressed. Use whenever the user asks to review code changes, a branch, a diff, or a PR; asks for a security review, standards check, or pre-merge/pre-PR review; says "review my changes", "run the review board", or "is this safe to merge"; wants a second opinion on work in progress; or asks to review a documentation, process, runbook, prompt, or agent-instruction change, where the document is the behavior and nothing compiles it. An optional leading mode argument (`quality`|`balanced`|`speed`) scales the board; with no mode given, the session AI recommends a mode and read depth reasoned from the change itself.
argument-hint: '[quality|balanced|speed] [PR number, commit range, or paths to scope the review]'
---

# Review Board

Run a panel of parallel specialist reviewers over a set of changes — code, documented process, or both — then act as the board chair: dedupe their findings, judge each one, render your own verdict, and present a consolidated report. The human decides what gets addressed; deep verification and any fix wait until they choose.

Two principles run through every step:

- **Parallel specialists beat one general pass.** A single reviewer skimming five concerns misses what a focused reviewer catches; each board member gets one category, its own checklist, and a full context budget. The chair's triage matters just as much: sub-agents overproduce plausible-sounding findings, and your judgment is what separates signal from noise before the human ever sees it.
- **Your session context cuts both ways.** In the common flow you implemented the change earlier this session and are now reviewing it. That context is an asset for facts — intent, stack, which code you actually read — so reuse it instead of re-deriving it. It is a liability for judgment — deciding a category needs no review, or that a finding "can't be right" — because the author's confidence is exactly what a blind spot feels like. Reuse your knowledge; distrust your comfort.

## State at invocation

- Branch: !`git branch --show-current`
- Default branch: !`def=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null); def=${def#*/}; echo "${def:-main}"`
- Committed delta vs merge-base with the default branch: !`def=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null); def=${def#*/}; def=${def:-main}; base=$(git merge-base "$def" HEAD 2>/dev/null); [ -n "$base" ] && [ "$base" != "$(git rev-parse HEAD)" ] && git diff --stat "$base" HEAD | tail -1 || echo "(none: on the default branch, or no merge-base)"`

Uncommitted changes at invocation (empty = clean):

```!
git status --short | head -50
```

## Step 1: Resolve scope and context

Parse the arguments:

- A leading mode keyword (`quality`, `balanced`, or `speed`): sets the board mode used in Step 2; everything after it is scope. No keyword sends mode and depth to gate 1 in Step 2 — never a silent default.
- A PR number (`142` or `#142`): use `gh pr diff <n>` and `gh pr view <n>`.
- A commit range (`abc123..def456`): use it directly.
- Paths: restrict the default scope to those paths.
- Nothing: the current branch versus the merge base with the default branch from the snapshot above (`git diff $(git merge-base <default> HEAD)`, where `<default>` is the local default-branch name — the origin/HEAD detection `ship-pr` uses, with the remote prefix stripped, falling back to `main` when no origin/HEAD ref exists; the local name, not `origin/<name>`, so unpushed commits on the default branch never widen the scope) **plus** uncommitted changes (`git diff HEAD` and untracked files via `git status --porcelain`).

If that resolves to an empty diff, tell the user there is nothing to review and ask what they meant. Do not review the whole repository unasked.

Gather three pieces of context — from session knowledge first when you authored the change, otherwise by looking:

- **Intent**: what the change is supposed to do, from the PR description, commit messages in scope, or a matching `docs/tasks/` file. If still unclear, ask the user for a one-line summary before spawning; a review against unknown requirements wastes a whole board's worth of tokens.
- **Stack snapshot**: the review lens depends on the runtime — event-loop blocking and `fs` access mean nothing on Cloudflare Workers, connection pooling advice differs between `pg` and D1, module-level state is a per-isolate footgun on Workers and a cross-request race on Node. A quick look at `package.json`, runtime configs (`wrangler.jsonc`/`wrangler.toml`, `Dockerfile`, `next.config.*`), and `tsconfig.json` is enough; this is a snapshot, not an audit. On a documentation-heavy change the equivalent is the **process surface**: which documented flow the change alters, who or what actually reads it, and which neighboring documents cite it. A doc finding judged against the wrong flow is the same noise as a code finding judged against the wrong runtime.
- **Scope hygiene**: if the diff mixes clearly unrelated changes (a refactor tangled with a feature, drive-by edits), record it for the report's process notes.

## Step 2: Set the dials (gate 1), compose the board (gate 2), spawn

The mode presets the board's two cost dials — seat model tier and read depth — because they trade the same currency: recall against tokens and turnaround. Two user gates stand between invocation and spawn: gate 1 settles mode and depth posture when no mode keyword was given, gate 2 confirms the board's composition. Each gate leads with your recommendation, and each recommendation is reasoned from this session's change — in the common flow you authored the implementation, so you know which seams you touched, what you were least sure of, and where an author's blind spots most plausibly live. A recommendation that would read identically on any diff is a default wearing a costume. Everything else works the same in every mode: which seats run, the chair on the session model, the human gate.

Depth is the fat in the board's budget; tier is the muscle. Full changed-file reads across every parallel seat dominate the board's token count and wall-clock, while the quality worth paying for lives mostly in the Opus judgment seats and the chair's triage. Cut depth before tier: diff-first with targeted escalation keeps nearly all the recall at a fraction of the reads, whereas dropping correctness or security a tier trades away exactly the judgment the board exists to buy.

| Mode       | Seat models           | Read depth                                       | Reach for it when                                                                                  |
| ---------- | --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `quality`  | Per-seat matrix below | Full changed files, every seat                   | The miss costs more than the tokens: pre-merge on large, unfamiliar, or security-sensitive changes |
| `balanced` | Per-seat matrix below | Diff-first; per-seat escalation by named trigger | The everyday review                                                                                |
| `speed`    | Per-seat matrix below | Diff-first, every seat                           | Mid-work sanity passes and small self-contained diffs, where turnaround matters more than recall   |

A speed board is a screen, not a proof: diff-first reads with lower tiers catch pattern-shaped defects and miss interaction bugs. That is the right trade for mid-work passes and most small diffs — recommend it freely there — and the wrong one pre-merge on changes whose misses are expensive.

### Which seats: code, documentation, or both

**Settle this before the dials**, because the seat set decides what the depth question even means. The five code seats review executable logic. A change whose subject is a **documented process** — a runbook, an onboarding or contribution guide, an agent or prompt file, an API doc chain, a set of ADRs, or config whose job is to document behavior — has no logic to review and seats three different reviewers instead, because for that class the document _is_ the behavior: nothing executes it but a human or a model reading it, so a hole in the chain is the defect rather than a symptom of one.

| Agent           | Prefix | `quality` | `balanced` | `speed` | Checklist                   | Subagent type        |
| --------------- | ------ | --------- | ---------- | ------- | --------------------------- | -------------------- |
| Flow continuity | `FLW`  | Opus      | Opus       | Sonnet  | `references/flow.md`        | `review-flow`        |
| Coherence       | `COH`  | Opus      | Sonnet     | Haiku   | `references/coherence.md`   | `review-coherence`   |
| Adversarial     | `ADV`  | Opus      | Opus       | Sonnet  | `references/adversarial.md` | `review-adversarial` |

**All three run whenever this board sits.** The floor is three seats _running_, not three seats unmerged, so neither consolidating them nor dropping one is available: they hunt by genuinely different methods — traversal, agreement, and exploitation — and each reliably finds what the others cannot. Seat-skipping is a code-board rule and does not reach here, because "this document has no gate to red-team" is an argument available against almost any document and it retires the highest-yield seat first. Adversarial is the deepest-reasoning seat and never drops below Sonnet; coherence is the most systematic, grep-shaped work and covers from Haiku up.

**Read depth is fixed on this board: full changed files, every seat, every mode.** It is not a dial here, and no mode preset overrides it. A prose diff loses the section that gives an edit its meaning, and the defect frequently sits in the untouched sentence beside the change; the three agent definitions read changed files in full regardless, so a diff-first instruction would only make the spawn prompt disagree with the seats it spawns. What still varies is how far _past_ the changed files a seat reads: the code triggers below apply, plus one of this board's own — a corpus that cross-references heavily, where coherence earns the wider sweep.

A mixed change seats from both sets: every documentation seat, plus each code seat whose category has a surface. Skip the board entirely only when the edit changes no instruction to any reader — a typo, a link, formatting, wording carrying no rule — and put that no-board shape through gate 2 like any other, rather than deciding it alone: declining the board is the largest composition call available and it is the cheapest one to reach for. On a confirmed no-board, say in one line that no seats ran and no record commit will be left, so a later `/ship-pr` re-offer reads as expected rather than as something having failed.

**Diff-first is the default read depth for code seats below `quality`; full-file is an escalation a seat earns through a named trigger.** Diff-first means working from the diff and opening surrounding code only to confirm a suspected finding, so its recall loss is bounded; full changed-file reads are what multiply the board's cost. Escalate a code seat only when one of these fires:

- **Code you did not author this session** — cold code gives no session context to lean on; full files are how a reviewer builds the interaction picture an author already holds.
- **Cross-module contract changes** — modified signatures, types, or schemas consumed beyond the diff; the breakage lives outside the hunk by definition.
- **Security-sensitive surface** — auth, input handling, secrets, or money paths; escalates the security seat, not the whole board.
- **Tangled or oversized diff** — mixed concerns or a diff too large to carry its own context.
- **Concurrency or resource lifecycles** — races and leaks live in the code around the hunk; escalates reliability specifically.

"The change feels important" and "better safe than sorry" are not triggers — board-wide caution is how a cheap review quietly becomes an expensive one. Escalation is per-seat, with the trigger named.

### Gate 1: mode and depth posture (only when no mode keyword was given)

An explicit mode keyword is the user's call — run it as given and skip this gate. If the choice looks genuinely wrong for the diff (speed on a tangled security-sensitive change, quality on a two-line copy fix), say so once at gate 2 with your reasoning and let the user reconsider; their answer stands either way.

With no keyword, do not silently assume anything. Settle the seat set first per the section above — the depth question means something different on each board — then open with two recommendations, each carrying reasoning specific to this change:

1. **Mode** — lean `speed` for mid-work passes and small self-contained diffs, `balanced` for the everyday pre-merge review, `quality` only when the miss cost plainly dominates the token cost. Say why this diff lands where it does.
2. **Depth posture** — for code seats, diff-first unless a trigger above fires; name each escalated seat and its trigger ("I touched the auth middleware, so security reads full files; everything else diff-first"). Documentation seats are full-file in every mode, so state that as a fact rather than offering it — and a posture agreed here never carries forward onto them.

Ground both in what you actually did this session: the seams you touched, the parts you were least confident about, the categories where your author's blind spot most plausibly lives. Put them as one `AskUserQuestion` with your recommended shape as the first option; the user's pick feeds gate 2.

### The seats

The five code members, each a registered agent in `.claude/agents/` with a checklist in this skill's `references/` directory. Modes shift each seat's tier rather than flattening the board to one model, because the seats differ in ways no mode changes. Correctness and security misses are what a review exists to catch, and their findings come from intent-modeling and threat-modeling rather than pattern-matching, so they never drop below Sonnet — chair triage filters a cheap seat's extra noise, but nothing recovers a miss. Maintainability is the opposite pole: checklist-saturated, diff-local, and lowest miss cost (tech debt, not an incident), so Opus buys it nothing even in `quality` and Haiku covers it from `balanced` down. Reliability and performance sit between — pattern-shaped enough for Haiku on a speed screen, reasoning-shaped enough (races, resource lifecycles, cross-function complexity) to earn Opus when the miss is what you are paying to avoid. The chair (you) runs on the session model in every mode, because triage — verification, dedup, verdicts — is the judgment the board's value actually rests on.

| Agent                    | Prefix | `quality` | `balanced` | `speed` | Checklist                       | Subagent type            |
| ------------------------ | ------ | --------- | ---------- | ------- | ------------------------------- | ------------------------ |
| Correctness              | `COR`  | Opus      | Opus       | Sonnet  | `references/correctness.md`     | `review-correctness`     |
| Security                 | `SEC`  | Opus      | Opus       | Sonnet  | `references/security.md`        | `review-security`        |
| Reliability              | `REL`  | Opus      | Sonnet     | Haiku   | `references/reliability.md`     | `review-reliability`     |
| Maintainability          | `MNT`  | Sonnet    | Haiku      | Haiku   | `references/maintainability.md` | `review-maintainability` |
| Performance & operations | `PRF`  | Opus      | Sonnet     | Haiku   | `references/performance.md`     | `review-performance`     |

Spawn mechanics are the same for both boards, against whichever matrix governs the seat. Spawn each seat by its `review-*` subagent type; the read-only toolset comes from the agent definition. Every frontmatter model pin encodes its seat's `balanced` column, so in `balanced` spawning by type is enough; in `quality` and `speed`, pass each seat's `model` from its matrix explicitly on the spawn — the per-invocation override takes precedence over the pin, and skipping it is how a `speed` board silently runs two Opus seats and costs more than the mode it replaced. If the definitions are not installed in this repo, fall back to `general-purpose` agents and set `model` explicitly in every mode, straight from the matrix; a documentation seat spawned that way carries no agent preamble, so its full-file read depth has to come from the prompt.

### Gate 2: board composition

Form the board shape and put it to the user as one confirmation before spawning:

- **Full board or lite (`balanced` only).** The documentation board never consolidates and never drops a seat, per the floor above; on that board this bullet and the next are already settled and the only shape to confirm is whether the board sits at all. For code, the five-seat board is the default. For a small, self-contained diff (a few files, localized logic, no signature changes or cross-module effects) offer a **lite board** instead: three consolidated seats — Security (Opus, solo), Correctness + Reliability (Opus, one agent reading both checklists), Maintainability + Performance (Sonnet, one agent reading both) — all diff-first. Lite trades some recall for a much shorter, cheaper run; recommend it only when the change is genuinely small and localized, and never on a large or security-sensitive diff where the focused five earn their cost. `quality` never consolidates seats — merged lenses give up exactly the recall it exists to buy — and `speed` already gets its savings from tier and depth while five parallel seats cost no extra wall-clock.
- **Which code reviewers run (every mode).** Skip a code seat only when its category has no surface in the change: a pure-computation change has no I/O for performance to review, a test-only change has no performance story, a change touching no persistence and no external input has little security surface. Documentation seats are exempt from this bullet — all three run whenever that board sits. The bar is "nothing to look at", never "I'm confident this part is fine" (second principle). When in doubt, run them all: a reviewer returning "no findings, here's what I checked" is cheap; a category silently unreviewed is how the one real bug ships.
- **Read depth finalization per running code reviewer (`balanced` only — the other modes preset it).** Apply the default-and-triggers rule above: diff-first for every code seat, full files only where a named trigger fires, decided per seat rather than board-wide. If you authored the change, you already know which triggers fire; a gate-1 depth posture carries straight into this list rather than being re-litigated. Documentation seats do not appear in this list at all — their depth is fixed at full changed files in every mode, and neither a preset nor a gate-1 posture moves it.

Present the shape with a one-line reason each, your recommendation as the accept-as-is first option (a single `AskUserQuestion`; one question, not several). In `quality` and `speed`, restate the preset tier and depth as facts rather than asking about them; the question is only which seats run — plus, when the user's explicit mode looks wrong for this diff, your one-time case for reconsidering (their answer is final). This is a cost/thoroughness tradeoff the user owns, and asking is cheap next to a board's worth of tokens.

Then spawn the selected seats in a single message so they run in parallel. Each agent is read-only — it must not modify, create, or delete any file — and its prompt must contain, concretely (agents cannot see this conversation). For a lite-board merged seat, pass both checklist paths and tell it to apply both, keeping each finding's prefix tied to its category:

1. The exact scope: the git commands to reproduce the diff, the base ref, and the list of changed files.
2. The intent context, stated in a sentence or two.
3. The stack snapshot, with an instruction that the agent's first step is a seconds-long confirmation of it (`package.json` plus any runtime config touching the changed files); a finding judged against the wrong runtime is noise. Documentation seats get the process surface in its place — the flow under change, its readers, and the documents citing it.
4. Its checklist file and `references/output-format.md`, by absolute path, to read before reviewing.
5. The read depth, stated explicitly — full changed files or diff-first — from the mode preset or the gate decisions; never left for the agent to choose.
6. The evidence bar: every finding needs a `file:line` location, an excerpt, and a concrete failure scenario. For code seats the excerpt is code and the scenario names a specific input or state producing the wrong outcome; for documentation seats it is a quote of the text and a named reader path ending in a specific bad outcome, since a documented process has no inputs and the strongest doc findings — a null action, an unstated precedence — are by construction not a specific input. "This could be a problem" without a scenario is not a finding, and an empty findings list is a perfectly good result; agents must not invent findings to look busy.
7. What not to flag: anything a linter or formatter auto-fixes, subjective style preferences, and pre-existing issues in untouched code or documents (unless the change makes them worse or newly reachable — then say so explicitly). Note for documentation seats that this excludes untouched _neighbors_ from being faulted for pre-existing problems, and never excludes reading them: a contradiction the change created lives in the file it did not open.
8. Return format: findings per `references/output-format.md`, IDs prefixed with the agent's category prefix, returned as the agent's final message.

## Step 3: Consolidate and triage

When all reviewers return, you become the chair. This step is your own judgment, not a summary job:

1. **Dedupe.** Different agents often catch the same defect through different lenses (a missing input check is both `SEC` and `COR`). Merge duplicates, keep the most severe categorization, and note the agreement; independent convergence is evidence of validity.
2. **Judge each finding from your own context; deep-verify nothing yet.** Default to what you already know — your read of the change and the task — to decide whether a finding is probably true and worth the user's attention. Open code during triage only when a finding _alarms_ you: it contradicts your understanding (your context may be the blind spot, or the reviewer may be hallucinating a line — "that can't be right" is how both feel), or it reads as wildly off from the task at hand (obviously off-topic or misdirected). A quick look settles those; everything else, trust your read. How much lands in that trusted bucket scales with the context you actually have: a change you authored, you can judge from memory; a change you are seeing cold, lean on the reviewers' evidence and let thin spots fall to Plausible rather than wave them through. The expensive confirm-and-root-cause pass is deferred to Step 5 and runs only on the findings the user chooses — doing it now on every finding is exactly the verify tail this step exists to cut.
3. **Render a verdict per finding**, a line or two of reasoning each: **Confirmed** (matches your understanding of the change; you judge it real), **Plausible** (credible, but you cannot settle it from context — it needs runtime, domain, or intent knowledge you lack, or code you have not read), **Rejected** (contradicts what you know or is off-task; you looked and it does not hold — say why, since the rejection is how the user audits your triage). Have the spine to reject; a triage pass that confirms everything was not a triage pass. Rejecting a documentation finding carries one extra obligation: its "Noted" line quotes the reviewer's own one-line scenario alongside your reason. Those seats exist to challenge the author's reading, you are usually the author, and Rejected is the cheapest verdict on the board — so the human audits the rejection against the reviewer's words rather than your paraphrase of them.
4. **Form the board recommendation** — one disposition per surviving finding, decided by where the defect came from rather than by how big the fix looks:
   - **Fix in this session** for anything the work under review introduced or made worse. This session holds the change's context, which makes it the cheapest place that defect will ever be fixed; handing it to a future session buys back that context at full price on top of the same fix. A large fix is therefore a reason to start now, not grounds to file it — size never moves a finding out of this bucket.
   - **`/capture-task`** in exactly two cases, and name which one applies: a pre-existing bug whose root cause needs investigation this change has no grounds to run, or a real design tradeoff that deserves deciding on its own terms rather than inside a review.
   - **Noted, no action** for rejected findings and for confirmed-low ones you judge not worth the human's attention now — one line each, so they can see you saw it.

   Then order the fix-now list. Have a take; "it depends" is not a recommendation.

## Step 4: Report and wait for the human

Present the consolidated report using the exact structure in `references/output-format.md` (Part B). Its shape is the deliverable, not a container for one: the decisions the board is asking the human to make come first, in plain language, each ending in a direct question with your recommendation attached, and the evidence sits below them. Write it so the human can answer the closing question from the first screen without reading a code excerpt.

Two things keep that shape honest as you fill it in:

- **A bullet the human can neither answer nor act on goes in the "Noted" section as a one-liner.** Stating that findings want their call and then asking nothing is what makes a report unanswerable — the reader cannot tell a question from a status note.
- **Every `/capture-task` recommendation names its ground** — pre-existing bug needing investigation, or a design tradeoff needing its own decision (Step 3). A finding this session's own work introduced carries a fix-now recommendation at whatever size it turns out to be.

Then stop and ask which findings to address, for example: "Reply with finding IDs, `all confirmed`, or `none`."

> [!WARNING]
> **Do not fix anything yet.** No edits, no "quick wins while I'm here", no staged patches. The human-in-the-loop gate is the contract of this skill: the report ends the turn, and code changes only happen after the user explicitly selects findings.

## Step 5: Verify, then address selected findings

This is where the deep verification deferred from triage happens — now, on the few findings the user chose, not all of them upfront. For each selected finding, confirm it against the actual code before writing a fix: reproduce the failure scenario, trace it to root cause, and fix the source rather than the reviewer's paraphrase of the symptom. If a finding does not hold up to that closer look, say so and skip it instead of inventing a fix — a triage verdict is a judgment, not a guarantee, and this is the point where the two can diverge. Apply fixes for exactly the selected findings and nothing else. A fix landing in a file with its own edit gate loads that gate's skill first — `skill-creator` for anything under `.claude/skills/`, where a hook denies the edit otherwise, and `curate-context` or `domain-modeling` for the governed context docs, where nothing enforces it and the instruction is the whole mechanism. The documentation board makes this routine rather than incidental, since those files are exactly what it reviews. After fixing, run the project's relevant checks (tests, typecheck, lint) for the touched areas and report the results honestly; a fix without a passing check is reported as unverified, not done.

## Step 6: Leave the record commit

The board's outcome must outlive this conversation — `/ship-pr` documents it in the PR body, and a record nobody can find is a review that never happened. On a branch other than the default, once the user's selection is resolved (including `none`): commit any Step 5 fixes first (explicit paths, message naming the finding), then leave an always-empty record commit as the last commit on the branch:

```bash
git commit --allow-empty -m "review: board (<mode>) — <N> findings, <X> addressed, <Y> dismissed, <Z> rejected" -m "<record body>"
```

The record body carries one line per finding — ID, severity, verdict, title, outcome (addressed + fix commit SHA, captured + the task file path, dismissed + the user's one-line reason verbatim, or rejected) — plus one coverage line for every seat that returned nothing, so a clean board leaves evidence that it ran rather than an absence that reads the same as never convening, and closes with trailers (`Review-Mode:`, `Review-Scope: <base>..<head>`) for grep-ability; `/ship-pr` finds records with `git log <default>..HEAD --grep='^review:'`. This subject shape is the stated point-of-use exception to the repo's 50-char imperative commit rule — the `review:` prefix is the grep contract, so the format wins.

Capture dismissal reasons at selection time: when the user declines a confirmed or plausible finding, take the one-line why from their reply or ask for it — it is the one datum nobody can reconstruct later, and it is what makes a dismissal defensible instead of silent. A captured finding rides the `dismissed` count in the subject, since nothing about it was addressed on this branch; the body line is where its task file makes it findable. Always empty, always last: fix commits describe fixes, the record commit records the board — two jobs, two commits, one shape to parse. Pinning the record to the branch also pins it to the exact tree that was reviewed; a dated file could drift from that, a commit cannot.

On the default branch (the solo flow) skip the commit — the report stays conversational, and nothing ships from there anyway. An interactive rebase can silently drop an empty commit; if the user rewrites the branch before shipping, warn them the record goes with it. Finally, when the branch has a remote to ship to, close with a one-line `/ship-pr` offer — offer only, never invoke it yourself.
