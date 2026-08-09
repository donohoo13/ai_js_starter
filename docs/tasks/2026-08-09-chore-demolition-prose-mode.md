---
type: chore
status: captured
created: 2026-08-09
---

# Decide whether the demolition pass gets a prose mode

## Context

Two payload-wide documentation sweeps have now been forced into `incumbent: extend` for the same reason. The first, `docs/tasks/2026-08-05-chore-payload-accuracy-and-restatement-pass.md`, recorded the gap in its own Risks section and nobody closed it. The second, `docs/tasks/2026-08-09-chore-retire-ui-ux-doc.md`, hit it again and reached the same verdict by citing that precedent.

## Problem

Current behavior: `incumbent:` conflates two different facts — whether the old content dies, and whether `implement-task` runs the demolition pass. The pass is code-shaped end to end. Its connection map is a whole-program typechecker's error set, which markdown does not have; its record explicitly forbids verbatim content and any structural description of what died, which is exactly the transfer a documentation relocation needs; and `implement-task` treats an empty error set as a stop rather than a pass.

So a sweep whose old content genuinely dies has to record `extend`, which is accurate about the mechanism (no pass runs) and misleading about the work (the content did die).

Both sweeps independently improvised the same substitute, which is evidence the shape is real: extract every rule as a line, have the user review and cull the list, then write the new document from the approved list alone — the 2026-08-05 task called this "the restatement method", and the 2026-08-09 task's disposition table is the same instrument. Both also found a mechanical connection map that is not a compiler: a grep for the retired name across the payload, reaching zero.

Desired behavior: unknown, and that is the decision. Either the key grows a third state for prose, or the pass grows a documented prose mode, or the workaround is blessed as correct and written down so a third sweep does not re-derive it.

## Scope

- In scope (must-have): the decision, and whatever it implies for `capture-task/assets/task-template.md`, `grill-engineer`'s spec-it exit, and `implement-task/references/demolition.md`.
- Out of scope (non-goals, named so the task does not expand silently): rewriting the code-path demolition pass. It works and two instances have exercised it.

## Requirements

- Whatever lands accounts for both artifacts the two sweeps invented independently: the reviewed line-level disposition standing in for run 1's record, and a name grep reaching zero standing in for the typechecker's error set.
- The anti-anchoring property is the point of the pass and must survive: the 2026-08-05 method had an agent that never saw the original write the new document from the approved list, which buys what deleting-first buys for code.

## Acceptance criteria

- [ ] A third documentation sweep reads one stated path rather than re-deriving the workaround.
- [ ] Whatever `incumbent:` value such a task records is accurate about both the content and the mechanism, or the key's definition says plainly why one of the two goes unrecorded.

## Dependencies

None.

## Risks / open questions

- [ ] Is a third `incumbent:` state worth the cost? Every value added is a branch in four gates, and documentation sweeps are rare.
- [ ] The blessed-workaround option is cheapest and leaves the key inaccurate on exactly the tasks where its accuracy was the point. Weigh that against the branch cost before defaulting to it.
