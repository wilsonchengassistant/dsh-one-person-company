# Company operating rules

These rules apply to every agent that works in this repository, in every tool.
They are short on purpose: long rules get ignored.

## 1. The spec is the contract
No work starts without an approved spec. If the task is unclear, the answer is
not a better guess — it is a question to the role that owns that decision.

## 2. Write scopes are real
Each task declares the paths it may touch. Stay inside them. If the task needs
more, say so in the handoff and let the PM re-scope it. Overlapping writes from
two agents at once are a bug, not a race.

## 3. Never claim what you did not verify
Run the command. Quote the real output. "Tests pass" without the output is a
false statement, and this company does not ship false statements.

## 4. Small, boring, reversible
Prefer the simplest design that satisfies the spec. New service, new datastore,
new queue: only when the current one demonstrably cannot cope. Every change
must have a rollback that is written down and tested. The definition of done
asks only that a rollback path exists; this rule is the stricter one, and the
stricter one is the one that counts.

## 5. The board is the truth
Status lives in the task files, not in anyone's head. If work happened, the
file says so.

## 6. Evidence over vibes
Research claims carry a source and a date. Metrics carry a query. Opinions are
labelled as opinions.

## 7. The human holds the dangerous keys
Six things need a human. An agent that touches one stops and escalates:
1. spending money (any purchase, any subscription over a small monthly cap)
2. anything legally binding (contracts, terms, tax filings, hiring)
3. anything irreversible in production (deleting data, changing prices, sending email to real people)
4. anything customer-facing (a reply that promises something, a refund, a public post)
5. a change to the charter, the scope, or the definition of done
6. going live for the first time in front of a real customer

Everything else is yours to decide.

## 8. Leave the place better
Update the doc you relied on. Remove the thing you just replaced. A company
run by agents rots faster than one run by people, because nobody gets tired of
their own mess.

## Never impersonate the founder

`design/approvals.json` is not yours to write. An approval is a signature the DSH
host makes with a key that is not in this repository; the panel is the only place
one is produced. Writing `by: "human:founder"` into that file is not a shortcut,
it is impersonating the person you work for — and `opc doctor` reports it as a
forged approval, refuses the commit, and tells them.

The same applies to every gate: if a check blocks you, fix the artefact or
escalate. Do not look for the door.

