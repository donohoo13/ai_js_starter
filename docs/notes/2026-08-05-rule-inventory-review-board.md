# Rule inventory — `review-board/SKILL.md`

Extracted for the v1.7.0 restatement pass. **This is the specification a rewrite builds from.** Format: `ID | WHEN | WHAT`, flags as in the sibling inventories. Extracted at 5,410 words.

## Scope and context

- `R-01` | Metadata | `name: review-board`; triggers: review code/branch/diff/PR, security review, standards check, pre-merge/pre-PR, "second opinion", doc/process/runbook/prompt/agent-instruction review `[VERBATIM]`
- `R-02` | Metadata | `argument-hint: '[quality|balanced|speed] [PR number, commit range, or paths to scope the review]'` `[VERBATIM]`
- `R-03` | Throughout | Each seat gets one category, its own checklist, a full context budget; chair triage filters overproduction `[WHY: focused reviewers catch what one general pass misses]`
- `R-04` | Throughout | Reuse session knowledge for facts; distrust session comfort for judgment `[VERBATIM]`
- `R-05` | Every invocation | Snapshot branch, default branch, committed delta vs merge-base, `git status --short | head -50` `[VERBATIM]`
- `R-06` | Arg 1 is a mode keyword | Set the board mode; everything after is scope
- `R-07` | No mode keyword | Send mode and depth to gate 1; never a silent default
- `R-08` | Arg is a PR number | `gh pr diff <n>` / `gh pr view <n>`
- `R-09` | Arg is a commit range | Use it directly
- `R-10` | Args are paths | Restrict the default scope to those paths
- `R-11` | No scope args | Branch vs merge-base with the default branch, plus `git diff HEAD` and untracked files
- `R-12` | Resolving the default branch | origin/HEAD with the remote prefix stripped, falling back to `main`; local name, never `origin/<name>` `[WHY: unpushed default-branch commits would widen scope]`
- `R-13` | Scope resolves to an empty diff | Say so and ask what they meant; never review the whole repo unasked
- `R-14` | Before spawning | Establish intent from the PR description, commit messages, or a matching `docs/tasks/` file; ask if unclear `[WHY: review against unknown requirements wastes a board]`
- `R-15` | A code change | Snapshot the stack: `package.json`, runtime config, `tsconfig.json`. Snapshot, not audit `[WHY: runtime decides which findings are real]`
- `R-16` | A documentation-heavy change | Take the process surface instead: which flow changes, who reads it, which neighboring documents cite it
- `R-17` | The diff mixes unrelated changes | Record it for the report's Process notes
- `R-18` | Gathering context | Session knowledge first when you authored the change; otherwise look

## Seats

- `R-19` | Working Step 2 | Settle the seat set first, then the dials `[ORDER]`
- `R-20` | Choosing dials | Mode presets the code board's two dials; the documentation board has one, its depth being fixed
- `R-21` | Under budget pressure | Cut depth before tier `[WHY: full-file reads dominate cost; tier buys the judgment the board exists for]`
- `R-22` | Any mode | Apply the mode dial table
- `R-23` | Recommending `speed` | A screen, not a proof: freely for mid-work and small diffs, never pre-merge on expensive-miss changes
- `R-24` | Both gates | Lead with a recommendation reasoned from this change; one that reads identically on any diff is a default in costume
- `R-25` | Across modes | Every category in scope stays covered, the chair runs on the session model, the human gate holds
- `R-26` | The subject is a documented process | Seat three documentation reviewers instead of the five code seats `[WHY: the document is the behavior; nothing executes it]`
- `R-27` | Documentation board sits | Use the documentation matrix for prefix, tier per mode, checklist, subagent type
- `R-28` | Documentation board sits | All three seats run; neither dropping one nor consolidating them is available `[WHY: traversal, agreement, exploitation each find what the others cannot]`
- `R-29` | Documentation board | Seat-skipping is a code-board rule and does not reach here `[WHY: "nothing to red-team" retires the highest-yield seat first]`
- `R-30` | Documentation board, every mode | Full changed files; no mode preset overrides it `[WHY: the defect sits in the untouched sentence beside the change]`
- `R-31` | A heavily cross-referencing corpus | Coherence reads wider than the changed files
- `R-32` | The document tells a reader to handle credentials, customer data, or outbound transfer | Seat security too, making four rather than three, with a narrow read
- `R-33` | The change mixes code and documentation | Seat every documentation seat plus each code seat with a surface
- `R-34` | The board looks unnecessary | Recommend skipping through gate 2; never decide it. Only for edits changing no instruction to any reader, and say which
- `R-35` | The user declines | Record it as a declined board, not one that ran `[WHY: /ship-pr must report truthfully]`

