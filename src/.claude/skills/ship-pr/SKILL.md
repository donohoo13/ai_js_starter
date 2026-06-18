---
name: ship-pr
description: Take a branch of committed work from draft PR to green CI. Creates a draft PR, pauses for the user's functional QA, runs the SOC2 AI code-review loop, marks the PR ready, then watches CI until all checks pass. Self-contained; also invoked by /implement-prd.
---

# Ship PR

Take the current branch's committed work and drive it through the org's PR
process: draft PR, functional QA gate, AI code review loop (SOC2 audit
evidence), mark ready, watch CI to green.

This skill is **self-contained** - it derives everything it needs from git
and the current branch. `/implement-prd` invokes it after committing all
sub-issue work; standalone usage is identical. No arguments.

## Step 1: Guard Branch

```bash
git branch --show-current
git rev-list --count origin/main..HEAD  # or main..HEAD if origin/main absent
```

- If on `main` - stop. Ask the user to checkout a feature branch.
- If zero commits ahead of `main` - stop. Nothing to ship.

When stopping, report the observed values verbatim: `Observed branch=<X>
commits_ahead=<N>`. If this disagrees with the user's shell, they likely just
checked out a branch in another terminal after the slash command queued, so
the tool saw the prior state - have them rerun /ship-pr.

Trust whatever non-main branch the user is on.

## Step 2: PR-Exists Check

This skill owns PR creation. If a PR already exists for the branch, stop.

```bash
gh pr list --head "$(git branch --show-current)" --state open --json number,url
```

If that returns a PR, report `PR #<n> already exists (<url>); resolve it
before rerunning` and **stop**. Do not adopt or modify an existing PR.

## Step 3: Create Draft PR

Build the PR body from the repo template, filling every section by deriving
from git. The template is the single source of truth - read it, never
hardcode its structure:

```bash
cat .github/pull_request_template.md
git log origin/main..HEAD --pretty='%H %s%n%b'
git diff origin/main..HEAD --stat
```

Fill each section:

- **Description** - 2-3 sentences synthesized from the commit log and diff.
- **Type of Change** - check the one box matching the dominant change.
- **Related Issues** - scrape every `Closes #N` / `Fixes #N` / `Resolves #N`
  from the commit messages and list them. If none, omit the section's body.
  (This is how parent-PRD and sub-issue closers reach the PR - they live in
  commit messages, nothing is passed between skills.)
- **Changes Made** - bullets grouped by area (DB, Validation, API, UI, Tests),
  derived from the diff. For 5+ files, add a file summary table.
- **Deployment Notes** - migrations, new env vars, breaking changes from the
  diff; `None` if clean.

PR **title** must satisfy the `pr-title` check: `<type>: <Subject>` where
type is one of `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`
and the subject starts with an uppercase letter. Derive it from the dominant
commit.

Create as a draft:

```bash
gh pr create --draft --title "<title>" --assignee @me --body "<filled body>"
```

`gh pr create` pushes the branch if it is not already pushed. Capture:

```bash
PR_NUMBER=$(gh pr view --json number -q .number)
REPO=$(gh pr view --json headRepository,headRepositoryOwner \
  -q '.headRepositoryOwner.login + "/" + .headRepository.name')
```

While the PR is a draft, every CI workflow is skipped (the `draft == false`
job gates), so the QA gate and review loop below run cost-free.

## Step 3.5: User QA Gate (functional acceptance)

Before any code review runs, hand functional QA to the user. This is
acceptance ("does the app actually do what was asked?"), distinct from code
review. Running it first means the AI review loop later runs **once**, on the
diff the user has already accepted, instead of re-running every time QA
surfaces a change. For an iterating, mixed-skill team, QA-driven churn is the
dominant churn, so it must settle before the expensive SOC2 review.

The draft PR exists and CI is skipped, so QA-driven fixes are cost-free.
Offer the user:

> "Implementation is committed on the draft PR. Want to QA the functionality
> before I run the code review? Run it yourself via `pnpm dev`, have me drive
> Playwright flows against `localhost:3333` (the `playwright-local` MCP) that
> you direct, or skip if this change does not warrant a look."

- The user signs off; you do not. Wait for an explicit "proceed" / "looks
  good" / "skip".
- **Skippable:** for a trivial or no-UI change (docs, config), the user may
  skip straight to review. Offer it, do not force it.
- If QA surfaces a problem, fix it on the branch now, before review:
  implement the fix (`/tdd` for non-trivial changes), `pnpm typecheck &&
pnpm lint` until clean, commit, and `git push` to the draft. No review has
  run yet, so there is nothing to re-sync; re-offer QA on the new state.

Only proceed to Step 4 once the user has signed off or explicitly skipped.

## Step 4: Initial AI Code Review

The PR must exist before review - the reviewer's output is posted as a PR
comment that serves as SOC2 audit evidence (the `code-review-comment` job in
`pr-validation.yml` enforces it once the PR is non-draft).

```bash
BASE_SHA=$(git merge-base origin/main HEAD)
HEAD_SHA=$(git rev-parse HEAD)
```

Invoke `/requesting-code-review` with placeholders:

- `DESCRIPTION` - what this branch delivers (1-2 sentences)
- `PLAN_REFERENCE` - the PR URL, plus the parent PRD issue if one appears in
  the commit messages
