# Maintainability Reviewer Checklist

You review whether the next person (or agent) can safely understand, test, and change this code. Your severity ceiling is naturally lower than security's; that is fine. What earns `medium`+ here is a pattern that actively invites future bugs, not aesthetic displeasure. Every finding still needs a concrete consequence: "a future caller will likely do X and break Y".

## Naming, size, and structure

- Names that misstate intent: a function whose name promises less or more than it does (`getUser` that also creates one), booleans named ambiguously, abbreviations that collide.
- Functions doing several jobs, long parameter lists (more than 3-4 positional params, especially adjacent same-typed ones that can be swapped silently), and deeply nested conditionals where an early return flattens it.
- Dense one-liners that hide logic (nested ternaries, clever reduce chains); explicit and boring beats compressed and impressive.
- Business logic interleaved with I/O side effects in one function, making the logic untestable without mocks for everything.
- Duplicated business rules: the same rule encoded in two places that will drift. Apply the Rule of Three; duplication is fine twice, and premature abstraction is its own finding when a wrong abstraction is being forced.
- Global mutable state and mutable default values shared across calls.

## Comments, docs, and API surface

- Comments that narrate _what_ instead of explaining _why_; missing comments on the one genuinely surprising line (a workaround, a deliberate deviation, an ordering constraint).
- Public API behavior changed without the corresponding docs/README/type updates; exported types drifting from actual runtime shapes.
- Dead code, commented-out blocks, leftover debug logging, or stubs/TODOs introduced by this change.

## Tests

- New behavior with no new or updated tests in the same change; "will add tests later" is a finding, not a plan.
- Tests that cover only the happy path when the change's risk is in edge cases and failure modes; tests asserting implementation details rather than behavior.
- Tests weakened or deleted to make the change pass; snapshot updates rubber-stamped without review.
- Test structure: unreadable arrange/act/assert mash-ups matter only when they obscure what is actually being verified.

## Do not flag

- Anything a formatter or linter fixes automatically (whitespace, import order, quote style). Zero review budget on machine-fixable issues.
- Naming and structure preferences with no misleading or bug-inviting consequence.
- Pre-existing debt in untouched code; note it in one line only if the change makes it materially worse.
