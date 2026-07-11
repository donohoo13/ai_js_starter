# Agent Skills Overview

## grilling

Relentless one-question-at-a-time interview that walks the decision tree of a plan, request, or captured task until shared understanding is reached: biggest decisions first, a recommendation with reasoning attached to every question, facts looked up in the codebase while decisions stay with the user. Opens by naming subject and objective, stops when the objective is met, and leaves nothing behind beyond the shared understanding in conversation. Model-invocable on 'grill' trigger phrases or whenever a plan needs stress-testing before implementation.

## grill-me

User-invoked wrapper (never model-triggered): runs a `/grilling` session with the `domain-modeling` skill active, so glossary terms land in `CONTEXT.md` and hard-to-reverse decisions become ADRs as they crystallise. Reach for it over plain `/grilling` when the session should leave durable docs behind.

## review-board

Multi-agent code review: spawns parallel specialist reviewers (correctness, security, reliability, maintainability, performance/operations), each a registered agent in `.claude/agents/review-*.md` with its own checklist in `review-board/references/`, over the branch diff vs `main` plus uncommitted changes (args can scope to a PR number, commit range, or paths). Reviewers are model-tiered by seat: correctness and security run on Opus (misses cost most, findings need intent/threat modeling), reliability/maintainability/performance run on Sonnet (pattern-shaped, cheaper and faster), and the chair runs on the session model. Small self-contained diffs can use a lite three-seat board. The session AI then acts as chair: dedupes findings, verifies each against the actual code, renders a confirmed/plausible/rejected verdict with reasoning, and presents a consolidated report per `review-board/references/output-format.md`.

Strictly human-in-the-loop: the report ends with "which findings should I address?" and nothing is fixed until the user picks. Invoke for pre-PR/pre-merge reviews, security passes, or any "review my changes" request.

## capture-task

Quick-captures a unit of work (bug, feature idea, or chore) as a structured task file at `docs/tasks/YYYY-MM-DD-<type>-<slug>.md`, built from `capture-task/assets/task-template.md` with every unknown kept explicit as `TBD (needs grilling)` rather than invented. No interviewing: it mines the current conversation for context (error text, file paths, decisions already made) so a fresh session can pick the task up cold with `/grilling`.

Suggest it once when the user voices an actionable aside, reports something broken mid-flow, or drifts into "we should do X later" territory. Never auto-file; if the user doesn't bite, drop it.

## stage-for-commit

Stages exactly the files changed during the current session by explicit path (never `git add -A`) and hands back a ready-to-paste commit message, then stops: no commit, no branch, no push, no AI attribution — the user is the committer. Proves the staged set with `git diff --cached --stat` before writing the message, and is concurrent-session aware: files another session already staged stay in the index and get flagged in the handoff (a `git commit` takes the whole index), and same-file collisions with unrecognized hunks are surfaced for the user to decide instead of silently staged.

Invoke at the end of a quick chore/feature/bug when the user wants to commit the work themselves — "stage my changes", "ready to commit", "write me a commit message for this".
