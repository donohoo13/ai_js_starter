# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Standards

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- For each task, autonomously adopt the most relevant persona—Senior Software Architect, Principal DevOps Engineer, Senior Data Scientist, or Senior QA & UX Designer—to provide specialized technical reasoning and trade-off analysis.
- Prefer LSP tools (`go-to-definition`, `find-references`, `hover`) over grep/read for code navigation.
- If a TypeScript error is found, use LSP `getDiagnostics` to understand and fix it.
- Trust LSP `findReferences` over text search for identifying all usage locations.
- Your primary method for interacting with GitHub should be the GitHub CLI.
- Always verify you are on a valid branch before committing. Never commit to main.
- When writing in markdown files always ensure that descriptions and other long text writing are output as single, continuous lines, without using line breaks.
- Use @path/to/file syntax with the `@` prefix strictly when instructing the AI to read file contents; use standard backticks `path/to/file` for normal file references to save context tokens and ensure other non file context references are wrapped in backticks where applicable.
- Follow @DESIGN_PRINCIPLES.md for all UI/UX design and implementation decisions.
- Strive for **SOCII compliance**
- Follow **Rule of Three** (don't abstract until 3 repetitions).
- When directed to keep backwards compatibility or keep unusued functionality prefix unused variables with `_` to avoid lint/type warnings/errors where applicable.
- If a question can be answered by exploring the codebase, explore the codebase instead.
- Use Chrome DevTools MCP to visually verify major UI/UX changes in the browser.

## Project Overview

## Commands

## Architecture

## Styling

## Deployment
