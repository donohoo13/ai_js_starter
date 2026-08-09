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
- **Load-time snapshots run under the session's restrictions, not the author's.** Both snapshot forms — the inline bang-backtick and the bang-fenced block — execute before the body is available, in whatever context invoked the skill: a git worktree, a narrowed permission set, a sandbox. A refused snapshot aborts the load, so the skill's content never reaches the session at all and none of its rules run. Write the plainest command that yields the fact and let the body interpret the output. Command substitution is the shape that fails first and the one to drop outright: a harness isolating the session cannot statically prove a substituted subcommand stays inside the boundary, so it refuses the whole command rather than guess — a snapshot of `git remote` labeled "empty = no remote" carries exactly what `[ -n "$(git remote)" ] && git remote | head -1 || echo "(none)"` carries and loads where the compound form does not. A plain `||` or `2>/dev/null` fallback survives, because a harness can read it without executing anything, so it stays available for a genuine either-or. Label what empty output means beside every snapshot regardless, since a command that fails into silence and one that succeeds with nothing to say are indistinguishable to the body reading them, and prose keyed to "an error here" never fires when the error went to stderr and the pipeline exited clean. Reproduce the bang syntax itself nowhere outside a real snapshot, since an example of it in prose or a code span risks executing as one.

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
