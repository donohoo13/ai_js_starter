---
name: review-board
description: Multi-agent code review board. Spawns five parallel reviewer agents (correctness, security, reliability, maintainability, performance/operations), consolidates their findings, renders the session AI's own confirmed/plausible/rejected verdict on each, and waits for the human to pick what gets addressed before touching any code. Use whenever the user asks to review code changes, a branch, a diff, or a PR; asks for a security review, standards check, or pre-merge/pre-PR review; says "review my changes", "run the review board", or "is this safe to merge"; or wants a thorough second opinion on work in progress, even if they only name one concern like security. Accepts an optional leading mode argument that scales the board — `quality` (top models, full-file reads) for exhaustive pre-merge scrutiny, `speed` (fast models, diff-only reads) for a quick pass, default `balanced` — so also use it when the user asks for a "quick review" or a "deep review" of their changes.
argument-hint: '[quality|balanced|speed] [PR number, commit range, or paths to scope the review]'
---

# Review Board

Run a panel of parallel specialist reviewers over a set of code changes, then act as the board chair: dedupe their findings, judge each one, render your own verdict, and present a consolidated report. The human decides what gets addressed; deep verification and any fix wait until they choose.

Two principles run through every step:

- **Parallel specialists beat one general pass.** A single reviewer skimming five concerns misses what a focused reviewer catches; each board member gets one category, its own checklist, and a full context budget. The chair's triage matters just as much: sub-agents overproduce plausible-sounding findings, and your judgment is what separates signal from noise before the human ever sees it.
- **Your session context cuts both ways.** In the common flow you implemented the change earlier this session and are now reviewing it. That context is an asset for facts — intent, stack, which code you actually read — so reuse it instead of re-deriving it. It is a liability for judgment — deciding a category needs no review, or that a finding "can't be right" — because the author's confidence is exactly what a blind spot feels like. Reuse your knowledge; distrust your comfort.

## Step 1: Resolve scope and context

Parse the arguments:

- A leading mode keyword (`quality`, `balanced`, or `speed`): sets the board mode used in Step 2; everything after it is scope. No keyword means `balanced`.
- A PR number (`142` or `#142`): use `gh pr diff <n>` and `gh pr view <n>`.
- A commit range (`abc123..def456`): use it directly.
- Paths: restrict the default scope to those paths.
- Nothing: the current branch versus the merge base with `main` (`git diff $(git merge-base main HEAD)`) **plus** uncommitted changes (`git diff HEAD` and untracked files via `git status --porcelain`).

If that resolves to an empty diff, tell the user there is nothing to review and ask what they meant. Do not review the whole repository unasked.

Gather three pieces of context — from session knowledge first when you authored the change, otherwise by looking:

- **Intent**: what the change is supposed to do, from the PR description, commit messages in scope, or a matching `docs/tasks/` file. If still unclear, ask the user for a one-line summary before spawning; a review against unknown requirements wastes five agents' worth of tokens.
- **Stack snapshot**: the review lens depends on the runtime — event-loop blocking and `fs` access mean nothing on Cloudflare Workers, connection pooling advice differs between `pg` and D1, module-level state is a per-isolate footgun on Workers and a cross-request race on Node. A quick look at `package.json`, runtime configs (`wrangler.jsonc`/`wrangler.toml`, `Dockerfile`, `next.config.*`), and `tsconfig.json` is enough; this is a snapshot, not an audit.
- **Scope hygiene**: if the diff mixes clearly unrelated changes (a refactor tangled with a feature, drive-by edits), record it for the report's process notes.

## Step 2: Compose the board, set read depth, confirm, spawn

The mode from Step 1 presets the board's two cost dials — seat model tier and read depth — because they trade the same currency: recall against tokens and turnaround. Everything else works the same in every mode: which seats run, the chair on the session model, the single confirmation, the human gate.

| Mode                 | Seat models           | Read depth                           | Reach for it when                                                                                  |
| -------------------- | --------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `quality`            | Per-seat matrix below | Full changed files, every seat       | The miss costs more than the tokens: pre-merge on large, unfamiliar, or security-sensitive changes |
| `balanced` (default) | Per-seat matrix below | Decided per seat at the confirmation | The everyday review                                                                                |
| `speed`              | Per-seat matrix below | Diff-first, every seat               | A mid-work sanity pass where turnaround matters more than recall                                   |