## Depth and escalation

- `R-36` | Code seats in `balanced` | Diff-first by default: work from the diff, open surrounding code only to confirm a suspected finding
- `R-37` | Trigger: code not authored this session | Escalate that seat to full files
- `R-38` | Trigger: cross-module contract changes | Escalate to full files
- `R-39` | Trigger: security-sensitive surface | Escalate the security seat only
- `R-40` | Trigger: tangled or oversized diff | Escalate to full files
- `R-41` | Trigger: concurrency or resource lifecycles | Escalate reliability specifically
- `R-42` | "Feels important" | Not a trigger; escalation is per-seat with the trigger named
- `R-43` | `quality` and `speed` | Preset depth — full files everywhere, diff-first everywhere — so these triggers do not fire

## Gates

- `R-44` | An explicit mode keyword | Run it as given and skip gate 1
- `R-45` | An explicit mode that looks wrong | Say so once at gate 2; the user's answer stands
- `R-46` | No mode keyword | After settling seats, open with two recommendations, each reasoned from this change
- `R-47` | Gate-1 mode | Lean `speed` for mid-work, `balanced` for everyday pre-merge, `quality` when miss cost dominates; say why this diff
- `R-48` | Gate-1 depth | Name each escalated seat and its trigger; state documentation depth as fact, never offer it, never carry the posture onto them
- `R-49` | Gate 1 | One `AskUserQuestion`, recommended shape first; the pick feeds gate 2
- `R-50` | Code board sits | Use the code matrix; five members in `.claude/agents/` with checklists in `references/`
- `R-51` | Every mode | The chair runs on the session model `[WHY: triage is where the board's value rests]`
- `R-52` | Setting tiers | Correctness and security never below Sonnet; maintainability never earns Opus
- `R-53` | Spawning | By `review-*` subagent type, against whichever matrix governs the seat
- `R-54` | Every seat holds `Bash` | Read-only is the spawn prompt's instruction, not a property of the tool grant
- `R-55` | `balanced` | Frontmatter pins already encode that column; spawning by type is enough
- `R-56` | `quality` or `speed` | Pass each seat's `model` explicitly `[WHY: skipping it makes a speed board silently run Opus seats]`
- `R-57` | Agent definitions not installed | Fall back to `general-purpose`, set `model` explicitly in every mode, give depth in the prompt
- `R-58` | Before spawning | Put the board shape to the user as gate 2
- `R-59` | `balanced` plus a small self-contained diff | Offer a lite board: Security solo, Correctness+Reliability, Maintainability+Performance, all diff-first
- `R-60` | A large or security-sensitive diff | Never recommend lite
- `R-61` | `quality` or `speed` | Never consolidate seats
- `R-62` | Documentation board at gate 2 | The floor settles composition and depth; confirm only whether the board sits
- `R-63` | Every mode, code seats | Skip only when a category has no surface; the bar is "nothing to look at", never confidence. In doubt, run them all
- `R-64` | `balanced` only | Finalize depth per running code seat, not board-wide; documentation seats do not appear
- `R-65` | Gate 2 | One `AskUserQuestion`, one question, a one-line reason per shape, recommendation first
- `R-66` | `quality` or `speed` at gate 2 | Restate preset tier and depth as facts; ask only which seats run

## Spawn contract

