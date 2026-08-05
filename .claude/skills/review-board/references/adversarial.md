# Adversarial Reviewer Checklist

You red-team a documented process. Assume the reader is capable, under time pressure, and looking for the cheapest path that still counts as compliance. Your job is not to find what the document forgot — the flow seat does that — but to find how following it exactly still produces the outcome it exists to prevent.

Start by naming what the change is trying to force and what the reader would rather do. Every process document exists because a cheaper behavior was happening; that behavior is your first attack.

## The null action

For every check, gate, judgment, or optional step, work out what happens when the reader does the minimum — supplies nothing, finds nothing, decides nothing — and follow it to an outcome.

- Where a missing input is treated as a benign default, ask whether the default is the behavior the document exists to prevent. A rule whose null action is the failure mode is inverted.
- Where a step produces a list, ask what an empty list means downstream. "Nothing found" and "nobody looked" are indistinguishable unless the document distinguishes them.
- Where a judgment can be deferred, find where it lands if nobody ever makes it.

## Price the options

When a document offers several verdicts, paths, or exits, compare what each costs the reader in effort and ceremony, then expect traffic to flow to the cheapest one.

- An option requiring justification, extra work, or an additional step will lose to an option requiring none, whenever both are defensible.
- Options producing the same outcome at different prices are one option; the expensive one will not be chosen.
- A gate whose remedy is cheaper than the work it protects gets satisfied rather than respected. Ask specifically whether the party being gated can produce the thing being checked.

## Self-serving readings

For each instruction, find the reading a motivated reader prefers and ask whether the text forbids it.

- Terms doing load-bearing work with no definition: what counts as "evidence", "explicit", "exclusive", "relevant", "significant", "similar". Each is a place the cheap reading wins.
- Audits phrased as a transformation rather than a filter. "Rewrite it as X or cut it" is passed by rewriting; the content survives in a new shape.
- Prohibitions scoped narrower than their intent — forbidding one route to a thing while other routes remain open, especially routes the process itself creates.
- Requirements a party cannot compute from the information it is permitted to have. These get satisfied by guessing, and the guess is uniformly the cheap one.

## Unrecoverable and repeated states

- Trace what a re-run does. Re-entering a process that already ran once, on a state it did not expect, is where destructive steps do their worst damage.
- Trace an interruption: partway through, is the state safe, resumable, and distinguishable from not-yet-started?
- Where a recovery story is claimed — a backup, a history, a revert — test it against the cases that fall outside it, and name what is genuinely unrecoverable.
- Where an artifact is deliberately temporary, check whether anything it uniquely holds needs to outlive it.

## Instructions that will simply be skipped

- Any judgment with no forcing function, especially one whose cost recurs while its benefit is invisible.
- Any check that will fail often for uninteresting reasons; it gets rationalized away, and everything downstream of it silently stops running.
- Any control whose output nobody sees: a report announced where no reader is looking, a warning in a channel nobody reads, an approval window that closes before a human could act.
- Apply the change's own reasoning back to itself — a document arguing that some class of check undertriggers or gets ignored has handed you the test for every check it introduces.

## Do not flag

- Prose style, tone, length, or anything a formatter fixes.
- Risks with no walked scenario. The bar is a named path to a specific bad outcome, not a plausible worry.
- Failures requiring an actively malicious operator. Your reader is cutting corners, not sabotaging.
- Pre-existing weaknesses the change neither introduces nor worsens, unless the change makes one newly reachable; then say so with that framing.
