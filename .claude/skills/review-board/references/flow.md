# Flow Continuity Reviewer Checklist

You review whether a documented process still works end to end after the change. Your subject is any artifact whose job is to be followed rather than executed: runbooks, onboarding and contribution guides, agent or prompt files, API doc chains, ADR sets, and config that documents behavior. Nothing compiles these, so a break in the chain is the defect itself.

## The producer/consumer sweep

The highest-yield move on this seat, and the one nobody makes while reading for sense. For every input a stage requires, find the stage that produces it.

- Enumerate what each stage **consumes**: inputs it is told to receive, fields it must read, decisions it assumes were made, artifacts it opens.
- For each, find where it is **produced**. Grep the corpus for the term. An input named only in the document that consumes it is an input with no producer.
- Check the produced form matches the consumed form. A stage producing a prose judgment and a stage consuming a structured field disagree even when both exist.
- Check ordering: a stage cannot consume what a later stage produces. Read instruction order as execution order unless the text says otherwise.

## Paths and dead ends

- Enumerate every entry point into the process and every exit from it. An entry with no exit, or a state with no defined next step, is a finding.
- Follow each branch of every conditional. The unhappy branch is usually the undocumented one: what happens on refusal, on failure, on a halt partway through, on a precondition that does not hold?
- Check that stop conditions have handlers. If a step can halt, the surrounding process states what the halted state is and who resolves it, or the reader is left mid-process with a partial result.
- Check resume and re-entry. A process a reader can leave and return to states what is already done; without a marker, a resumed run repeats steps whose repetition may not be safe.

## Gates and bypasses

- For every stated gate, enumerate the paths that reach the protected work. A gate on one path while another path reaches the same work unguarded is a bypass, and it is a finding even when the unguarded path is the older one.
- Check that a gate's scope matches its claim. A gate written for one state or one entry point, while the document claims it applies universally, is either an overclaim or a missing case.
- Check who can satisfy the gate. A gate the gated party can satisfy itself, with no independent producer of the thing being checked, is advisory rather than enforcing.

## Handoffs across a context boundary

Wherever information crosses from one reader, session, agent, or document to another, the receiving side gets only what was written down.

- Named recipients that cannot see the sending context need every input restated, not referenced.
- Judgments held "in the conversation" or "in session" survive only within it; a cold pickup of the same artifact loses them.
- Check what a receiving side is told to read against what it is told to produce; a required output derived from an unread input is unreachable.

## Do not flag

- Prose style, tone, length, heading choices, or anything a formatter fixes. Zero budget here.
- A gap that exists identically before the change, unless the change makes it materially worse or newly reachable — then say so with that framing.
- Missing detail you would personally have included. The bar is a reader who cannot proceed, not a reader who would like more.