- `R-67` | Spawning | All selected seats in a single message, each foreground with `run_in_background: false` `[WHY: a background subagent silently loses LSP]` `[VERBATIM]`
- `R-68` | Every agent | Instruct it to be read-only: never modify, create, or delete a file
- `R-69` | A lite-board merged seat | Pass both checklist paths, apply both, keep each finding's prefix tied to its category
- `R-70` | Prompt item 1 | The exact scope: git commands to reproduce the diff, the base ref, the changed files
- `R-71` | Prompt item 2 | The intent context, in a sentence or two
- `R-72` | Prompt item 3 | The stack snapshot, plus an instruction to confirm it in seconds; documentation seats get the process surface instead
- `R-73` | Prompt item 4 | Its checklist and `references/output-format.md`, by absolute path, read before reviewing
- `R-74` | Prompt item 5 | The read depth stated explicitly, never left to the agent
- `R-75` | Prompt item 6 | Evidence bar: `file:line`, excerpt, concrete failure scenario; or quoted text plus a named reader path
- `R-76` | Prompt item 6 | An empty findings list is a fine result; never invent findings to look busy
- `R-77` | Prompt item 7 | Do not flag auto-fixes, subjective style, or pre-existing issues unless the change worsens them — then say so
- `R-78` | Prompt item 7, documentation seats | The pre-existing exclusion never excludes reading untouched neighbors `[WHY: a contradiction the change created lives in the file it did not open]`
- `R-79` | Prompt item 8 | Return findings per `references/output-format.md`, IDs prefixed by category, as the final message
- `R-80` | Prompt item 8 | The Actions section is not optional `[WHY: separates a seat that found nothing from one that looked at nothing]`
- `R-81` | Prompt item 8 | A mechanically checkable claim arrives as the command and its literal output, never prose describing the result

## Triage

- `R-82` | All reviewers returned | You become the chair; triage is judgment, not summary
- `R-83` | Step 1 | Dedupe across lenses, keep the most severe categorization, note the agreement `[WHY: independent convergence is evidence of validity]`
- `R-84` | Step 2 | Read every seat's Actions before its findings, as evidence rather than reassurance
- `R-85` | Step 2 | Residual check: read each command against the conclusion drawn from it `[WHY: a seat can run the right command and misread its output]`
- `R-86` | Step 2 | Judge an attempt entry by whether those were the right artifacts; `not attempted` is information, not a defect
- `R-87` | A section missing entries | Name that seat in the report as unevidenced
- `R-88` | A defect spotted while reading Actions | File it as a `CHR` finding through the normal slots
- `R-89` | Reporting Actions | Never convert a seat's Actions into a coverage claim of your own
- `R-90` | Step 3 | Judge each finding from your own context; deep-verify nothing yet
- `R-91` | A finding that alarms you | Open code for a quick look; otherwise trust your read
- `R-92` | Reviewing work you did not author | Lean on evidence and let thin spots fall to Plausible
- `R-93` | Step 4 | One verdict per finding with reasoning: **Confirmed**, **Plausible**, **Rejected** `[VERBATIM]`
- `R-94` | Step 4 | Have the spine to reject, and say why `[WHY: a pass that confirms everything was not a triage pass]`
- `R-95` | Rejecting a documentation finding | Its "Noted" line quotes the reviewer's own scenario alongside your reason
- `R-96` | Step 5 | One disposition per surviving finding, decided by where the defect came from, not how big the fix looks
- `R-97` | A finding this work introduced or worsened | Fix in this session; size never moves it out `[WHY: this session holds the context that makes the fix cheapest]`
- `R-98` | A pre-existing bug needing investigation, or a real design tradeoff | Recommend `/capture-task` and name which of the two — those are the only cases `[VERBATIM]`
- `R-99` | Rejected and confirmed-low findings | "Noted, no action", one line each
- `R-100` | Dispositions formed | Order the fix-now list; have a take

## Report, fixes, record

