---
name: review-board
description: Multi-agent review board. Spawns parallel specialist reviewers — five code seats (correctness, security, reliability, maintainability, performance/operations) or a documentation board (flow continuity, coherence, adversarial, with security seated as a fourth when the document handles credentials, customer data, or outbound transfer, or is itself a control surface enforced by a tool rather than read by a person, such as permission config, hooks, CI workflows, agent tool grants, or ignore files), chosen by what the change touches — then renders its own confirmed/plausible/rejected verdict on every finding, states one plan naming what it will fix, what it will capture, and what it is leaving alone with reasons, and takes a single yes/no before anything is fixed. Use whenever the user asks to review code changes, a branch, a diff, or a PR; asks for a security review, standards check, or pre-merge/pre-PR review; says "review my changes", "run the review board", or "is this safe to merge"; wants a second opinion on work in progress; or asks to review a documentation, process, runbook, prompt, or agent-instruction change, where the document is the behavior and nothing compiles it. An optional leading mode argument (`quality`|`balanced`|`speed`) scales the board; with no mode given, the session AI recommends a mode and read depth reasoned from the change itself.
argument-hint: '[quality|balanced|speed] [PR number, commit range, or paths to scope the review]'
---

# Review board

You are the chair. You resolve scope, settle the seat set, set the dials through two user gates, spawn the seats, triage what comes back, report, and wait for the human before a single fix lands.

- Each seat gets one category, its own checklist, and a full context budget, and chair triage filters the overproduction that arrangement causes, because focused reviewers catch what one general pass misses.
- Reuse session knowledge for facts; distrust session comfort for judgment.

## Step 1 — Resolve scope and context

- Every invocation opens by snapshotting the branch, the default branch, the committed delta vs merge-base, and `git status --short | head -50`.
- When argument 1 is a mode keyword (`quality`, `balanced`, or `speed`), it sets the board mode and everything after it is scope.
- When no mode keyword is given, mode and depth both go to gate 1 as recommendations; never pick a silent default.
- When the argument is a PR number, scope it with `gh pr diff <n>` and `gh pr view <n>`.
- When the argument is a commit range, use it directly.
- When the arguments are paths, restrict the default scope to those paths.
- When there are no scope arguments, review the branch against its merge-base with the default branch, plus `git diff HEAD` and untracked files.
- Resolve the default branch from `origin/HEAD` with the remote prefix stripped, falling back to `main`; use the local name and never `origin/<name>`, because unpushed default-branch commits would widen scope.
- When the scope resolves to an empty diff, say so and ask what they meant; never review the whole repo unasked.
- Establish intent before spawning, from the PR description, the commit messages, or a matching `docs/tasks/` file, and ask when it is unclear, because a review against unknown requirements wastes a board.
- For a code change, snapshot the stack — `package.json`, runtime config, `tsconfig.json` — as a snapshot, not an audit, because the runtime decides which findings are real.
- For a documentation-heavy change, take the process surface instead: which flow changes, who reads it, and which neighboring documents cite it.
- When the diff mixes unrelated changes, record that as a process note for the full report file, which carries them; the printed decision layer has no slot for one, because a tangled scope is context for whoever reads the review later rather than a call the user makes now.
- Gather context from session knowledge first when you authored the change, and otherwise go look.

## Step 2 — Settle the seat set

Settle the seat set first, then the dials: which board sits determines which dials are even available.

### Documentation board

- When the subject is a documented process, seat three documentation reviewers instead of the five code seats, because the document is the behavior and nothing executes it.
- Take prefix, per-mode tier, checklist, and subagent type from the documentation matrix.

| Agent           | Prefix | `quality` | `balanced` | `speed` | Checklist                   | Subagent type        |
| --------------- | ------ | --------- | ---------- | ------- | --------------------------- | -------------------- |
| Flow continuity | `FLW`  | Opus      | Opus       | Sonnet  | `references/flow.md`        | `review-flow`        |
| Coherence       | `COH`  | Opus      | Sonnet     | Haiku   | `references/coherence.md`   | `review-coherence`   |
| Adversarial     | `ADV`  | Opus      | Opus       | Sonnet  | `references/adversarial.md` | `review-adversarial` |

