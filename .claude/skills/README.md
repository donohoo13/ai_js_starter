# Agent Skills Overview

## review-board

Multi-agent code review: spawns parallel specialist reviewers (correctness, security, reliability, maintainability, performance/operations), each a registered agent in `.claude/agents/review-*.md` with its own checklist in `review-board/references/`, over the branch diff vs `main` plus uncommitted changes (args can scope to a PR number, commit range, or paths). Reviewers are model-tiered by seat: correctness and security run on Opus (misses cost most, findings need intent/threat modeling), reliability/maintainability/performance run on Sonnet (pattern-shaped, cheaper and faster), and the chair runs on the session model. Small self-contained diffs can use a lite three-seat board. The session AI then acts as chair: dedupes findings, verifies each against the actual code, renders a confirmed/plausible/rejected verdict with reasoning, and presents a consolidated report per `review-board/references/output-format.md`.

Strictly human-in-the-loop: the report ends with "which findings should I address?" and nothing is fixed until the user picks. Invoke for pre-PR/pre-merge reviews, security passes, or any "review my changes" request.

## capture-task

Quick-captures a unit of work (bug, feature idea, or chore) as a structured task file at `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`, built from `capture-task/assets/task-template.md` with every unknown kept explicit as `TBD (needs grilling)` rather than invented. No interviewing: it mines the current conversation for context (error text, file paths, decisions already made) so a fresh session can pick the task up cold with `/discuss`.

Suggest it once when the user voices an actionable aside, reports something broken mid-flow, or drifts into "we should do X later" territory. Never auto-file; if the user doesn't bite, drop it.
