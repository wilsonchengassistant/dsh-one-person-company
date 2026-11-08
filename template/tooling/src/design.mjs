// The mockup gate.
//
// A task that writes a UI path has to name its mockup, and that mockup has to be
// a file. This module is the one place that decides what "a UI path" means, so
// the doctor and the cycle cannot disagree about which tasks need a design.

import { join } from 'node:path'
import { exists, read, hashBody } from './util.mjs'
import { verifyApproval } from './approval.mjs'

/**
 * The globs whose tasks need a mockup, from `company/design-scope.json`.
 *
 * @param {string} root - Project root.
 * @returns {string[] | null} the globs, or null when the file is missing or unreadable.
 */
export function designScopeOf(root) {
  const path = join(root, 'company', 'design-scope.json')
  if (!exists(path)) return null
  try {
    const parsed = JSON.parse(read(path))
    return Array.isArray(parsed.ui) ? parsed.ui : []
  } catch {
    return null
  }
}

/**
 * Path segments that mean "this is a user interface".
 *
 * The configured globs alone are not enough: a project that puts its frontend in
 * `apps/frontend/` silently fell outside a scope that listed `apps/web/`, and the
 * whole mockup gate stopped applying without anyone noticing. Choosing a
 * different directory name must not be a way to skip the gate, so this vocabulary
 * is checked in addition to the configured globs.
 *
 * A false positive is cheap — write `design: none` on the task. A false negative
 * is a screen nobody drew being built by an engineer.
 */
const UI_SEGMENTS = new Set([
  'web',
  'frontend',
  'front-end',
  'front',
  'ui',
  'client',
  'mobile',
  'ios',
  'android',
  'app',
  'apps-www',
  'www',
  'site',
  'screens',
  'components'
])

/**
 * Does a write scope touch a UI path?
 *
 * Supports the two glob shapes the scope file uses: an exact path, and a
 * trailing `/**` meaning "everything under this directory". A path whose segments
 * contain a UI word also counts, whatever the configured globs say.
 *
 * @param {string[]} writes - The task's write scopes.
 * @param {string[]} uiGlobs - Globs from design-scope.json.
 * @returns {boolean}
 */
export function touchesUi(writes, uiGlobs) {
  const norm = (p) => String(p).replace(/^\.\//, '').replace(/\/+$/, '')
  const isDesignOutput = (path) => path === 'design' || path.startsWith('design/')
  const looksUi = (path) =>
    !isDesignOutput(path) &&
    path
      .split('/')
      .map((segment) => segment.replace(/\.\w+$/, '').toLowerCase())
      .some((segment) => UI_SEGMENTS.has(segment))
  return (Array.isArray(writes) ? writes : []).some((write) => {
    const path = norm(write)
    if (looksUi(path)) return true
    return uiGlobs.some((glob) => {
      const g = norm(glob)
      if (g.endsWith('/**')) {
        const base = g.slice(0, -3)
        return path === base || path.startsWith(`${base}/`)
      }
      return path === g
    })
  })
}

/**
 * The approval record for one mockup, keyed by its path inside `design/`.
 *
 * @param {string} root - Project root.
 * @returns {Record<string, {approved?: boolean, at?: string, by?: string, note?: string}>}
 */
export function readApprovals(root) {
  const path = join(root, 'design', 'approvals.json')
  if (!exists(path)) return {}
  try {
    const parsed = JSON.parse(read(path))
    if (parsed === null || typeof parsed !== 'object') return {}
    const out = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (key.startsWith('//')) continue
      if (value !== null && typeof value === 'object') out[key] = value
    }
    return out
  } catch {
    return {}
  }
}

/**
 * The recorded approval for one mockup, or null.
 *
 * @param {string} root - Project root.
 * @param {string} file - Path such as `design/screens/capture.html`.
 * @returns {{approved?: boolean, at?: string, by?: string, note?: string, specVersion?: number} | null}
 */
