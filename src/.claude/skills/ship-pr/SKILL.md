---
name: ship-pr
description: Push the current non-main branch and open a GitHub PR whose body documents how the work was produced: summary, human QA evidence, and review-board outcomes. Use when the user says "ship this", "open a PR", "create the PR", "PR this branch", "ship it", or accepts the one-line ship-pr offer at the close of implement-task or review-board. Strictly user-invoked: never auto-chain into this from another skill, and never run it on main.
argument-hint: '[draft] (optional — opens the PR as a draft)'
---

# Ship PR

Take a completed, QA'd, reviewed implementation on its branch and land it on the remote: push the branch, open the PR. The PR body is the durable audit artifact — GitHub retains it after branches are deleted and record commits are squashed away — so its job is to answer, in one screen, how thoughtfully this change was produced: what it does, whether a human saw it work, whether a review board ran, and what happened to every finding, including the dismissed ones.

Invocation is the consent. The chain's invariant — push and PR only on the user's word — lives here as a named door: typing `/ship-pr`, or accepting another skill's one-line offer, is that word. Nothing extends the consent: one branch pushed, one PR opened, nothing else touches the remote.

## Branch state at invocation

- Current branch: !`git branch --show-current`
- Default branch ref: !`git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null || echo "(no remote HEAD; fall back to main)"`
- Remote: !`[ -n "$(git remote)" ] && git remote | head -1 || echo "(none)"`

Working tree at invocation (empty = clean):

```!
git status --short | head -50
```

## Hard stops — mechanics only

Refuse and route when the mechanics make shipping wrong. Never block on process — process gaps get documented truthfully instead (below), because a skill that blocks on process gets routed around with a bare `gh pr create`, and the paper trail is lost exactly when it mattered.

- **On the default branch** (`git symbolic-ref refs/remotes/origin/HEAD`, falling back to `main`) — nothing to PR; route to `stage-for-commit` or a feature branch.
- **No remote** — nothing to push to.
- **Dirty working tree** — this skill ships commits; it does not sweep the tree. Route uncommitted changes to a proper commit first, then re-invoke. Untracked files that are clearly unrelated strays don't block, but name them so the user decides.

## Assemble the record

Session context is capital — reuse what this conversation already knows — but the branch is ground truth. Three inputs:

1. **Review record.** `git log <default>..HEAD --grep='^review:'` finds the always-empty record commits review-board leaves after its human gate resolves. The latest record describes the final state; earlier boards on the same branch each still get a line. A board ran this session but left no record commit → use the session's report and note the record's absence. Neither → offer `/review-board` once, one line, their call; declined means the PR says `Not run.` plainly. That sentence existing is the accountability — don't nag, don't block, don't soften it.
2. **QA evidence.** A `docs/tasks/` file at `status: done` means the human QA gate passed — cite what its QA script exercised. Otherwise ask once: has a human seen this change in action? Record the answer as given. "Not yet human-verified" is a valid, honest entry; a false "verified" is the one thing this section must never contain.
3. **Summary.** The task file's problem and requirements when one drove the work; else the branch's commit subjects plus session context. What and why in 2-4 lines. The diff is the changes — no restated file lists.

## Fill the template

`.github/PULL_REQUEST_TEMPLATE.md` owns the structure; this skill owns the semantics of each section. Template missing → offer once to scaffold it with the canonical structure below (it is a repo-visible file, so confirm before writing), and use the same structure for this PR either way.

```markdown
## Summary

<!-- What changed and why, 2-4 lines. Link the docs/tasks/ file if one drove this. -->

## QA

<!-- Who exercised the change in action and what they verified. "Not yet human-verified" is a valid, honest entry. -->

## Review board

<!-- Not run. -->
<!-- or: Ran `balanced` board YYYY-MM-DD: N findings → C confirmed / P plausible / R rejected. -->
<!-- Addressed: SEC-1, COR-2 (fix commits abc1234, def5678). -->
<!-- Dismissed: REL-3 — one-line reason as given. -->
<!-- Record: review commit <sha> on this branch. -->
```

Section semantics:

- **Summary** — the what and why; link the task file when one exists.
- **QA** — who exercised the change and what they verified, from the evidence above, recorded verbatim.
- **Review board** — `Not run.`, or: mode and date, finding counts by verdict, addressed IDs with their fix commit SHAs, dismissed IDs each with the user's recorded one-line reason, and the record commit SHA. Dismissals are the point of this section: a dismissal with a recorded reason is defensible; a silent one indicts the process. Never invent a reason that wasn't given — "no reason recorded" is the honest fallback.
- **No AI attribution** — no generated-with footer, no `Co-Authored-By`. The user is the author of record; the Review board section is the disclosure that actually matters.

## Confirm once, ship, stop

Title: imperative mood, 72 characters or fewer, from the task file title or the branch's dominant commit subject. Show the exact title and body and ask one confirm — this is the last moment before the remote. On yes:

```bash
git push -u origin <branch>
gh pr create --title "<title>" --body "<body>" --base <default-branch>
```

`draft` in the arguments adds `--draft`. Report the PR URL, then stop: no reviewers, no labels, no auto-merge, no follow-up pushes unless asked. The PR is open; the rest is team process.
