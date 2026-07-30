---
type: chore
status: done
created: 2026-07-29
---

# Move template to pnpm 11 + Node 24 version model (v1.2.0)

## Context

This session started as a cleanup of `v1.0.7` version residue in the steering docs and grew, via two `from-instance` feedback issues, into a version-management overhaul. The residue strip and a new `template-dev.md` rule (version provenance lives only in history records, never steering docs) are already applied in the working tree and fold into this release. The two issues and one recurring pain drove the rest: issue #14 (`README.md` still calls `curate-context` hook-enforced in two spots after `v1.0.7` removed the hook), issue #15 (`check-install.mjs` asserts pnpm-10 `engineStrict`/`devEngines` behavior as universal fact, false on pnpm 11), and the `WARN Unsupported engine` noise on every `pnpm` command in this repo.

The template pins bleeding-edge, non-LTS Node (`26.5.0`, LTS only in Oct 2026) and a stale pnpm (`10.32.1`), which is the root of the warning: the template pins ahead of where developers and CI actually are. The owner's goal is a consistency model where the pinned Node is used for every `pnpm`-routed command by construction, one-off Node goes through `pnpm exec node`, and a developer can never silently run weeks on the wrong Node.

Measured evidence (Docker probe, pnpm 11.7.0, ambient Node `v22.23.2`, pinned `24.18.1`), so a fresh session need not re-run it: `pnpm install` provisioned `24.18.1` and ran the `preinstall` script under it; `pnpm exec node -v` and `pnpm run <script>` both reported `24.18.1`; bare `node -v` reported ambient `v22.23.2`; and no "Unsupported engine" warning appeared at all. With `engineStrict: true` added, install still succeeded on `24.18.1` (no deadlock). A `devEngines.runtime` range resolved a Node version but then failed with `ERR_PNPM_IGNORED_BUILDS`, breaking `pnpm exec`. Conclusion: the consistency model works on pnpm 11, the warning is a pnpm-10 artifact, exact-not-range still holds (new failure mode), and the pnpm-10 guard assumptions are stale.

## Problem

Current behavior: the template pins pnpm `10.32.1` and Node `26.5.0`; every `pnpm` command in a repo whose ambient Node differs prints `WARN Unsupported engine`, which is easy to ignore for weeks; `check-install.mjs` hard-fails the `engineStrict`+`devEngines` pairing and tells the developer the repo is "uninstallable" and "every pnpm command fails", which is only true on pnpm 10; two `README.md` lines contradict the file's own `curate-context` blurb. Desired behavior: on pnpm 11.7.0 with Node pinned to LTS `24.18.1`, every `pnpm`-routed command runs on the pin with no warning; one-off Node is run via `pnpm exec node`; the guard tells the truth on both pnpm majors; the docs state the current mechanism; and a Docker matrix proves the consistency across environments before release.

## Scope

- In scope (must-have): pnpm and Node version re-pin across all sites plus lockfile; `check-install.mjs` pnpm-11 pass; `pnpm exec node` and corepack-migration conventions in `CLAUDE.md` + README; README Mac/Linux quickstart; issue #14 README fix; Docker env-matrix test + first CI workflow; single `v1.2.0` CHANGELOG entry absorbing the whole session; close #14 and #15.
- Nice to have: CI caching of the per-project downloaded Node runtime (fallback: re-download per matrix cell).
- Out of scope (non-goals, named so the task does not expand silently): turning `engineStrict` on by default (kept off; instances opt in); a corepack-free pnpm activation path (corepack is correct on Node 24 — only a triggered migration note is recorded); any application code or UI (the workspace ships empty); tagging the release (owner tags after PR merge, deliberately not part of this task).

## Requirements

