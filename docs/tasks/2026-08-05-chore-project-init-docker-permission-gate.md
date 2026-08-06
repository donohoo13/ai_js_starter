---
type: chore
status: captured
created: 2026-08-05
---

# Build the docker permission gate in project-init, on detection

## Context

The template shipped a docker permission gate in `.claude/settings.json`: 45 `Bash(docker …)` entries in `permissions.ask`, plus a `CLAUDE.md` Standards bullet claiming the gate "lists every code-executing, destructive, and data-exporting docker verb in both its short and object-command spellings" and telling future sessions to "grow the list by that criterion". The v1.7.0 payload accuracy pass added twelve missing verbs to that list. A `review-board` documentation board over that branch then found the list still incomplete (finding SEC-2, confirmed): `docker bake`, `docker login`, `docker logout`, `docker init`, `docker swarm init|join|leave|unlock`, `docker plugin install|enable|upgrade|set`, `docker extension install|update`, `docker context use`, `docker service scale|rollback`, `docker network connect|disconnect`, and `docker rename` all ran with no prompt while the doc asserted completeness. `docker login -u u -p $TOKEN` was the sharpest case, putting a registry credential on the command line and writing it into `~/.docker/config.json` — a file the repo's own secret registry protects.

The user's decision on that finding was to delete the gate rather than complete or narrow it: this repo runs no docker, so the gate was boilerplate written for hypothetical destinations, and an incomplete gate behind a completeness claim is the exact "failure shaped like success" defect the whole v1.7.0 release existed to remove. All 45 entries and the `CLAUDE.md` bullet were deleted in that change. This task carries the other half of the decision: docker gating belongs in `project-init`, generated when docker is actually detected in a destination, not shipped blind to every project.

## Problem

Current behavior: `project-init` sweeps a destination for git platform, CI, stack, tracker, MCP surface, and secret-candidate files, and lands an itemized tailoring plan across skills, agents, `settings.json`, hooks, scripts, and `CLAUDE.md`. Docker is not among the things it detects, and no plan item produces a docker permission gate. A destination that genuinely runs docker now inherits no gate at all, because the shipped one was deleted.

Desired behavior: `project-init` detects whether the destination actually uses docker, and when it does, proposes a `permissions.ask` gate as a normal itemized plan item — derived against docker's real command set rather than a hand-maintained list, and paired with whatever `CLAUDE.md` wording is true of the gate it actually generates. A destination with no docker gets no gate and no bullet about one.

## Scope

- In scope (must-have): docker detection in `project-init`'s sweep; a plan item that generates the `ask` entries for a detected-docker destination; the criterion by which verbs are selected, stated somewhere a future session can re-derive rather than guess; whatever `CLAUDE.md` text ships alongside a generated gate, written so it does not re-assert exhaustiveness it cannot hold.
- Nice to have: a check that re-derives the verb set against the installed docker version, so the gate does not silently rot as docker adds commands; the same treatment generalized to other CLI surfaces with the same shape (`kubectl`, `terraform`, `gcloud`, `aws`), which have the identical destructive-verb problem and the identical boilerplate risk.
- Out of scope (non-goals, named so the task does not expand silently): restoring the deleted gate to the template payload in any form; a hook-based approach to command gating (the repo's own decision record already argues against a `PreToolUse` guard on tool selection); changing how `permissions.ask` precedence works.

## Requirements

- Detection must distinguish a destination that runs docker from one that merely mentions it: a `Dockerfile`, `compose.yaml`/`docker-compose.yml`, a `.devcontainer/`, or a CI job invoking docker are signals; a README paragraph is not.
- The verb selection criterion is the one the deleted bullet named and failed to apply: code-executing, destructive, and data-exporting verbs are gated, read-only verbs (`ps`, `logs`, `images`, `inspect`) ride the blanket `Bash` allow. Whatever ships must make that criterion mechanically applicable rather than a prose instruction a future session hand-expands into an incomplete list.
- Both spellings matter where both exist: the deleted gate paired `Bash(docker rm*)` with `Bash(docker * rm*)` for object-command forms. Three verbs legitimately have only one form (`buildx`, `debug`, `prune`), so a symmetry check has to allow named exceptions rather than demand pairs everywhere.
- `docker login` and `docker logout` are credential-handling, not just destructive: gating them connects to the repo's secret registry rules, since `docker login` writes `~/.docker/config.json`, a registered path.
- `project-init` is `disable-model-invocation: true`, so anything added here is reachable only when the user runs it explicitly; the plan item follows the skill's existing itemized-approval shape rather than applying anything automatically.
- Whatever lands updates `project-init/references/fork-points.md` in the same change, per that file's own maintenance contract.

## Acceptance criteria

- [ ] `project-init` run against a destination with a `Dockerfile` proposes a docker gate as an itemized, individually approved plan item.
- [ ] `project-init` run against a destination with no docker proposes no docker gate and adds no `CLAUDE.md` text about one.
- [ ] The generated gate, checked against `docker --help` on the machine, gates every code-executing, destructive, and data-exporting verb, or the accompanying `CLAUDE.md` wording states plainly which classes it covers rather than claiming completeness.
- [ ] `docker login` is gated in any generated gate.
- [ ] `fork-points.md` carries the coupling.

## Dependencies

- [ ] None known. The template-side deletion already landed, so nothing blocks starting this.

## Risks / open questions

- [ ] Does the verb set get derived at init time by parsing `docker --help` on the user's machine, or written as a maintained list in `project-init`'s references? Parsing is self-updating and correct across docker versions but adds a runtime dependency on docker being installed during init; a maintained list is the approach that just failed in the template and would fail the same way here, one layer down.
- [ ] Is a docker gate worth shipping at all versus letting the blanket `Bash` allow plus `defaultMode: "default"` handle it? Worth answering explicitly, since the honest answer might be that the original gate was never load-bearing and the right outcome is no gate anywhere.
- [ ] Should this generalize to `kubectl`, `terraform`, `gcloud`, and `aws` in the same change, or ship docker-only first? Generalizing early risks building the abstraction before three real examples exist; the repo's own Rule of Three says wait.
- [ ] How does a generated gate stay correct as docker adds commands over a project's life, and is that `sync-template`'s problem, a project's own problem, or nobody's?
- [ ] Does the same completeness trap apply to the deny-list side of `settings.json` in a destination, where `project-init` already generates secret-file entries?
