---
status: accepted
---

# Instance-to-template feedback rides GitHub issues on the template repo

The skill chain files no GitHub issues anywhere — the task file is the tracker, and `/ship-pr` is its only door to the remote. The `template-feedback` skill breaks that rule deliberately, filing issues against `donohoo13/ai_starter` from an instance, because what the channel buys is an aggregate view: "what is currently wrong with the template across every project using it." Instances share no git history and no filesystem with each other or with the template, so only a central store with open/closed state and labels can answer that question; a per-project file cannot.

## Considered options

**A feedback file in the reporting instance** (`docs/template-feedback/`), handed to a template-dev session by path. This is the safer option on data handling — the payload never leaves the repo that owns its context — which is what makes the rejection worth recording, since a future reader will reach for it first. It fails on the single thing the channel exists for: a file in project A and a file in project B never join, so the aggregate view has nowhere to live. The reachability argument for issues (a queue readable from any machine) was not decisive on its own; the aggregate-view argument was.

**A direct cross-repo write** into the template's `docs/tasks/`. Rejected because an instance carries a snapshot of the template synced at some `vX.Y.Z` and possibly locally adapted, so a claim about how a template artifact behaves may describe a version that no longer exists upstream. Findings arrive as evidence to be re-verified, never as a task file in the parent's backlog.

## Consequences

The template repo is public, so every filed issue is world-readable and indexed, and deleting one does not undo that. The scrub rule in `template-feedback` is therefore load-bearing rather than hygienic: the trace narrates purely in template vocabulary, with instance-side content described rather than pasted. That constraint doubles as a quality filter, which is why it is stated once and used twice — a finding that cannot be told in template vocabulary is a project incident rather than a template gap, and that is exactly the skill's `not-the-template` verdict.

`.claude/skills/README.md` states the no-issues rule and carries the carve-out inline. The two stay consistent or the rule wins by default: a session reading only the rule treats `template-feedback` as a violation of it.
