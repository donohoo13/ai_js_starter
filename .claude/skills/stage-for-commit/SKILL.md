---
name: stage-for-commit
description: Stage the files changed during this session and hand back a ready-to-paste commit message, without committing, branching, or pushing. Use at the end of a quick chore/feature/bug — typically right after a grilling session and implementation — when the user wants to commit it themselves on main. Trigger on "stage my changes", "stage this and give me a commit message", "stage what you did", "I'll commit this myself", "ready to commit", "write me a commit message for this", "get this ready to commit".
argument-hint: '(no args needed)'
---

# Stage for Commit

The user is closing out a small piece of work — usually a chore, a small feature, or a bug fixed straight after a grilling session — and wants to commit it themselves on `main`. This skill does exactly one job: stage the work done this session and produce a clean commit message they can copy and paste. Nothing else.

The user is the committer. Respect that boundary precisely: hand them staged changes and a message, then stop. The value here is speed and trust — they should be able to glance at what's staged, read the message, and run their own commit without untangling anything you did.

## Hard boundaries

These are the whole point of the skill. Crossing any of them defeats it:

- **Never commit.** No `git commit`, no `--amend`. The user commits.
- **Never branch.** No `git checkout -b`, no `git switch`, no `git branch`. Staying on the current branch (`main` is expected and correct here) is intended.
- **Never push** or touch the remote.
- **Never stage work that isn't from this session.** A quick-task tree often has unrelated dirty files; sweeping them in with `git add -A` is the classic way this goes wrong. Stage by explicit path only.

## Process

### 1. Build the explicit file list

From the conversation, list every file you created, edited, or deleted while doing this session's work. This is your source of truth — you know what you touched. Reconcile it against the tree to catch renames and deletions:

```bash
git status --short
```

Any dirty or untracked file that you did **not** touch this session stays out of the staging set. Do not guess that an unfamiliar change is yours; if it predates your work, leave it alone.

Also check the index itself: `git diff --cached --name-only`. Anything already staged that you didn't touch is another session's work in flight, not contamination — leave it staged and flag it in the handoff (step 5), because `git commit` takes the whole index and the user should commit that work before yours. Likewise, if a file you _did_ touch contains hunks you don't recognize, a concurrent session edited the same file; `git add` stages the whole file, so flag the collision and let the user decide rather than silently sweeping in their half.

### 2. Stage exactly those paths

Stage by path, never with `-A` or a bare `git add .`:

```bash
git add -- <path1> <path2> ...
```

`git add -- <path>` correctly stages modifications, additions, and deletions, so the same command covers a file you removed.

### 3. Prove what's staged

Don't claim it worked — show it. Confirm the staged set matches your intent and nothing extra slipped in:

```bash
git diff --cached --stat
```

If a file you touched is missing, or something appears that you neither touched nor found already staged in step 1, fix the staging set before moving on. Entries that were staged before you started stay put — unstaging another session's in-flight work is worse than the noise. If there was nothing from this session to stage, say so plainly and stop — there's no message to write.

### 4. Write the commit message

Match the repo's convention (see recent `git log`): a subject line in imperative mood, 50 characters or fewer. Use a conventional prefix (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`) when it sharpens the intent; a bare subject is fine for a trivial change. Keep the user's terse voice.

Add a body **only when the _why_ isn't obvious from the subject** — explain the reasoning or context, not a restatement of the diff. Wrap the body at ~72 characters, blank line after the subject. A small chore often needs no body at all; don't pad it.

Do not add a `Co-Authored-By` trailer or any AI attribution — the user is the author of record.

### 5. Hand it back

Present the message as raw text in a single fenced block, ready to copy. Nothing decorative around it. Above the block, a one-line summary of what got staged (file count is enough) so they can sanity-check at a glance. If step 1 found another session's files already staged, add one line saying so — the message below covers only this session's work, and committing right now would take both.

```
chore: tidy board switcher tab styling

Tabs and button groups now route through the shared components so the
look can't drift between surfaces.
```

Then stop. The user takes it from here. Do not include any text after the supplied commit message block. The message is always the last thing you say.
