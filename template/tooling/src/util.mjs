// Shared helpers for the `opc` CLI. No dependencies on purpose: this tool must
// run anywhere the company repo is cloned, including CI and a laptop with no
// node_modules.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'

export function repoRoot(start = process.cwd()) {
  let dir = resolve(start)
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(dir, 'company')) && existsSync(join(dir, '.agent'))) return dir
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return resolve(start)
}

export function read(path) {
  return readFileSync(path, 'utf8')
}

export function write(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
}

export function exists(path) {
  return existsSync(path)
}

export function listFiles(dir, ext) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => !f.startsWith('.') && (!ext || f.endsWith(ext)))
    .sort()
}

/**
 * Minimal YAML front-matter reader. Deliberately supports only the subset the
 * company OS uses: scalars, inline arrays `[a, b]`, and block arrays of
 * scalars. Anything fancier belongs in a JSON file.
 *
 * Two rules learned the hard way:
 *  1. A key with no value is an EMPTY STRING, not an empty list. `owner:` must
 *     be falsy, otherwise a task with no owner looks like it has one.
 *  2. A value that is nothing but a comment (`owner: # agent:<role>`) is also
 *     empty. The comment is documentation for the human, not a value.
 */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!m) return { data: {}, body: text }
  const data = {}
  const lines = m[1].split(/\r?\n/)
  let currentKey = null
  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue
    const listItem = /^\s*-\s+(.*)$/.exec(raw)
    if (listItem && currentKey !== null) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = []
      data[currentKey].push(stripQuotes(stripInlineComment(listItem[1].trim())))
      continue
    }
    const kv = /^([A-Za-z0-9_.-]+):[ \t]*(.*)$/.exec(raw)
    if (!kv) continue
    const [, key, restRaw] = kv
    const rest = stripInlineComment(restRaw.trim())
    currentKey = key
    if (rest === '') {
      // No value on this line. It may be the head of a block list, or it may
      // be an empty value. Decide when the next line arrives.
      data[key] = ''
      continue
    }
    if (rest.startsWith('[') && rest.endsWith(']')) {
      data[key] = rest
        .slice(1, -1)
        .split(',')
        .map((s) => stripQuotes(s.trim()))
        .filter(Boolean)
      continue
    }
    data[key] = stripQuotes(rest)
  }
  return { data, body: text.slice(m[0].length) }
}

function stripQuotes(v) {
  if (/^".*"$/.test(v) || /^'.*'$/.test(v)) return v.slice(1, -1)
  return v
}

/**
 * YAML inline comment: a `#` preceded by whitespace starts a comment. A `#`
 * inside a quoted string does not. A value that is *only* a comment is empty.
 * This is why `status: ready # backlog | ready | ...` parses to `ready` and
 * why `owner: # agent:<role> or human:<name>` parses to nothing.
 */
export function stripInlineComment(v) {
  const trimmed = String(v).trim()
  if (trimmed.startsWith('#')) return ''
  const m = /\s#/.exec(trimmed)
  if (!m) return trimmed
  return trimmed.slice(0, m.index)
}

export function stringifyFrontmatter(data, body) {
  const lines = ['---']
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.join(', ')}]`)
    } else {
      lines.push(`${k}: ${v}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n') + body.replace(/^\n+/, '')
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function nextTaskId(tasks) {
  const nums = tasks
    .map((t) => /^T-(\d+)$/.exec(t.id || '') && Number(/^T-(\d+)$/.exec(t.id)[1]))
    .filter(Boolean)
  const max = nums.length ? Math.max(...nums) : 0
  return `T-${String(max + 1).padStart(4, '0')}`
}

/**
 * A stable hash of a document body, used to prove a spec has not changed since a
 * human approved it. Front matter is excluded so re-approving does not change the
 * hash, and trailing whitespace is normalised so an editor's newline does not
 * invalidate an approval.
 *
 * @param {string} body - The document without its front matter.
 * @returns {string} the first 16 hex characters of the sha256.
 */
export function hashBody(body) {
  const normalised = String(body)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trim()
  return createHash('sha256').update(normalised).digest('hex').slice(0, 16)
}
