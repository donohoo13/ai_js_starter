# Review Board Output Formats

Two formats live here: what each reviewer agent returns (Part A), and what the chair presents to the human (Part B). Both are exact templates; consistency is what makes five parallel reports mergeable and lets the human scan any report from any session the same way.

## Part A: Reviewer agent findings format

Each reviewer returns its findings as its final message, using this structure. IDs use the agent's category prefix (`COR`, `SEC`, `REL`, `MNT`, `PRF`) numbered from 1.

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

Severity calibration, so five agents rate on one scale:

- **critical**: exploitable security hole, data loss, or a defect that breaks the feature's core purpose in production.
- **high**: wrong behavior on realistic inputs, a leak or race that will surface under normal load, a missing auth check on a privileged path.
- **medium**: wrong behavior on edge cases, missing error handling on failable operations, a maintainability problem that actively invites bugs (e.g. duplicated business rule).
- **low**: worth fixing but harmless today; deferred cleanup, missing test for an unlikely path, minor observability gap.

Confidence is about the finding's validity, not its severity: `high` means the failure scenario is verifiable from the code alone; `medium` means it depends on runtime or config assumptions; `low` means it depends on intent or domain knowledge the agent does not have.

## Reviewer toolcraft

Applies to every seat, whatever the category. When the `LSP` tool is active (it needs a code-intelligence plugin, so it may be absent), prefer it to text search for symbol work: find-references on a changed function or type reaches every real consumer, and go-to-definition verifies the contract you think you are reviewing against — grep only finds matching strings. Fall back to Grep when LSP is inactive.

## Part B: Consolidated report format (chair)

The chair presents exactly this structure to the human. Findings appear grouped by verdict, and within each group ordered by severity. The verdict is the chair's context-based judgment, not the result of deep-verifying every finding: **Confirmed** means it matches the chair's understanding of the change, **Plausible** means credible but unsettled from context, **Rejected** means it contradicts what the chair knows or is off-task. The "Chair's read" line carries that judgment; deep confirmation of a finding happens later, in Step 5, only for the findings the user chooses to address.

```markdown
# Review Board Report

**Scope**: <base>..<head> (+ uncommitted), N files, +X/-Y lines
**Intent**: <one-line summary of what the change is supposed to do>
**Board**: 5 reviewers, N raw findings, M after dedupe → C confirmed / P plausible / R rejected

## Verdict summary

| ID    | Sev      | Verdict   | Title                             | Location             |
| ----- | -------- | --------- | --------------------------------- | -------------------- |
| SEC-1 | critical | Confirmed | SQL built by string interpolation | `src/db/users.ts:47` |
| ...   |          |           |                                   |                      |

## Confirmed

### [SEC-1] <title> — critical

<Evidence, failure scenario, and suggested fix from the finding.>
**Chair's read**: <your judgment in 1-2 lines — why it matches your understanding of the change. If multiple agents independently flagged it, say so; if a finding alarmed you and you spot-checked the code, say what you found.>

## Plausible

### [REL-2] <title> — medium

<Finding content.>
**Chair's read**: <why you cannot settle it from context, and what would settle it.>

## Rejected

- **[MNT-3] <title>** — <one-line reason it does not hold, e.g. "the null case is guarded at the call site, `api/routes.ts:12`".>

## Process notes

<Only if applicable: mixed unrelated changes, missing tests as a pattern, scope oddities. Omit the section when empty.>

## Board recommendation

<Your ordered take: fix these before merge, defer those, here is why. 3-6 lines.>
```

Close the report by asking the human what to address, and then stop: "Which findings should I address? Reply with IDs (e.g. `SEC-1 REL-2`), `all confirmed`, or `none`."
