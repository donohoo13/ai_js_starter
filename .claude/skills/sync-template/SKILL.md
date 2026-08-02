---
name: sync-template
description: Pull-based template-update session for projects instantiated from the ai_starter template. Fetches the template remote, reads the template CHANGELOG.md entries newer than the project's CLAUDE.md template-lineage stamp, and walks each unapplied release as an itemized, individually approved adaptation plan negotiated against this project's own posture (compliance rules, tracker, collapsed monorepo, deliberately forked skills) — landing working-tree changes only, then updating the lineage stamp and sync log. Use when the user says "sync with the template", "pull template updates", "check for template updates", "is the suite behind the template", or asks to adopt a new template release. Refuses to run in the template repo itself; the parent never pushes into children.
argument-hint: '[optional: target version, or paths to scope the sync]'
disable-model-invocation: true
---

# Sync Template

Child-side consumer of template releases. The contract is strictly pull-based: the template publishes versions (a `CHANGELOG.md` entry plus a matching `vX.Y.Z` git tag per release) and never reaches into instances; each instance decides when to sync and how each change fits its own posture. One release at a time, oldest first, because later releases assume earlier ones landed.

Refuse in one line when this repo is the template itself — `.claude/rules/template-dev.md` present, or no lineage stamp alongside a changelog that lists releases this repo authored — the template has no parent to pull from.

## Phase 0 — Resolve lineage

- Read the stamp from `CLAUDE.md`: `Template lineage: <owner>/<repo>, vX.Y.Z`.
- Stamp missing but this is clearly an instance: run first-run onboarding instead of failing — confirm the template repo with the user (`donohoo13/ai_starter` is the default), establish the baseline version together (the newest release whose content this project already carries; when unknown, diff candidate releases against the working tree and recommend), and stamp it before syncing.
- Ensure the remote and fetch with namespaced tags so template tags never land in or collide with the project's own tag namespace: `git remote get-url template 2>/dev/null || git remote add template git@github.com:<owner>/<repo>.git`, then `git fetch --no-tags template '+refs/tags/v*:refs/remotes/template/tags/v*'` and `git fetch --no-tags template main` — `--no-tags` matters on both, because git's default tag auto-following would copy template tags into plain `refs/tags/` and defeat the namespacing.

## Phase 1 — Delta

- Read the template changelog without touching the working tree: `git show template/main:CHANGELOG.md`.
- Unapplied releases are the entries newer than the lineage version, minus anything the sync log (below) records as rejected. None → report up to date and stop.
- Per release, get the concrete diff from the template's own history, excluding the template's own residue — what `project-init` clears from an instance, which no instance should ever be offered back — and swapping the leading `.` for the user's path argument when one was given, the exclusions still applying:

```bash
git diff refs/remotes/template/tags/v<from> refs/remotes/template/tags/v<to> -- . \
  ':(exclude)CHANGELOG.md' ':(exclude).claude/rules/template-dev.md' ':(exclude).claude/skills/project-init' \
  ':(exclude)docs/tasks' ':(exclude)docs/adr' ':(exclude)docs/designs' ':(exclude)docs/briefs' \
  ':(exclude)docs/initiatives' ':(exclude)docs/assets' \
  ':(exclude)CONTEXT.md' ':(exclude)ARCHITECTURE.md' ':(exclude)CONTEXT-MAP.md'
```

- `docs/company/` is deliberately absent from that set: it is payload skeleton that stays in instances, so it syncs like any other payload file. The set mirrors the residue plan item in `project-init/SKILL.md`, and the two move together — a path added to one belongs in the other in the same change. The exclusion scopes this diff only; the `git show template/main:CHANGELOG.md` read above is a separate operation that must keep working, since the changelog is how releases are discovered at all.
- Unrelated histories are irrelevant here — both endpoints live in the fetched template history.

## Phase 2 — Adaptation interview

Walk unapplied releases oldest first. For each, present the changelog entry (what, why, adaptation notes) beside the diff mapped onto this project's files, then resolve item by item with the user:

- **Apply clean** — the file is an unmodified template descendant and the change carries over verbatim.
- **Adapt** — this project's posture bends the change: its `CLAUDE.md` and compliance rules, its tracker, a collapsed monorepo, a deliberately forked skill. The adaptation notes seed the negotiation; the project's own context files are ground truth for what must survive.
- **Reject** — recorded with the user's one-line reason, never argued past the decision.

The project's own guards keep governing throughout: load `skill-creator` before touching anything under `.claude/skills/`, `curate-context` before prescriptive context files, `domain-modeling` for descriptive docs.

## Phase 3 — Apply and record

- Approved items land as working-tree changes only — no commits, no pushes; the user reviews and lands them through this project's own flow.
- Update the `CLAUDE.md` lineage stamp to the newest synced version.
- Append the sync record to `docs/template-sync-log.md` (created on first sync): date, version range, applied / adapted (how) / rejected (why). The log is what keeps a rejected release from being re-litigated on the next sync.
- Close with the report: what changed, every adaptation and its reason, every rejection, and anything the diff touched that this project had deliberately forked.