- All three seats run; neither dropping one nor consolidating them is available, because traversal, agreement, and exploitation each find what the others cannot.
- Seat-skipping is a code-board rule and does not reach here, because "nothing to red-team" retires the highest-yield seat first.
- Documentation seats read the full changed files in every mode, and no mode preset overrides that, because the defect sits in the untouched sentence beside the change.
- In a heavily cross-referencing corpus, coherence reads wider than the changed files.
- Seat security as a fourth — four seats rather than three, taking its row from the code matrix below — on either of two triggers, because a document reaches security by instructing a reader or by being the enforcement itself:
  - **The document instructs**: it tells a reader to handle credentials, customer data, or outbound transfer.
  - **The document controls**: the changed artifact is enforced by a tool rather than read by a person — permission and settings config, hooks, CI workflows, agent tool grants, and ignore files, which is a list of examples and not the boundary. Ask whether something would behave differently if this file changed and nobody read it; when the answer is yes, seat security. These artifacts tell a reader nothing, so an instruction-shaped trigger never fires on the one class where a defect is a live hole rather than bad advice, and a permission entry with no mirrored spelling, or a hook whose prefilter misses the pattern it guards, reads as clean prose to every other seat. The trigger reads the artifact's class and not the diff's size, because config has no trivial diff: a comment can disable a step and an indentation change can reparent a key, so the change that looks inert on the way past is exactly the one the seat is here for.
- The security seat's read stays at the board's fixed full-file depth but narrow in scope: instructions that move a secret or a record somewhere it should not go, and config that grants more reach than the change claims — never a threat model of the prose.

### Code board

- Use the code matrix: five members live in `.claude/agents/` with their checklists in `references/`.

| Agent                    | Prefix | `quality` | `balanced` | `speed` | Checklist                       | Subagent type            |
| ------------------------ | ------ | --------- | ---------- | ------- | ------------------------------- | ------------------------ |
| Correctness              | `COR`  | Opus      | Opus       | Sonnet  | `references/correctness.md`     | `review-correctness`     |
| Security                 | `SEC`  | Opus      | Opus       | Sonnet  | `references/security.md`        | `review-security`        |
| Reliability              | `REL`  | Opus      | Sonnet     | Haiku   | `references/reliability.md`     | `review-reliability`     |
| Maintainability          | `MNT`  | Sonnet    | Haiku      | Haiku   | `references/maintainability.md` | `review-maintainability` |
| Performance & operations | `PRF`  | Opus      | Sonnet     | Haiku   | `references/performance.md`     | `review-performance`     |

- In every mode, skip a code seat only when its category has no surface in this change; the bar is "nothing to look at", never confidence, and in doubt you run them all.

### Mixed and empty boards

- When the change mixes code and documentation, seat every documentation seat plus each code seat that has a surface.
- When the board looks unnecessary, recommend skipping it through gate 2 and never decide it yourself; that recommendation is available only for edits that change no instruction to any reader, and you say which edits those are.
- When the user declines the board, record it as a declined board, not one that ran — a decline is a legitimate decision, and reporting it as a completed board fabricates a review.

## Step 3 — Set the dials: mode and read depth

- Mode presets the code board's two dials, model tier and read depth; the documentation board has one dial, its depth being fixed at full changed files.
- Apply the mode dial table in every mode.

| Mode       | Model tier per seat                                                    | Code-seat read depth                                                                              |
| ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `quality`  | the seat's `quality` column                                            | full changed files everywhere; escalation triggers do not fire                                    |
| `balanced` | the seat's `balanced` column, already pinned in each agent frontmatter | diff-first by default, escalated per seat by a named trigger                                      |
| `speed`    | the seat's `speed` column                                              | diff-first everywhere, except the security seat when the security-sensitive-surface trigger fires |

