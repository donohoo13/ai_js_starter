---
name: prd-feedback
description: Give a PRD a structured engineering feasibility review — interrogate it against the actual codebase, surface constraints and required tradeoffs, recommend an implementation path, and post the verdict back to the PRD's source as a versioned thread. The iterative bridge between product and engineering. Use when a product PRD needs an engineering reality check, when asked whether a PRD is feasible or what it would take to build, or to respond to a new PRD version. Platform-agnostic — reads and writes wherever the PRD lives.
argument-hint: '[optional: pasted PRD, a source id/url, or the PRD from context]'
---

This skill is the loop between product and engineering. Product writes a PRD at product altitude; this skill answers, from engineering, three questions grounded in the real codebase: **is it feasible, what does it actually take, and what must product accept to get it?** The output is feedback product can act on — not a redesign. Product owns the PRD; engineering owns the reality check. It runs once per PRD version and repeats as the PRD evolves, until product accepts a version.

Read `references/example-feedback.md` for the shape of a finished verdict before writing one.

## 1. Get the current PRD version

Find the PRD and the version you are reviewing. It is the user's responsibility to point you at it; do not assume a platform.

- **In context** — the PRD is already in this conversation (e.g. `/write-a-prd` just ran). Use it.
- **A named platform** — the user points at where it lives ("the Linear issue", "GitHub #42", a Notion url). Pull the current version through that platform's MCP. **If no MCP for that platform is connected, stop** and ask the user to paste the PRD or wire the MCP via `/mcp`.
- **Pasted inline** — use it directly.

**Record the source handle and the version number** you are reviewing. Step 4 writes the verdict back to that source, tagged to that version, so a later version gets a clearly distinct review.

## 2. Interrogate the PRD against the codebase — as an engineering skeptic

Invoke `/grill-me` with this frame:

- **Your role:** a senior engineer doing a feasibility review — skeptical, constructive, grounded in what the code actually is today.
- **Subject:** the current PRD version, read against the real codebase.
- **Who you grill:** the engineer running this session, on the calls only a human can make (acceptable tradeoffs, priority of constraints, appetite for scope cuts). You do the codebase investigation yourself — read the modules, schemas, and integration points the PRD implies and bring findings to each question, rather than asking the engineer to recall them.
- **Objective:** know, concretely, what building this PRD as written would require, where the codebase resists it, and which tradeoffs are real.
- **Leave behind:** the raw material for the verdict in step 3.

For any area where feasibility genuinely cannot be judged by reading the code — a suspected performance cliff, an unproven integration — invoke `/diagnose` to prove it rather than guessing in the verdict.

## 3. Synthesize the feasibility verdict

Turn the investigation into structured feedback. Use the format in `references/example-feedback.md`. The verdict states:

- **Feasibility** — one of: _Feasible as written_ / _Feasible with tradeoffs_ / _Not feasible as written_.
- **Engineering constraints** — what the current codebase imposes (existing schema, coupling, missing infrastructure), each tied to a concrete place in the code.
- **Required tradeoffs** — what product must accept or decide: scope cuts, sequencing, a degraded-but-shippable v1, a cost. Frame each as a decision for product, with the engineering consequence of each option.
- **Recommended path** — the implementation approach engineering recommends, with rough relative effort/risk. Offer alternatives where a real fork exists.
- **Open questions for product** — what you need answered before a TRD can be written.
- **Recommendation** — _proceed as written_ / _proceed with these changes_ / _revise before proceeding_.

Keep it about feasibility and tradeoffs. Do not design the solution in detail here — that is `/write-a-trd`. This is the engineering opinion product needs to decide whether the PRD is ready.

## 4. Post the verdict to the PRD's source, as a versioned thread

The back-and-forth must be recoverable, so the verdict lives with the PRD, tagged to the version it reviewed — not just in this conversation.

- Write the verdict to the recorded source as a **threaded entry** keyed to the PRD version (e.g. "Engineering review of PRD v2"). Through the platform's MCP, use whatever maps to a thread there — a comment, a linked note, a review entry.
- **This is an outcome, not a mechanism.** Achieve "the verdict is attached to the PRD and to the specific version it judged, and the history of reviews is readable." Use whatever the platform's MCP makes natural; do not hardcode one tracker.
- If the PRD was pasted with no home, present the verdict in conversation and ask the user where the thread should live.

## 5. Loop or close out

A review ends in one of two states:

- **Product revises** — product takes the feedback, edits the PRD, and `/write-a-prd` writes a bumped version. Re-run this skill against the new version. Each pass should converge; if it is not converging after a couple of rounds, that itself is a signal to surface to the user.
- **Product accepts a version** — the PRD is good to build. Now, and only now, finalize the **Engineering Context** section _in the PRD itself_:
  - Write a tight digest of the accepted review — the agreed constraints, the tradeoffs product signed off on, and the chosen implementation path. This is a summary for the next reader, not a fresh review.
  - If the loop produced a genuinely binding, hard-to-reverse architectural decision, record _that_ as an ADR via `/domain-modeling` (into `docs/adr/`) and **link** it from Engineering Context. Do not inline a parallel decision record — `docs/adr/` is the system of record for decisions; this section only summarizes and points to it.
  - Flip the PRD status to `Accepted` and write it back to the source.

## 6. Hand off

Once a version is accepted and Engineering Context is written, the PRD is ready to become a technical spec. Invoke `/write-a-trd`, which reads the accepted PRD and its Engineering Context and does the deep implementation dive.

$ARGUMENTS
