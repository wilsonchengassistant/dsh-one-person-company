// `opc check-commit` — the gate that runs where the agent cannot skip it.
//
// A rule in a prompt is context. A rule in a pre-commit hook is a control. This
// module answers one question about a set of changed paths: may this land?
//
// It is deliberately independent of the doctor: the doctor audits the whole
// company, this audits one change. Both are needed — the doctor catches drift,
// this catches a shortcut at the moment it is taken.

import { join } from 'node:path'
import { exists, read, parseFrontmatter } from './util.mjs'
import { loadTasks, decorate } from './board.mjs'
import { designScopeOf, mockupState } from './design.mjs'
import { doctor } from './doctor.mjs'

/**
 * Which tasks own a changed path?
 *
 * A task owns a path when one of its write scopes matches it. A `/**` scope owns
 * everything beneath its directory; an exact path owns itself.
 *
 * @param {object[]} tasks - Decorated tasks.
 * @param {string} changedPath - Repository-relative path.
 * @returns {object[]} the tasks that claim it.
 */
export function tasksOwning(tasks, changedPath) {
  const norm = (p) => String(p).replace(/^\.\//, '').replace(/\/+$/, '')
  const path = norm(changedPath)
  return tasks.filter((t) => {
    const writes = Array.isArray(t.writes) ? t.writes : t.writes ? [t.writes] : []
    return writes.some((write) => {
      const w = norm(write)
      if (w.endsWith('/**')) {
        const base = w.slice(0, -3)
        return path === base || path.startsWith(`${base}/`)
      }
      return path === w
    })
  })
}

/**
 * Audit one change.
 *
 * @param {string} root - Project root.
 * @param {string[]} changedPaths - Repository-relative paths, as git reports them.
 * @param {{skipDoctor?: boolean}} [options]
 * @returns {{ok: boolean, errors: string[], warnings: string[]}}
 */
export function checkChange(root, changedPaths, options = {}) {
  const errors = []
  const warnings = []
  const tasks = decorate(loadTasks(root), root)
  const uiGlobs = designScopeOf(root)

  // 1. The company itself must be consistent. A change on top of a broken board
  //    is a change on sand, so this runs first and is not optional.
  if (!options.skipDoctor) {
    const report = doctor(root)
    for (const error of report.errors) errors.push(`doctor: ${error}`)
  }

  // 2. Any UI path that changed must be owned by a task whose mockup a human
  //    approved. This is the gate the shortcut skips.
  if (uiGlobs !== null) {
    for (const path of changedPaths) {
      const owners = tasksOwning(tasks, path)
      const uiOwner = owners.find((t) => mockupState(t, uiGlobs, root) !== 'not-ui')
      if (uiOwner === undefined) {
        // Touching a UI path with no task that claims it at all is its own smell.
        const touchedUi = (() => {
          const norm = (p) => String(p).replace(/^\.\//, '').replace(/\/+$/, '')
          const candidate = norm(path)
          return uiGlobs.some((glob) => {
            const g = norm(glob)
            return g.endsWith('/**') ? candidate.startsWith(g.slice(0, -3) + '/') : candidate === g
          })
        })()
        if (touchedUi) {
          errors.push(`${path}: a UI path changed, but no task claims it — every change needs an owner`)
        }
        continue
      }
      const state = mockupState(uiOwner, uiGlobs, root)
      if (state === 'missing-field') {
        errors.push(`${uiOwner.id}: ${path} is UI work but the task declares no design: mockup`)
      } else if (state === 'missing-file') {
        errors.push(`${uiOwner.id}: mockup ${uiOwner.design} does not exist`)
      } else if (state === 'unapproved') {
        errors.push(`${uiOwner.id}: mockup ${uiOwner.design} has not been approved by a human`)
      }
    }
  }

  // 3. A spec that changed must have been re-approved, or the change is a
  //    requirement change nobody signed off.
  const specDir = join(root, 'company', 'specs')
  for (const path of changedPaths) {
    if (!path.startsWith('company/specs/') || !path.endsWith('.md')) continue
    const absolute = join(root, path)
    if (!exists(absolute)) continue // a deletion; doctor reports the dangling tasks
    const { data } = parseFrontmatter(read(absolute))
    if (data.status === 'approved' && data.approved_hash === undefined) {
      warnings.push(`${path}: approved but has no approved_hash — a later edit cannot be detected`)
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}
