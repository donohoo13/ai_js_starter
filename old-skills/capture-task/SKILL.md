---
name: capture-task
description: Quick-capture any unit of work — a bug, a feature idea, or a chore — as a structured GitHub issue. A "task" here is the umbrella: anything you want tracked for later but don't want to run a full grilling session at this time. Use whenever the user says "capture this", "log this", "track this for later", "file a follow-up", "create a task", "outline a feature", "we should do X later", "add this to the roadmap", "tech debt note", "park this", OR reports something broken: "capture this bug", "log this bug", "file an issue for this", "demo bug", "saw a bug in prod", "this just broke". Optimized for low-friction in-the-moment capture.
argument-hint: "[optional: brief outline of the bug, feature, or chore]"
---

# Capture Task

Get a unit of work out of the user's head and into a GitHub issue, fast. A "task" is the umbrella: a **bug** (something broke), a **feature** (net-new product surface), or a **chore** (internal work, tech debt, deferred fix). The user is usually mid-something-else, so speed is the feature: gather the minimum, file it, hand back control.

This skill never runs `/grill-me` or any interview loop — deferring that work is the whole point of capture. Instead, the filed issue carries a `## Context for planning` section: the distilled context a future grilling session needs to start rich in a new session that has none of today's context. That grilling happens later, inside `/write-a-prd` (features) or `/write-a-trd` (bugs and chores). Capture the seed; leave the expansion to the downstream skill.

## Process

### 1. Classify: Bug, Feature, or Chore

- **Bug** — broken or wrong behavior. Signals: "fails", "throws", "wrong value", "demo bug", "saw in prod". If it worked before, also add the `regression` label.
- **Feature** — net-new product surface or capability customers will see and use (a new tab, export option, AI feature, integration). If a customer would notice it on a changelog and care, it's a Feature.
- **Chore** — internal work: tech debt, refactors, dependency bumps, dev tooling, infra hardening, observability. The user-visible surface doesn't change.

The kind drives the template, labels, and issue type, so resolve it first — but default to Chore on ambiguity (retyping later is cheap) and ask one confirming question only if genuinely unclear.

### 2. Gather the minimum

Treat `$ARGUMENTS` and the surrounding conversation as the seed. Ask at most 1-3 targeted questions to fill the template's required fields — a bug needs observed/expected behavior, repro context, environment, and severity; a feature or chore needs only a summary and affected area. If the conversation already answers a question, don't ask it. Write `Unknown` for anything the user can't answer offhand — pressing for completeness is grilling, which belongs downstream.

For bugs only: if a specific surface or API is named and a pointer costs ≤30 seconds (1-2 file reads), note the suspected file in `Context for planning`. A pointer, not an investigation — skip entirely if the user wants speed.

### 3. Draft from the kind's template

- **Bug** → `references/bug-template.md`
- **Feature / Chore** → `references/outline-template.md`

Replace every `<...>` placeholder with real content — never file one. The `## Context for planning` section is what makes a capture worth more than a one-liner: it is the payload the future grilling session runs on. Distill it from the conversation you are already in — constraints and decisions already voiced, approaches considered or ruled out (with the one-line why), open questions, and pointers mentioned (files, services, links, related issues). Transcript distillation, not analysis: do not interrogate the user further, do not explore the codebase to invent scope, do not propose design. Invoked cold with no surrounding discussion? Omit the section — that's fine.

### 4. Confirm, then file

Show the drafted title and body: "Filing this unless you want to tweak." They'll say "go" or "change X" — move at their pace, no grilling.

Ensure the kind's label exists (once per session), then create the issue. The labels keep one-off captures visually distinct from `prd`- and `trd`-labeled planned work in triage queries:

```bash
# Bug:
gh label create field-report --description "Ad-hoc bug captured from a demo, prod, or customer call — not part of a planned PRD" --color FBCA04 2>/dev/null || true
gh issue create --title "<title>" --body "<body>" --label bug --label field-report

# Feature / Chore:
gh label create outline --description "Quick-captured chore or feature outline — sketch only, not a full PRD" --color 0366D6 2>/dev/null || true
gh issue create --title "<title>" --body "<body>" --label outline
```

Add other labels (`regression`, `performance`, `a11y`, `breaking-change`, `documentation`) only where they clearly fit or the user volunteered them — don't fish.

### 5. Set the issue type

`gh issue create` has no `--type` flag. Set the type via GraphQL: look up the type IDs with a `repository { issueTypes }` query, get the issue node ID (`gh issue view <n> --json id`), then run the `updateIssueIssueType` mutation. Bug → **Bug**, Feature → **Feature**, Chore → **Task**. If the repo has no issue types (e.g. a personal repo), skip silently — the labels carry the distinction.

### 6. Report back

Output the issue URL and route by kind: Feature → "Filed as #N. Want to `/write-a-prd` off this later, or move on?" Bug / Chore → same, with `/write-a-trd`. Most captures stay parked for weeks — never push escalation. If later discussion in this session materially changes the picture (scope, severity, a ruled-out approach), offer once to update #N's `Context for planning`; confirm before editing.

## Title format

`<imperative summary>` — ≤80 characters, specific, no leading prefix (the issue type and labels already convey Bug/Feature/Task). The title is the at-a-glance handle for triage.

- Good: `Engagement plan share link strips PII when toggle is off` · `Run AI categorization on-demand after sync completion` · `Bump TanStack Query catalog dep to 5.85`
- Bad: `Bug in scenario model` · `TODO: categorization later` · `Feature: billing` · `Tech debt cleanup`

$ARGUMENTS