- Node pins move as a set to exact `24.18.1`: `.nvmrc` = `24.18.1`, `engines.node` = `>=24.18.1 <25`, `devEngines.runtime.version` = `24.18.1` (exact, never a range), `package.json` `version` = `1.2.0`, and `pnpm-lock.yaml` regenerated under pnpm 11.7.0.
- pnpm pins to `11.7.0` via the `packageManager` field, activated by corepack on Node 24; do not adopt `devEngines.packageManager` (corepack is correct while on Node 24).
- `engineStrict` stays absent (off); the shipped template sets it nowhere.
- One-off Node commands (user or AI) run through `pnpm exec node`, not bare `node`, so the pinned runtime is used; bare `node` is reserved for when ambient Node is intentionally wanted.
- The corepack-migration hazard is recorded as a triggered instruction: corepack is bundled through Node 24 and gone from Node 25+, so retargeting the Node major to 25+ migrates the pnpm activation path off corepack in the same change.
- `check-install.mjs` reads the pnpm major from `npm_config_user_agent` (already read for the pnpm-only check) and scopes its pnpm-10 assumptions accordingly.
- The Docker matrix driver is a shipped script and stays bash-3.2 compatible (`#!/usr/bin/env bash`); the in-container assertions may use any shell the base image ships.

## Acceptance criteria

