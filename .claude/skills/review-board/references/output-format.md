# Review Board Output Formats

Two formats live here: what each reviewer agent returns (Part A), and what the chair presents to the human (Part B). Both are exact templates; consistency is what makes parallel reports mergeable across both seat sets and lets the human scan any report from any session the same way.

## Part A: Reviewer agent findings format

Each reviewer returns its findings as its final message, using this structure. IDs use the agent's category prefix — `COR`, `SEC`, `REL`, `MNT`, `PRF` on the code board, `FLW`, `COH`, `ADV` on the documentation board — numbered from 1.

```markdown
## <Category> review

Scope reviewed: <base ref>..<head>, N files
Files examined in full: <list>

### [SEC-1] <Short imperative title, e.g. "SQL built by string interpolation in user search">

- **Severity**: critical | high | medium | low
- **Confidence**: high | medium | low
- **Location**: `src/db/users.ts:47`
- **Evidence**: `` `db.query(`SELECT * FROM users WHERE name = '${q}'`)` ``
- **Failure scenario**: Request with `q = "' OR 1=1 --"` returns every row in the table; with a stacked query it can mutate data.
- **Suggested fix**: Use a parameterized query (`db.query('SELECT * FROM users WHERE name = $1', [q])`).

### [SEC-2] ...

### No further findings

<If the category is clean, say so explicitly: "No findings. Checked: <the checklist areas you covered>." An empty list with evidence of coverage is a valid, useful result.>
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

The chair presents exactly this structure to the human. It is ordered by what the human has to do with it rather than by where the information came from: the decisions the board is asking for come first, in plain language, each one ending in a question with the chair's recommendation attached, and the evidence backing them is appended below for the reader who wants to check the reasoning. **The human answers the closing question from the first screen, without reading a code excerpt** — that is the property the whole layout exists to hold, and every judgment about what goes above the evidence is made against it.

The verdict is the chair's context-based judgment, not the result of deep-verifying every finding: **Confirmed** means it matches the chair's understanding of the change, **Plausible** means credible but unsettled from context, **Rejected** means it contradicts what the chair knows or is off-task. Deep confirmation happens later, in Step 5, only for the findings the user chooses to address.

```markdown
# Review Board Report

**Scope**: <base>..<head> (+ uncommitted), N files, +X/-Y lines
**Intent**: <one-line summary of what the change is supposed to do>
**Board**: N reviewers (name the seats), N raw findings, M after dedupe → C confirmed / P plausible / R rejected

## Verdict summary

| ID    | Sev      | Verdict   | Title                             | Location             |
| ----- | -------- | --------- | --------------------------------- | -------------------- |
| SEC-1 | critical | Confirmed | SQL built by string interpolation | `src/db/users.ts:47` |
| ...   |          |           |                                   |                      |

## Your call

<One line naming the order you would take these in, when order matters. Omit when it does not.>

- **[SEC-1] critical** — <what is wrong and what it costs, in plain language, no code.> I recommend <the action> because <one-line reason>. <Direct question naming the alternative>?
- **[REL-2] medium, plausible** — <what the reviewer believes is wrong, and what you could not settle from context.> I recommend <verifying it in Step 5 / shipping as-is> because <one-line reason>. <Direct question naming the alternative>?

## Noted, no decision needed

- **[MNT-3]** Rejected — <one-line reason it does not hold, e.g. "the null case is guarded at the call site, `api/routes.ts:12`">.
- **[PRF-2]** Confirmed, low — <one line: what it is, and why it does not need the human's attention now>.

## Process notes

<Only if applicable: mixed unrelated changes, missing tests as a pattern, scope oddities. Omit the section when empty.>

## Evidence

<One block per "Your call" finding, same order. A "Noted" finding gets no block.>

### [SEC-1] <title>

- **Location**: `src/db/users.ts:47`
- **Evidence**: <the code excerpt from the finding>
- **Failure scenario**: <from the finding>
- **Suggested fix**: <from the finding>
- **Chair's read**: <how you judged it — what matches your understanding of the change, whether agents converged on it independently, what a spot-check found if the finding alarmed you. For a Plausible finding, what would settle it.>
```

Four rules keep the shape honest while you fill it in:

- **Every "Your call" bullet ends in a question mark**, and carries a recommendation with its reason. A finding the human can neither answer nor act on belongs in "Noted" as a one-liner instead; the Step 6 record commit carries the full set either way, so leaving a finding out of the report loses nothing.
- **Plain language above the evidence.** No code excerpts, `file:line` pointers, or stack traces in "Your call" — the ID and the verdict table already carry the pointer, and the appendix carries the proof.
- **Order by what to do first**, and by severity where no fix order applies. That holds within each section; the verdict table stays the place to scan the whole set at once.
- **Length lives below the fold.** Header, table, and decision bullets stay inside roughly one screen; everything that grows with finding count grows in the evidence appendix.

Close the report by asking the human what to address, and then stop: "Which findings should I address? Reply with IDs (e.g. `SEC-1 REL-2`), `all confirmed`, or `none`."
