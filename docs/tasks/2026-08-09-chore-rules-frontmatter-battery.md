---
type: chore
status: captured
created: 2026-08-09
---

# Test that every rules file's paths globs actually match

## Context

Surfaced by the `quality` review board's security seat on `chore/retire-ui-ux-doc` as finding SEC-4, seated because `.claude/rules/*.md` `paths:` frontmatter is a control surface: the glob decides whether a rule loads, and no human reads it as prose.

The UI_UX retirement moved the usability and accessibility floors out of a root markdown file and onto that mechanism. Before the change the floors were reached by a skill naming the file; now they are reached by a glob matching a path.

## Problem

Current behavior: nothing protects the glob. `grep -rn "rules/" .claude/settings.json .claude/hooks/` returns nothing — no `PreToolUse` matcher covers `.claude/rules/**`, and `guard-skill-edit` is scoped to `.claude/skills/`. No battery under `scripts/test/` parses the frontmatter. A typo in a brace list, a stray unquoted `*`, or a well-meaning narrowing silently stops the floors loading.

The failure is indistinguishable from a session that simply had no UX rules to follow, which is the same silent-gap class the retirement exists to close.

Two live examples from the same review show the mechanism is easy to get wrong in practice: `**/templates/**` reached every Django and Flask view directory, and the `*.email.*` suffix glob dropped two extensions its sibling globs carried. Both were caught by a reviewer reading carefully, not by anything mechanical.

Desired behavior: a battery alongside `guard-dev-server.battery.mjs` and `check-install.battery.mjs` that parses every `.claude/rules/*.md` `paths:` block and asserts a known fixture path matches each file's globs, plus a known non-matching path that must not.

## Scope

- In scope (must-have): the battery, its fixtures, and wiring it wherever the other two batteries run.
- Nice to have: asserting the frontmatter parses as YAML at all, which catches the malformed case where the body loads with empty metadata.
- Out of scope (non-goals, named so the task does not expand silently): a `PreToolUse` hook over `.claude/rules/`. A test is the right instrument for a content check, matching the reasoning `ADR-FORMAT.md` already applies to ADR linting.

## Requirements

- Match the two shipped batteries' shape and reporting so the three read alike.
- Assert positive and negative cases per file: `ux-standards.md` matches a `.tsx` and must not match a `.py`; `transactional-email.md` matches `emails/welcome.tsx` and must not match `templates/registration/login.html`.
- The glob semantics must be the harness's, not a stand-in library's, or the battery tests something other than what loads the rules.

## Acceptance criteria

- [ ] The battery runs green and fails when a glob is deliberately broken.
- [ ] It covers every file in `.claude/rules/` carrying `paths:`, discovered rather than enumerated.

## Dependencies

- [ ] Which glob implementation the harness uses for `paths:`. No glob library is installed in this repo, so the battery either vendors the right one or shells out to whatever the harness uses.

## Risks / open questions

- [ ] The security seat could not settle whether `**/` matches zero path segments here and declined to guess. That question is exactly what this battery would answer, and it decides whether the zero-segment spellings added during the review were necessary or redundant.
