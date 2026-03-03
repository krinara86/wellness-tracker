import { useState } from 'react'
import { hashPassword, generateSalt, verifyPassword, setSession } from './auth.js'
import { loadUsers, saveUsers } from './github.js'

const S = {
  page:  { fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f8f6f2' },
  hero:  { background: '#2d5a3d', padding: '48px 24px 36px', textAlign: 'center', color: 'white' },
  card:  { background: 'white', borderRadius: 14, padding: 20, margin: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  input: { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 12 },
  btn:   (variant = 'primary') => ({
    width: '100%', padding: 14, borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    background: variant === 'primary' ? '#2d5a3d' : 'white',
    color:      variant === 'primary' ? 'white' : '#2d5a3d',
    border:     variant === 'primary' ? 'none' : '1.5px solid #2d5a3d',
    marginBottom: 10,
  }),
  err:   { color: '#e57373', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fdecea', borderRadius: 8 },
  note:  { color: '#888', fontSize: 12, textAlign: 'center', lineHeight: 1.6 },
}

export default function AuthScreen({ onLogin }) {
  const [mode, setMode]       = useState('home')   // home | login | register
  const [username, setUser]   = useState('')
  const [password, setPass]   = useState('')
  const [password2, setPass2] = useState('')
  const [error, setError]     = useState('')
  const [busy, setBusy]       = useState(false)

  const reset = (m) => { setMode(m); setError(''); setUser(''); setPass(''); setPass2('') }

  const doLogin = async () => {
    if (!username.trim() || !password) return setError('Please enter username and password')
    setBusy(true); setError('')
    try {
      const { users } = await loadUsers()
      const user = users[username.toLowerCase().trim()]
      if (!user) return setError('Username not found')
      const ok = await verifyPassword(password, user.salt, user.passwordHash)
      if (!ok) return setError('Incorrect password')
      setSession(username.toLowerCase().trim())
      onLogin(username.toLowerCase().trim())
    } catch (e) {
      setError('Could not connect to GitHub: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  const doRegister = async () => {
    const u = username.toLowerCase().trim()
    if (!u || !password) return setError('Please fill in all fields')
    if (!/^[a-z0-9_-]{3,20}$/.test(u)) return setError('Username: 3–20 characters, letters/numbers/hyphens only')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== password2) return setError('Passwords do not match')
    setBusy(true); setError('')
    try {
      const { users, sha } = await loadUsers()
      if (users[u]) return setError('Username already taken')
      const salt         = generateSalt()
      const passwordHash = await hashPassword(password, salt)
      users[u]           = { salt, passwordHash, createdAt: new Date().toISOString() }
      await saveUsers(users, sha)
      setSession(u)
      onLogin(u)
    } catch (e) {
      setError('Registration failed: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  // ── Home ─────────────────────────────────────────────────────────────────────
  if (mode === 'home') return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🌿</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Inner Peace Tracker</div>
        <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
          A private daily tracker for anxiety management and pre-therapy practice.
          Your data lives securely in your own account.
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: 20 }}>
        <button style={S.btn('primary')} onClick={() => reset('login')}>
          Log in
        </button>
        <button style={S.btn('outline')} onClick={() => reset('register')}>
          Create account
        </button>
        <div style={S.note}>
          All data is stored privately per user.<br />
          Passwords are hashed before saving — never stored in plain text.
        </div>
      </div>

      <div style={{ ...S.card, marginTop: 20, background: '#f1f8f4', border: '1px solid #c8e6c9' }}>
        <div style={{ fontWeight: 600, color: '#2d5a3d', marginBottom: 6, fontSize: 14 }}>What is this?</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
          A tool to practice anxiety management techniques — grey rock, ACT defusion,
          rumination interrupts — before starting therapy.
          Track your mood, log what worked, and build up real data to bring to your first session.
        </div>
      </div>
    </div>
  )

  // ── Login ─────────────────────────────────────────────────────────────────────
  if (mode === 'login') return (
    <div style={S.page}>
      <div style={{ ...S.hero, padding: '32px 24px 28px' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Welcome back</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Log in to your tracker</div>
      </div>
      <div style={S.card}>
        {error && <div style={S.err}>{error}</div>}
        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Username</label>
        <input style={S.input} value={username} onChange={e => setUser(e.target.value)}
          placeholder="your-username" autoCapitalize="none" autoCorrect="off"
          onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Password</label>
        <input style={S.input} type="password" value={password} onChange={e => setPass(e.target.value)}
          placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <button style={S.btn('primary')} onClick={doLogin} disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
        </button>
        <button style={S.btn('outline')} onClick={() => reset('home')}>← Back</button>
        <div style={S.note}>
          Don't have an account?{' '}
          <span style={{ color: '#2d5a3d', cursor: 'pointer', fontWeight: 600 }} onClick={() => reset('register')}>
            Create one
          </span>
        </div>
      </div>
    </div>
  )

  // ── Register ──────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={{ ...S.hero, padding: '32px 24px 28px' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Create account</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Your data belongs to you</div>
      </div>
      <div style={S.card}>
        {error && <div style={S.err}>{error}</div>}
        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Username</label>
        <input style={S.input} value={username} onChange={e => setUser(e.target.value)}
          placeholder="e.g. rohan" autoCapitalize="none" autoCorrect="off" />
        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Password</label>
        <input style={S.input} type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="At least 6 characters" />
        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Confirm password</label>
        <input style={S.input} type="password" value={password2} onChange={e => setPass2(e.target.value)}
          placeholder="Repeat password" onKeyDown={e => e.key === 'Enter' && doRegister()} />
        <button style={S.btn('primary')} onClick={doRegister} disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
        </button>
        <button style={S.btn('outline')} onClick={() => reset('home')}>← Back</button>
        <div style={S.note}>
          Passwords are hashed with SHA-256 + salt in your browser.<br />
          Plain text passwords are never stored or transmitted.
        </div>
      </div>
    </div>
  )
}
