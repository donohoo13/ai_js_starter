---
name: tdd
description: Test-driven development discipline — the red → green loop, seam selection, and the anti-patterns that make tests worth keeping. Use when implementing any feature or bug fix a test can lock down, even when nobody says test-first, and whenever the user asks to build test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

### Choosing the seam by dependency

What the code under test depends on decides where the seam goes and whether a test double is warranted. Classify each dependency:

- **In-process** (pure computation, in-memory state, no I/O) — test through the module's interface directly. No adapter, no mock.
- **Local-substitutable** (a real dependency with a faithful local stand-in: Postgres via PGLite, an in-memory filesystem) — run the stand-in in the suite and test through the interface. The seam is internal; keep it out of the module's public interface.
- **Remote but owned** (your own services across a network) — define a port at the seam, inject a real transport adapter (HTTP/gRPC/queue) in production and an in-memory adapter in tests. Two adapters, so the seam is real.
- **True external** (a third party you don't control: Stripe, Twilio) — inject a port, provide a mock adapter in tests. Mock only here, at the outermost edge; never mock internal collaborators.

### The UI seam split

Layout, appearance, and composition are never test targets: jsdom computes no layout (its own README — no layout or rendering), so a test can neither see nor protect how a surface looks, and appearance verification belongs to the surface's design artifact and the build's rendered checks, not to assertions. UI code still gets the full discipline at the right seams — the logic behind the view (state, view-model math, derived values) tests through its module interface, and behavioral contracts test at the component seam the way a user exercises them: clicking save submits the right payload, the error message renders, the hidden section stays hidden until toggled. The Humble View shape — thin view, logic pushed behind a testable interface — is what makes this split natural rather than a coverage hole.

When the loop touches an existing test file, appearance-shaped tests found there are cleaned up in the same change: assertions targeting inline styles, look-classes, render-tree snapshots, or geometry values (which jsdom fakes as zeros) are removed within the change's blast radius. Before deleting, check whether the test smuggles a behavioral guarantee — `display: none` asserted directly is really "hidden until X", so re-express it at the behavior seam instead. Assertions on roles, accessible names, and `aria-*` stay: those are contracts, not looks. Report every removal in the change summary; a purge wider than the touched files is a `/capture-task`, never a hunt.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Run a bounded neighborhood.** Each cycle runs the tests covering the seam under test plus the tests of its direct consumers, and lints only the files touched; the full suite runs at the end of the work, where its job is catching interactions single-file runs cannot see. "The end of the work" is scoped to the unit this loop is running: a caller that re-enters the loop re-runs the suite on its own terms, which is why `implement-task` runs it at Land and again after any post-QA fix. Bound it by dependency rather than by directory depth — depth means a whole app in one repo layout and a single util in another. Feedback is most useful one edit old, and a full suite per cycle is slow enough that the loop stops getting run at all.
- **Refactoring is not part of the loop.** Land it as a separate tidy step after green — tests unchanged, proving the behavior held — or in an explicit user-requested cleanup pass; never mid-cycle between red and green.
