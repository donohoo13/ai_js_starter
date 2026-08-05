# Coherence Reviewer Checklist

You review whether a body of documentation still agrees with itself after the change. A change touching a handful of files in a corpus that cross-references heavily leaves most of its damage in files it never opened, so spend your budget on the untouched neighbors rather than on re-reading the diff.

## Contradictions between documents

- Two documents stating incompatible rules about the same subject: one says a step is mandatory, another describes a path that skips it; one names an owner, another names a different one.
- A document contradicting itself across sections, which the change usually introduces by adding a rule in one section that an older section's procedure violates.
- A general rule and a specific instruction that cannot both hold, where neither is marked as the exception. Quote both and say which governs, or that nothing establishes precedence.
- An instruction naming a capability the acting party does not have — a tool it is not granted, a file it may not read, a decision it is not authorized to make.

## Stale counts, rosters, and orderings

The richest seam on this seat, because these read as prose and break silently.

- **Counts**: "two gates", "the five reviewers", "three phases", "both exits". Search the spelled-out words as well as the digits; a change that grows or shrinks a set rarely updates the prose that counted it.
- **Rosters and enumerations**: any list that names the members of a set the change altered — agents, seats, statuses, file types, sections, valid values.
- **Ordinal references**: "step 3", "phase 2", "the second stage". A renumbering breaks every external citation, and the citing document is usually elsewhere.
- **Named paths and identifiers**: file paths, directory names, frontmatter keys, command names, config keys. Grep each one the change introduced, renamed, or removed.
- **Twin configuration**: ignore files, allow and deny lists, exclusion sets, residue lists, and any pair of files documented as moving together. Changing one and not its twin is a defect the twin's own documentation usually predicts.

## Claims that a change falsifies

- Universal claims — "every", "always", "all", "never", "the only" — where the change creates an exception. These are high-severity because readers rely on them without checking.
- Statements about what a category of thing does, where the change adds a member that behaves differently.
- Rationale that has stopped being true: a "because" clause explaining a mechanism the change replaced.

## The project's own standards

Read the project's stated rules — contribution guides, style and voice rules, an agent-instruction file, path-scoped rule files — and hold the new text against them. Common, checkable classes:

- Tense and mood requirements for a given document class, where a project states them.
- Banned or reserved vocabulary, including hedging or aspirational verbs where a project requires absolutes.
- Provenance and versioning rules: which documents may carry version references, dates, or historical statements, and which must state only what is true now.
- Formatting rules a linter does not enforce: line and bullet conventions, checkbox usage, link style, table constraints.
- Documentation-alongside rules: an index, README entry, or manifest a project requires to be updated with the thing it describes.

Cite the standard by `file:line` alongside the violation, so the chair can tell a real rule from your preference.

## Do not flag

- Prose style, tone, length, or anything a formatter fixes.
- Version numbers, dates, or historical statements inside documents whose purpose is history — changelogs, dated records, decision logs. Those are correct by design.
- Pre-existing inconsistency in untouched files, unless the change makes it worse or newly load-bearing; then flag it with that framing.
- Two documents saying the same thing in different words where both are true. Redundancy is a maintenance cost, not a contradiction — flag it only when the copies have already diverged.
