# Review Board Output Formats

- [Part A: Reviewer agent findings format](#part-a-reviewer-agent-findings-format)
- [Reviewer toolcraft](#reviewer-toolcraft)
- [Part B: Consolidated report format (chair)](#part-b-consolidated-report-format-chair)

Two formats live here: what each reviewer agent returns (Part A), and what the chair presents to the human (Part B). Both are exact templates; consistency is what makes parallel reports mergeable across both seat sets and lets the human scan any report from any session the same way.

## Part A: Reviewer agent findings format

Each reviewer returns its findings as its final message, using this structure. IDs use the agent's category prefix — `COR`, `SEC`, `REL`, `MNT`, `PRF` on the code board, `FLW`, `COH`, `ADV` on the documentation board — numbered from 1. The chair adds findings of its own under `CHR`, which is how a defect it spots while reading Actions reaches the report instead of dying in triage; a `CHR` finding fills every slot a seat's finding does, evidence block included.

```markdown
## <Category> review

Scope reviewed: <base ref>..<head>, N files

### [SEC-1] <Short imperative title, e.g. "SQL built by string interpolation in user search">

- **Severity**: critical | high | medium | low
- **Confidence**: high | medium | low
- **Location**: `src/db/users.ts:47`
- **Evidence**: `` `db.query(`SELECT * FROM users WHERE name = '${q}'`)` ``
- **Failure scenario**: Request with `q = "' OR 1=1 --"` returns every row in the table; with a stacked query it can mutate data.
- **Suggested fix**: Use a parameterized query (`db.query('SELECT * FROM users WHERE name = $1', [q])`).

### [SEC-2] ...

### Actions

<Always present, findings or not. **Report what you did, never a verdict about absence.** "I checked X and it is fine" is the exact form that ships a wrong answer behind confident prose: the reader cannot audit it, and neither can you.

For anything mechanically checkable, the entry is the command and its literal output — `` `python3 -c "print(len(open('f').read()))"` → `1112` `` — never a sentence describing the result. Compute rather than reason about a number you could measure; a measurable fact you argued your way to is the single highest-risk line you can write.

A number you could measure is never a narrative entry. If a claim has a command, it takes the command form — reasoning your way to a count you could have run is the single highest-risk line in your report.

For anything genuinely not mechanically checkable, the entry names the artifacts the work touched — the files opened, the exact terms greped, the specific text quoted, what you tried to break and how it resisted — and stops there. **State no conclusion about the area's state.** "I traced every consumed input against its producer, and each had one" is the banned claim in a different mood; "I traced these six inputs, listed, against `SKILL.md` and `output-format.md`" is an entry a reader can disagree with.

**One entry per top-level section of your checklist, always** — a command, an artifact-named attempt, or the literal words `not attempted`. Never omit a section: an omission you declare is auditable, and an omission that looks like brevity is indistinguishable from work nobody did. `not attempted` is a good entry and costs you nothing.

An empty findings list is a good result when the Actions section shows the work behind it.>
```

Severity calibration, so every seat rates on one scale:

- **critical**: exploitable security hole, data loss, or a defect that breaks the feature's core purpose in production.
- **high**: wrong behavior on realistic inputs, a leak or race that will surface under normal load, a missing auth check on a privileged path.
- **medium**: wrong behavior on edge cases, missing error handling on failable operations, a maintainability problem that actively invites bugs (e.g. duplicated business rule).
- **low**: worth fixing but harmless today; deferred cleanup, missing test for an unlikely path, minor observability gap.

Confidence is about the finding's validity, not its severity: `high` means the failure scenario is verifiable from the code alone; `medium` means it depends on runtime or config assumptions; `low` means it depends on intent or domain knowledge the agent does not have.

On the documentation board the same scale reads against the process rather than the runtime, since the document is what executes: **critical** is a reader who follows the document and destroys something, or a gate that never fires at all; **high** is a path with no defined next step, a contradiction that sends two readers different ways, or an escape hatch that reaches the outcome the change exists to prevent; **medium** is a gap or stale claim a careful reader recovers from at some cost; **low** is a self-correcting round trip. Confidence carries over unchanged, with "verifiable from the text alone" standing in for "from the code alone".

## Reviewer toolcraft

Applies to every seat, whatever the category. When the `LSP` tool is active (it needs a code-intelligence plugin, so it may be absent), prefer it to text search for symbol work: find-references on a changed function or type reaches every real consumer, and go-to-definition verifies the contract you think you are reviewing against — grep only finds matching strings. Fall back to Grep when LSP is inactive.

## Part B: Consolidated report format (chair)

The chair produces two artifacts, in this order. Splitting them is the design, not a shortcut: the audit trail and the decision surface serve different readers, and printing the audit trail at the decision surface is how a report becomes unreadable.

1. **The full report file**, written to `.ai/review/<YYYY-MM-DD>-<slug>.md` — the gitignored scratch namespace, so it survives the session and never ships. It carries everything: the header, the verdict table, the full per-finding reasoning, every seat's Actions section reproduced whole — never abridged, excerpted, reordered, or paraphrased, because dropping the narrative entries deletes exactly the seats whose work is hardest to fake — the process notes, and an Evidence appendix per finding (location, excerpt, failure scenario, suggested fix, chair's read). A seat that returned no Actions section is named in it as having returned none, its findings marked unevidenced. **The chair performs the residual check before writing this file** — reading each command against the conclusion drawn from it, since a seat can run the right command and misread its output. The close-out step appends the outcome per finding once the plan is confirmed, which makes this file the whole record of the review: what was found, what was done about it, and why anything was declined. It is the only such record, and it never leaves the machine.
2. **The printed report** — the decision layer only, sized so the human answers the closing yes/no from one screen. Nothing is lost by the split; detail moves to where an auditor looks instead of where a decider reads.

The printed report, exactly this structure:

```markdown
# Review Board Report

**Scope**: <base>..<head>, N files, +X/-Y
**Intent**: <one line>
**Board**: <seats, mode> — N raw, M deduped → C confirmed / P plausible / R rejected
**Full detail**: `.ai/review/<file>.md` — verbatim Actions and per-finding evidence; ask for any finding's evidence inline.

## Verdict summary

| ID  | Sev | Verdict | Title | Location |
| --- | --- | ------- | ----- | -------- |

## The plan

**Fixing** <in fix order when order matters, severity otherwise>

- **[ID] severity** — <what is wrong and what it costs, one or two sentences, plain language, no code.> <A one-line ground whenever the call is not obvious from the title, and always when the fix touches something the user decided earlier.>

**Capturing** <omit the whole group when empty>

- **[ID] severity** — <what it is> — <which of the two capture cases it is: a pre-existing bug needing investigation, or a design tradeoff deserving its own decision.>

**Not addressing** <omit the whole group when empty>

- **[ID]** <verdict> — <the one-line reason it is not being addressed.>

## Actions digest

- <seat>: <N sections, M command entries, any literal `not attempted` the seat wrote> — counts and the seat's own words only, never the chair's coverage conclusions.

That is the plan — any objections?
```

Rules that keep the printed report honest and small:

- **The plan is stated, never asked.** Step 6 already gave every surviving finding a disposition, decided by provenance; printing those as per-finding questions throws that work away and hands the human a menu to recompute it from. Say what happens next and take one yes/no. A report that ends by asking which findings to address is a chair that did its triage and then declined to stand behind it.
- **Every "Not addressing" entry carries its reason, and so does any "Fixing" entry whose call is not obvious from the title.** The ground is the whole reviewable surface: a list of IDs under a batch confirm is a rubber stamp, and the adversarial checklist's own rule — an option requiring justification loses to one requiring none — applies to the human as readily as to a reader of any other process. One decision carrying its reasons beats a row of pro-forma questions, but only because the reasons are there to disagree with.
- **No slot exists for a decision the human owns**, because every path into the board runs after the human QA gate: they have already exercised the change and confirmed it does what they meant, and the board's whole subject is what their eyes missed. Where a proposed fix would touch a decision they made earlier, that is disclosed in the finding's ground and never promoted into a question — a chair that notices the reversal can say so in one clause, and a chair that does not notice would not have filled a slot either.
- **Verdict is not a disposition axis.** Never offer selection by verdict or any `all confirmed` shorthand: disposition follows where the defect came from, so a plausible finding this work introduced is fixed while a confirmed pre-existing one may be captured, and a verdict-shaped shortcut silently inverts both.
- **Plain language only above the table's pointers** — no code excerpts, stack traces, or quoted evidence in the printed report. Print a finding's evidence block inline only when the user asks, or when a ground genuinely cannot be stated without the quote.
- **The Actions digest is counts and pointers**, never a summary of what was covered: paraphrasing a seat's Actions into a coverage claim is the exact conversion the contract forbids, so the digest names sizes and the full file carries the words.
- **Order by what to do first**, severity where no fix order applies.
- The verdict is the chair's context-based judgment, not deep verification: **Confirmed** matches the chair's understanding, **Plausible** is credible but unsettled, **Rejected** contradicts what the chair knows — stated with its why, and for a documentation finding quoting the reviewer's own one-line scenario beside it. Deep confirmation happens in the fix step, only for the findings the plan fixes.