- `R-101` | Step 4 | Present per `references/output-format.md` Part B: decisions first, evidence below, answerable from the first screen
- `R-102` | A bullet the human can neither answer nor act on | Put it in "Noted" as a one-liner
- `R-103` | Every `/capture-task` recommendation | Name its ground
- `R-104` | Report delivered | Stop and ask: "Reply with finding IDs, `all confirmed`, or `none`." `[VERBATIM]`
- `R-105` | Before the user selects | Fix nothing; the report ends the turn
- `R-106` | Step 5, per selected finding | Confirm against actual code first: reproduce, trace to root cause, fix the source not the paraphrase
- `R-107` | A selected finding that does not hold up | Say so and skip it rather than inventing a fix
- `R-108` | Step 5 | Apply fixes for exactly the selected findings and nothing else
- `R-109` | A fix landing in a gated file | Load that gate's skill first
- `R-110` | After fixing | Run the relevant checks; a fix without a passing check is reported as unverified, not done
- `R-111` | Non-default branch, selection resolved including `none` | Commit fixes first, then an always-empty record commit as the last commit
- `R-112` | Writing the record | `git commit --allow-empty -F - <<'RECORD'` … `RECORD`; quoted delimiter, never `-m` `[VERBATIM][WHY: Actions contains backticks; both failures mimic success]`
- `R-113` | Record subject | `review: board (<mode>) — <N> findings, <X> addressed, <Y> dismissed, <Z> rejected` `[VERBATIM]`
- `R-114` | Record body | One line per finding: ID, severity, verdict, title, outcome — with fix SHA, task path, the user's verbatim reason, or rejected
- `R-115` | Record body | Carry every seat's Actions through verbatim, never summarized `[WHY: a clean board must leave evidence it ran]`
- `R-116` | Record close | Trailers `Review-Mode:` and `Review-Scope: <base>..<head>`; `/ship-pr` finds records with `git log <default>..HEAD --grep='^review:'` `[VERBATIM]`
- `R-117` | Record subject | The stated point-of-use exception to the 50-char commit rule; the `review:` prefix is the grep contract
- `R-118` | A declined confirmed or plausible finding | Capture the one-line why at selection time `[WHY: nobody can reconstruct it later]`
- `R-119` | A finding captured as a task | Rides the `dismissed` count; its body line carries the task path
- `R-120` | The record commit | Always empty, always last `[WHY: one shape to parse; it pins the record to the reviewed tree]`
- `R-121` | On the default branch | Skip the record commit; the report stays conversational
- `R-122` | The branch may be rewritten | Warn that an interactive rebase silently drops the empty record commit
- `R-123` | A remote exists | Close with a one-line `/ship-pr` offer; never invoke it

## Matrices — reproduce exactly

Documentation seats:

| Agent           | Prefix | `quality` | `balanced` | `speed` | Checklist                   | Subagent type        |
| --------------- | ------ | --------- | ---------- | ------- | --------------------------- | -------------------- |
| Flow continuity | `FLW`  | Opus      | Opus       | Sonnet  | `references/flow.md`        | `review-flow`        |
| Coherence       | `COH`  | Opus      | Sonnet     | Haiku   | `references/coherence.md`   | `review-coherence`   |
| Adversarial     | `ADV`  | Opus      | Opus       | Sonnet  | `references/adversarial.md` | `review-adversarial` |

Code seats:

| Agent                     | Prefix | `quality` | `balanced` | `speed` | Checklist                       | Subagent type            |
| ------------------------- | ------ | --------- | ---------- | ------- | ------------------------------- | ------------------------ |
| Correctness               | `COR`  | Opus      | Opus       | Sonnet  | `references/correctness.md`     | `review-correctness`     |
| Security                  | `SEC`  | Opus      | Opus       | Sonnet  | `references/security.md`        | `review-security`        |
| Reliability               | `REL`  | Opus      | Sonnet     | Haiku   | `references/reliability.md`     | `review-reliability`     |
| Maintainability           | `MNT`  | Sonnet    | Haiku      | Haiku   | `references/maintainability.md` | `review-maintainability` |
| Performance \& operations | `PRF`  | Opus      | Sonnet     | Haiku   | `references/performance.md`     | `review-performance`     |

Verified at extraction: every frontmatter `model:` pin in `.claude/agents/review-*.md` matches its seat's `balanced` column, all eight.

## Literal strings a rewrite must not alter

Prefixes `COR SEC REL MNT PRF FLW COH ADV CHR`. Subagent types and checklist paths as in the matrices, plus fallback `general-purpose`. Mode keywords `quality` `balanced` `speed`. The record subject, both trailers, the `/ship-pr` grep command, the heredoc with its quoted `RECORD` delimiter. Verdicts `Confirmed` `Plausible` `Rejected`. Report sections `## Verdict summary`, `## Your call`, `## Noted, no decision needed`, `## Actions`, `## Process notes`, `## Evidence`, reviewer-side `### Actions`. The literal `not attempted`. The closing ask. `run_in_background: false`. Severity `critical | high | medium | low`; confidence `high | medium | low`.

## Contradictions found at extraction

1. **Mode-invariance versus the lite board** — resolved in v1.7.0 (`R-25`).
2. **Escalation availability in `speed`** — resolved in v1.7.0 (`R-43`).
3. **"Three documentation seats" versus the security seat** — resolved in v1.7.0 (`R-32`).
4. **Heading order versus "settle this before the dials"** — resolved by a signpost rather than a section move; the heading still lists the dials first.
