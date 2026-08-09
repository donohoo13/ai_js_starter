---
type: chore
status: captured
created: 2026-08-09
---

# Assert rules globs match the paths they claim

## Context

Surfaced by the `quality` review board's security seat on `chore/retire-ui-ux-doc` as finding SEC-4, seated because `.claude/rules/*.md` `paths:` frontmatter is a control surface: the glob decides whether a rule loads, and no human reads it as prose.

Half of that finding is closed. `scripts/test/rules-frontmatter.battery.mjs` now asserts every rules file's frontmatter parses, closes, and carries quoted, brace-balanced, non-empty globs — the malformed cases, which load the body with empty metadata so the rules never fire and the session looks identical to one with no rules to follow. It is red-capable: a deliberately unbalanced brace was verified to fail it.

This task carries the half that could not be closed, and the reason it could not.

## Problem

Current behavior: the battery checks that a glob is well-formed, not that it matches anything. A perfectly-formed glob pointing at the wrong paths passes it and still fails silently at runtime — which is not hypothetical, since the same review found two real instances: `**/templates/**` reaching every Django, Flask, and Express view directory, and a `*.email.*` suffix glob dropping two extensions its sibling globs carried. Both were caught by a reviewer reading carefully.

The blocker is that a match assertion has to use the harness's own glob engine or it tests something else. No glob library ships in this repo (`node_modules` holds husky, node, prettier, turbo), and a vendored `minimatch` or `picomatch` would answer a question about that library rather than about what loads the rules — a green run that means nothing, which is worse than no test.

One concrete question rides on this and is currently unanswered: whether `**/` matches zero path segments here. It decides whether `'**/emails/**/*.tsx'` reaches react-email's default `emails/welcome.tsx`. The security seat recorded it as unresolved rather than guessing, and the branch added zero-segment spellings as insurance; a match battery would say whether that insurance is needed or redundant.

Desired behavior: positive and negative match assertions per rules file — `ux-standards.md` matches a `.tsx` and not a `.py`; `transactional-email.md` matches `emails/welcome.tsx` and not `templates/registration/login.html` — running against the same semantics the harness applies.

## Scope

- In scope (must-have): establish which glob semantics `paths:` uses, then extend the existing battery with per-file positive and negative cases.
- Out of scope (non-goals, named so the task does not expand silently): a `PreToolUse` hook over `.claude/rules/`. A test is the right instrument for a content check, matching the reasoning `ADR-FORMAT.md` already applies to ADR linting. Rewriting the well-formedness half, which ships and passes.

## Requirements

- Extend `scripts/test/rules-frontmatter.battery.mjs` rather than adding a fourth battery; the well-formedness checks and the match checks belong to one question.
- Discover the rules files rather than enumerating them, as the current battery does, so a new file is covered on arrival.
- State in the file what the match layer's semantics are grounded in, so a later reader can tell a verified assertion from an assumed one.

## Acceptance criteria

- [ ] The battery asserts at least one matching and one non-matching path per rules file carrying `paths:`.
- [ ] The zero-segment question is answered in the battery or in a comment citing where the answer came from.
- [ ] It fails when a glob is narrowed to miss its own positive fixture.

## Dependencies

- [ ] Which glob implementation the harness uses for `paths:`. Documentation, an observed behavior, or a maintainer answer all work; a guess does not.

## Risks / open questions

- [ ] If the harness's engine cannot be established, the honest outcome is to leave the match layer unbuilt and say so in the battery, rather than shipping assertions against a stand-in that can diverge silently.
