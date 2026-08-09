# Issue body template

The shape of a filed `template-feedback` issue. Every section appears in the rendered body; a section with nothing known says so explicitly rather than being dropped, because a missing section reads as an oversight while an explicit unknown reads as a checked fact.

The reader is a template-dev session with none of the reporting project's context. Everything below is written for that reader: template artifacts named precisely, project content described rather than pasted.

---

## Artifact

The template file and section in play, at the version this project carries. Name the specific skill, hook, script, rule, or context-file bullet — "the design skill" is not an artifact, `grill-design/SKILL.md`'s component survey is.

## Lineage

- **Template version**: `vX.Y.Z` from the `CLAUDE.md` stamp, or `unknown — no lineage stamp`
- **Artifact state**: `unmodified template descendant`, or `locally adapted` with a one-line description of the divergence

## What happened

The ordered trace, in template vocabulary only: which artifacts were invoked, what each did, and where it went wrong. Numbered steps, one per line. Template-side text quotes verbatim; project-side content is described, never pasted — no project file paths, no error text carrying project identifiers, no code. The template repo is public.

## Attribution

- **Verdict**: one of `defect`, `gap`, `misfit`, `upstream`, `not-the-template`
- **Reasoning**: why this verdict and not the adjacent one
- **Ruled out**: which pre-flight checks passed — lineage (not already fixed upstream), sync log (not an already-recorded rejection), local fork (artifact unmodified, or divergence disclosed above). This is what stops the receiving session re-running the same checks by hand.
- **Evidence provenance**: `session-derived` (reconstructed from the session at hand) or `user-reported` (narrated by the caller, unverified against a transcript)

## Proposed resolution

A candidate, never a decision — the grilling session this repo runs against the issue owns the actual call. Say which shape it takes: a payload fix, new content, a `fork-points.md` entry declaring a tailoring lever, or promoting a local adaptation upstream.

## Instance posture

What the receiving session needs in order to judge the finding, and nothing that identifies the project. Posture travels; identity does not.

- **Stack**:
- **Tracker**:
- **Repo shape**: monorepo or collapsed single-app
- **Compliance regime**: if any
