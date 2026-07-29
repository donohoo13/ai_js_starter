---
type: bug
status: captured
created: 2026-07-29
---

# Close the guard-context-edit prefilter's case-variant hole

## Context

Surfaced by a review board on the v1.0.3 `guard-context-edit` work (branch `bug/guard-context-scope-and-subagent`), where it was flagged as pre-existing and explicitly left unfixed — the v1.0.3 CHANGELOG entry records it as a known hole so instances are not surprised by it. It is carved out here rather than patched inline because closing it involves a real tradeoff between readability, coverage, and how often the hook process is spawned, and that decision deserves its own pass rather than riding along on an unrelated fix.

Who is affected: every AI session in this template and in every instance created from it, on macOS and any other case-insensitive filesystem. The failure is silent — the guard simply does not run, and nothing reports that it did not.

## Problem

Current behavior: the `Edit|Write` PreToolUse entry in `.claude/settings.json` wraps the hook in a shell `case` prefilter so Node is only spawned for plausibly-relevant payloads. That prefilter enumerates literal case variants, currently `*CLAUDE.md*|*claude.md*|*Claude.md*|*CLAUDE.local.md*|*claude.local.md*|*README.md*|*readme.md*|*Readme.md*|*.claude/rules/*|*CONTEXT.md*|*context.md*|*CONTEXT-MAP.md*|*context-map.md*|*ARCHITECTURE.md*|*architecture.md*|*Architecture.md*|*BRAND_DESIGN.md*|*brand_design.md*|*UI_UX.md*|*ui_ux.md*|*docs/adr/*`. A spelling outside that list never reaches the hook at all, so the hook's own case-insensitive matching never gets a chance to run.

Confirmed ungated spellings, each of which lands on the governed inode on APFS: `Context.md`, `Ui_Ux.md`, `docs/ADR/`. `Architecture.md` happens to be listed and is gated; `Context.md` is not, despite `CONTEXT.md` and `context.md` both being present — the list is inconsistent as well as incomplete.

Desired behavior: an edit to a governed context file is gated regardless of how its path is capitalized, without the prefilter degrading into something that spawns a Node process for nearly every Edit and Write.

Root constraint that makes this non-trivial: the `case` statement matches against the entire hook payload on stdin, which contains the file's new content as well as its path. It cannot distinguish "the path is CLAUDE.md" from "the content mentions CLAUDE.md". Any broadening of the pattern therefore broadens on both axes at once.

## Scope

- In scope (must-have): every case spelling of the governed basenames and directory prefixes reaches the hook; the decision recorded with its reasoning; the v1.0.3 CHANGELOG note about this hole updated or superseded once closed.
- Nice to have: a check that keeps the prefilter and the hook's own arm list from drifting apart as governed names are added, since they are two lists of the same thing in two languages.
- Out of scope: the hook's internal matching logic, which is already case-insensitive and correct; the marker-detection and containment work landed in v1.0.3; `guard-skill-edit` and `guard-secret-read`, whose prefilters have the same shape but are not part of this ask.

## Requirements

- The prefilter stays bash-3.2 compatible: macOS pins `/bin/bash` there permanently, so `shopt -s nocasematch` and other bash-4-isms are unavailable to shipped scripts under the repo's standing rule.
- Whatever lands must be legible to a human reading `.claude/settings.json`, since that file is the permission and hook registry people actually audit.
- The hook exits before any filesystem access for a non-governed path, so the cost of an unnecessary spawn is process startup only — roughly 30-50ms measured during the v1.0.3 work — but it is paid synchronously in an interactive session.
- Candidate approaches surfaced so far, none chosen: enumerate the missing spellings (fragile, never provably complete); bracket-class patterns per character, e.g. `*[Cc][Oo][Nn][Tt][Ee][Xx][Tt].[Mm][Dd]*` (complete for known names but close to unreadable across roughly ten names); broaden to something like `*.md*` plus `*.claude/rules/*` (complete and simple, but fires on any payload merely mentioning `.md`, which is most of them); drop the prefilter and let the hook decide every time (simplest and fully correct, costs a process spawn on every Edit and Write).
- Worth checking during the pass: whether the hook runner supports a matcher expressive enough to filter on the tool's `file_path` alone, which would dissolve the path-versus-content problem rather than trading around it.

## Acceptance criteria

- [ ] An Edit to `Context.md`, `Ui_Ux.md`, and a file under `docs/ADR/` is blocked when the owning skill has not been loaded, verified by executing the hook through the prefilter rather than by calling the hook directly.
- [ ] The spellings already covered today stay covered, verified by re-running the guard battery.
- [ ] The chosen approach's cost is measured, not assumed: how many additional Node spawns it causes across a representative session.
- [ ] The reasoning behind the chosen approach is recorded where the next reader will find it, and the v1.0.3 CHANGELOG's "unchanged in this release" note is updated to reflect the closure.

## Dependencies

None. Self-contained within `.claude/settings.json` and its verification, and independent of the v1.0.3 hook work, which has already landed.

## Risks / open questions

- [ ] Is a spawn on every Edit and Write actually unacceptable, or is the prefilter a premature optimization that costs more in correctness than it saves in latency? Measuring this first likely collapses the whole decision.
- [ ] Can the PreToolUse matcher filter on `file_path` specifically rather than the whole payload? If so, the readable-and-complete option exists and the tradeoff disappears.
- [ ] Should the same fix be applied to the `guard-skill-edit` and `guard-secret-read` prefilters in the same change, since they share the shape? The secret-read one matters most: a missed spelling there fails toward exposure rather than toward an ungated doc edit.
- [ ] Does the prefilter and the hook's arm list drifting apart warrant a generated-from-one-source approach, or is a comment cross-referencing the two enough?
- [ ] Is case-insensitivity the only spelling axis that leaks, or do trailing separators, URL-encoded paths, or Unicode-normalized spellings need the same treatment?
