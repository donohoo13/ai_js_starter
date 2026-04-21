---
name: codify
description: Digest a conversation's key patterns, standards, or architectural decisions into concise bullets for CLAUDE.md or DESIGN_PRINCIPLES.md. Use at the end of an implementation, bug fix, or design discussion when a reusable convention emerged that future AI sessions should follow.
disable-model-invocation: true
---

Scan this conversation for patterns, standards, or architectural decisions that should be codified for future AI sessions. Then propose additions to the project's contextual files.

## Process

1. **Identify candidates.** Review the conversation for:
   - New conventions or patterns established during implementation
   - Architectural decisions with rationale worth preserving
   - Gotchas or anti-patterns discovered during debugging
   - Styling, component, or data-flow standards that emerged

   Skip anything already documented in CLAUDE.md or DESIGN_PRINCIPLES.md.

2. **Classify each candidate.** Determine the best home:
   - `CLAUDE.md` — tooling, workflow, code-organization, testing, API, or database conventions
   - `DESIGN_PRINCIPLES.md` — UI/UX patterns, component usage, styling rules, layout conventions

3. **Draft bullets.** For each candidate, write a single concise bullet (or minimal section if the concept needs sub-bullets). Follow these rules:
   - **Imperative voice, present tense.** e.g., "Use `BaseDialog` for all creation flows."
   - **Front-load the constraint.** Lead with what to do/avoid, not the backstory.
   - **Reference a file when a living example exists.** Use `See <FileName>.vue as reference.` so future sessions can read the pattern directly. Only reference files that cleanly demonstrate the convention.
   - **No filler.** Omit "we decided", "going forward", "always remember". Just state the rule.
   - **Match existing tone and density.** Read the target file first and mirror its style.

4. **Present the proposal.** Show the user:
   - The exact bullet(s) or section(s) to add
   - Which file each belongs in and where it fits (under which existing heading)
   - A one-line rationale for why it's worth codifying (not included in the bullet itself)

5. **Apply on approval.** Once the user confirms (they may edit or reject items), insert the approved text into the target file(s) under the appropriate heading. Do not reorder or rewrite existing content.

## Quality checks

- If a rule is already implied by existing bullets, do not add a near-duplicate — suggest strengthening the existing one instead.
- If the convention is project-specific but the file is global (e.g., user-level CLAUDE.md), flag the mismatch and suggest the project-level file.
- If no meaningful convention emerged from the conversation, say so — do not force output.
- When a clear, well-implemented example of a pattern already exists in the codebase, include a link to the best one if it helps reinforce the new conventions, rules, and structure.
