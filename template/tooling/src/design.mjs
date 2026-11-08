// The mockup gate.
//
// A task that writes a UI path has to name its mockup, and that mockup has to be
// a file. This module is the one place that decides what "a UI path" means, so
// the doctor and the cycle cannot disagree about which tasks need a design.

import { join } from 'node:path'
import { exists, read, hashBody } from './util.mjs'

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
 * Does a write scope touch a UI path?
 *
 * Supports the two glob shapes the scope file uses: an exact path, and a
 * trailing `/**` meaning "everything under this directory".
 *
 * @param {string[]} writes - The task's write scopes.
 * @param {string[]} uiGlobs - Globs from design-scope.json.
 * @returns {boolean}
 */
export function touchesUi(writes, uiGlobs) {
  const norm = (p) => String(p).replace(/^\.\//, '').replace(/\/+$/, '')
  return (Array.isArray(writes) ? writes : []).some((write) => {
    const path = norm(write)
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
  const rel = String(file).replace(/^\.?\/?design\//, '')
  const approval = readApprovals(root)[rel]
  if (approval?.approved !== true) return false
  // The approval covers the file it was given, not the path. A mockup edited
  // after approval is a different mockup, and nobody has looked at this one.
  if (approval.mockupHash === undefined) return false
  const absolute = join(root, String(file))
  if (!exists(absolute)) return false
  return approval.mockupHash === hashBody(read(absolute))
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