- [x] `package.json`: `version` `1.2.0`, `packageManager` `pnpm@11.7.0`, `engines.node` `>=24.18.1 <25`, `devEngines.runtime.version` `24.18.1`; `.nvmrc` `24.18.1`; `pnpm-lock.yaml` regenerated under 11.7.0 and committed.
- [x] On pnpm 11.7.0, `pnpm install` succeeds and `pnpm format:check` runs with no `Unsupported engine` warning in the captured output.
- [x] `check-install.mjs`: the `engineStrict`×`devEngines` block does not hard-fail on pnpm >=11 and still hard-fails on pnpm <=10; the exact-vs-range rationale names the measured `ERR_PNPM_IGNORED_BUILDS` cause; the header comment marks its pnpm-10 measurements as pnpm-<=10-scoped and notes the wrong-Node check is advisory on pnpm 11.
- [x] The guard verification battery passes across pnpm major (<=10 / >=11) x `engineStrict` (on/off) x `devEngines` (present/absent) x pin (exact/range/drift), each case asserting exit code and branch.
- [x] `CLAUDE.md` carries the `pnpm exec node` convention bullet and the corepack-migration bullet (approved wording), and reframes the `.nvmrc` role; `fork-points.md` records that pnpm 11+ instances may keep `engineStrict: true` alongside `devEngines`.
- [x] `README.md` has a Mac/Linux quickstart (Homebrew `node`+`pnpm` or Apple-Silicon standalone script, `corepack enable`, `pnpm install`) with the Node-25 corepack caveat at point of use.
- [x] `.claude/skills/README.md` lines 25 and 149 no longer describe `curate-context` as hook-enforced; line 143 (`skill-creator`) is unchanged (#14 closed).
- [x] Docker matrix: cell (a) mismatched-major and cell (b) no-Node both assert `pnpm exec node -v` == `v24.18.1` and bare `node -v` != the pin; cell (c) Alpine/musl is captured as an expected failure, not a regression. A `.github/workflows/` job runs the matrix.
- [x] A single `v1.2.0` CHANGELOG entry (what / why / adaptation notes) absorbs the residue strip, `template-dev` rule, #14, #15, the pins, the guard rework, the conventions, the README quickstart, and the Docker matrix.
- [ ] GitHub issues #14 and #15 are closed referencing v1.2.0.

## Dependencies

- The machine must actually run pnpm 11.7.0 to regenerate the lockfile and validate. Ambient pnpm is 10.32.1 and ambient Node is 24.17.0 (below the new 24.18.1 floor); corepack activation of 11.7.0 is the path, and the research flagged a corepack keyid-rotation issue (Jan 2025) that needs corepack >=0.31.0 — handle if it surfaces.
- The Docker matrix needs the Docker daemon (present this session, 29.6.2) and network for image pulls and the Node runtime download.

## Risks / open questions

- [ ] After re-pin, confirm on the real repo (not just the probe) that pnpm 11.7.0 provisions `24.18.1` for the `preinstall` guard so it passes even though ambient is `24.17.0`; if the real repo diverges from the probe, investigate before release.
- [ ] Cell (c) musl: pin the expected-failure assertion to the actual error signal (per pnpm issue #9964 it is an `ENOENT`/`not found` at the runtime step); confirm the exact shape when building the cell so the test asserts a known failure rather than passing blindly.
- [ ] Per-project runtime caching in CI may be brittle across pnpm patches (the runtime is stored per-project, not in the shared store); acceptable fallback is re-download per cell.
- [ ] `package.json` and `pnpm-lock.yaml` are payload that `sync-template` offers instances; an instance with its own pins must negotiate this hop rather than apply clean — the adaptation notes must say so.

## Design decisions

- Version pins (all in `package.json` unless noted): `packageManager` `pnpm@11.7.0`; `engines.node` `>=24.18.1 <25`; `devEngines.runtime.version` `24.18.1`; `version` `1.2.0`; plus `.nvmrc` `24.18.1` and a regenerated `pnpm-lock.yaml`. Node 24.18.1 is the current active LTS; 26.x is Current until Oct 2026 and is what generated the warning. Exact (never range) for `devEngines.runtime.version` stays the rule: on pnpm 11 a range resolves but hits `ERR_PNPM_IGNORED_BUILDS` and breaks `pnpm exec` (measured), superseding v1.0.1's pnpm-10 "registry stub / ENOENT" reason.
- Consistency contract (why the model works, measured): on pnpm 11 the `devEngines.runtime` is provisioned before lifecycle scripts and every `pnpm`-routed command (`install` scripts, `pnpm run`, `pnpm exec`) runs under it regardless of ambient Node, and the `Unsupported engine` warning does not fire. The only gap is bare `node`, closed by the `pnpm exec node` convention. This is what retires both owner fears: silent wrong-Node is impossible for `pnpm`-routed commands, and the warning is gone.
- `check-install.mjs` interface unchanged (dependency-free `preinstall` guard, `fail([lines])` then `exit(1)`); behavior gains a pnpm-major dimension parsed from `npm_config_user_agent`. Contract: pnpm <=10 keeps the `engineStrict`x`devEngines` hard-fail (the deadlock is real there); pnpm >=11 does not block that pairing (they coexist, measured) and at most prints an informational note. The pnpm-only check, the three-site drift check, and the malformed-`.nvmrc` check are unchanged. The wrong-Node machine check stays but its header notes it is advisory on pnpm 11 (the guard runs under the provisioned runtime, so `process.versions.node` equals the pin regardless of ambient) and load-bearing only on pnpm <=10 or the musl no-`devEngines` posture. The header comment's pnpm-10 measurements are re-scoped to "pnpm <=10", matching v1.0.5's evidence rather than overriding it.
- Conventions (imperative rules for the AI, so `CLAUDE.md` JS/Node section, shipped to children): (1) `pnpm exec node` for one-off Node; (2) the approved corepack-migration bullet — "Corepack ships bundled through Node 24 and is removed from Node 25+. While the Node pin stays on 24, activate pnpm through Corepack and the `packageManager` field (see the README quickstart). Retargeting the Node major to 25 or newer is the trigger to migrate the pnpm activation path off Corepack in the same change: move the README setup and CI activation to pnpm's native package-manager management or a direct pnpm install, because the `packageManager` field no longer self-activates without Corepack." The existing "Retarget the Node pin as a set" bullet is reframed to note `.nvmrc` is for CI `setup-node`/nvm-fnm and the guard cross-check, not what pnpm consumes.
- README quickstart (human procedure, so README point-of-use, shipped to children): the fresh-Mac and Linux path — install pnpm (Homebrew `brew install node && brew install pnpm`, or the Apple-Silicon standalone script), `corepack enable`, `pnpm install` (which provisions the pinned Node) — with the Node-25 corepack caveat mirrored at the `corepack enable` step. The standalone script is Apple-Silicon-only; Intel Macs and the Homebrew path need a Node present first.
- #14 fix: reword `.claude/skills/README.md:25` (the chain-block `/curate-context` line) and `:149` (the stage-map row) to name the current mechanism (skill description + `CLAUDE.md` rule, no hook), matching the file's own `curate-context` blurb; leave `:143` (`skill-creator`, correctly hook-enforced). This is a `skill-creator`-owned edit.
- Docker env matrix: a shipped bash-3.2 driver script (host-side `docker run` per cell) plus a minimal fixture project (`package.json` with the pins and a `print-node` script). Cells: (a) `node:22` style mismatched-major, (b) `ghcr.io/pnpm/pnpm` (pnpm, no Node — proves provision-from-nothing), (c) an Alpine/musl image as a captured expected-failure. Per-cell assertions: bare `node -v` != pin, `pnpm exec node -v` == pin, `pnpm run print-node` context == pin. CI: the repo's first `.github/workflows/` job driving the same cells via `strategy.matrix` -> `jobs.<id>.container.image`; cache the per-project runtime path where feasible, else re-download per cell.
- CHANGELOG: one `v1.2.0` entry replacing the interim `v1.1.1` entry already written this session, absorbing the residue strip, the `template-dev` provenance rule, #14, #15, the pins, the guard rework, the conventions, the README quickstart, and the Docker matrix. Adaptation notes: `package.json`/`pnpm-lock.yaml` and the skill-file rewrites and the conventions are payload `sync-template` offers (instances with their own pins negotiate the pin hop; the skill/README/`CLAUDE.md` edits apply as hygiene); the `template-dev` rule, `fork-points.md`, `project-init/`, and the CHANGELOG itself sit inside `sync-template`'s residue exclusion; instances on pnpm <11 keep the pnpm-10 guard behavior, which the major-scoping preserves.

## Test strategy

- Docker env matrix is the primary integration test, at the "does pnpm provision and use the pinned Node" behavior seam: cells (a) and (b) pass when `pnpm exec node -v` equals `v24.18.1` and bare `node` does not; cell (c) passes when it fails in the known musl way (asserted as expected, per issue #9964). This mirrors the manual Docker probe already run this session, promoted to a repeatable script.
- `check-install.mjs` verification battery at the guard's external seam (crafted `npm_config_user_agent` + a temp fixture dir of `.nvmrc`/`package.json`/`pnpm-workspace.yaml`/`.npmrc`, asserting exit code and the branch taken), mirroring the case batteries recorded in the v1.0.2, v1.0.3, and v1.0.6 CHANGELOG entries. Dependency-free Node, runnable standalone since the repo has no test runner. Cases: pnpm <=10 with the pairing (blocks), pnpm >=11 with the pairing (passes), engineStrict absent (passes both majors), devEngines absent/musl (pairing check skipped), three-site drift (blocks), exact vs range spelling.
- Real-repo validation, run once on pnpm 11.7.0: `pnpm install` exits 0 and `pnpm format:check` output contains no `Unsupported engine` line. This is the thesis proven on the actual repo, not a fixture.
- Config parses: `pnpm-workspace.yaml`, `package.json`, and the regenerated lockfile are valid; the `turbo` tasks no-op cleanly on the empty workspace.

## Slices

- [x] Version pins + real-repo validation: retarget the four Node sites to `24.18.1`, bump `packageManager` to `pnpm@11.7.0` and `version` to `1.2.0`, regenerate `pnpm-lock.yaml` under 11.7.0, and prove `pnpm install` + `pnpm format:check` run warning-free on 11.7.0. The tracer bullet that confirms the whole thesis on the real repo.
- [x] `check-install.mjs` pnpm-11 pass + guard battery: add the pnpm-major branch, scope the `engineStrict` block, correct the range rationale, re-scope the header, update `fork-points.md`, and land the verification battery green.
- [x] Conventions + docs: the `pnpm exec node` bullet, the corepack-migration bullet, and the `.nvmrc` reframe in `CLAUDE.md`; the Mac/Linux README quickstart with the Node-25 caveat; and the #14 fix in `.claude/skills/README.md`.
- [x] Docker env matrix + first CI workflow: the bash-3.2 driver, the fixture project, the three cells with their assertions, and the `.github/workflows/` matrix job.
- [x] CHANGELOG `v1.2.0`: fold the interim `v1.1.1` entry and the whole session's work into one entry; confirm `package.json` `version` matches; leave tagging and issue-closing (#14, #15) as the owner's post-merge step.
