---
name: codify
description: Distill the current conversation down to the few durable lessons a future AI session genuinely could not infer, then route each to the narrowest correct file — the nearest enclosing CLAUDE.md for operational and code conventions, or BRAND_DESIGN.md / UI_UX.md for brand and UI foundations. Hands off to the domain-modeling skill when a lesson is really domain vocabulary (CONTEXT.md), a hard-to-reverse architectural decision (docs/adr/), or a fact about a context's engineering shape (ARCHITECTURE.md). Ruthlessly selective: only verified conventions get codified. Use at the end of an implementation, bugfix, or design discussion, and whenever the user says "codify", "capture this convention", "add this to CLAUDE.md", "remember this convention", or "we should document this". Never runs automatically; suggest it at most once when a session surfaces a genuine candidate.
argument-hint: '[optional: the specific lesson or convention to consider]'
---

# Codify

Capture the handful of lessons from this conversation that a future AI session genuinely could not infer and would plausibly get wrong, and write each to the file that will actually surface it at the right moment.

The hard part is not writing bullets. It is deciding what deserves to exist forever. A long session produces dozens of micro-decisions, corrections, and course-changes; almost none of them are rules. A rule you add is paid for by every future session that loads the file, so the cost is real and recurring. **Default to writing nothing, and make each line earn its place.** If the conversation produced no durable convention, say so plainly and stop. Forcing output is the primary failure mode of this skill.

## When this runs

Only when the user asks for it ("codify", "add this to CLAUDE.md", "capture this convention") or accepts a suggestion to run it. Suggest it at most once per session, and only when a genuine candidate surfaced — an undocumented convention got violated, a real gotcha came out of debugging. If the user does not bite, drop it. Never run it as a session-end ritual: an offer that fires regardless of whether anything happened trains the user to ignore it. Even once running, nothing lands in a file until the user approves each candidate in Step 5.

## Step 1: Attribute every friction point before drafting anything

Most codify candidates come from moments where something went wrong: a correction, a redo, a "no, not like that", a roadblock you had to back out of. The instinct is to convert each one into a rule so it "never happens again." Resist that. First reflect honestly on _why_ it went wrong, because only one of the causes justifies a durable rule.

For each friction point, attribute the root cause:

- **(A) The prompt steered you wrong.** The user's request was ambiguous, under-specified, or a one-time preference for this task. A generic future prompt would not reproduce the misstep. Writing a rule here satisfies a sample size of one and pollutes future sessions with a constraint that was never really a constraint. **Do not codify. Say so, and say why** ("this came from how the task was framed today, not a standing rule, so I'd leave it out"). If you suspect the ambiguity reflects a real recurring decision, the fix is to document the _decision_ (often domain-modeling territory, see Step 3), not to encode the steering.
- **(B) A real convention was undocumented.** The code already follows a pattern you violated because nothing told you, or the user revealed a standing constraint ("we always do X here", "never touch Y directly"). A future session lacking this context repeats the exact mistake. **This is the only real codify candidate.** Verify it against the code in Step 2.
- **(C) You simply erred.** Adequate context existed and you misread it or slipped. A rule that patches a one-off model error is noise every future session pays for. **Do not codify.** Own the mistake instead of memorializing it.

Be opinionated and push back. If the user expects a rule from a moment you judge to be (A) or (C), tell them you think it does not belong and why. A short, direct disagreement is more useful than a defensively-added bullet. The user can always overrule you.

## Step 2: What clears the bar

A surviving candidate from Step 1 must also be something an AI **cannot reliably infer and would plausibly get wrong in this repo**: a convention established during implementation, a gotcha or anti-pattern found while debugging, a non-obvious styling/component/data-flow standard.

Reject, even from cause (B):

- Generic best practices, restated framework defaults, anything the linter/formatter/types already enforce, anything already documented in a context file.
- Anything that reads as a transcript of today's work rather than a rule for tomorrow's. The test is **reusability across unrelated future sessions**, not "did this come up today".

If a candidate clears the bar, **verify it against the current code before writing it** — read the file, grep the pattern. Never codify from conversation memory alone, and resolve every pointer to a real `path` or `path:line` so it does not drift.

## Step 3: Route to the narrowest correct destination

