# Agent Skills Overview

## capture-task

Quick-captures a unit of work (bug, feature idea, or chore) as a structured task file at `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`, built from `capture-task/assets/task-template.md` with every unknown kept explicit as `TBD (needs grilling)` rather than invented. No interviewing: it mines the current conversation for context (error text, file paths, decisions already made) so a fresh session can pick the task up cold with `/discuss`.

Suggest it once when the user voices an actionable aside, reports something broken mid-flow, or drifts into "we should do X later" territory. Never auto-file; if the user doesn't bite, drop it.