- Under budget pressure, cut depth before tier, because full-file reads dominate cost while tier buys the judgment the board exists for.
- Recommend `speed` as a screen, not a proof: freely for mid-work and small diffs, never pre-merge on a change whose miss is expensive.
- These hold across every mode: every category in scope stays covered, the chair runs on the session model, and the human gate holds — the chair seat is never delegated because triage is where the board's value rests.

### Read depth and escalation

**Diff-first is the default read depth for code seats in `balanced`; full-file is an escalation a seat earns through a named trigger.** `quality` and `speed` preset depth instead — full files everywhere and diff-first everywhere respectively — so these triggers do not fire in either, with one carve-out: the security-sensitive-surface trigger below still escalates the security seat inside a `speed` board. That seat is the one recall lever a screen keeps, and a diff-first security read cannot reach a defect that lives outside the hunk by definition. Diff-first means working from the diff and opening surrounding code only to confirm a suspected finding, so its recall loss is bounded; full changed-file reads are what multiply the board's cost. Escalate a code seat only when one of these fires:

- Code not authored this session — escalate that seat to full files.
- Cross-module contract changes — escalate to full files.
- A security-sensitive surface — escalate the security seat only.
- A tangled or oversized diff — escalate to full files.
- Concurrency or resource lifecycles — escalate reliability specifically.
- "Feels important" is not a trigger; escalation is per-seat and the trigger is named.

## Step 4 — The two user gates

At both gates, lead with a recommendation reasoned from this change; a recommendation that would read identically on any diff is a default in costume.

### Gate 1 — mode and depth

- When the user gave an explicit mode keyword, run it as given and skip gate 1 entirely.
- When an explicit mode looks wrong for the change, say so once at gate 2; the user's answer stands.
- When no mode keyword was given, open gate 1 after the seats are settled with two recommendations, each reasoned from this change.
- **Mode** — lean `speed` for mid-work, `balanced` for everyday pre-merge, and `quality` when the cost of a miss dominates, saying why for this diff.
- **Depth posture** — this item is live only when the mode you recommend is `balanced`, since `quality` and `speed` preset depth; under either of those, state the preset as a fact the way the documentation seats' fixed depth is stated, and name the `speed` security carve-out when it applies. Under `balanced`: diff-first for code seats unless a trigger above fires, naming each escalated seat and its trigger ("I touched the auth middleware, so security reads full files; everything else diff-first").
- Documentation depth is stated as fact and never offered, and the code board's depth posture is never carried onto documentation seats.
- Gate 1 is one `AskUserQuestion` with the recommended shape first, and the pick feeds gate 2.

### Gate 2 — board shape

- Put the board shape to the user as gate 2 before spawning anything.
- In `balanced` with a small self-contained diff, offer a lite board: Security solo, Correctness+Reliability merged, Maintainability+Performance merged, all diff-first. A merged seat spawns at the highest `balanced` tier among the categories it carries — Correctness+Reliability at Opus, Maintainability+Performance at Sonnet — passed as an explicit `model`, since a frontmatter pin covers only its own seat.
- Never recommend lite for a large or security-sensitive diff.
- In `quality` or `speed`, never consolidate seats: `quality` exists to buy recall and merged lenses give up exactly that, while `speed` already takes its savings from tier and depth — five parallel seats cost no extra wall-clock.
- For a documentation board, the floor settles composition and depth already, so gate 2 confirms only whether the board sits.
- In `balanced` only, finalize depth per running code seat rather than board-wide; documentation seats do not appear in that item.
- In `quality` or `speed` at gate 2, restate the preset tier and depth as facts and ask only which seats run.
- Which code seats may be dropped is governed by the "nothing to look at" bar in Step 2; gate 2 confirms the set, it does not relax the bar.
- Gate 2 is one `AskUserQuestion` carrying one question, a one-line reason per shape, recommendation first.

## Step 5 — Spawn the seats

### Mechanics