export function approvalOf(root, file) {
  const rel = String(file).replace(/^\.?\/?design\//, '')
  return readApprovals(root)[rel] ?? null
}

/**
 * Is this mockup approved by a human?
 *
 * @param {string} root - Project root.
 * @param {string} file - Path such as `design/screens/capture.html`.
 * @returns {boolean}
 */
export function isApproved(root, file) {
  const state = approvalState(root, file)
  return state.ok
}

/**
 * Why an approval does or does not hold.
 *
 * Three separate things have to be true, and they fail differently: the record
 * must be signed by the panel, it must cover the mockup's current bytes, and the
 * mockup must still exist.
 *
 * @param {string} root - Project root.
 * @param {string} file - Path such as `design/screens/capture.html`.
 * @returns {{ok: boolean, reason: 'unsigned' | 'forged' | 'stale' | 'missing' | '' , detail: string}}
 */
export function approvalState(root, file) {
  const rel = String(file).replace(/^\.?\/?design\//, '')
  const approval = readApprovals(root)[rel]
  if (approval?.approved !== true) {
    return { ok: false, reason: 'unsigned', detail: 'no approval has been recorded' }
  }
  // The signature is the authority. Without it, the record is a claim by whoever
  // wrote the file — which, in a repository agents work in, is not evidence.
  // An approval without the conversation it came from is an assertion, not
  // evidence — and the panel has nowhere to show it back to the human.
  if (String(approval.via ?? '') !== 'ask_user') {
    return {
      ok: false,
      reason: 'forged',
      detail: 'the approval does not record the question it answered — approvals come from ask_user'
    }
  }
  if (!String(approval.question ?? '').trim() || !String(approval.answer ?? '').trim()) {
    return { ok: false, reason: 'forged', detail: 'the approval records no question or no answer' }
  }
  const verified = verifyApproval(root, rel, approval)
  if (!verified.ok) {
    return { ok: false, reason: 'forged', detail: verified.reason }
  }
  const absolute = join(root, String(file))
  if (!exists(absolute)) {
    return { ok: false, reason: 'missing', detail: 'the mockup file does not exist' }
  }
  if (approval.mockupHash !== hashBody(read(absolute))) {
    return { ok: false, reason: 'stale', detail: 'the mockup changed after it was approved' }
  }
  return { ok: true, reason: '', detail: '' }
}

/**
 * The mockup state of one task.
 *
 * @param {object} task - A decorated task.
 * @param {string[] | null} uiGlobs - Globs from design-scope.json.
 * @param {string} root - Project root.
 * @returns {'not-ui' | 'ok' | 'missing-field' | 'missing-file' | 'unapproved'}
 */
export function mockupState(task, uiGlobs, root) {
  if (uiGlobs === null) return 'not-ui'
  // The designer produces mockups; it is never gated by one.
  if (String(task.owner ?? '') === 'agent:designer') return 'not-ui'
  const writes = Array.isArray(task.writes) ? task.writes : task.writes ? [task.writes] : []
  if (!touchesUi(writes, uiGlobs)) return 'not-ui'
  if (!task.design) return 'missing-field'
  // `design: none` is a deliberate declaration that this task has no screen. It
  // is cheap, and it is reviewed: a reviewer can see the claim.
  if (String(task.design).trim().toLowerCase() === 'none') return 'ok'
  if (!exists(join(root, String(task.design)))) return 'missing-file'
  // A mockup nobody approved is a mockup nobody looked at; the engineer waits.
  if (!isApproved(root, task.design)) return 'unapproved'
  return 'ok'
}

/**
 * Tasks an engineer must not start yet: they touch UI and have no usable mockup.
 *
 * @param {object[]} tasks - Decorated tasks.
 * @param {string[] | null} uiGlobs - Globs from design-scope.json.
 * @param {string} root - Project root.
 * @returns {object[]}
 */
export function awaitingDesign(tasks, uiGlobs, root) {
  return tasks.filter(
    (t) =>
      (t.status === 'ready' || t.status === 'backlog' || t.status === 'in_progress') &&
      mockupState(t, uiGlobs, root) !== 'ok' &&
      mockupState(t, uiGlobs, root) !== 'not-ui'
  )
}
