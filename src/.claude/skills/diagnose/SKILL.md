---
name: diagnose
description: Structured diagnosis loop for hard or complicated bugs. Build a red-capable feedback loop before any theorizing, reproduce and minimize, test ranked falsifiable hypotheses, then land the fix through /tdd and the human QA gate. Use whenever the user says "diagnose", "debug this", "root-cause this", "figure out why", or reports something broken, throwing, failing, flaky, or slow that they want understood or fixed now, even if they never say "bug". Parking a bug for later is /capture-task; investigating it now is this skill.
---

# Diagnose

A discipline for hard or complicated bugs. Skip phases only when explicitly justified: name the phase and the reason in one line before skipping. No conclusions without investigation. A symptom is not a root cause.

Orient before digging: lean on what this session already knows, read `CONTEXT.md` and any ADRs near the suspect area if they exist, and check the stack (`package.json`, runtime configs) so harnesses and probes fit the runtime.

## Phase 1 — Build a feedback loop

**This is the skill.** Everything else is mechanical. With a tight pass/fail signal that goes red on _this_ bug, bisection, hypothesis-testing, and instrumentation all just consume it; without one, no amount of reading code will save you. Spend disproportionate effort here. Be aggressive, be creative, refuse to give up.

Ways to construct one, in rough order of preference:

1. **Failing test** at whatever seam reaches the bug: unit, integration, e2e.
2. **HTTP script** (`curl` or similar) against a running dev server.
3. **CLI invocation** on a fixture input, diffed against a known-good snapshot.
4. **Headless browser script** driving the UI, asserting on DOM, console, or network.
5. **Trace replay**: save a real request, payload, or event log to disk; replay it through the code path in isolation.
6. **Throwaway harness**: a minimal subset of the system (one service, mocked deps) exercising the bug path in a single call.
7. **Property/fuzz loop** for "sometimes wrong output": run 1000 random inputs, look for the failure mode.
8. **Bisection harness** when the bug appeared between two known states: automate "boot at state X, check" so `git bisect run` can consume it.
9. **Differential loop**: same input through old vs new version (or two configs), diff the outputs.
10. **HITL script**, last resort: if a human must click, drive them with `scripts/hitl-loop.template.sh` so the loop stays structured and the captured output feeds back to you.

Treat captured artifacts as secret-bearing until proven otherwise: HAR files, real payloads, and log dumps routinely carry auth headers, session cookies, and PII. Scrub what you can, keep them in a gitignored scratch path outside version control, and plan their deletion — the Phase 4 checklist holds you to it.

Then tighten it, because the loop is a product: faster (cache setup, skip unrelated init), sharper (assert the specific symptom, not "didn't crash"), more deterministic (pin time, seed RNG, isolate filesystem). A 2-second deterministic loop is a debugging superpower; a 30-second flaky one barely beats none. For non-deterministic bugs the goal is a higher reproduction rate, not a clean repro: loop the trigger 100x, parallelize, add stress, inject sleeps — a 50% flake is debuggable, a 1% flake is not.

Phase 1 is done when you can name **one command** you have **already run at least once** (paste the invocation and its output) that is red-capable (drives the actual bug path and asserts the user's exact symptom, so it can go red on this bug and green once fixed), deterministic, fast (seconds), and agent-runnable. If you catch yourself reading code to build a theory before this command exists, stop — jumping straight to a hypothesis is the exact failure this skill prevents.

If you genuinely cannot build a loop, stop and say so explicitly: list what you tried, then ask the user for an environment that reproduces it, a captured artifact (HAR file, log dump, recording with timestamps), or permission to add temporary instrumentation. Do not proceed to hypothesize without a loop.

## Phase 2 — Reproduce + minimize

Run the loop; watch it go red. Confirm it fails with the failure mode the **user** described — a nearby-but-different failure means wrong bug, wrong fix — and capture the exact symptom (error text, wrong output, slow timing) so later phases can verify the fix addresses it.

Then shrink to the smallest scenario that still goes red: cut inputs, callers, config, and steps one at a time, re-running after each cut. Done when every remaining element is load-bearing — removing any one makes the loop go green. A minimal repro shrinks the hypothesis space (fewer moving parts left to suspect) and becomes the regression test in Phase 4. Do not proceed until reproduced **and** minimized.

## Phase 3 — Hypothesize + instrument

Generate **3–5 ranked hypotheses** before testing any; single-hypothesis generation anchors on the first plausible idea. Each must be falsifiable — state its prediction: "if X is the cause, then changing Y makes the bug disappear / changing Z makes it worse." No prediction means it is a vibe; sharpen or discard.

Show the ranked list to the user before testing. They often re-rank instantly ("we just deployed a change to #3") or have already ruled some out — cheap checkpoint, big time saver. Present the list and proceed with your ranking in the same turn, folding in any re-rank the user sends back.

Then probe: each probe maps to one prediction, one variable changed at a time. Prefer a debugger or REPL breakpoint over logs, targeted logs at hypothesis-distinguishing boundaries over that, and never "log everything and grep". Tag every debug log with a unique prefix like `[DEBUG-a4f2]` so cleanup is a single grep — untagged logs survive into commits.

For performance regressions, logs are usually the wrong tool: establish a baseline measurement first (timing harness, profiler, query plan), then bisect. Measure first, fix second.

## Phase 4 — Fix through the chain

Write the regression test before the fix, via `/tdd`, but only at a **correct seam** — one where the test exercises the real bug pattern as it occurs at the call site. A too-shallow seam (a unit test that cannot replicate the chain that triggered the bug) gives false confidence. **If no correct seam exists, that itself is the finding**: the architecture is preventing the bug from being locked down — document it and hand it to `/capture-task`.

With a seam: turn the minimized repro into a failing test there, watch it fail, apply the fix, watch it pass, then re-run the Phase 1 loop against the original un-minimized scenario.

Before declaring done:

- [ ] Original repro no longer reproduces (Phase 1 loop re-run, output shown).
- [ ] Regression test passes, or the absence of a seam is documented and captured.
- [ ] All `[DEBUG-...]` instrumentation removed (grep the prefix) and throwaway harnesses deleted or moved to a clearly marked debug location.
- [ ] Captured artifacts (HAR files, payloads, log dumps, recordings) deleted — they carry tokens and PII, and they never belong in the tree.
- [ ] The winning hypothesis is stated wherever the fix is recorded (commit message, task file), so the next debugger learns.

Then the chain takes over: human QA gate first — hand the user steps to see the fix in action and wait for their verdict — then the usual exits (`/stage-for-commit`, or the branch's existing flow). Where the team flow requires branches, land the fix on a non-main branch chosen deliberately at fix time, not improvised after the guard-main hook blocks a commit. When the fix grew past quick-fix size, recommend `/review-board` before the commit exit — author overconfidence is exactly what the board exists to catch. Last, ask what would have prevented this bug: an architectural answer (no good seam, tangled callers, hidden coupling) goes to `/capture-task` with specifics, and a durable debugging gotcha earns one `/curate-context` nudge. Make these recommendations after the fix is in, not before — you know more now than when you started.