- `BASE_SHA` / `HEAD_SHA` - full 40-char (from above)
- `BASE_SHA_SHORT` / `HEAD_SHA_SHORT` - `git rev-parse --short` of each
- `PRIOR_REVIEW_BODY` - empty string (first review)

Capture the reviewer's full output verbatim into `REVIEW_BODY`. It starts
with the marker `<!-- oneview:code-review:sha=<HEAD_SHA> -->`. Post it:

```bash
gh pr comment "$PR_NUMBER" --body "$REVIEW_BODY"
COMMENT_ID=$(gh api "repos/$REPO/issues/$PR_NUMBER/comments" \
  --jq '[.[] | select(.body | startswith("<!-- oneview:code-review:sha="))] | sort_by(.created_at) | last | .id')
```

## Step 5: Report and Gate

Print the reviewer's `## Findings` section to the user verbatim. Then stop
and ask the user, per finding, one of:

- **Address** - apply the suggested fix (or your alternative)
- **Dismiss** - provide a one-line rationale; reviewer marks `❌ Dismissed`
- **Defer** - leave as `⏸️ Pending` for a follow-up PR

Alongside the verbatim findings, you may annotate any finding you assess as
incorrect or low-value with one line of reasoning, so the user's per-finding
decision is informed rather than a rubber-stamp. Do not perform agreement
with the reviewer; the AI reviewer can be wrong.

Do not proceed without explicit per-finding direction. If the user says
"ship it" with Critical or Important findings still Pending, surface the
conflict with the SOC2 control before continuing.

If the reviewer found nothing actionable and the verdict is `Ready to
merge`, skip Step 6 and go to Step 7 - the comment marker already matches
HEAD.

## Step 6: Apply Fixes Loop

For each finding marked **Address**:

"Address" means implement a fix you have verified is correct, not a
cargo-culted copy of the reviewer's suggestion. If on inspection the finding
is actually invalid, kick it back to the user as a Dismiss candidate with
reasoning rather than implementing a bad fix.

1. Implement the fix (use `/tdd` for non-trivial changes).
2. `pnpm typecheck && pnpm lint` - fix iteratively until clean.
3. Commit locally with a message referencing the finding ID:
   ```
   fix(F1): <short description>
   ```

Once the batch of fixes is committed, **re-sync the review comment before
pushing** - this ordering keeps the marker SHA matching HEAD when CI fires:

1. `HEAD_SHA=$(git rev-parse HEAD)` - the new local HEAD.
2. Re-dispatch `/requesting-code-review` with the refreshed `HEAD_SHA` /
   short SHA and `PRIOR_REVIEW_BODY` set to the current comment body:
   ```bash
   PRIOR_REVIEW_BODY=$(gh api "repos/$REPO/issues/comments/$COMMENT_ID" --jq .body)
   ```
   The reviewer re-classifies prior findings (`✅ Addressed in <sha>`,
   `❌ Dismissed - <rationale>`, `⏸️ Pending`), adds any new findings with
   the next free ID, and bumps the marker SHA. Never renumber.
3. Patch the comment in place - never post a new one:
   ```bash
   gh api -X PATCH "repos/$REPO/issues/comments/$COMMENT_ID" -f body="$REVIEW_BODY"
   ```
4. `git push`.

**Full re-review on every HEAD move** - every pushed commit gets a fresh
review pass, so the audit comment always reflects the exact diff under it.

Loop Steps 5 and 6 until the verdict is `Ready to merge` with nothing
actionable left Pending.

## Step 7: Mark Ready

```bash
gh pr ready "$PR_NUMBER"
```

`ready_for_review` fires the full CI suite. At this point HEAD equals the
last reviewed SHA and the comment marker matches it, so `code-review-comment`
passes on the first run.

## Step 8: Watch CI

```bash
gh pr checks "$PR_NUMBER" --watch
```

Watch **all** checks.

- **Any check fails** - stop. Do **not** auto-fix. Report to the user: which
  check, the failure diagnosis (use `/diagnose` to root-cause when the cause
  is not obvious from the log), and a proposed fix. Wait for explicit
  approval. On approval, apply the fix and run the **same commit → re-review
  → patch comment → push** sequence from Step 6, then resume watching. A
  CI-fix re-review can surface new code findings - if so, re-enter the
  Step 5 gate.
- **All checks green** - proceed to Step 9.

Never run `gh pr merge`. Merging is a human action behind the branch
protection approval gate.

## Step 9: Done

Report:

- PR URL
- Final reviewer verdict and finding counts (addressed / dismissed / deferred)
- CI state (all green)

Stop. Hand back to the caller (or the user).

## Important Rules

- NEVER commit to `main`. Verify the branch before every commit.
- NEVER force push. NEVER run `gh pr merge`.
- Run `pnpm typecheck && pnpm lint` after every code change.
- The review comment is edited **in place** (`PATCH`), never reposted. It is
  located by the marker prefix `<!-- oneview:code-review:sha=`.
- Every pushed commit must be followed by a marker update pointing at the new
  HEAD, or the `code-review-comment` job fails `validation-status`.
- Never use the em-dash character (U+2014) in the PR body, comments, or
  commit messages.
- Follow CLAUDE.md, BRAND_DESIGN.md, and UI_UX.md for all code standards.
