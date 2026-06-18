---
name: diagnose
description: Iteratively root-cause a tough bug, test failure, or unexpected behavior that cannot be discerned from the code alone. A front-of-chain precursor that investigates to a proven root cause, then hands off to /capture-task or /write-a-prd. Does NOT implement the fix. Use when a bug needs reproduction, instrumentation, and hypothesis testing rather than a quick code read.
---

# Diagnose

Find the root cause of a hard bug through systematic investigation, then hand the finding off to be captured or planned. This skill **investigates; it does not fix.** When the root cause is proven, it terminates into `/capture-task` (file the bug with the diagnosis as its seed) or `/write-a-prd` (if the fix needs planning).

Use it for bugs you cannot understand by reading the code: intermittent failures, "works locally but not in prod," wrong values with no obvious source, multi-component breakage. For a bug you can already see in the code, skip this and go straight to `/capture-task` or the fix.

**Core principle:** No conclusions without investigation. A symptom is not a root cause.

## The Iron Law

```
NO ROOT-CAUSE CLAIM WITHOUT EVIDENCE THAT PROVES IT
```

If you have not reproduced it or traced it to its source, you have a hypothesis, not a diagnosis.

## Phase 1: Investigate

Before forming any theory:

1. **Read the error completely.** Full message, stack trace, line numbers, codes. The answer is often in the text that got skimmed.
2. **Reproduce it.** Exact steps, every time? If you cannot reproduce reliably, gather more data before theorizing, do not guess.
3. **Check what changed.** Recent commits (`git log`/`git diff`), new deps, config or env differences.
4. **Gather live evidence from our stack.** This is where OneView's read-only MCP servers do the heavy lifting (CLAUDE.md already mandates them for debugging):
   - **Local data discrepancy** (missing rows, wrong values, nulls, constraint/seed issues) → query local Supabase via `mcp__supabase-local__*` (SELECT only).
   - **Cloudflare infra** (Workers, Workflows, Durable Objects, R2, KV, Queues) → read live state via the Cloudflare MCP when available (GET/LIST only).
   - **Production / customer-specific** (data correctness, a customer's records) → `mcp__oneview-prod-read__*`, org-scoped per the invariant in CLAUDE.md.

   For multi-component failures (labs-api → labs-ingestion-worker → DB, or a sync workflow → R2 → mirror tables), instrument each boundary: confirm what data enters and exits each layer to find _where_ it breaks before asking _why_.

5. **Trace the data flow to its source.** Where does the bad value originate? Keep tracing upstream until you reach the origin, not the symptom. See [root-cause-tracing.md](root-cause-tracing.md).

**Multiple independent failures?** If you have 2+ unrelated failures (different subsystems, different root causes, no shared state), dispatch one investigator subagent per domain and run them concurrently, then integrate the findings. Do NOT parallelize when the failures might be related or share state, one agent investigates related failures together.

## Phase 2: Compare

1. **Find a working example.** Similar code in this codebase that works. What does it do differently?
2. **List every difference** between working and broken, however small. "That cannot matter" is how root causes hide.
3. **Understand dependencies.** What config, env, permissions, or other components does the broken path assume?

## Phase 3: Hypothesize and Test

1. **State one hypothesis:** "I think X is the root cause because Y." Specific, written down.
2. **Test it minimally.** Smallest possible probe, one variable. Do not fix multiple things, you are confirming the cause, not patching.
3. **Confirmed → done.** Not confirmed → form a new hypothesis with what you learned. Do not stack guesses on top of each other.
4. **3 hypotheses failed → stop and surface to the user.** Three misses usually means a wrong assumption or an architectural problem, not a fourth guess. Lay out what you ruled out and ask for direction. This is the "blocked, call out" trigger, do not thrash silently.

## Deliverable

When the root cause is proven, produce:

- **Root cause:** the actual origin, stated plainly, with the evidence that proves it.
- **Minimal reproduction (where practical):** a failing test or a short repro script that demonstrates the bug. This is proof, not a fix, and it hands `/tdd` a ready-made failing test downstream. If the issue is genuinely environmental, timing-dependent, or external, document the investigation instead.
- **Affected area and suspected blast radius.**

## Hand Off

A bug that needed this skill is worth a written record. Default to filing it:

- **`/capture-task`** (default) - file the bug; drop the root cause, evidence, and repro into its `Context for planning` so a later `/write-a-prd` starts rich instead of cold.
- **`/write-a-prd`** - if the fix is non-trivial and needs planning now.
- **Proceed to fix directly** - only when the diagnosis made the fix obvious and small; then implement via the normal path (`/tdd`).

This skill never implements the fix itself, and never references the fix path beyond the handoff above.
