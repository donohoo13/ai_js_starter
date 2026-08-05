---
name: skill-creator
description: Author, edit, and review Claude Code skills with the discipline that makes them reliable — lean imperative SKILL.md bodies, trigger-accurate third-person descriptions, progressive disclosure into references, and a gut-check handoff of test prompts the user runs in a fresh session. Use before creating, editing, renaming, or deleting anything under `.claude/skills/`, including one-line SKILL.md tweaks landed mid-session by a grilling exit or another skill, and when a skill misfires, undertriggers, or needs its description sharpened. Also owns the landing checklist for every skill change — README blurb updates and fork-points coupling checks.
---

# Skill Creator

The authoring discipline for skills. Load it before touching any file under `.claude/skills/`, whatever brought the change — a direct ask, a grilling exit, another skill's follow-through, a one-line description tweak. The `guard-skill-edit` PreToolUse hook denies `Edit` and `Write` on those paths until this skill is loaded — a Bash write is outside its matcher — so loading it first is the fast path, not ceremony. A SKILL.md is a prompt that will run in many future sessions that know nothing about the conversation that shaped it; that is why every edit gets the same discipline whether it rewrites a skill or touches one line.

## Scope first

- Mine the session before interviewing: the conversation that triggered the change usually already contains the workflow, the correction, or the gap. Extract what the skill should enable, when it should trigger, and what it should produce; put only the real gaps to the user.
- A new skill or a structural rewrite means reading `references/skill-quality.md` in full first. For a small edit, the rules below are the floor either way.

## Authoring rules

The complete checklist — limits, frontmatter keys, sources — is `references/skill-quality.md` (read it as reference; nothing in it runs). The rules that carry the most weight:

- **The description is the trigger**, joined by `when_to_use` in the listing and by `paths`, which narrows automatic activation without ever forcing it. Third person, stating what the skill does and when to use it, with concrete contexts and trigger phrases spelled out. Phrase triggers around session state as well as user intent — "use when editing any file under `.claude/skills/`" fires in sessions where nobody said the word "skill". Undertriggering is the default failure mode; specificity is the cure.
- **Progressive disclosure.** Metadata sits in the listing, the body loads on invocation and stays for the whole session, references load on demand. Keep the body under 500 lines and aim far lower; push long or fragile detail into `references/` exactly one hop from SKILL.md; give a reference file a table of contents past ~100 lines.
- **Explain why over MUST.** Imperative voice with the reasoning attached. All-caps ALWAYS/NEVER and rigid enumerations are a yellow flag that the reasoning is missing — reframe as the reason the behavior matters and the model generalizes it. Generalize past the motivating example: a skill runs across many prompts, not the one that inspired it.
- **Bundled files declare their mode.** "Run `scripts/x.py`" and "see `references/x.md` for the schema" are different instructions; ambiguity wastes tokens or skips execution.
- **Rewrite accreted prose; don't patch it.** Skill files degrade clause by clause: each edit appends a qualifier until a bullet contradicts its own thesis. When an edit inverts a rule or reframes what a passage is for, rewrite that section as if written under the new thesis from the start. Clause surgery is only for edits that keep the thesis; coherence of the final text outranks minimality of the diff.

## Gut-check handoff

This skill never tests its own output. The session that wrote a skill carries the full context that shaped it, so its own runs prove nothing about how the skill behaves cold — triggering and instruction-following can only be judged by a session that discovers the skill the way real sessions do. Close every create or substantive edit by handing the user test prompts to run in a fresh session:

- 2–3 realistic task prompts, each with the expected behavior stated — what the fresh session should load, do, or produce if the skill works.
- When the description changed: should-trigger and should-not-trigger prompts, with negatives chosen as near-misses (adjacent domains, shared keywords), not obviously irrelevant asks.
- Prompt craft rules are in `references/skill-quality.md`.

The user's verdicts drive the next edit. Trivial edits (typo, link fix) skip the handoff; a change to triggering, structure, or behavior never does.

## Landing checklist

A skill change is not done when the SKILL.md reads well; it is done when the suite is coherent. Every change lands with:

- **README blurb** — a change to behavior, triggering, or interface updates the skill's entry in `.claude/skills/README.md` in the same change.
- **Fork points** — in repos shipping `project-init`, a change to a skill's coupling (platform CLI, tracker path, branch model, plugin dependency) updates `project-init/references/fork-points.md`.
- **Gut-check prompts** — handed to the user per the section above.
