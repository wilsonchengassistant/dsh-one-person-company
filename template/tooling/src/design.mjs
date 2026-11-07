// The mockup gate.
//
// A task that writes a UI path has to name its mockup, and that mockup has to be
// a file. This module is the one place that decides what "a UI path" means, so
// the doctor and the cycle cannot disagree about which tasks need a design.

import { join } from 'node:path'
import { exists, read } from './util.mjs'

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
 * The mockup state of one task.
 *
 * @param {object} task - A decorated task.
 * @param {string[] | null} uiGlobs - Globs from design-scope.json.
 * @param {string} root - Project root.
 * @returns {'not-ui' | 'ok' | 'missing-field' | 'missing-file'}
 */
export function mockupState(task, uiGlobs, root) {
  if (uiGlobs === null) return 'not-ui'
  // The designer produces mockups; it is never gated by one.
  if (String(task.owner ?? '') === 'agent:designer') return 'not-ui'
  const writes = Array.isArray(task.writes) ? task.writes : task.writes ? [task.writes] : []
  if (!touchesUi(writes, uiGlobs)) return 'not-ui'
  if (!task.design) return 'missing-field'
  if (!exists(join(root, String(task.design)))) return 'missing-file'
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
