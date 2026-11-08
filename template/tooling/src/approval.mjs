// A human approval is a signature, not a line in a file.
//
// Found in the wild: an agent read design/approvals.json, understood the shape,
// computed the mockup hash itself and wrote `by: "human:founder"`. It was not
// impersonating a person it had ever seen — it just wrote a string into a JSON
// file inside its own repository. That is what a file-based approval is worth.
//
// So an approval now carries an Ed25519 signature made by the DSH host, with a
// private key that lives outside the workspace. The repository holds only the
// public key, so any clone, any CI job and any agent can *verify* an approval but
// none of them can produce one.
//
// This is not a secret-keeping contest. An agent with shell access to the whole
// machine could still go and read the private key — but that is no longer editing
// a file in its own project, it is exfiltrating a key from the user's config
// directory, and the signature makes the honest path the easy one: the panel
// signs, and nobody has to think about it.

import { createPublicKey, verify } from 'node:crypto'
import { join } from 'node:path'
import { exists, read } from './util.mjs'

/** The public key the workspace carries, so approvals can be checked anywhere. */
export const PUBLIC_KEY_FILE = 'design/approval-key.pub'

/**
 * The exact bytes an approval signs.
 *
 * Fixed field order and no whitespace surprises: the same record must produce the
 * same bytes in the panel, in the doctor and in a CI job.
 *
 * @param {object} record - An approval entry.
 * @returns {string}
 */
export function canonicalApproval(record) {
  return JSON.stringify({
    file: String(record.file ?? ''),
    mockupHash: String(record.mockupHash ?? ''),
    specVersion: Number(record.specVersion ?? 0),
    approved: record.approved === true,
    at: String(record.at ?? ''),
    by: String(record.by ?? '')
  })
}

/**
 * Read the workspace's public key.
 *
 * @param {string} root - Project root.
 * @returns {import('node:crypto').KeyObject | null}
 */
export function readPublicKey(root) {
  const path = join(root, PUBLIC_KEY_FILE)
  if (!exists(path)) return null
  try {
    return createPublicKey(read(path))
  } catch {
    return null
  }
}

/**
 * Verify one approval record's signature.
 *
 * @param {string} root - Project root.
 * @param {string} file - The mockup path the record is meant to approve.
 * @param {object} record - The approval entry, including its `sig`.
 * @returns {{ok: boolean, reason: string}}
 */
export function verifyApproval(root, file, record) {
  const key = readPublicKey(root)
  if (key === null) {
    return {
      ok: false,
      reason: `no ${PUBLIC_KEY_FILE} — no approval in this workspace has ever been signed. Approve it in Company board.`
    }
  }
  const signature = typeof record?.sig === 'string' ? record.sig : ''
  if (signature === '') {
    return {
      ok: false,
      reason: 'the approval carries no signature — it was written by hand, not by the panel'
    }
  }
  const message = canonicalApproval({ ...record, file })
  try {
    const ok = verify(null, Buffer.from(message, 'utf8'), key, Buffer.from(signature, 'base64'))
    return ok
      ? { ok: true, reason: '' }
      : { ok: false, reason: 'the approval signature does not verify — the record was edited after it was signed' }
  } catch {
    return { ok: false, reason: 'the approval signature is malformed' }
  }
}
