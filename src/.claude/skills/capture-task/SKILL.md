---
name: capture-task
description: Quick-capture any unit of work — a bug, a feature idea, or a chore — as a structured GitHub issue. A "task" here is the umbrella: anything you want tracked for later. Lighter than `/write-a-prd`. Use whenever the user says "capture this", "log this", "track this for later", "file a follow-up", "create a task", "outline a feature", "we should do X later", "add this to the roadmap", "tech debt note", "park this", OR reports something broken: "capture this bug", "log this bug", "file an issue for this", "demo bug", "saw a bug in prod", "this just broke". Optimized for low-friction in-the-moment capture; the resulting issue is shaped to seed `/write-a-prd` downstream (for features) or `/write-a-trd` (for bugs and chores).
argument-hint: "[optional: brief outline of the bug, feature, or chore]"
---

# Capture Task

The single quick-capture entry point for any unit of work. A "task" is the umbrella term: a **bug** (something broke), a **feature** (net-new product surface), or a **chore** (internal work, tech debt, deferred fix). Optimized for low friction: gather the minimum context, file the issue, get back to whatever the user was doing.

The output is shaped to seed the right downstream skill when the work needs deeper planning — `/write-a-prd` for a feature (it has a product dimension), `/write-a-trd` for a bug or chore (engineering-only, no PRD needed). Don't push the user to escalate in the moment — most captures are deferred work that won't be planned for weeks. Just file it cleanly so it's there when someone picks it up.

This skill does **not** attempt PRD- or TRD-level work. It captures a seed, optionally enriched with the surrounding conversation context (see step 5), and leaves the branching/expansion to the downstream skill.

## Process

### 1. Determine the kind: Bug, Feature, or Chore

Infer the kind from the user's phrasing, then confirm with a single question if it's not obvious:

- **Bug** — something is broken or behaving wrong. Signals: "broke", "fails", "throws", "errors out", "wrong value", "missing UI", "demo bug", "saw in prod".
- **Feature** — net-new product surface a customer will see and use (a new tab, export option, AI feature, integration).
- **Chore / Task** — internal work, tech debt, deferred fix, refactor, dependency upgrade, dev-tooling, infra hardening, observability. The user-visible surface doesn't change.

Default to **Chore/Task** on ambiguity. The kind drives the template, labels, and issue type below, so resolve it first.

### 2. Gather context

If `$ARGUMENTS` contains an outline, treat it as the seed and skip directly to clarifying gaps. Otherwise ask the kind-appropriate opener:

- Bug → "What broke, and what were you doing when it happened?"
- Feature / Chore → "What do you want to capture, and why now?"

Then ask follow-ups only as needed to fill the template's required sections — typically 1-3 quick questions, never more. The user is in capture mode (often mid-demo or context-switching); respect that. If the initial outline already carries enough, skip the questions entirely.

**Required by kind:**

- **Bug** — Summary, Observed behavior, Expected behavior, Repro context, Environment, Severity, Affected area, Next steps.
- **Feature / Chore** — Summary, Affected area, Next steps.

For required fields the user can't answer concretely, write `Unknown` rather than fabricating.

### 3. Optional code-side sanity check (bugs only)

If a bug clearly references a specific feature/page/API and you can spend ≤30 seconds without slowing the user down, do a quick scan (1-2 file reads or LSP lookups) and note the suspected file or service in the issue's `Context for planning` section. The goal is a useful pointer, not a root-cause investigation. If the user is mid-demo or clearly wants speed, skip this entirely. Do **not** run this scan for Feature/Chore captures — the user is usually closest to that code and already knows the rough scope; a scan is friction for marginal value.

### 4. Ensure the needed label exists

Each kind carries a label so captures stay visually distinct from PRDs (`prd`) and PRD sub-issues (typed `Task` with a parent link). Bugs use `field-report`; features and chores use `outline`. Check once per session that the label you need exists; create it if missing:

```bash
# For bug captures:
gh label list --json name --jq '.[] | select(.name == "field-report")' | grep -q field-report || \
  gh label create field-report \
    --description "Ad-hoc bug captured from a demo, prod, or customer call — not part of a planned PRD" \
    --color FBCA04

# For feature / chore captures:
gh label list --json name --jq '.[] | select(.name == "outline")' | grep -q outline || \
  gh label create outline \
    --description "Quick-captured chore or feature outline — sketch only, not a full PRD" \
    --color 0366D6
```

### 5. Draft the issue body from the kind's template

Read the kind-appropriate template and fill it in:

- **Bug** → `references/bug-template.md`
- **Feature / Chore** → `references/outline-template.md`

Filling rules:

- Replace each `<...>` placeholder with real content. Never leave angle-bracket placeholders in the filed issue.
- The `## Context for planning` section is the seed-enrichment payload. **Distill it from the conversation you are already in** — capture only what was actually said: constraints and decisions already voiced, approaches considered or explicitly ruled out (with the one-line why), open questions, and any pointers mentioned. **Do NOT generate new solution design, do NOT explore the codebase to invent scope, and do NOT propose architecture.** It is transcript distillation, not analysis. Keep it terse bullets. If the skill was invoked cold (a one-liner with no surrounding discussion), this section is minimal or omitted entirely — that's fine.

### 6. Confirm before filing

Show the user the drafted title and body. State: "Filing this unless you want to tweak." Don't grill — they'll either say "go" or "change X". Move at their pace.

### 7. Create the issue

```bash
# Bug:
gh issue create --title "<title>" --body "<filled body>" --label bug --label field-report

# Feature / Chore:
gh issue create --title "<title>" --body "<filled body>" --label outline
```

