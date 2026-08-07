---
name: ship-pr
description: Push the current non-main branch and open a descriptive GitHub PR whose body fills the project's pull request template with a summary and human QA evidence. Use when the user says "ship this", "open a PR", "create the PR", "PR this branch", "ship it", or accepts the one-line ship-pr offer at the close of implement-task or review-board. Strictly user-invoked: never auto-chain into this from another skill, and never run it on main.
argument-hint: '[draft] (optional — opens the PR as a draft)'
---

# Ship PR

Take a completed implementation on its branch and land it on the remote: push the branch, open the PR. The PR body is descriptive, not investigative — it answers, in one screen, what the change does and whether a human saw it work. Session context is capital — reuse what this conversation already knows — but the branch is ground truth: a resumed branch carries commits this conversation never saw, so the Summary and title describe the commit list below, never session memory alone.

Invocation is the consent. The chain's invariant — push and PR only on the user's word — lives here as a named door: typing `/ship-pr`, or accepting another skill's one-line offer, is that word. Nothing extends the consent: one branch pushed, one PR opened, nothing else touches the remote.

## Branch state at invocation

- Current branch: !`git branch --show-current`
- Default branch ref: !`git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null || echo "(no remote HEAD; fall back to main)"`
- Remote: !`[ -n "$(git remote)" ] && git remote | head -1 || echo "(none)"`

Working tree at invocation (empty = clean):

```!
git status --short | head -50
```

Branch commits against the default branch — the PR's actual contents:

```!
git log --oneline "$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null || echo main)"..HEAD | head -30
```

## Hard stops — mechanics only

Refuse and route only when the mechanics make shipping wrong. This skill polices no process — no review nudges, no gate checks — because process routing already happened upstream where it belongs, and a skill that blocks at the door gets routed around with a bare `gh pr create`.

- **On the default branch** (`git symbolic-ref refs/remotes/origin/HEAD`, falling back to `main`) — nothing to PR; route to `stage-for-commit` or a feature branch.
- **No remote** — nothing to push to.
- **Dirty working tree** — this skill ships commits; it does not sweep the tree. Route uncommitted changes to a proper commit first, then re-invoke. Untracked files that are clearly unrelated strays don't block, but name them so the user decides.

## Fill the template

`.github/PULL_REQUEST_TEMPLATE.md` owns the structure; this skill owns the semantics of the sections it defines below. It is loaded at invocation here (empty = missing) so you fill the project's actual sections, not an assumed set — a project may have customized them:

```!
cat .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null
```

Empty output → the template is missing; offer once to scaffold it from the canonical structure below (a repo-visible file, so confirm before writing), and use that structure for this PR either way.

```markdown
## Summary

<!-- What changed and why, 2-4 lines. Link the docs/tasks/ file if one drove this. -->

## QA

<!-- Who exercised the change in action and what they verified. "Not yet human-verified" is a valid, honest entry. -->
```

Section semantics:

- **Summary** — the what and why in 2-4 lines, from the task file's problem and requirements when one drove the work, else the commit subjects in the invocation snapshot plus session context; link the task file when one exists. The diff is the changes — no restated file lists.
- **QA** — who exercised the change in action and what they verified. A `docs/tasks/` file at `status: done` means the human QA gate passed — cite what its QA script exercised, and name any commits that landed after the `done` flip (review fixes routinely do), because those postdate the human's look. Otherwise ask once: has a human seen this change in action? Record the answer as given. "Not yet human-verified" is a valid, honest entry; a false "verified" is the one thing this section must never contain.
- **Any other section** — a customized template may carry sections this skill defines no semantics for; name each one at the confirm and leave it to the user to fill or strike, never filling it from session memory, because the honesty rules here are scoped to the sections above.
- **No AI attribution** — no generated-with footer, no `Co-Authored-By`. The user is the author of record.

## Confirm once, ship, stop

Title: imperative mood, 72 characters or fewer, from the task file title or the dominant commit subject in the invocation snapshot. Show the exact title and body and ask one confirm — this is the last moment before the remote. On yes:

```bash
git push -u origin <branch>
gh pr create --title "<title>" --body "<body>" --base <default-branch>
```

`draft` in the arguments adds `--draft`. Report the PR URL — and when the session is working in a git worktree, add one line naming the post-merge cleanup (`scripts/setup/gwt-remove.sh <branch>`, run from the main checkout; never run it yourself) — then stop: no reviewers, no labels, no auto-merge, no follow-up pushes unless asked. The PR is open; the rest is team process.
