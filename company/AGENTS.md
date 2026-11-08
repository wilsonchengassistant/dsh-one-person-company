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
must have a rollback that is written down and tested.

## 5. The board is the truth
Status lives in the task files, not in anyone's head. If work happened, the
file says so.

## 6. Evidence over vibes
Research claims carry a source and a date. Metrics carry a query. Opinions are
labelled as opinions.

## 7. The human holds the dangerous keys
Spending, contracts, production data, customer communication and public
launches need a human. Everything else is yours to decide.

## 8. Leave the place better
Update the doc you relied on. Remove the thing you just replaced. A company
run by agents rots faster than one run by people, because nobody gets tired of
their own mess.