For bugs, add additional labels where they fit: `regression` (previously worked), `a11y`, `breaking-change`, `performance`, `documentation`. For features/chores, only add labels the user volunteered (e.g. `breaking-change`, `documentation`, `performance`) — don't fish for labels. The Bug/Feature/Task distinction is conveyed by the issue type, set next.

### 8. Set the issue type via `/gh-cli`

`gh issue create` does not support `--type`. Invoke `/gh-cli` to set the type via GraphQL (repo `issueTypes` lookup → issue node ID → `updateIssueIssueType` mutation):

- Bug → **Bug**
- Feature → **Feature**
- Chore / Task → **Task**

### 9. Report back, offer next steps, and keep the seed live

Output the issue URL and ask, routing by kind:

> Feature → "Filed as #N. Want to `/write-a-prd` off this, or move on?"
> Bug / Chore → "Filed as #N. Want to `/write-a-trd` off this, or move on?"

Most captures will be deferred — don't push escalation. Then leave this standing note in effect for the rest of the session:

> **Keep #N's `Context for planning` live.** If later discussion in this session changes a decision, rules out an approach, shifts scope, or (for bugs) changes severity or repro details, offer to update issue #N so its seed stays current for a future `/write-a-prd` or `/write-a-trd`. Sync **material** changes only — not every tangent — and **confirm before editing** the issue. Update the body's `## Context for planning` section in place. This is best-effort within the active session; it does not persist across sessions.

## Title format

`<imperative summary>` — short, specific, no leading prefix (the issue type badge already conveys Bug/Feature/Task).

**Examples:**

- `Engagement plan share link strips PII when toggle is off` (bug)
- `Run AI categorization on-demand after sync completion` (feature)
- `Replace Sequence Categorization Durable Object queue with Workflows` (chore)
- `Bump the TanStack Query catalog dep to 5.85` (chore)

Bad: `Bug in scenario model`, `TODO: categorization later`, `Feature: billing`, `Tech debt cleanup`.

Aim for ≤80 characters. The title is the at-a-glance handle for triage.

## Field guidance

### Kind selection (Bug vs Feature vs Chore)

- **Bug** — broken or wrong behavior. If it worked before and doesn't now, also add `regression`.
- **Feature** — net-new product surface, capabilities a customer will see and use, additions to existing surfaces (a new tab, export option, AI feature, integration). If a customer would notice it on a changelog and care, it's a Feature.
- **Chore / Task** — chores, internal work, deferred fixes, tech debt, refactors, dependency upgrades, dev-tooling, infra hardening, observability. The user-visible surface doesn't change (or changes only marginally).

When in doubt between Feature and Chore → **Task**. It's easier to retype later than to discover a "Feature" was scope-creep cleanup.

### Severity values (bugs)

- **blocking-demo** — surfaced live in a customer-facing context; risk of repeat embarrassment.
- **customer-visible** — production users will hit this in normal use.
- **internal** — surfaces only for OneView staff or in test/seed data; customers don't see it.
- **cosmetic** — wrong-looking but functionally correct (alignment, copy, color, missing icon).

### Environment defaults (bugs)

If the user reports a bug from a demo, default `Env: production` — demos run against production OneView; don't ask. If the report is from a development context (mention of `pnpm dev`, `localhost`, seed data, a migration), default `local` and confirm only if ambiguous.

### Severity escalation triggers (bugs)

If the user describes data corruption, a permission / multi-tenancy boundary leak (one org seeing another org's data), an auth bypass, or anything touching PII handling — set severity to at minimum `customer-visible` and add a sentence to `Why this severity:` flagging the class of issue. These categories are never `cosmetic` no matter how they surface.

### Next steps values

- **Triage** — too vague or unexplored to plan against; needs investigation first.
- **Needs PRD** — a _feature_ well-understood enough that `/write-a-prd <issue-number>` can lift it into a product spec, which then flows through `/prd-feedback` to a TRD.
- **Needs TRD** — a _bug or chore_ with engineering substance but no product dimension; `/write-a-trd <issue-number>` takes it straight in on its engineering on-ramp. Even small, single-slice work goes here — `/write-a-trd`'s single-slice fast path makes it cheap, and the test-strategy framing is worth it for a one-commit fix.

If the user didn't say which, infer from kind and detail. A one-line "we should add caching here someday" is `Triage`. A feature like "re-enable the AI categorization toggle once billing is in place" is `Needs PRD`. "Bump the TanStack Query catalog dep to 5.85" or a diagnosed bug is `Needs TRD`.

## Why this format

The templates mirror the inputs the downstream skill needs: `Summary` (plus `Observed`/`Expected` for bugs) frames the problem; `Context for planning` gives the downstream interview and codebase-exploration step a running start, including the dead ends already ruled out; `Affected area` scopes discovery; `Next steps` flags the escalation path.

What "later" looks like depends on kind:

- **Feature** → `/write-a-prd` consumes this issue as a **context source**. Because PRDs are platform-agnostic, the PRD may be written back here (if product also works in GitHub, the issue is promoted in place — body rewritten to the PRD, retyped to Feature, `outline` swapped for `prd`) or authored wherever product works (e.g. Linear), in which case this capture remains the linked seed. The downstream skill decides where the PRD lives.
- **Bug / Chore** → `/write-a-trd` consumes this issue as its **engineering seed**, then creates the parent TRD issue and slices. The capture is the seed that makes the TRD's deep dive start rich rather than cold.

The `outline` and `field-report` labels keep one-off captures visually distinct from `prd`-labeled PRDs, `trd`-labeled TRDs, and `Task`-typed sub-issues, so triage queries stay clean (`is:open label:outline -label:prd`, `is:open label:field-report -label:trd`).

$ARGUMENTS
