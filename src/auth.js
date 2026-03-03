// Uses the browser's built-in Web Crypto API — no dependencies needed

export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateSalt() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password, salt) {
  return sha256(salt + password)
}

export async function verifyPassword(password, salt, storedHash) {
  const hash = await hashPassword(password, salt)
  return hash === storedHash
}

// Session: stored in sessionStorage (cleared when browser tab closes)
const SESSION_KEY = 'wt_session'

export function setSession(username) {
  sessionStorage.setItem(SESSION_KEY, username)
}

export function getSession() {
  return sessionStorage.getItem(SESSION_KEY)
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}