- Spawn by `review-*` subagent type, against whichever matrix governs the seat.
- Spawn all selected seats in a single message, each in the foreground with `run_in_background: false`, because a background subagent silently loses LSP.
- In `balanced`, the frontmatter pins already encode that column, so spawning by type is enough.
- In `quality` or `speed`, pass each seat's `model` explicitly, because skipping it makes a `speed` board silently run Opus seats.
- When setting tiers, correctness and security never go below Sonnet, and maintainability never earns Opus.
- When the agent definitions are not installed, fall back to `general-purpose`, set `model` explicitly in every mode, and give the depth in the prompt.
- Instruct every agent to be read-only: never modify, create, or delete a file.
- Every seat holds `Bash`; read-only is the spawn prompt's instruction, not a property of the tool grant.
- For a lite-board merged seat, pass both checklist paths, instruct the seat to apply both, and keep each finding's prefix tied to its own category.

### The prompt contract

Every seat prompt contains all eight items:

1. **Scope** — the exact scope: the git commands that reproduce the diff, the base ref, and the changed files.
2. **Intent** — the intent context, in a sentence or two.
3. **Stack** — the stack snapshot, plus an instruction to confirm it in seconds; documentation seats get the process surface instead.
4. **Checklists** — its checklist and `references/output-format.md`, by absolute path, to be read before reviewing.
5. **Depth** — the read depth stated explicitly, never left to the agent.
6. **Evidence bar** — `file:line`, an excerpt, and a concrete failure scenario; or quoted text plus a named reader path. An empty findings list is a fine result; never invent findings to look busy.
7. **Exclusions** — do not flag auto-fixes, subjective style, or pre-existing issues unless the change worsens them, and then say so. For documentation seats, the pre-existing exclusion never excludes reading untouched neighbors, because a contradiction the change created lives in the file it did not open.
8. **Output** — return findings per `references/output-format.md`, IDs prefixed by category, as the final message, with severity `critical | high | medium | low` and confidence `high | medium | low`. The `### Actions` section is not optional, because it separates a seat that found nothing from one that looked at nothing. A mechanically checkable claim arrives as the command and its literal output, never prose describing the result.

## Step 6 — Triage as chair

Once all reviewers have returned you become the chair, and triage is judgment, not summary.

1. **Dedupe across lenses** — keep the most severe categorization and note the agreement, because independent convergence is evidence of validity.
2. **Read every seat's `### Actions` before its findings**, as evidence rather than reassurance.
   - Run the residual check: read each command against the conclusion drawn from it, because a seat can run the right command and misread its output.
   - Judge an attempt entry by whether those were the right artifacts; `not attempted` is information, not a defect.
   - When a section is missing entries, name that seat in the report as unevidenced.
   - When you spot a defect while reading Actions, file it as a `CHR` finding through the normal slots.
   - Never convert a seat's Actions into a coverage claim of your own.
3. **Judge each finding from your own context** and deep-verify nothing yet.
   - When a finding alarms you, open the code for a quick look; otherwise trust your read.
   - When reviewing work you did not author, lean on the evidence and let the thin spots fall to Plausible.
4. **Render one verdict per finding, with reasoning** — **Confirmed**, **Plausible**, **Rejected**.
   - Have the spine to reject, and say why, because a pass that confirms everything was not a triage pass.
   - When rejecting a documentation finding, its "Noted" line quotes the reviewer's own scenario alongside your reason.
5. **Give each surviving finding one disposition**, decided by where the defect came from, not by how big the fix looks.
   - A finding this work introduced or worsened is fixed in this session, and size never moves it out, because this session holds the context that makes the fix cheapest.
   - A pre-existing bug needing investigation, or a real design tradeoff, gets a `/capture-task` recommendation naming which of the two — those are the only cases.
   - Rejected and confirmed-low findings land under "Not addressing", one line each, and that line is the reason rather than a restatement of the title.
   - Once the dispositions are formed, order the fix-now list; have a take.

