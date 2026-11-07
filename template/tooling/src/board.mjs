// The board: read every task file, resolve dependencies, decide what is
// actually runnable right now. This is the piece that replaces "a PM moving
// cards around" — in a one-person company the PM is an agent, and an agent
// needs a *derived* view, not a hand-maintained status field.

import { join } from 'node:path'
import { read, listFiles, parseFrontmatter, exists } from './util.mjs'

export const STATUSES = ['backlog', 'ready', 'in_progress', 'review', 'done', 'blocked', 'dropped']
export const TERMINAL = ['done', 'dropped']

export function loadTasks(root) {
  const dir = join(root, 'company', 'tasks')
  return listFiles(dir, '.md')
    .filter((file) => /^T-\d+/.test(file))
    .map((file) => {
      const path = join(dir, file)
      const { data } = parseFrontmatter(read(path))
      return {
        ...data,
        id: data.id || file.replace(/\.md$/, ''),
        status: data.status || 'backlog',
        priority: data.priority || 'P2',
        file,
        path,
      }
    })
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
}

/**
 * Resolve everything the board and the doctor need to reason about a task:
 * dependencies, the spec's real status, and whether the spec file exists.
 */
export function decorate(tasks, root) {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  for (const t of tasks) {
    const deps = Array.isArray(t.depends_on) ? t.depends_on : t.depends_on ? [t.depends_on] : []
    t.deps = deps
    t.missingDeps = deps.filter((d) => !byId.has(d))
    t.unmetDeps = deps.filter((d) => byId.get(d) && !TERMINAL.includes(byId.get(d).status))
    t.blockedByHuman = t.status === 'blocked' || /^human:/.test(String(t.owner || ''))
    t.unknownStatus = !STATUSES.includes(t.status)

    // The spec is the contract. Resolve it for real: a task whose spec is
    // missing, or whose spec is still a draft, is not ready to start.
    t.specPath = t.spec ? join(root, t.spec) : null
    t.specExists = Boolean(t.specPath && exists(t.specPath))
    t.specStatus = null
    if (t.specExists) {
      const { data } = parseFrontmatter(read(t.specPath))
      t.specStatus = data.status || 'unknown'
    }
    t.specApproved = t.specExists && t.specStatus === 'approved'
    t.specMissing = Boolean(t.spec) && !t.specExists
  }
  return tasks
}

/**
 * A task is startable when it is decomposed (status ready or backlog), its
 * dependencies are done, its spec exists, and that spec is APPROVED. The
 * board's own rule 1 and rule 2 are enforced here rather than in prose.
 */
export function readyTasks(tasks) {
  return tasks.filter(
    (t) =>
      (t.status === 'ready' || t.status === 'backlog') &&
      t.unmetDeps.length === 0 &&
      t.missingDeps.length === 0 &&
      t.specApproved
  )
}

/** Find dependency cycles so the doctor can name them. */
export function findCycles(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const cycles = []
  const state = new Map()
  const path = []
  const walk = (id) => {
    if (state.get(id) === 'done') return
    if (state.get(id) === 'open') {
      const start = path.indexOf(id)
      if (start !== -1) cycles.push(path.slice(start).concat(id))
      return
    }
    state.set(id, 'open')
    path.push(id)
    for (const d of byId.get(id)?.deps || []) {
      if (byId.has(d)) walk(d)
    }
    path.pop()
    state.set(id, 'done')
  }
  for (const t of tasks) walk(t.id)
  return cycles
}

export function renderBoard(tasks, { ready = false } = {}) {
  const rows = ready ? readyTasks(tasks) : tasks
  if (!rows.length) return ready ? 'No task is ready to start.' : 'Board is empty.'
  const cols = ['ID', 'STATUS', 'P', 'OWNER', 'TITLE', 'SPEC', 'DEPS']
  const body = rows.map((t) => [
    t.id,
    t.status,
    t.priority,
    t.owner || '-',
    truncate(t.title || '', 46),
    t.spec ? basename(t.spec) : '-',
    (t.deps || []).join(' ') || '-',
  ])
  const widths = cols.map((c, i) => Math.max(c.length, ...body.map((r) => String(r[i]).length)))
  const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join('  ')
  const out = [line(cols), line(widths.map((w) => '-'.repeat(w)))]
  for (const r of body) out.push(line(r))
  return out.join('\n')
}

export function boardSummary(tasks) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  for (const t of tasks) counts[t.status] = (counts[t.status] || 0) + 1
  const ready = readyTasks(tasks).length
  const stuck = tasks.filter((t) => t.status === 'in_progress').map((t) => t.id)
  const blocked = tasks.filter((t) => t.status === 'blocked').map((t) => t.id)
  return { counts, ready, stuck, blocked, total: tasks.length }
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function basename(p) {
  return String(p).split('/').pop()
}
