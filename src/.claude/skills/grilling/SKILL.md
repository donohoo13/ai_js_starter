---
name: grilling
description: Interview the user relentlessly about a plan or design until a shared understanding is reached. Use when user wants to discuss a new request, idea, concept, issue, or stress-test a plan, or to resolve the `TBD (needs grilling)` items in a captured task or spec. Grilling sessions are best had before an implementation and should be used when the user uses any 'grill' trigger phrases.
---

Open with one line — "Grilling on <subject>, until <objective>." — so each session has a clear boundary when several happen in one conversation. Default objective: a shared, unambiguous understanding of what to build and why.

Interview the user relentlessly about every aspect of the subject. Walk down each branch of the decision tree, resolving dependencies between decisions one by one — take the largest, most load-bearing decisions first, since they shape every branch below. Ask one question at a time; a stack of questions is bewildering. With each question, give your recommendation and the reasoning behind it.

If a _fact_ can be found by exploring the codebase, look it up rather than asking, and verify the user's assertions against the code. The _decisions_ are the user's — put each one to them and wait. Correct misunderstandings about how the code currently works, citing the specific files and patterns you found so they enter the shared understanding.

The subject may be a document rather than a live idea — a captured task, spec, or plan. Then grill the user on the gap between what the document claims and what the codebase shows, resolving each `TBD` in it.

Do not leave a topic until you have a direct, unambiguous answer. Stop when the objective is met — not before, not after.
