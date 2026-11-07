#!/usr/bin/env node
// Seeds the worked example: the task bodies for the receipt-ledger spec.
//
// This file exists to be re-runnable and to show *how* a spec becomes a set of
// agent-sized tasks. It is what the PM role would have produced after reading
// the spec and the architecture notes.
//
//   node examples/seed-receipt-ledger.mjs

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { read, write, parseFrontmatter, stringifyFrontmatter } from '../tooling/src/util.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const BODIES = {
  'T-0001': `## Context
Everything else depends on this: the schema, the migration path and the local
dev loop. The spec's data model lives in section 9.

## Deliverable
- \`pnpm-workspace.yaml\` with \`apps/api\`, \`apps/web\`, \`apps/worker\`, \`packages/db\`, \`packages/ui\`
- \`packages/db\` with the \`expenses\` table, Drizzle schema and a migration runner
- A local Postgres via \`pnpm db:up\` and \`pnpm db:migrate\`
- CI job that boots the DB and runs migrations

## Acceptance criteria
- [ ] AC-1 (partial): \`expenses\` row can be created and read back with all fields from spec §9
- [ ] AC-4 (partial): every query in the data layer takes a \`user_id\` filter — no unscoped query helper is exported
- [ ] Migrations are reversible: \`pnpm db:rollback\` restores the previous schema

## Verification
\`\`\`sh
pnpm install && pnpm db:up && pnpm db:migrate && pnpm test --filter packages/db
\`\`\`

## Notes / handoff
Open question for the architect: whether \`low_confidence_fields\` is a JSONB
column or a normalised table. Default to JSONB; revisit only if filtering on
it becomes a real requirement.`,

  'T-0002': `## Context
AC-4 and AC-6: receipt images are customer data. A public object URL is a data
breach waiting to be found.

## Deliverable
- \`POST /api/receipts\` — multipart upload, validates content type and size, writes to a private object store bucket
- \`GET /api/receipts/:id/image\` — owner-scoped, returns a short-lived signed URL (or streams the bytes)
- Object keys are random and contain no user id, filename or merchant name

## Acceptance criteria
- [ ] AC-4: another authenticated user requesting the same receipt id gets 404 with no data in the body
- [ ] AC-6: no receipt object is readable without a valid, unexpired signed URL
- [ ] AC-8: a failed upload leaves no orphaned object in storage

## Verification
\`\`\`sh
pnpm test --filter apps/api -- receipts
\`\`\`

## Notes / handoff
Capture is behind a flag from day one (\`RECEIPTS_ENABLED\`).`,

  'T-0003': `## Context
AC-1, AC-2, AC-8. Extraction runs asynchronously (ADR-0001) behind a provider
interface (ADR-0002) so the provider can be swapped and tested against fixtures.

## Deliverable
- \`packages/extraction\` with an \`ExtractionProvider\` interface: \`extract(image) -> {merchant, date, total, currency, lineItems, tax, confidence}\`
- A worker that consumes queued receipt ids, calls the provider, writes the expense row and its confidence flags
- A fixture suite: 20 sample receipts with known expected values
- Timeout + retry policy, and the manual-entry fallback (AC-8)

## Acceptance criteria
- [ ] AC-1: extraction completes within 10 s end to end for a legible receipt
- [ ] AC-2: fields below 0.80 confidence are returned with a low-confidence flag
- [ ] AC-8: on provider timeout, a manual entry form is produced and no orphan object remains

## Verification
\`\`\`sh
pnpm test --filter packages/extraction -- --fixtures
\`\`\`

## Notes / handoff
Provider credentials come from the environment. Never log the image bytes or
the raw provider response — it contains customer data.`,

  'T-0004': `## Context
AC-1, AC-2, AC-3 and the accessibility requirement. One novel UI element: the
confidence chip.

## Deliverable
- \`CaptureSheet\` component: viewfinder → extracted fields → save
- \`ConfidenceChip\` in \`packages/ui\`, colour-blind safe, not the only signal (it also carries a label and an icon)
- Field row component reused for every extracted field (label, value, chip, tap-to-edit)
- Keyboard path: focus moves into the field on edit, Escape cancels, Save is reachable without a pointer

## Acceptance criteria
- [ ] AC-2: a low-confidence field is visually distinct and editable in one tap
- [ ] AC-3: an edited value is what the ledger and CSV show
- [ ] Contrast ≥ 4.5:1, every control has a real label

## Verification
\`\`\`sh
pnpm test --filter apps/web -- capture && pnpm lint
\`\`\`

## Notes / handoff
Empty, loading, error and success states are required — see
\`.agent/checklists/definition-of-done.md\`.`,

  'T-0005': `## Context
AC-7. The ledger is the product; the capture is the novelty.

## Deliverable
- \`GET /api/ledger\` with \`from\`, \`to\`, \`category\`, \`q\` filters, owner-scoped
- Ledger list UI with filter bar, result count, and running total
- Server-side pagination with a stable cursor

## Acceptance criteria
- [ ] AC-7: filtering by date range, category and free text over merchant/note works and the count and total update within 300 ms at 1,000 expenses
- [ ] AC-4: the endpoint is owner-scoped by construction, not by a filter applied later

## Verification
\`\`\`sh
pnpm test --filter apps/api -- ledger && pnpm test --filter apps/web -- ledger
\`\`\`

## Notes / handoff
Use an index on \`(user_id, occurred_on)\` and a trigram index for the text
search; both are cheap at this scale.`,

  'T-0006': `## Context
AC-5. This is the accountant's job — the one output that decides whether the
product is used by professionals.

## Deliverable
- \`GET /api/export/ledger.csv\` — one row per expense, columns exactly: date, merchant, total, currency, category, note, receipt_url
- Streaming response, UTF-8 with BOM so Excel opens it correctly
- Empty export returns a header row and zero rows, not a 404

## Acceptance criteria
- [ ] AC-5: column set and order match the spec exactly; values round-trip into a spreadsheet unchanged
- [ ] AC-4: the export is owner-scoped; another user's rows cannot appear

## Verification
\`\`\`sh
pnpm test --filter apps/api -- export
\`\`\`

## Notes / handoff
The receipt_url column is a signed URL with a 1-hour expiry — say so in the
CSV header comment or the docs, or accountants will bookmark it and be
surprised when it stops working.`,

  'T-0007': `## Context
This is the QA role's whole job for this spec: prove that one user can never
see another user's data. It is the cheapest thing to automate and the most
expensive thing to get wrong.

## Deliverable
- A test that creates two users, gives each one receipt, and asserts isolation on every endpoint in the spec: capture, image fetch, ledger list, expense read, expense update, export
- A test that asserts 404 (not 403) and an empty body for a foreign resource
- A test that asserts receipt image requests without a valid signature fail

## Acceptance criteria
- [ ] AC-4 and AC-6 are proven by tests that fail if the owner filter is removed from any handler
- [ ] Every endpoint in the spec is covered — the QA role enumerates them from the spec, not from the code

## Verification
\`\`\`sh
pnpm test --filter tests -- isolation
\`\`\`

## Notes / handoff
This suite must be able to run against production-like config in CI. If a
route is added later without a case here, the QA role is expected to fail the
review.`,

  'T-0008': `## Context
AC-9. Analytics for a solo company are not vanity metrics — they are the only
way to know whether anyone is using the thing.

## Deliverable
- \`expense.created\` and \`expense.field_corrected\` events, emitted server-side
- Properties: source (camera/upload), low_confidence_field_count, correction_count — never merchant names, totals or image data
- A dashboard view and an alert on capture success rate

## Acceptance criteria
- [ ] AC-9: events appear in the product analytics within 60 s of the write
- [ ] No customer data is present in any event payload

## Verification
\`\`\`sh
pnpm test --filter packages/analytics
\`\`\`

## Notes / handoff
The privacy rule (no customer data in analytics) is checked by a unit test
that asserts the allowed property list. Do not bypass it.`,

  'T-0009': `## Context
No deployment means no learning. This task exists so that "ship" is a command,
not an event.

## Deliverable
- GitHub Actions: lint, typecheck, test, build on every push
- A preview environment per pull request with a seeded database
- A deploy job: migrate (expand/contract), release, health check
- A documented rollback: the exact command, tested once against the preview environment
- Error tracking (Sentry) with source maps for the web build
- Uptime check and an alert that pages the founder

## Acceptance criteria
- [ ] The deploy is reproducible from a clean checkout
- [ ] The rollback command has been executed at least once, and the output is pasted into the release note
- [ ] AC-8's failure path (extraction down) does not page anyone — it shows as a metric, not an alert

## Verification
\`\`\`sh
pnpm ci && pnpm deploy:preview
\`\`\`

## Notes / handoff
Alerting fatigue is the real risk. Every alert must have a runbook link in
\`company/playbooks/\`; an alert with no runbook gets deleted, not tuned.`,

  'T-0010': `## Context
This is the founder's task. The agent team prepares the evidence; the human
decides.

## Deliverable
- The pre-ship checklist (\`.agent/checklists/pre-ship.md\`) completed with real evidence, not ticks
- A first customer contact — a real person who agreed to try it
- The launch: pricing page live, terms live, monitoring live, the founder personally clicked through on a real phone
- A rollback decision tree written down before the launch, not during an incident

## Acceptance criteria
- [ ] Every pre-ship line has evidence attached
- [ ] The founder has personally clicked through the whole flow on a real device
- [ ] One customer has used it, and their first question has been answered by the support role

## Verification
\`\`\`sh
node tooling/src/cli.mjs doctor && node tooling/src/cli.mjs board
\`\`\`

## Notes / handoff
If any line of the pre-ship checklist cannot be satisfied, the launch moves.
That is the founder's call and it is the only call that matters here.`,
}

let n = 0
for (const [id, body] of Object.entries(BODIES)) {
  const dir = join(root, 'company', 'tasks')
  const file = Array.from(
    (await import('node:fs')).readdirSync(dir)
  ).find((f) => f.startsWith(id))
  if (!file) {
    console.error(`task file not found for ${id}`)
    continue
  }
  const path = join(dir, file)
  const { data } = parseFrontmatter(read(path))
  write(path, stringifyFrontmatter(data, body))
  n++
}
console.log(`Seeded ${n} task bodies.`)