## Step 7 — Report and wait

- Produce Part B's two artifacts in order: write the full report — every seat's verbatim Actions, per-finding evidence, the residual check already performed — to `.ai/review/<YYYY-MM-DD>-<slug>.md`, then print the slim decision-layer report, which points at that file for every detail.
- Print the dispositions Step 6 already formed as a plan — fixing, capturing, not addressing — and never as a menu of per-finding questions. The triage is done by the time this step runs; asking the human which findings to address discards it and makes them recompute from the table, which is how a finding the disposition rule called mandatory gets deferred by a shorthand.
- Every entry under "Not addressing" carries its one-line reason, every `/capture-task` entry names which of the two capture cases it is, and a "Fixing" entry carries a ground whenever its call is not obvious from the title. Those reasons are the only surface the human can disagree with; without them a batch confirm is a rubber stamp.
- Disclose it in the finding's ground, never as a question, when a proposed fix would touch a decision the human already made — the board sits after the human QA gate on every path into it, so no finding here is theirs to adjudicate.
- Close with the plan's single yes/no, per the output-format closing line — "That is the plan — any objections?"

> [!WARNING]
> Fix nothing before the human answers. The report ends the turn.

- When the human objects to part of the plan, capture the one-line why as they give it, because nobody can reconstruct it later.

## Step 8 — Verify, fix, and commit the fixes

- For each finding the confirmed plan fixes, verify it against the actual code first: reproduce it, trace it to root cause, and fix the source rather than the paraphrase.
- When one does not hold up, say so and skip it rather than inventing a fix.
- Apply fixes for exactly the plan as confirmed — the objections the human raised are amendments to it, and nothing outside it rides along.
- When a fix lands in a gated file, load that gate's skill first.
- After fixing, run the relevant checks; a fix without a passing check is reported as unverified, not as done.
- Commit the fixes, staged by explicit path, each message naming the finding it closes. These are the only commits a board produces, because a commit records a change to the code and nothing else about the review is one.
- On the default branch, `CLAUDE.md`'s commit rule applies as everywhere else: branch first, then commit there. A board is not a licence to commit to `main`, and leaving the fixes staged instead strands them with no SHA for the outcome line below.

## Step 9 — Close out the review locally

- Append the outcome to the full report file — one line per finding: ID, severity, verdict, title, and the outcome, which is the fix SHA, the task path, the user's verbatim reason for declining, or rejected. Do this even when the selection was `none`, because a board that found things and changed nothing is exactly the run whose reasoning goes missing first.
- A finding captured as a task counts as dismissed, and its line carries the task path.
- **The review stays on this machine.** The full report file lives in the gitignored `.ai/` namespace, and the board's deliberation — verdicts, Actions, dismissal reasons — reaches no commit message, PR body, or other outbound surface on its own. A branch carries the work, not the argument about the work. The one thing that does cross is a fix commit's subject naming the finding it closes: that labels a code change rather than reporting a review, which is why Step 8 asks for it.
- **When the user does ask for board content on an outbound surface, scrub it first.** Replace every literal credential, token, and PII value with its match count and `file:line`, and leave the raw line in the report file. A security seat's secret grep can hit a real value in a path no deny rule covers, and the evidentiary property — the command and what it returned — survives a count and a location intact.
- Locality costs something, accepted deliberately, and the loss is routine rather than exotic: the report dies with its worktree. `scripts/setup/gwt-remove.sh` is the cleanup `ship-pr` hands the user after a merge, and `git worktree remove` takes the gitignored `.ai/` tree with it — after which "re-run the board" is not a recovery, because the branch is gone and the diff is empty. When a review's reasoning needs to outlive the branch, copy the report out of the worktree before cleanup; when it needs to reach the remote, that is a compliance posture rather than a template default, and `project-init/references/fork-points.md` carries the add-back.
- When a remote exists, close with a one-line `/ship-pr` offer; never invoke it yourself. On the default branch, skip the offer — `ship-pr` refuses there.
