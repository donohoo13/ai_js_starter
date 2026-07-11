---
name: capture-task
description: Quick-capture any unit of work (a bug, a feature idea, or a chore) as a structured task file in `docs/tasks/`. A "task" is the umbrella: anything worth tracking for later without running a full grilling session right now. Use whenever the user says "capture this", "log this", "track this for later", "file a follow-up", "create a task", "outline a feature", "we should do X later", "add this to the roadmap", "tech debt note", "park this", OR reports something broken: "capture this bug", "log this bug", "file an issue for this", "demo bug", "saw a bug in prod", "this just broke". Optimized for low-friction in-the-moment capture.
argument-hint: "[optional: brief outline of the bug, feature, or chore]"
---

# Capture Task

Capture what the user just described as one markdown file in `docs/tasks/`, then get out of the way. This is in-the-moment capture: the file must hold enough context for a fresh session, with none of this conversation available, to pick the task up cold and run a full `/grilling` or `/grill-me` session later. Write for that future session.

## Rules of engagement

- Do not interview as the majority of needed context should have been surfaced from the current working session up to this point. Ask at most two clarifying questions, and only if you cannot tell what the task actually is. Everything else you are unsure about becomes an open question in the file instead.
- Mine the current conversation first: error output, file paths, commands run, decisions already made, constraints mentioned in passing. This context evaporates when the session ends; the task file is where it survives.
- Verification budget is seconds, not minutes: confirm a file path or symbol name with a quick search if it makes the capture more precise, but never launch an investigation. Capture speed beats completeness.
- Do not design the fix. Noting a suspected cause or a rough shape the user voiced is fine; solutioning is the future session's job.
- Fill only what the conversation actually surfaced. A section with nothing known gets a single `TBD (needs grilling)` line, never invented content. The explicit gap is what separates decided from needs-discovery for the team.

## Task file

Path: `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` where `<type>` is `bug`, `feature`, or `chore` and the slug is 2-5 kebab-case words. Create `docs/tasks/` if it does not exist. Use today's actual date.

Start from `assets/task-template.md` (sibling of this SKILL.md). It defines the required frontmatter and seven sections: Context, Problem, Scope, Requirements, Acceptance criteria, Dependencies, Risks / open questions. Replace every guidance comment with real content or `TBD (needs grilling)`; no `<!-- -->` comments survive in the captured file. Keep every bullet one continuous line.

Where the usual facts land, by type:

- Bug: current vs desired behavior, repro steps as known, and exact error text verbatim go in Problem; environment and suspected code paths in Problem or Requirements; who hit it and severity in Context.
- Feature: who is asking and what triggered the idea in Context; the gap in Problem; must-have vs nice-to-have split in Scope; voiced constraints and adjacent existing code in Requirements.
- Chore: what is dirty and where in Problem; the cost of leaving it (risk, friction, time) in Context; blast radius of cleaning it up in Scope or Risks.

Risks / open questions is the payload for the future grilling session: the 2-5 questions you would have asked if this were an interview, as `- [ ]` checkboxes, prioritizing the ones whose answers most change the work. Acceptance criteria also use `- [ ]` checkboxes.

The quality bar: someone new to the project should be able to read the file and answer what we are changing, why, what exactly should happen, what should not happen, and what is still uncertain. In a quick capture the last question carries most of the weight.

## After writing

Confirm in one line with the file path, and note the task can be picked up later by running `/grilling` against the file in a fresh session. Do not commit, do not create GitHub issues, and do not edit any other files.

$ARGUMENTS
