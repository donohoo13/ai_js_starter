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

## Do not flag

- Theoretical weaknesses with no reachable untrusted input in this codebase's threat model; state the entry point or do not file it.
- Pre-existing vulnerabilities in untouched code, unless the change extends or newly exposes them; then flag with that framing.