A speed board is a screen, not a proof: diff-first reads catch pattern-shaped defects and miss the interaction bugs that full files and deeper seats surface. When the user asks for speed on a change where that tradeoff looks wrong — large, tangled, or security-sensitive — say so in the confirmation and recommend a higher mode; the choice stays theirs.

The five members, each a registered agent in `.claude/agents/` with a checklist in this skill's `references/` directory. Modes shift each seat's tier rather than flattening the board to one model, because the seats differ in ways no mode changes. Correctness and security misses are what a review exists to catch, and their findings come from intent-modeling and threat-modeling rather than pattern-matching, so they never drop below Sonnet — chair triage filters a cheap seat's extra noise, but nothing recovers a miss. Maintainability is the opposite pole: checklist-saturated, diff-local, and lowest miss cost (tech debt, not an incident), so Opus buys it nothing even in `quality` and Haiku covers it from `balanced` down. Reliability and performance sit between — pattern-shaped enough for Haiku on a speed screen, reasoning-shaped enough (races, resource lifecycles, cross-function complexity) to earn Opus when the miss is what you are paying to avoid. The chair (you) runs on the session model in every mode, because triage — verification, dedup, verdicts — is the judgment the board's value actually rests on.

| Agent                    | Prefix | `quality` | `balanced` | `speed` | Checklist                       | Subagent type            |
| ------------------------ | ------ | --------- | ---------- | ------- | ------------------------------- | ------------------------ |
| Correctness              | `COR`  | Opus      | Opus       | Sonnet  | `references/correctness.md`     | `review-correctness`     |
| Security                 | `SEC`  | Opus      | Opus       | Sonnet  | `references/security.md`        | `review-security`        |
| Reliability              | `REL`  | Opus      | Sonnet     | Haiku   | `references/reliability.md`     | `review-reliability`     |
| Maintainability          | `MNT`  | Sonnet    | Haiku      | Haiku   | `references/maintainability.md` | `review-maintainability` |
| Performance & operations | `PRF`  | Opus      | Sonnet     | Haiku   | `references/performance.md`     | `review-performance`     |

Spawn each seat by its `review-*` subagent type; the read-only toolset comes from the agent definition. The frontmatter model pins encode the `balanced` column, so in `balanced` spawning by type is enough; in `quality` and `speed`, pass each seat's `model` from the matrix explicitly on the spawn — the per-invocation override takes precedence over the pin. If those definitions are not installed in this repo, fall back to `general-purpose` agents and set `model` explicitly in every mode, straight from the matrix.

Form the board shape and put it to the user as one confirmation before spawning:

- **Full board or lite (`balanced` only).** The five-seat board is the default. For a small, self-contained diff (a few files, localized logic, no signature changes or cross-module effects) offer a **lite board** instead: three consolidated seats — Security (Opus, solo), Correctness + Reliability (Opus, one agent reading both checklists), Maintainability + Performance (Sonnet, one agent reading both) — all diff-first. Lite trades some recall for a much shorter, cheaper run; recommend it only when the change is genuinely small and localized, and never on a large or security-sensitive diff where the focused five earn their cost. `quality` never consolidates seats — merged lenses give up exactly the recall it exists to buy — and `speed` already gets its savings from tier and depth while five parallel seats cost no extra wall-clock.
- **Which reviewers run (every mode).** Skip a seat only when its category has no surface in the change: a docs-only diff has no concurrency to review, a copy change may need only correctness and maintainability, a test-only change has no performance story. The bar is "nothing to look at", never "I'm confident this part is fine" (second principle). When in doubt, run them all: a reviewer returning "no findings, here's what I checked" is cheap; a category silently unreviewed is how the one real bug ships.
- **Read depth per running reviewer (`balanced` only — the other modes preset it).** Full changed files catch interaction bugs but cost tokens and time; for a small, self-contained change **diff-first** — work from the diff, opening surrounding code only to confirm a suspected finding — is enough. If you authored the change, you already know whether it is self-contained. Decide per seat, not globally: correctness, security, and reliability profit most from full files because their failure modes live in interactions (invariants around changed lines, untrusted data crossing functions, resource lifecycles), while maintainability and performance usually judge fine from the diff plus hunk context.

Present the shape with a one-line reason each, your recommendation as the accept-as-is first option (a single `AskUserQuestion`; one question, not several). In `quality` and `speed`, restate the preset tier and depth as facts rather than asking about them; the question is only which seats run. This is a cost/thoroughness tradeoff the user owns, and asking once is cheap next to a board's worth of tokens.

