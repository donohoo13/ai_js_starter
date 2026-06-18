---
name: write-a-prd
description: Generate a product requirements document at product altitude (problem, users, value, scope) from a context source the user names, then write it back versioned to that source. Use when the user wants to write or update a PRD, turn a product idea/brief/ticket into a structured PRD, or expand a captured item into one. Platform-agnostic — the source can be pasted inline or pulled from any tracker with an MCP (Linear, Jira, GitHub, Notion, etc.).
argument-hint: '[optional: pasted context, a source id/url, or a feature description]'
---

This skill turns a product brief into a structured PRD and lands it back where the product team works. It stays at **product altitude** — problem, users, value, priority, scope. It does NOT design modules, choose schemas, or write test strategy; that is engineering's job downstream (`/prd-feedback` then `/write-a-trd`). Keeping this document free of engineering decisions is the whole point of the product/engineering split — resist the pull to start solving.

## 1. Resolve the context source

A PRD is generated _from_ something and written _back_ to something. Before anything else, establish where the context lives and where the result goes. The source is the user's responsibility to provide — do not assume a platform.

Resolve it one of these ways, in order:

- **Pasted inline** — context is already in `$ARGUMENTS` or the conversation. Use it directly. There is no system of record yet, so at step 5 ask the user where the PRD should live.
- **A named platform** — the user points at a tracker ("the Linear project FOO-123", "this Jira epic", "GitHub issue #42", "our Notion brief at <url>"). Pull it through that platform's MCP. **If no MCP for that platform is connected, stop and say so** — ask the user to paste the context instead or wire up the MCP via `/mcp`. Never guess at a platform's contents.
- **Nothing yet** — the user has only a rough idea. Ask for a description of the problem and who has it. The PRD will be generated from the interview alone, and step 5 asks where it should live.

**Record the source handle** (the id/url and platform, or "pasted"). Step 5 writes the finished PRD back to exactly that place, so settle it now.

## 2. Reach shared understanding — as a product partner

Invoke `/grill-me` with this frame:

- **Your role:** a product partner pressure-testing the brief — sharp on user value, scope, and priority, deliberately _not_ an implementer.
- **Subject:** the sourced context.
- **Objective:** a clear, unambiguous picture of the problem, who has it, what success looks like, and what is in vs out of scope.
- **Stay out of:** how it gets built. If an engineering constraint comes up, note it as an open question for `/prd-feedback`; do not resolve it here.

Skip this step only if an equivalent product interview already happened in this conversation. You may still read the codebase to ground yourself in what exists today, but the questions stay at product altitude.

## 3. Scope check

Ask: is this genuinely one product capability, or several independent ones? Default hard to a single PRD — pieces that feel separate usually share a user journey and ship together. Split only when two capabilities serve different user goals and could each ship alone with standalone value. When you split, PRD one now and capture the deferred siblings to the same source so nothing is lost.

## 4. Write the PRD

Fill in the template below. It is deliberately product-only. There is an **Engineering Context** placeholder at the end — leave it empty; `/prd-feedback` fills it once engineering has reviewed, and an accepted PRD carries it into `/write-a-trd`. Read `references/example-prd.md` for the altitude to hit — if your draft names a technology or a data structure, you have dropped too low.

## 5. Write it back to the source, versioned

A PRD iterates — product and engineering pass it back and forth via `/prd-feedback` — so it must be versioned at its source, not dropped as a one-off.

- **Stamp a version.** Put a `PRD vN — <status>` header at the top (v1 on first write; bump on every later rewrite). Status starts as `Draft`.
- **Write to the recorded source.** If the source is an editable artifact (a Linear issue/doc, a Jira ticket, a GitHub issue), update it _in place_ through its MCP so the canonical current version lives where the team already looks, preserving any prior raw brief under a collapsed/appended note so nothing is lost. If the context was pasted with no home, ask the user where it should live and write it there.
- **Versioning is an outcome, not a mechanism.** Different platforms version differently (issue description + comment history, a doc with revision headers, etc.). Achieve "current canonical body + recoverable history"; use whatever the platform's MCP makes natural. Do not hardcode one tracker's model.

## 6. Hand off

The PRD is now in conversation context and at its source. Ask the user how to proceed:

- **Engineering review** — invoke `/prd-feedback` to get the feasibility-and-tradeoffs pass. This is the normal next step; a PRD should not go to `/write-a-trd` until engineering has weighed in at least once.
- **Stop** — pause for product to circulate it first.

<prd-template>

# PRD vN — <Draft | In Review | Accepted>

## Problem Statement

The problem the user faces, from the user's perspective. Why it matters, who it affects.

## Solution

The solution from the user's perspective — the experience and outcome, not the implementation.

## User Stories

An extensive, numbered list covering all aspects of the capability:

1. As an `<actor>`, I want `<capability>`, so that `<benefit>`.

<user-story-example>
1. As a mobile bank customer, I want to see balances on my accounts, so that I can make better-informed spending decisions.
</user-story-example>

## Success Metrics

How we will know this worked — the user-facing or business signals that move. Avoid vanity metrics.

## Priority & Scope

What ships first and why. Relative priority of the user stories if not all land at once.

## Out of Scope

What is explicitly NOT part of this PRD.

## Open Questions

Unresolved product questions, and any engineering concerns surfaced during the interview that `/prd-feedback` should weigh. These are questions, not answers.

## Engineering Context

_Left empty by product. `/prd-feedback` fills this with the digest of the accepted feasibility review — agreed constraints, tradeoffs, and the chosen implementation path — and links any binding decisions recorded as ADRs in `docs/adr/`. An accepted PRD carries this section into `/write-a-trd`._

</prd-template>

$ARGUMENTS
