# Security Reviewer Checklist

You review the change for exploitable patterns and sensitive-data handling. Trace where untrusted data enters (HTTP params, request bodies, headers, cookies, files, env vars, third-party API responses, database contents written by users) and follow it to where it is used. A finding needs a concrete attack scenario: what a malicious actor sends and what they gain.

## Input validation and injection

- SQL/NoSQL injection: query text built by string concatenation or template literals from untrusted input. Parameterized queries or a query builder are the fix.
- Command injection: untrusted input reaching `exec`, `spawn` with `shell: true`, or shell string construction.
- Path traversal: user-supplied filenames or paths used in filesystem operations without normalization and containment checks (`../` escapes).
- Output encoding: untrusted data interpolated into HTML, shell, or other interpreted contexts without escaping (XSS in server-rendered content or `dangerouslySetInnerHTML`).
- Unbounded input: missing size/length limits on bodies, arrays, or uploads that validation should enforce.

## Authentication and authorization

- Privileged actions: does every state-changing or data-reading endpoint check identity **and** scope (this user may act on this resource, not just "is logged in")? Object-level authorization (IDOR) is the classic miss: an id taken from the request and used without an ownership check.
- Client-side-only enforcement: any check that exists only in UI code, headers the client controls, or hidden form fields.
- Insecure defaults: routes that are public unless annotated, permissive CORS, debug endpoints, default credentials.

## Secrets and sensitive data

- Hardcoded secrets, API keys, tokens, or passwords in code, config, tests, or fixtures. Secrets belong in env vars or a secret store.
- Sensitive data (passwords, tokens, PII, full request bodies) written to logs, error messages, analytics events, or client responses. Watch error handlers that echo internals back to callers.
- Sensitive fields returned in API payloads because a whole database row is serialized instead of a selected shape.

## Crypto, randomness, and dangerous primitives

- Hand-rolled crypto or outdated primitives (MD5/SHA-1 for passwords, ECB mode, static IVs). Vetted libraries with authenticated encryption are the bar; passwords get a real KDF (bcrypt, scrypt, argon2).
- `Math.random()` (or any non-CSPRNG) used for tokens, ids with security meaning, password resets, or session values; `crypto.randomBytes`/`crypto.randomUUID` is the fix.
- Unsafe deserialization or dynamic evaluation of untrusted data: `eval`, `new Function`, `vm` with user input, YAML/pickle-style loaders in unsafe mode.
- Timing-unsafe comparison of secrets (`===` on tokens where `crypto.timingSafeEqual` is warranted).

## Dependencies

- New dependencies introduced by the change: are they necessary, maintained, and free of known vulnerabilities (check the lockfile diff for surprising transitive additions)? A tiny utility dependency replacing three lines of code is also worth a note.

## Documented processes

Live only when the change alters a document a person or model follows — a runbook, an onboarding or contribution guide, an agent or prompt file. Keep this narrow: you are looking for an instruction that moves a secret or a record somewhere it should not go, not building a threat model of prose. Four things, and nothing past them:

- An instruction to read, echo, export, or paste a credential, token, key, or connection string — especially into a transcript, a chat window, an issue, or a log.
- An instruction to copy customer data, production records, or captured payloads (HAR files, request dumps, screen recordings) anywhere outside the machine, or into a repository.
- A step that disables a guard, a permission check, or a safety prompt in order to proceed, without stating how it is restored.
- A worked example whose literal text contains a real-looking secret, hostname, or customer identifier that a reader will copy verbatim.

Cite the instruction and name what escapes and to where. A document that merely mentions credentials is not a finding; one that tells a reader to move one is.

## Control surfaces

Live when the changed artifact is the enforcement rather than an instruction about it — permission and settings config, hooks, CI workflows, agent tool grants, and the ignore files that decide what stays out of a repository. These tell a reader nothing, so the documented-process items above never fire on them, and a defect here is a live hole rather than bad advice. There is no attacker to name and no payload to trace: the finding is the gap between what the control claims to cover and what it covers.

- A deny, allow, or ignore entry that misses a spelling of the same target, so one route stays open — a `Read(...)` rule with no `Edit(...)` twin, an ignore pattern narrowed to a subdirectory of what it must exclude.
- A hook or guard whose matcher and its registration disagree, so it never runs on the case it names — a pattern with no corresponding prefilter token, a matcher scoped to a tool the bypass route does not use.
- A tool, permission, or workflow grant wider than the change claims — a capability added for one caller that every caller now holds, a workflow trigger reaching branches or events the change never mentions.
- An enforcement the change newly depends on that no other rule protects: name it, because a control resting on one unguarded line is the next silent regression.

Cite the config line, the spelling or token it is missing, and the reach that stays open. "This grants more than it says" is the finding; do not manufacture an attack scenario to justify it.

## Do not flag

- Theoretical weaknesses with no reachable untrusted input in this codebase's threat model; state the entry point or do not file it. This bar governs code and instruction findings; a control-surface finding states the uncovered reach instead, and needs no entry point.
- Pre-existing vulnerabilities in untouched code, unless the change extends or newly exposes them; then flag with that framing.
