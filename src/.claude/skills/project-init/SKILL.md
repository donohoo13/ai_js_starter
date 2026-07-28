---
name: project-init
description: One-shot onboarding audit that tailors the copied skill suite to the destination project. Detects the git platform, CI, stack, tracker, and MCP surface; interviews the user on everything a repo cannot answer; then applies an itemized, individually approved tailoring plan across skills, agents, settings, hooks, the doctor script, and CLAUDE.md — and removes itself when done. Run once, right after copying the template payload — the .claude directory and its sibling files (CLAUDE.md, .mcp.json, scripts/, the design and domain docs) — or any part of it, into a project. Never run it in the template repo itself.
argument-hint: '[optional: anything you already know this project needs from the suite]'
disable-model-invocation: true
---

# Project Init

One-shot onboarding auditor. The skill suite arrives voiced as best practices that fit roughly 8 of 10 projects; this session's job is to validate that the 8/10 assumptions actually hold here and to find the 2/10 places where they do not. It runs once, immediately after the template payload — `.claude` and its sibling files (`CLAUDE.md`, `.mcp.json`, `scripts/`, the design and domain docs) — lands in a destination project, in whole or in part, and its last act is deleting itself — everything after this session is the project building on itself, not the template.

Correctness over speed: this session is allowed to be long. Read everything that adds context; recommend thoughtfully; write nothing without approval.

## Context

- Remote: !`[ -n "$(git remote 2>/dev/null)" ] && git remote -v | head -2 || echo "(no remote)"`
- Copied-over state (empty = clean): !`git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git status --porcelain -- .claude CLAUDE.md | head -20 || echo "(not a git repo)"`

## Operating principles

- **Config-first hybrid.** Facts about the project (platform, tracker, teams, labels, compliance posture, team composition) land in `CLAUDE.md`, which the skills read ambiently. Skills themselves get edited only at genuine behavioral forks — where a procedure is wrong for this project, not merely generic. Every in-place edit is maintenance surface; keep the edit set minimal and let context files carry the rest.
- **Full `CLAUDE.md` ownership.** Init owns the whole file, not a section: merge what exists, resolve the shipped placeholders, prune stack sections that do not apply, and leave one coherent document. An existing `CLAUDE.md` is project reality — weave the template's conventions into it, never clobber it.
- **Every question traces to a file edit.** Ask only what detection could not settle, and only when the answer changes a named file. Pure color goes in `CLAUDE.md` or nowhere.
- **Predecessors are talking points, not gospel.** Older versions of these skills recovered from git are an agenda — "your previous grilling carried X; still true here?" — never silently resurrected content.
- **HITL throughout.** The tailoring plan is approved item by item; rejected items are recorded in the report, not argued.
- **Write in the suite's voice.** Everything init writes obeys the template's own context-file standards: strict present tense, no aspirational language, single-line bullets, exceptions documented at point of use.

## Phase 1 — Detect (silent)

Facts a repo can answer are never questions. Sweep, then present one findings snapshot before the first question:

- **Git platform**: remote URL → GitHub/GitLab/other; which CLI is installed (`gh`, `glab`); default branch name; branch protection or team signals if the CLI can read them.
- **CI and workflow dirs**: `.github/`, `.gitlab-ci.yml`, `.gitlab/`, other pipeline configs — these are constraints the suite must respect, not targets to rewrite.
- **Stack**: manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, ...), package manager, test/lint/typecheck commands, monorepo layout.
- **MCP and plugins**: `.mcp.json`, `.claude/settings.json` `enabledPlugins`, plus any user-level servers visible in-session — tracker candidates (Linear, Jira), Context7, browser tooling.
- **Context files**: existing `CLAUDE.md` files (root and nested), `CONTEXT.md`, `docs/adr/`, `docs/tasks/`, `docs/briefs/`, design docs — read them all; they shape every recommendation. Note which shipped design files (`BRAND_DESIGN.md`, `UI_UX.md`) are still template-skeletal; `CONTEXT.md` and `ARCHITECTURE.md` are created lazily by domain-modeling, so their absence is normal.
- **Git archaeology**: the copy step may have clobbered a pre-existing partial suite. `git status`/`git diff` over `.claude/` exposes uncommitted overwrites; if the copy was already committed, `git log -p -- .claude` one commit back does the same. Extract every project-specific delta the old versions carried as interview talking points.
- **Payload inventory**: note which payload files actually landed in the copy — `.claude` alone is a common partial copy, leaving no shipped `CLAUDE.md`, `.mcp.json`, `scripts/setup/doctor.sh`, or design docs. A Phase 4 target that never arrived becomes a plan item to scaffold it or an explicit gap in the report, never a silent no-op.
- **Fork-point manifest**: read `references/fork-points.md` (sibling of this file) for the suite's known couplings, then run its drift greps to catch anything the manifest missed.

If the project is not a git repo or is empty, skip the archaeology and lean harder on the interview — degraded gracefully, never blocked.

## Phase 2 — Interview

Run the `grilling` skill under this frame: persona is the onboarding auditor — an engineer joining the project who must make the tooling fit the team, concrete and decisive, a recommendation with reasoning attached to every question. One question at a time, biggest decisions first. Agenda, seeded by detection:

