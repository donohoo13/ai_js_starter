---
type: chore
status: scoped
created: 2026-08-05
incumbent: extend
---

# Correct every harness claim and restate the decayed docs

## Context

Four `from-instance` GitHub issues (#17, #22, #26, #27) prompted an audit. Four parallel readers checked every instruction file in the payload against the official Claude Code docs at `code.claude.com/docs`, and a fifth ranked every file for structural decay. The audit found roughly 30 wrong statements about harness behavior, of which the four issues had reported four. A separate measurement found the context files carry far more instruction than their size suggests: `CLAUDE.md` alone holds ~155 rules in 4,365 words.

Two distinct problems came out of it, and they need different fixes. **Accuracy**: the payload asserts how Claude Code behaves without having checked, and states it in absolutes. **Volume and decay**: several documents have been augmented across many releases and never restated, so rules are duplicated across up to ten files and single bullets carry ten instructions.

Every wrong statement shares one signature: the failure is shaped like success. No error, no warning, a clean-looking result. That is why none of these surfaced through normal use.

## Problem

Current behavior:

- Nine of eleven agents declare `tools: ... LSP`. Background dispatch is the default and strips `LSP` silently, so the grant resolves to nothing and reports no error.
- `CLAUDE.md` tells every session to follow `UI_UX.md` and `BRAND_DESIGN.md`. Neither file ever loads; they are plain markdown links and the repo contains no `@path` imports.
- `curate-context` recommends placing a cross-directory rule in `.claude/rules/` with `paths:` frontmatter, describing the load trigger as "touched". The documented trigger is a **read**, so a session that only edits those paths never loads the rule.
- Three permission entries do not do what `CLAUDE.md` claims: the `WebFetch` domain allows are dead, the docker `ask` gate is missing twelve verbs, and `Read(...)` deny does not cover `Write` or `NotebookEdit`.
- Four skills carry trigger phrases in descriptions the model never sees, because they set `disable-model-invocation: true`.
- Fourteen rules are stated in two to ten files each. One copy has already gone stale in the opposite direction, which is issue #17.
- Four documents have decayed structurally: one 657-word paragraph, one 536-word numbered step carrying ten instructions, two rules each stated three times inside a single file, and a reference file duplicating 1,222 words of the reference it mandates reading.

Desired behavior: every harness claim in the payload matches the documented mechanism or is deleted; every rule has exactly one canonical home; no single bullet carries more than one instruction; and the four decayed documents are restated without losing a rule.

## Scope

- In scope (must-have): all accuracy corrections; all deletions of unverifiable claims; the fourteen duplication collapses; four ground-up rewrites; ten trims; the Actions-contract promotion; the `CHANGELOG.md` entry and version bump; closing issues #17, #22, #26, #27.
- Nice to have: extending the demolition pass to cover prose zones, so a future documentation rewrite has a connection map.
- Out of scope (non-goals, named so the task does not expand silently): changing what any skill does. Every trigger, exit, gate, and behavior stays as-is. Pruning the `CLAUDE.md` MCP menu to servers this repo runs — decided and closed: the user keeps the full menu as-is, after a docs-grounded check confirmed `.mcp.json` carries no model-facing field (`type`, `url`, `command`, `args`, `env`, `headers`, `headersHelper`, `timeout`, `alwaysLoad` is the whole set) and context files are the only project-authored surface that reaches a session for third-party servers. Do not re-propose a thin-menu restructure. Adding a tool-selection hook. Registering a Vue language server.

## Requirements

### Accuracy corrections

- [ ] `.claude/skills/README.md:134` — replace "the hook-gated edit path" with the mechanism stated correctly at `:132`; this closes #17.
- [ ] `.claude/skills/README.md:94`, `:152`, `skill-creator/SKILL.md:8`, `CLAUDE.md:117` — `guard-skill-edit` matches `Edit|Write` only and can block but never load a skill; Bash writes bypass it entirely, as `fork-points.md:65` already states correctly.
- [ ] Nine agent files (`demolition-planner`, eight `review-*`) — resolve the `LSP` grant: background dispatch strips it silently, so either pin foreground dispatch at the call site or drop `LSP` and state grep-only.
- [ ] `implement-task/SKILL.md` — dispatch `demolition-planner` with `run_in_background: false`; the pass is synchronous by construction, so foreground is correct on the merits independent of `LSP`.
- [ ] `demolition-planner.md:20` and `implement-task/references/demolition.md:27` — the "LSP find-references plus a repo-wide grep" step states its degraded path, matching the wording `review-board/references/output-format.md:57` already carries.
- [ ] `CLAUDE.md:46` — the orphan-detection rule states what to do when find-references cannot run, so a session cannot perform half the check and report the whole.
- [ ] `CLAUDE.md:23` — LSP gating has three conditions (plugin enabled, `ENABLE_LSP_TOOL` set, binary installed), not one; the Python binary is `pyright-langserver`, not `pyright`, matching `doctor.sh:59`.
- [ ] `CLAUDE.md:130` — same binary-name correction.
- [ ] `CLAUDE.md:23` — the fallback condition gains a test a session can run, separate from `doctor.sh`, which answers machine-level binary presence rather than session-level tool availability.
- [ ] `CLAUDE.md:24-25` — `UI_UX.md` and `BRAND_DESIGN.md` never load; either import them or state the read step, and `BRAND_DESIGN.md:3`'s per-app override claim carries the same defect.
- [ ] `curate-context/SKILL.md:64` — both trigger descriptions are wrong: path-scoped rules and nested `CLAUDE.md` files both load when Claude **reads** a matching file. "Narrow placement is free" gains its real trade: zero context cost, at the risk of never loading in a session that only writes. Name the two guaranteed-load alternatives (`.claude/rules/` without `paths:`, and `@path` imports) with their always-loaded cost. This closes #27.
- [ ] `.claude/settings.json` — the bare `WebFetch` in `ask` outranks the three domain allows, making them dead; resolve so the doc domains are actually pre-approved.
- [ ] `.claude/settings.json` — the docker `ask` gate gains `start`, `restart`, `attach`, `pause`, `unpause`, `commit`, `save`, `export`, `load`, `import`, `update`, `debug` in both spellings, or `CLAUDE.md:20` stops claiming the list is exhaustive.
- [ ] `.claude/settings.json` — add `Edit(...)` deny entries alongside the `Read(...)` registry; `Read` deny does not cover `Write` or `NotebookEdit`, so `.env.production` is currently clobberable. Reading is already covered, so this is a destruction risk, not a disclosure risk.
- [ ] `CLAUDE.md:21` — state the registry's real coverage rather than "enforced natively for file tools".
- [ ] `CLAUDE.md:21` opens "Secret-bearing files are unreadable to AI sessions", an absolute that neither mechanism behind it delivers. `guard-secret-read.mjs:14` states "this is not an access control", and the permissions docs say native rules "don't apply to arbitrary subprocesses that read or write files indirectly, like a Python or Node script that opens files itself". Both guard accidents, not intent. State what the pair actually delivers, so a future session does not treat the boundary as sealed.
- [x] The same token matching that blocks a read also blocks any Bash command merely naming a registered file, including a commit message describing a fix to the registry. `guard-secret-read.mjs:12` names that exact case as intended over-blocking. The cost it does not name: the false positive has a thirty-second workaround (write the text to a file, reference the file), the workaround is indistinguishable in shape from deliberate evasion, and a session that learns it carries it into cases the guard exists to catch. Decided: the block message now teaches the sanctioned route explicitly (rephrase so no registered spelling appears as a token, or hand the command to the user), after the false positive reproduced live three times across two sessions — twice on the authoring session, once on a review seat.
- [ ] `CLAUDE.md:104` and `:112` — a project `.mcp.json` entry does not shadow a plugin server by name; plugins match by endpoint, and both chrome-devtools servers run concurrently.
- [ ] `README.md:11` — seven of ten `.mcp.json` entries are HTTP with no launch command, not "all launched via `pnpm dlx`".
- [ ] `CLAUDE.md:84` and `implement-task/SKILL.md:33` — entering a worktree outside `.claude/worktrees/` raises a second, unsuppressable approval prompt, and the flow is unreachable from inside a worktree or an `isolation: worktree` subagent.
- [ ] `skill-creator/SKILL.md:20` and `references/skill-quality.md:23` — a skill body is a per-turn recurring context cost for the rest of the session, not a one-time cost at trigger; this is the actual reason for the 500-line ceiling.
- [ ] `skill-creator/references/skill-quality.md:11` — the frontmatter enumeration omits `when_to_use`, `paths`, `effort`, `background`, `shell`, `metadata`, `license`, `compatibility`.
- [ ] `sync-template`, `template-feedback`, `project-init`, `grill-me` — these set `disable-model-invocation: true`, so their descriptions are never in context; remove the trigger phrases written for a reader that does not exist.
- [ ] `review-board/SKILL.md:113` — the seats are not read-only; all eight hold `Bash`, and the prompt is the only restraint, exactly as `fork-points.md:65` argues for `demolition-executor`.
- [ ] `review-board/SKILL.md:113` — note that `CLAUDE_CODE_SUBAGENT_MODEL` outranks the per-invocation `model` parameter the seat matrix depends on.
- [ ] `diagnose/scripts/hitl-loop.template.sh:4` — "the agent runs the script; the user follows prompts in their terminal" describes one shared terminal that does not exist; run through the Bash tool, `read -r -p` hits EOF and the EXIT trap returns a clean-looking empty capture. Hand the script to the user, matching the human QA handoff two phases later.
- [ ] `.claude/rules/template-dev.md` — this file has no `paths:` frontmatter, so it loads unconditionally in any instance where `project-init` never ran, and its own disclaimer arrives inside the block it is disclaiming.

### Deletions

- [ ] `skill-creator/SKILL.md:20` and `references/skill-quality.md:25` — delete the "nested reference chains get head-previewed and missed" mechanism. The one-hop rule itself is Agent Skills spec text ("Keep file references one level deep from `SKILL.md`. Avoid deeply nested reference chains") and stays, cited to the spec.
- [ ] `skill-quality.md:16` — delete "third person only; first or second person causes discovery problems". No source states this.
- [ ] `skill-quality.md:8` — delete the `name` "no XML tags" and "must not contain anthropic or claude" constraints. These are Skills API upload validation and this repo ships project skills. The `≤64` length and lowercase-hyphen charset are spec-confirmed and stay, re-sourced to the spec.
- [ ] `skill-quality.md:7`/`:9` — `name` and `description` required, and `description ≤1024`, are spec-confirmed; re-source from Claude Code docs to the spec.
- [ ] `CLAUDE.md:102` — delete the machine-global OAuth token-store claim. No documentation states it. The `.mcp.json` stanza names cost zero context and stay; only the prose explaining them goes.
- [x] `.claude/settings.json:4` — `ENABLE_LSP_TOOL` deleted. Tested rather than argued: with the key removed and `env` empty, a session loaded the LSP schema and got real hover data back (`probe.py:1:5` → `(function) def probe(value: int) -> str`). Both binaries on PATH, both plugins enabled. Verified on one Claude Code version only, which is stated in the changelog's adaptation notes.

### Duplication collapses

- [ ] Each of the fourteen duplicated rules gets one canonical home and pointers everywhere else. Canonical homes: `incumbent:` definition → `capture-task/assets/task-template.md`; the `none`/`extend` why-line asymmetry → `grill-engineer/SKILL.md`; the demolition procedure → `implement-task/references/demolition.md`; the Actions contract → `review-board/references/output-format.md`; the doc-board floor and depth → `review-board/SKILL.md` "Which seats"; the no-hook context routing → `CLAUDE.md:118`; the opening-line taxonomy rule → `grilling/SKILL.md`; the `research-analyst` dispatch contract → `.claude/agents/research-analyst.md`; the three-part ADR bar → `domain-modeling/ADR-FORMAT.md`; the residue path set → `project-init/SKILL.md` (`sync-template`'s pathspec stays literal, it is executable); the Node-pin retarget set → the `check-install.mjs` header; the brand-derivation refusal → `brand-init` frontmatter; the secret-file registry → `CLAUDE.md:21`.
- [ ] "Ceremony scales with size; engineering discipline never does" stays duplicated on purpose; `README.md:5` states it is written into the skills verbatim.

### Rewrites, worst first

- [ ] `.claude/skills/README.md` (158 lines, 7,157 words) — 657-word paragraph, 40 sentences over 60 words, a broken enumeration at `:5`, the `:132`/`:134` contradiction, and blurbs restating four SKILL.md bodies at ~70% fidelity. Target ~2,600 words.
- [ ] `implement-task/SKILL.md` (90 lines, 4,184 words) — `:74` is 536 words carrying ten instructions with the render check buried as instruction nine inside a step titled "Validate"; section 3 duplicates 1,222 words of `references/demolition.md`. Target ~2,400 words.
- [ ] `review-board/SKILL.md` (187 lines, 5,410 words) — the doc-board floor stated three times, the doc-board depth stated three times, and a section that opens "Settle this before the dials" positioned after the dials. Target ~3,600 words.
- [ ] `project-init/references/fork-points.md` (110 lines, 4,828 words) — 8 of 46 entries over 120 words, one at 416 that duplicates a canonical script header `CLAUDE.md:63` points at, and ten entries carrying no lever against the grammar the file declares at `:5`. Target ~3,200 words.

### Trims

- [ ] `CLAUDE.md` — split the six run-on bullets (`:19`, `:21`, `:45`, `:48`, `:50`, `:63`), fix the missing period at `:51`, and run the culling pass below. Structure stays; the skeleton is sound and 81 of 87 bullets already carry one idea.
- [ ] `curate-context/SKILL.md` — split `:9`, `:64`, `:89`.
- [ ] `grill-design/SKILL.md` — split `:31` (312 words, eleven instructions); the feel-silent-grammar rule lives once at `:23`.
- [ ] `grill-engineer/SKILL.md` — split `:48` (370 words, seven instructions) and `:47`.
- [ ] `grill-me/SKILL.md` — split `:47` (291 words holding all three routing checks) and `:45`.
- [ ] `grill-product/SKILL.md` — split `:26` (291 words, eight instructions) and `:16`.
- [ ] `project-init/SKILL.md` — split `:55` (three unrelated asks) and `:73`.
- [ ] `.claude/rules/template-dev.md` — split `:9`, a 143-word single sentence carrying seven claims whose "two separate commands" instruction sits mid-sentence between subordinate clauses.
- [ ] `BRAND_DESIGN.md` — split the `:3` and `:5` preamble paragraphs. Everything below `:7` is a clean skeleton and needs nothing.
- [ ] `UI_UX.md` — restate the Transactional Emails section (114-133) to the file's own grammar: single continuous lines, backticks on technical terms, and a source per rule, per the file's own header promise. All thirteen email rules keep their exact technical content.

### Promotion and release

- [ ] Promote the Actions contract out of `review-board` so it binds every verification the payload claims: a session states the command it ran and its literal output, never a conclusion about absence. Scope it to claimed verifications (orphan checks, blast-radius inventories, rule-load assumptions), not to all work.
- [ ] `CHANGELOG.md` entry with what, why, and adaptation notes for diverged instances; `package.json` version bump.
- [ ] Close #17, #26, #27 on merge. Close #22 immediately with a pointer to the v1.4.0 entry that resolved it.

## Acceptance criteria

- [ ] Every accuracy requirement above is fixed (the slices record each landing); the per-fix citation of a grounding documentation sentence was carried in commit messages and the changelog where it exists, not as a per-requirement ledger — checking this box requires that ledger, which nobody has built.
- [x] `grep -rn "hook-gated\|hook-enforced\|hook holds\|hook backs"` over the payload returns only `skill-creator`/`guard-skill-edit` references and explicit negations ("No hook backs this", "no hook holds this seam"), both legitimate. The phrasing alternatives are in the pattern because the narrow two-term grep passed a live instance of the same defect: `curate-context/SKILL.md:59` said "the hook holds this seam from both sides" while `:9` in the same file said nothing blocks a raw edit.
- [x] No agent declares a tool its dispatch mode strips: `demolition-planner` and all eight review seats are pinned to foreground dispatch at their call sites, so the `LSP` grant resolves; the review board measured two foreground probes overlapping 21 of 25 seconds, so concurrency survives.
- [x] For each of the four rewritten files, a behavioral diff test passed: scenario sets written before any rewrite, two fresh agents per file (one holding only the old file, one only the new), 31/31 scenarios answered identically after chair restorations of diff-caught fidelity leaks.
- [ ] Eleven of the fourteen duplicated rules now appear in full in exactly one file with pointers elsewhere; three (the no-hook routing statements, the brand-derivation signposts, the secret-registry statements) were judged distinct jobs per reader rather than duplicates and deliberately left as-is — the criterion's absolute wording does not hold for them, by decision rather than omission.
- [x] No bullet in any touched file carries more than one instruction: every named run-on is now a lead bullet holding one claim with sub-bullets holding one instruction each, verified by rereading each split for coordinating clauses.
- [x] The user redirected this gate: the persisted inventories serve as the spec for a faithful restructure rather than a cull menu, so no per-file review round ran — every rule survives by construction, verified by the behavioral diffs.
- [x] `pnpm format:check` passes and every config file parses, re-verified after every landing this branch.
- [x] Every deletion was reported before landing: the five-rule cull (later reversed by the user), the eight-bullet cull, the docker gate, the collapse drops, and each rewrite's behavioral-diff divergence report.

## Dependencies

- [ ] User review of each rule inventory. This is a blocking gate per file, and it is where culling decisions get made.
- [x] `ENABLE_LSP_TOOL` resolved by live test: LSP loads and answers without it, so the key is dead weight and the `CLAUDE.md` rule now names two activation conditions rather than three. The same test also showed `typescript-language-server` starting but failing to initialize in this repo (no `typescript` dependency), which is a tool error rather than absence — the rule now says to read the error before concluding a language is uncovered.
- [ ] User decision on the docker gate: complete the list, or narrow the claim in `CLAUDE.md:20`.

## Risks / open questions

- [ ] The rule inventory is the single point of failure. A rule missed at extraction is missed everywhere downstream. Mitigations: extraction is close to mechanical, the user reviews every list, and the original file stays in git.
- [ ] `incumbent: extend` is recorded because no file is deleted, but four files are genuinely being replaced in content. This exposes a real gap: the key conflates "the old content dies" with "run the demolition pass", and the pass is code-shaped (its connection map is the typechecker's error set, which markdown does not have). Worth deciding separately whether the pass should grow a prose mode.
- [ ] Splitting run-ons increases line count. `CLAUDE.md`'s own zero-net-growth benchmark should be overridden here and the override stated out loud.
- [ ] Whether a subagent's `transcript_path` points at its own transcript or the root session's is unknown, which decides whether `guard-skill-edit`'s "this session" means what it says inside a subagent.

## Design decisions

**`incumbent: extend`** — no file is deleted. The demolition pass is deliberately not used, because it is safe for code only when a design artifact outranks the incumbent, and no design artifact exists for these documents. The document is its own specification, so deleting it first destroys the only spec available.

**The restatement method, replacing demolition for prose.** Per file: extract every rule as one line (trigger, action, and the reason where the reason is load-bearing); the user reviews and culls that list; an agent that has never seen the original writes the new document from the approved list alone. That last step buys the anti-anchoring benefit deletion was meant to provide, while the original stays on disk.

**Rule granularity.** Split where one part could plausibly be kept and another dropped. Do not split a single rule into its clauses.

**The behavioral diff test.** Scenario questions are written **before** each rewrite, derived from the old file, so the test cannot be shaped to fit the new one. One agent answers from the old file only, another from the new file only, neither seeing the other. Compare answers, not prose. This tests at the interface, since a context file's interface is what a session does after reading it. The checking agents carry no memory of the authoring session, because a rewriter grading its own rewrite is the failure `review-board`'s Actions contract was built to stop.

**Culling versus restructuring are separate problems.** `CLAUDE.md` is dense, not decayed: ~155 rules in 4,365 words, 81 of 87 bullets carrying one idea, no contradictions. Restructuring it buys nothing. Its volume problem is answered by culling, which is the user's decision, not the rewriter's.

**No enforcement mechanism ships.** A `PreToolUse` guard on tool selection would fire constantly on legitimate repo-wide greps, including the vocabulary sweeps this repo's own release process requires. `InstructionsLoaded` cannot block or inject context and only logs what did load, never what failed to. The instrument is reporting, and it already exists as the Actions contract.

**Deletion is the default for an unverifiable claim.** An unverifiable mechanism sentence in a context file is worse than no sentence, because it reads as a reason and gets defended. Two claims were checked before deleting and survived: the Agent Skills spec confirms the `name` and `description` constraints and the one-hop reference rule.

## Test strategy

There is no test runner for prose. Three checks stand in, at the seam a reader actually crosses:

- **Behavioral diff**, per rewritten file, as described in Design decisions. This is the primary check and the only one that tests behavior rather than text.
- **Mechanical greps** for the accuracy fixes: vocabulary sweeps (`hook-gated`, `hook-enforced`, `v[0-9]`), the agent `tools:` lines against the documented background allowlist, and `.claude/settings.json` parsed and diffed against what `CLAUDE.md` claims about it.
- **Executable checks** where they exist: `node .claude/hooks/guard-main.mjs` and `guard-secret-read.mjs` driven with constructed inputs, as the audit already did, plus `pnpm format:check`.

## Slices

- [x] Config and permission corrections: `.claude/settings.json` (`WebFetch`, twelve docker verbs, 22 `Edit` deny entries) plus foreground dispatch for `demolition-planner` and the eight review seats. Human-QA'd: unlisted domain prompts, allowed domain does not, write to a registered path denied with the repo root still writable, `docker start` prompts.
- [x] Deletions: the four unsourced claims in `skill-creator` and `skill-quality.md`, and the OAuth token-store prose in `CLAUDE.md`. Two candidates checked against the Agent Skills spec first and re-sourced rather than cut.
- [x] Accuracy fixes in files not being rewritten: `curate-context:64` (closes #27), the `CLAUDE.md` LSP, secrets, design-doc, orphan, MCP-shadowing, and hook bullets, `skill-creator`, the two dead `disable-model-invocation` descriptions, and `hitl-loop.template.sh` with its `diagnose` call site.
- [x] Duplication collapses, the three largest: `implement-task` section 3 into `references/demolition.md` (−874 words), `review-board`'s two triple-statements into one home each, and the `check-install.mjs` entry in `fork-points.md` into its script header (−194 words). Closes #17.
- [x] Rule inventories extracted for all five files needing them: `CLAUDE.md` (164 rules), the skills README (365), `implement-task` (143), `review-board` (123), `fork-points` (60). Ready for the user's cull. Four are persisted under `docs/notes/`; the `CLAUDE.md` inventory exists only in the extracting session's context and is not on disk. The nine trim files need no inventory, since splitting a run-on drops nothing.
- [x] Contradictions the inventories surfaced, closed: eight across four files, including three claims corrected in `CLAUDE.md` that were left standing in `fork-points.md`. Two behavior-shaped ones were surfaced rather than fixed; one of those, the post-QA suite gap, the user then approved.
- [x] JS/TS conventions moved to `.claude/rules/javascript-typescript.md` with `paths:` scoping, leaving a pointer. `CLAUDE.md` 141 → 124 lines. The first time the template runs the mechanism `curate-context` recommends.
- [x] Duplication collapses, the remaining eleven, each inspected and dispositioned: the Actions contract's identical sentence in all eight agent files collapsed to a pointer at `output-format.md` Part A; the `research-analyst` brief contract trimmed from `grill-research` and `grill-product` (the agent's own description carries it, `grill-design` already had the collapsed form); the residue path set in `template-dev.md` collapsed to a pointer at `project-init`'s residue plan item. Five were found already resolved on inspection: the `incumbent:` definition (rewritten `implement-task` carries checks, not definitions), the why-line reasoning (one home, `task-template.md`), the opening-line rule (rationale once in `grilling`, lenses carry only their parameters), the ADR bar (reasoning once in `ADR-FORMAT.md:84`, use-sites carry the three-token trigger), and the Node-pin set (operative copy in the rules file pointing at the `check-install.mjs` header). Three were judged distinct jobs rather than duplicates and left: the no-hook routing statements (each addresses a different reader at its own seam), the brand-derivation refusal (every non-canonical copy is already a signpost), and the secret-registry statements (`CLAUDE.md` rule, `fork-points` lever, `project-init` append procedure, hook mechanism doc).
- [x] Rewrite `.claude/skills/README.md`: blind rewrite from the 365-rule inventory plus verbatim-carry materials (diagram, stage map, the four fresh blurbs); behavioral diff 8/8. The user waived the cull review — the inventories are the spec for a faithful restructure, every rule survives. 6,064 → 5,093 words, zero sentences over 60.
- [x] Rewrite `implement-task/SKILL.md`: blind rewrite from the 143-rule inventory plus review-fix amendments; behavioral diff 8/8. 3,499 → 2,715 words; the 536-word validate step is now one-instruction bullets.
- [x] Rewrite `review-board/SKILL.md`: blind rewrite from the 123-rule inventory plus amendments; behavioral diff 8/8, three chair restorations (consolidation rationale, doc-board security scope wording, one table cell). 5,569 → 3,236 words, sections in working order.
- [x] Rewrite `project-init/references/fork-points.md`: blind rewrite from the 60-entry inventory plus amendments; behavioral diff 7/7, three chair restorations (full script paths, the prefilter's `settings.json` home, adoption-cost sub-branches). 4,780 → 3,268 words; every entry carries a lever clause.
- [x] `CLAUDE.md` cull: the user decided it as a ~160-word directive rather than a 164-rule review — the JS/TS generics had already moved to the rules file, the MCP menu stays, the five two-natured rules were restored with a precedence clause, and eight generic bullets (six Markdown, two Development: AAA, env vars) were cut. 141 → 116 lines.
- [x] `CLAUDE.md` run-on splits: prose restatement, secrets, comments, kill-process, and zsh split into lead-plus-sub-bullets; the sixth (Node-pin) split in its moved home, `.claude/rules/javascript-typescript.md`. The missing period at the original `:51` died with the culled AAA bullet. `CLAUDE.md` at 132 lines.
- [x] Remaining trims, all landed: `grill-design` `:31` (store-source ladder to sub-bullets), `grill-engineer` `:47`/`:48` (criteria binding, the incumbent exit), `grill-me` `:45`/`:47` (portfolio bookkeeping, the three routing checks), `grill-product` `:15`/`:16`/`:26` (dispatch collapse, altitude/residue, brief exit), `project-init` `:55`/`:73` (repo shape/license/Node-pin, residue), `template-dev.md` `:9` (five bullets from the 143-word sentence), `BRAND_DESIGN.md` `:3`/`:5`, `curate-context` `:9`/`:68`/`:93`, and the `UI_UX.md` email section restated to the file's grammar (backticks, a source per rule, all thirteen rules' technical content intact). +143/−49 lines across the sweep.
- [x] Promote the Actions contract payload-wide, landed by strengthening `CLAUDE.md`'s existing evidence bullet to reach claims of absence rather than adding a sibling.
- [x] `CHANGELOG.md` v1.7.0 entry and version bump. #22 closed with a pointer to v1.4.0; #17, #26, #27 close on merge.
