// An approval is a recorded conversation, not a signature.
//
// History, because it explains the shape:
//
// 0.11.0 made an approval an Ed25519 signature: `opc approve` signed the record
// with a key in `~/.dsh/one-person-company/`, and the repository carried only the
// public key. 0.14.0 moved the decision into the chat (`ask_user_question`, then
// `opc approve`) but kept the signature.
//
// 0.15.0 removes it. Measured: an agent with shell access to the same repo can
// generate its own key pair, overwrite `design/approval-key.pub`, and sign
// `approved: true` itself — the doctor then reports zero errors. A signature
// that the agent it is supposed to stop can mint is worse than no signature,
// because it claims a guarantee that does not exist and teaches the agent that
// the gate is a formality.
//
// What is left is the honest mechanism, and it is instruction-sized:
//
//   1. the agent asks with `ask_user_question`;
//   2. the agent records the answer with `opc approve`;
//   3. the record holds the question and the answer, and Company board shows
//      them back to the human.
//
// `opc doctor` still checks that a record has both halves, because a record
// without a conversation is not evidence of one. But nothing here proves the
// human answered: the human reading the question back is the check. That is a
// step you can actually do, unlike verifying a signature the agent can forge.

/** The only provenance a usable record may claim: the answer came from ask_user. */
export const APPROVAL_VIA = 'ask_user'

/**
 * Why a record is not a usable approval, or null when it is one.
 *
 * 'unsigned'  — there is no record for this mockup.
 * 'rejected'  — the human asked for changes; the record is valid but negative.
 * 'unrecorded' — a record exists but does not hold a question AND an answer.
 *
 * Whether the mockup still matches the hash is decided by the caller, because
 * it needs the mockup file; see `approvalState` in design.mjs.
 *
 * @param {object | null | undefined} record - One entry from design/approvals.json.
 * @returns {{reason: 'unsigned' | 'rejected' | 'unrecorded', detail: string} | null}
 */
export function approvalProblem(record) {
  if (record === null || record === undefined || typeof record !== 'object') {
    return { reason: 'unsigned', detail: 'no approval has been recorded' }
  }
  if (record.approved === false) {
    return {
      reason: 'rejected',
      detail: 'the human asked for changes — rebuild the mockup, or amend the spec if the requirement itself changed'
    }
  }
  if (record.approved !== true) {
    return { reason: 'unsigned', detail: 'no approval has been recorded' }
  }
  if (String(record.via ?? '') !== APPROVAL_VIA) {
    return {
      reason: 'unrecorded',
      detail: 'the approval does not record the question it answered — approvals come from ask_user'
    }
  }
  if (!String(record.question ?? '').trim() || !String(record.answer ?? '').trim()) {
    return {
      reason: 'unrecorded',
      detail: 'the approval records no question or no answer — the human can see they were never asked'
    }
  }
  return null
}

/**
 * The part of a record Company board shows back to the human: what was asked and
 * what they answered. Nothing else about the record is worth displaying.
 *
 * @param {object | null} record - One entry from design/approvals.json.
 * @returns {{via: string, question: string, answer: string, at: string} | null}
 */
export function conversationOf(record) {
  if (record === null || record === undefined || typeof record !== 'object') return null
  return {
    via: String(record.via ?? ''),
    question: String(record.question ?? ''),
    answer: String(record.answer ?? ''),
    at: String(record.at ?? '')
  }
}