- **Platform mechanics** detection could not settle: how PRs/MRs actually flow here, which CI gates are load-bearing, whose PR template wins.
- **Branch naming**: detection reads the incumbent convention from `git branch -r`; where it conflicts with the shipped `<type>/<kebab-slug>` default, confirm which wins and retarget the manifest's fork points (the `CLAUDE.md` naming line, `implement-task`'s filename derivation) — the gwt scripts' slash-to-dash flattening keeps worktree paths flat under either answer, so they never need naming tailoring.
- **Tracker shape**: if a tracker (Linear, Jira) is present, walk through how the suite's file-based flow merges into it — do ADRs stay in repo (recommend yes), where do captures/specs/briefs land, which teams/projects/labels apply. Use the tracker's MCP tools to ground recommendations in how the platform is actually used — real team names, real label taxonomies — not hypotheticals.
- **OAuth account isolation**: for each account-bound OAuth MCP service detection found (Cloudflare, Linear, Stripe, ...), ask one-account-everywhere or per-project accounts; per-project answers trigger the manifest's isolation package (project-scoped `<service-server>-<slug>` servers in `.mcp.json`, shared-tool denies, slug confirmed and codified in `CLAUDE.md`).
- **Compliance posture** (SOC2, HIPAA, ...): ask for reference documents rather than taking a framework name as a vibe; mine them for the concrete rules that land in `CLAUDE.md`, harden `review-board`/`ship-pr`, and tighten `settings.json`. Reach into `tdd`/`implement-task` evidence requirements only on a clear in-project signal.
- **Team composition**: solo-on-main versus branch-and-review changes real machinery — the guard-main hook, `ship-pr`'s existence, `implement-task`'s non-main refusal, `stage-for-commit`'s posture. The suite's never-commit-to-main voice is an assumption to ask about, not impose.
- **Company/product overview**: context color for `CLAUDE.md` framing; point domain vocabulary at `CONTEXT.md`/`domain-modeling` for proper capture later.
- **Archaeology follow-ups**: every project-specific delta from predecessor skills gets asked about — carry forward, or let die.
- **Gaps** (rare): propose a net-new skill only when the interview surfaced a recurring workflow the existing chain demonstrably cannot route, with the evidence stated. A tool existing or a folder existing is never justification; most projects need zero new skills.

## Phase 3 — Tailoring plan

Present one itemized plan, grouped by landing zone (skills, agents, `settings.json`, hooks, scripts, `CLAUDE.md`, new skills). Each item states what changes, in which file, traced to the detection finding or interview answer that justifies it. The user approves or rejects each item individually — same discipline as `curate-context`. The final item is always self-removal (Phase 5). Nothing is written until the plan is resolved.

## Phase 4 — Apply

Approved items only, in landing-zone order:

- **Skill edits**: targeted rewrites of the forked passages per `references/fork-points.md` — swap the platform CLI and template paths, reroute tracker touchpoints, recalibrate ceremony. Keep each skill's voice and structure; a tailored skill should read as if it were written for this project, not patched.
- **`CLAUDE.md`**: the full merged rewrite — existing content preserved as ground truth, placeholders resolved, inapplicable stack sections pruned, project profile facts (platform, tracker, teams/labels, compliance, team model) stated in present tense where the skills will find them. Load the `curate-context` skill before this item — the `guard-context-edit` hook gates every `CLAUDE.md` write on it — with the approved itemized plan standing in for its per-candidate approval; this merged rewrite is the sanctioned point-of-use exception to that skill's append-only apply.
- **`settings.json` and hooks**: MCP allows for detected servers, `ask`/`deny` adjustments per compliance posture, LSP plugin enablement per stack, guard-main hook kept or removed per team model.
- **Scripts and scaffolding**: retarget `scripts/setup/doctor.sh` to the detected stack's LSP binaries and wire it into the manifest's install lifecycle (`prepare` via husky or the stack's equivalent) so every install self-reports gaps; retarget `scripts/setup/gwt-add.sh`/`gwt-remove.sh` per the manifest's worktree-isolation entry (install command, env-copy list, editor launch, base path).
- **Agents**: verify the five `review-*` agents' declared tools work here (LSP plugin + binary per doctor), verify `research-analyst`'s Context7 and web dependencies, and apply any approved signal-gated checklist additions in `review-board/references/`.
- **New skills** (if any were approved): build via the `skill-creator` skill, wired into the skills `README.md` and stage map like a native.

Validate as you go: re-read every edited file for coherence and present-tense voice, and run the project's formatter if one exists.

## Phase 5 — Report and self-removal

Close with a report: what changed and why, what was rejected, what stays TBD, and pointers for the deliberately untouched — a skeletal `BRAND_DESIGN.md` gets a "run `/brand-init` when ready" (`UI_UX.md` ships complete), and a missing `CONTEXT.md` or `ARCHITECTURE.md` points at `domain-modeling`, which grows both lazily from their first real entry. For a brownfield destination the tailoring plan may carry one optional item offering the survey bootstrap from `domain-modeling/ARCHITECTURE-FORMAT.md` — init has already read the codebase, so the whole shape map is cheapest to author now — approved or rejected like any other item, never mandatory. Recommend the user review the diff and land it through the flow this session just established: `/stage-for-commit` where direct commits are the project's norm, a branch plus `/ship-pr` where PRs are required — which every compliance regime is. Init obeys the rules it just wrote.

Then execute the approved self-removal: delete `.claude/skills/project-init/` entirely and scrub the `project-init` section and stage-map row from `.claude/skills/README.md`. If the user rejected self-removal, leave it in place and note in the report that re-running against an already-tailored project is not supported. There is no re-run: future drift (a tracker adopted later, a platform migration) is normal project work for `grilling` and `curate-context`.
