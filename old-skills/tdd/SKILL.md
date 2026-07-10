---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

If you wrote implementation before its test, delete it and reimplement from the test. Not "keep it as reference," not "adapt it while writing the test" - delete. Code you did not drive from a failing test is unverified by definition.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](interface-design.md)
- [ ] List the behaviors to test (not implementation steps)
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

**Verify RED before writing any code.** Run the test and watch it fail _for the expected reason_ (feature missing, not a typo or import error). A test that passes immediately is testing existing behavior - fix the test. **Verify GREEN after.** Run it again: the test passes, every other test still passes, and output is pristine (no errors or warnings). Run a single file with `pnpm --filter <package> exec vitest run <path>`.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Watch each test fail (verify RED) before implementing, then watch it pass (verify GREEN)
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior
- Never weaken a test to make it pass; fix the code

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## Don't Rationalize Out of It

| Excuse                               | Reality                                                      |
| ------------------------------------ | ------------------------------------------------------------ |
| "Tests after achieve the same thing" | Tests written after code pass immediately and prove nothing. |
| "Too simple to test"                 | Simple code breaks too; the test costs 30 seconds.           |
| "Already manually tested it"         | Ad-hoc, no record, can't re-run. Not systematic.             |
| "Deleting this code is wasteful"     | Sunk cost. Unverified code is the waste.                     |
| "I'm being pragmatic, not dogmatic"  | Test-first is the pragmatic path; debugging-after is slower. |

## When Stuck

| Problem                             | Fix                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Hard to test                        | Design is unclear. Simplify the interface (see [interface-design.md](interface-design.md)).          |
| Must mock everything                | Too coupled. Inject dependencies.                                                                    |
| Bug you can't discern from the code | Run `/diagnose` to root-cause first, then TDD the fix (the diagnosis may hand you the failing test). |

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
