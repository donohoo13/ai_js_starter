---
name: template-feedback
description: Files a scrubbed GitHub issue against the ai_starter template from a project instantiated from it, after validating the caller's complaint against the session that produced it. Strictly user-invoked — this skill never detects friction on its own and is never offered by the AI, because the caller is the one who recognized something. Use when the user says "template feedback", "file this against the template", "report this to the template", or "the template caused this". Refuses to run in the template repo itself.
argument-hint: '[what went wrong, and what to look into]'
disable-model-invocation: true
---

# Template Feedback

The child-to-parent reporting channel, paired with `sync-template`'s parent-to-child one. An instance hits friction that traces back to the template; this skill turns the caller's complaint plus the session that produced it into an issue a cold template-dev session can act on, or declines to file and says why.

The caller is the detector. This skill validates — it does not notice. That is why it carries `disable-model-invocation: true` rather than a carefully worded trigger: a session appraising its own output for signs the user is unhappy either never fires or fires as deflection, filing template debt for what was really its own bad reasoning. The user recognizing something is the only trigger, and it is a reliable one.

Refuse in one line when this repo is the template itself — `.claude/rules/template-dev.md` present, or a `CHANGELOG.md` listing releases this repo authored with no lineage stamp beside it. A gap found while working in the template is just work: grill it and fix it.

## Phase 0 — The caller's brief

The invocation carries what went wrong and what to look into. Invoked bare, ask once. That question is the only mandatory one, because without a stated complaint there is nothing to validate; everything else is looked up. Two questions is the ceiling for the whole session — the caller already knows what irritated them, and an interview after the fact is where the habit of reporting dies.

## Phase 1 — Disqualify before investigating

Cheapest disqualifier first. Each of these ends the session on its own, and each is a repo fact rather than something to ask about.

- **Lineage** — read the `Template lineage: <owner>/<repo>, vX.Y.Z` stamp from `CLAUDE.md`, then fetch and read the template changelog exactly as `sync-template` Phase 0/1 does: `git fetch --no-tags template main` then `git show template/main:CHANGELOG.md`. A release newer than the stamp that already addresses this means there is no issue — report it and point at `/sync-template`. This is the most common outcome in practice and the cheapest to check, which is why it runs first. No stamp, no remote, or no network: record the lineage as unknown and continue, because a missing stamp is most likely precisely when someone is hitting a template bug.
- **Sync log** — read `docs/template-sync-log.md`. A recorded rejection covering this artifact means the finding is an already-known misfit, so the resolution is a `fork-points.md` entry naming the tailoring lever rather than a defect report against the default. Carry that into the attribution instead of re-litigating a decision this project already made.
- **Local fork** — establish whether the artifact is an unmodified template descendant or locally adapted, comparing against the fetched template ref. A misfire inside a forked artifact is not a template defect until the fork is ruled out, and the issue discloses the divergence either way, or a template-dev session spends its time chasing a bug that does not exist upstream.

## Phase 2 — Evidence, and the gate

Reconstruct what happened from the session at hand, weighted by what the caller asked you to look into. The output is an ordered trace: which template artifacts were invoked, what each did, and where it went wrong.

Narrate that trace purely in template vocabulary — artifacts, their stated behavior, and the order they fired. Template-side text quotes verbatim; instance-side content gets described rather than pasted, with no project file paths, no error text carrying project identifiers, and no code.

That single constraint does two jobs, which is why it is worth holding strictly. It produces the most actionable evidence a session with none of this project's context can act on, and it is already scrubbed on arrival — the target repo is public, so anything filed is world-readable and indexed. It is also a diagnostic: a trace that cannot be told this way is the finding. It means the friction lives in this project rather than in the template, which is the `not-the-template` verdict below.

**No trace, no issue.** Evidence clears the gate from the session or from the caller narrating it, and the body labels which — a template-dev session weighs a reconstructed trace differently from a remembered one. What never clears it is a complaint with no trace from either source, and there the session reports what it looked for, did not find, and what to capture next time so the finding becomes filable. A refusal that re-arms the caller beats one that just says no.

This gate is the one thing in the skill that does not yield to the caller: an issue with no trace is unactionable by construction, and filing it spends exactly the queue readability the channel exists to build.

## Phase 3 — Attribution

State one verdict, its reasoning, and which Phase 1 checks it survived:

- **defect** — a shipped artifact is wrong: a skill misfires, a hook denies something legitimate, a script breaks on a real stack.
- **gap** — the template has no coverage for a case that arose.
- **misfit** — the shipped default is wrong _for this project_; the resolution is a `fork-points.md` entry declaring the tailoring lever, not a change to the default.
- **upstream** — this project's local adaptation beats the shipped default and should be promoted into the payload.
- **not-the-template** — the artifact behaved as designed, and the friction came from this project's posture or the session's own performance.

Reaching **misfit** and **not-the-template** is the actual work. Friction feels like a defect in the moment, and "the template is wrong" is the reflexive read when the honest answer is that the template is opinionated and this project differs, or that a session simply reasoned badly. A channel that files everything as defect or gap fills the queue with issues resolving to working-as-intended, and a queue nobody trusts is worse than no queue. Misfit is the highest-value verdict the channel produces: it grows `fork-points.md` from real evidence rather than from speculation about what future projects might need.

Unlike the evidence gate, the verdict is a recommendation. The caller can direct a filing over a `not-the-template` finding, and the body then records the attribution honestly rather than dressing the finding up as something it is not.

## Phase 4 — File

- **Search first** — `gh issue list --repo <template> --label from-instance --search "<artifact>" --state all`. A match means offering to comment on the existing issue instead of opening a second; duplicates are how an aggregate view decays into noise.
- **Compose** — build the body from `assets/issue-template.md` (sibling of this file). Title is `<artifact>: <one-line symptom>`, artifact first, because that is how the queue gets scanned.
- **Label** — `from-instance` plus one kind label matching the verdict. Missing labels surface the `gh label create` command in the confirm rather than filing unlabeled: the channel label is the join key for the whole aggregate view, so a silently unlabeled issue is invisible to the thing the channel exists for.
- **Confirm** — show the exact title, labels, and fully rendered body, and wait. This is not skippable and not summarized. The target is a public repo, so filing is outward-facing and effectively irreversible: deleting an issue does not un-index it.
- **File** — `gh issue create --repo <template> --title <title> --label <labels> --body-file <path>`, then report the URL. A scratch body file lives outside the project tree, never inside it, so project-side residue cannot get committed by accident.
- **Failures stop and preserve** — unauthenticated `gh`, issues disabled on the template repo, or a network failure ends the session with the reason and the rendered body included in the report, so a validated finding is never lost to a transport problem.
