// GitHub token is injected at build time from the VITE_GITHUB_TOKEN secret.
// It is scoped only to Contents: Read+Write on this one repo.
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN
const OWNER = import.meta.env.VITE_GITHUB_OWNER
const REPO  = import.meta.env.VITE_GITHUB_REPO

const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`

async function ghFetch(path, options = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    ...options,
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  return res
}

async function getFile(path) {
  const res = await ghFetch(path)
  if (res.status === 404) return { content: null, sha: null }
  if (!res.ok) throw new Error(`GitHub API error ${res.status} on ${path}`)
  const file = await res.json()
  const content = JSON.parse(atob(file.content.replace(/\n/g, '')))
  return { content, sha: file.sha }
}

async function putFile(path, data, sha, message) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))
  const body = { message, content: encoded, ...(sha ? { sha } : {}) }
  const res = await ghFetch(path, { method: 'PUT', body: JSON.stringify(body) })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `Failed to write ${path}`)
  }
  const result = await res.json()
  return result.content.sha
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function loadUsers() {
  const { content, sha } = await getFile('data/users.json')
  return { users: content || {}, sha }
}

export async function saveUsers(users, sha) {
  return putFile('data/users.json', users, sha, 'Update users')
}

// ── Entries ───────────────────────────────────────────────────────────────────

export function entriesPath(username) {
  return `data/entries-${username}.json`
}

export async function loadEntries(username) {
  const { content, sha } = await getFile(entriesPath(username))
  return { entries: content || [], sha }
}

export async function saveEntries(username, entries, sha) {
  const date = new Date().toISOString().split('T')[0]
  return putFile(entriesPath(username), entries, sha, `Update entries ${date}`)
}

export function isConfigured() {
  return !!(TOKEN && OWNER && REPO)
}