Wrong placement is its own failure: an app-specific rule in a root file pollutes every other session, and a rule in the wrong _kind_ of file never gets read. Before routing anything, **discover the actual layout** — glob for every `CLAUDE.md`, plus `CONTEXT.md` / `CONTEXT-MAP.md`, `ARCHITECTURE.md`, `BRAND_DESIGN.md` / `UI_UX.md`, and `docs/adr/` — rather than assuming where these files live. This skill ships with the starter template, so the layout differs by repo: in the template itself the design files sit under `src/`, while spawned projects typically hoist them to the root. Then decide the destination on two questions.

**What kind of lesson is it?**

- **Domain vocabulary or ubiquitous language** (what a term means, which word wins when several compete) → this is not codify's job. Hand off to the `domain-modeling` skill; it lives in `CONTEXT.md`, which is a glossary and nothing else. Do not write terminology into a `CLAUDE.md`.
- **A hard-to-reverse architectural decision with genuine alternatives and a real trade-off** → also `domain-modeling`'s job; it belongs in an ADR under `docs/adr/`, not as a terse `CLAUDE.md` bullet. `CLAUDE.md` records _how we do things_; an ADR records _why we chose this over that_. If the lesson has alternatives-considered and consequences, route it to an ADR.
- **A fact about a context's engineering shape** (what talks to what, who owns which data or secrets, where a flow runs, a load-bearing ordering) → also `domain-modeling`'s job; it belongs in the owning context's `ARCHITECTURE.md`, where the shape statement is canonical. `CLAUDE.md` keeps an imperative rule only when one is genuinely needed, pointing at the shape fact rather than restating it.
- **Brand, visual, or UX foundation** (color, type, aesthetic, CSS, a11y, units) → a design file: `BRAND_DESIGN.md` for brand identity, `UI_UX.md` for CSS/accessibility/layout standards.
- **Everything else** (tooling, workflow, code organization, testing, API, DB, infra, framework-specific gotchas) → a `CLAUDE.md`.

If `domain-modeling` was active this session (the grill lenses run it), whatever it already wrote to `CONTEXT.md`, `ARCHITECTURE.md`, or `docs/adr/` counts as documented — do not re-hand those off; only route residue it did not catch.

**At what scope?**

Route to the **nearest enclosing `CLAUDE.md`** to the code the rule governs. A rule about one package belongs in that package's `CLAUDE.md`, not the root; prefer the deepest file that still covers the code. If only a broad file exists today but the rule is really package-specific, place it in the narrowest available file and note that a nested file would be the better home once that package grows. When unsure, choose the narrower scope.

## Step 4: Draft the bullets

- **Imperative voice, present tense** ("Use `DialogContent` props for headers, never build them in children"). No "we decided", "going forward", "always remember".
- **Front-load the constraint**, then the _why_ only when it is non-obvious. The why is what lets a future model generalize instead of following blindly.
- **Point at a living example with `path` or `path:line`** rather than pasting a snippet; pointers drift less. Only cite a file that cleanly demonstrates the convention.
- **Match the target file's tone and density** (read it first). Write long prose as single continuous lines per the repo markdown convention.
- Avoid `ALWAYS`/`NEVER` shouting. If you reach for it, you usually have not explained the why well enough yet.

## Step 5: Present the deliberation, then apply

Show your work — this is where "picky" becomes visible. Present **every candidate you considered**, including the rejected ones:

- **Codify** → the exact bullet(s), the target file and heading, and a one-line rationale kept out of the bullet itself.
- **Reject** → the candidate and its attribution (A / C / generic / already-covered), in one line each.
- **Hand off** → candidates routed to `domain-modeling` (vocabulary or ADR), so the user can pick that up next.

The deliberation can be long; what lands in the files stays lean. Apply only on approval: insert approved text under the right heading, do not reorder or rewrite existing content. If a candidate is already implied by an existing bullet, strengthen that bullet instead of adding a near-duplicate.

## Quality checks

- If the convention is project-specific but the target is a global file (`~/.claude/CLAUDE.md`), flag the mismatch and route to the project file.
- Internal docs (`CLAUDE.md`, `BRAND_DESIGN.md`, `UI_UX.md`) are exempt from the em-dash ban, but match each file's existing punctuation style.
- Before finishing, reread what you are about to add as if you were a future session with no memory of today. If a line does not change what that session would do, cut it.

$ARGUMENTS