Then spawn the selected seats in a single message so they run in parallel. Each agent is read-only — it must not modify, create, or delete any file — and its prompt must contain, concretely (agents cannot see this conversation). For a lite-board merged seat, pass both checklist paths and tell it to apply both, keeping each finding's prefix tied to its category:

1. The exact scope: the git commands to reproduce the diff, the base ref, and the list of changed files.
2. The intent context, stated in a sentence or two.
3. The stack snapshot, with an instruction that the agent's first step is a seconds-long confirmation of it (`package.json` plus any runtime config touching the changed files); a finding judged against the wrong runtime is noise.
4. Its checklist file and `references/output-format.md`, by absolute path, to read before reviewing.
5. The read depth, stated explicitly — full changed files or diff-first — from the mode preset or, in `balanced`, the per-seat confirmation; never left for the agent to choose.
6. The evidence bar: every finding needs a `file:line` location, a code excerpt, and a concrete failure scenario (specific input or state producing the wrong outcome). "This could be a problem" without a scenario is not a finding, and an empty findings list is a perfectly good result; agents must not invent findings to look busy.
7. What not to flag: anything a linter or formatter auto-fixes, subjective style preferences, and pre-existing issues in untouched code (unless the change makes them worse — then say so explicitly).
8. Return format: findings per `references/output-format.md`, IDs prefixed with the agent's category prefix, returned as the agent's final message.

## Step 3: Consolidate and triage

When all reviewers return, you become the chair. This step is your own judgment, not a summary job:

1. **Dedupe.** Different agents often catch the same defect through different lenses (a missing input check is both `SEC` and `COR`). Merge duplicates, keep the most severe categorization, and note the agreement; independent convergence is evidence of validity.
2. **Judge each finding from your own context; deep-verify nothing yet.** Default to what you already know — your read of the change and the task — to decide whether a finding is probably true and worth the user's attention. Open code during triage only when a finding _alarms_ you: it contradicts your understanding (your context may be the blind spot, or the reviewer may be hallucinating a line — "that can't be right" is how both feel), or it reads as wildly off from the task at hand (obviously off-topic or misdirected). A quick look settles those; everything else, trust your read. How much lands in that trusted bucket scales with the context you actually have: a change you authored, you can judge from memory; a change you are seeing cold, lean on the reviewers' evidence and let thin spots fall to Plausible rather than wave them through. The expensive confirm-and-root-cause pass is deferred to Step 5 and runs only on the findings the user chooses — doing it now on every finding is exactly the verify tail this step exists to cut.
3. **Render a verdict per finding**, a line or two of reasoning each: **Confirmed** (matches your understanding of the change; you judge it real), **Plausible** (credible, but you cannot settle it from context — it needs runtime, domain, or intent knowledge you lack, or code you have not read), **Rejected** (contradicts what you know or is off-task; you looked and it does not hold — say why, since the rejection is how the user audits your triage). Have the spine to reject; a triage pass that confirms everything was not a triage pass.
4. **Form the board recommendation**: which findings to address before merge, in what order, and which are safe to defer. Have a take; "it depends" is not a recommendation.

## Step 4: Report and wait for the human

Present the consolidated report using the exact structure in `references/output-format.md` (the "Consolidated report" section). Then stop and ask which findings to address, for example: "Reply with finding IDs, `all confirmed`, or `none`."

> [!WARNING]
> **Do not fix anything yet.** No edits, no "quick wins while I'm here", no staged patches. The human-in-the-loop gate is the contract of this skill: the report ends the turn, and code changes only happen after the user explicitly selects findings.

## Step 5: Verify, then address selected findings

This is where the deep verification deferred from triage happens — now, on the few findings the user chose, not all of them upfront. For each selected finding, confirm it against the actual code before writing a fix: reproduce the failure scenario, trace it to root cause, and fix the source rather than the reviewer's paraphrase of the symptom. If a finding does not hold up to that closer look, say so and skip it instead of inventing a fix — a triage verdict is a judgment, not a guarantee, and this is the point where the two can diverge. Apply fixes for exactly the selected findings and nothing else. After fixing, run the project's relevant checks (tests, typecheck, lint) for the touched areas and report the results honestly; a fix without a passing check is reported as unverified, not done.
