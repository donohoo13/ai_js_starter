# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Opinionated JS/TS starter template optimized for AI-assisted development with Claude Code. Everything that exists within the `src` directory is the source with which is used as the template for new projects. Everything else is configuration and tooling used to set up and maintain the project.

## Standards

- Be concise but maintain clear grammar. Commit messages: 50-char subject in imperative mood, explain WHY in body.
- AI context files (CLAUDE.md, BRAND_DESIGN.md, UI_UX.md) state what is true TODAY in strict present tense. No aspirational language ("we'd like to", "try to"). Document exceptions at point of use, not by softening rules.
- Do not treat memory from previous conversations as gospel. Treat as ephemeral starting point and verify intelligently often.
- Prefer LSP tools for code navigation, symbol searches, and diagnostics. Fall back to terminal commands only if LSP unavailable.
- Follow @UI_UX.md for all UI/UX design and implementation decisions.
- Follow @BRAND_DESIGN.md for all brand design and implementation decisions.
- Prefix unused variables with `_` to avoid lint warnings when maintaining backwards compatibility.
- If a question can be answered by exploring the codebase, explore it instead.
- Confirm with the user to address root causes, not symptoms.
- Evidence before completion claims: do not state something passes, builds, or is fixed without running the command that proves it. "Should work" is not "works".
- No em-dashes (U+2014) in customer-facing text (UI, emails, marketing, AI prompts). Use commas, periods, or rephrasing instead. Hyphens (U+002D) and en-dashes (U+2013) are fine. Internal dev artifacts (code comments, CLAUDE.md, PRs) exempt.

### Git Control

- Prioritize using CLI tools (like `gh` for GitHub) for PR, issue, and remote repository management over raw git commands when available.
- Always verify you are on a valid branch before committing.
- Never commit to main.

### Markdown

- Keep bullet points and long descriptions as single continuous lines (no line breaks within a bullet). This ensures `cmd+x` cuts the entire bullet point instead of just one visual line.
- Use `- [ ]` for TODO items and `- [x]` for completed items instead of plain bullet points.
- Always wrap code snippets, commands, and technical terms in single backticks: `` `git commit` `` not just git commit.
- Use `###` for section headings with descriptive names (not just "Overview") to improve navigation.
- Use relative links like `[docs](./docs/setup.md)` instead of absolute URLs for repo navigation.
- Use `**bold**` for critical actions/warnings, `*italic*` for subtle emphasis—avoid ALL CAPS.
- Use blockquote alerts for critical info: `> [!WARNING]` for pitfalls, `> [!TIP]` for helpful tips (renders on GitHub and GitLab).

## MCP Tools

- Use `playwright-local` MCP server for UI/UX verification (more reliable than plugin) (`mcp__playwright_local__*`).
- Use Chrome DevTools plugin for performance traces and heap analysis (`mcp__chrome_devtools__*`).
- Use Context7 for context gathering when applicable (`mcp__context7__*`).
- Use the `linear` MCP for Linear issue, project, and cycle operations (`mcp__linear__*`). Configured at project scope in `.mcp.json`; requires per-user approval and OAuth via `/mcp`.

### Skills

- Skill usage should be documented concisely inside `src/.claude/skills/README.md` as a human readable reference.
- Use project skills when applicable instead of improvising.
- Task capture is user's responsibility (tracking system, not memory). Suggest `/capture-task` once when user voices actionable asides or conversation drifts. Suggest, never auto-file. One nudge; if user doesn't bite, drop it. Do not use memory for work items.
- Captured tasks land in `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` (`type`: `bug` | `feature` | `chore`), structured per `.claude/skills/capture-task/assets/task-template.md`: frontmatter (`type`, `status: captured`, `created`) plus Context, Problem, Scope, Requirements, Acceptance criteria, Dependencies, Risks / open questions, with unknowns kept explicit as `TBD (needs grilling)`.
- Convention capture is HITL. Suggest `/codify` once when a session surfaces a durable, undocumented convention or debugging gotcha worth writing into a context file (`CLAUDE.md`, `BRAND_DESIGN.md`, `UI_UX.md`). Suggest, never auto-run; one nudge; if user doesn't bite, drop it. Nothing is written without user approval of each candidate.

#### Project VS Template

- The project and template source claude skills should be treated as separate.
- Overlap is allowed between the project and template source skills but should be HITL (human-in-the-loop) to confirm the overlap is intentional.
- When asked to use a skill, always use the project skill if available, and do not attempt to use the template skill unless specified by the user.
- When asked to create or modify a skill, always clarify if we are doing so for the project or the template.

## Commands

## Architecture

## Styling

## Deployment
