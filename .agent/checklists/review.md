# Review checklist

The reviewer role is the one agent whose job is to disagree. It reads the diff,
the spec, and the verification output, and returns exactly one of:
**approve** / **request changes** / **escalate to founder**.

## Correctness
- [ ] Does the change do what the spec says, and only what the spec says?
- [ ] Is every acceptance criterion in scope demonstrably satisfied?
- [ ] What breaks at the edges: empty, one, many, concurrent, huge, negative, unicode?
- [ ] Is there a path where the code silently does nothing?

## Trust
- [ ] Was the verification command actually run? Is the quoted output consistent with the diff?
- [ ] Were any claims made that the diff does not support?
- [ ] Does the handoff note admit what was skipped?

## Security & data
- [ ] No secret or customer data in the diff, logs, or fixtures.
- [ ] Authz checked on every new path, not just authn.
- [ ] Input validated at the boundary; no string-concatenated SQL, no unescaped HTML.

## Blast radius
- [ ] What else does this touch? List it.
- [ ] Is it reversible? How, in one command?
- [ ] Does it need a migration? Is it expand/contract?

## Substance
- [ ] Is this the simplest thing that satisfies the spec?
- [ ] Does it introduce a dependency, a service, or an abstraction that has no second use yet?
