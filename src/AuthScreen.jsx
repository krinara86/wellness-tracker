import { useState } from 'react'
import { signIn, signUp } from './supabase.js'

const btn = (v = 'primary') => ({
  width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700,
  cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit',
  border: v === 'outline' ? '1.5px solid #2d5a3d' : 'none',
  background: v === 'outline' ? 'white' : '#2d5a3d',
  color: v === 'outline' ? '#2d5a3d' : 'white',
})
const pg  = { fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f8f6f2' }
const crd = { background: 'white', borderRadius: 14, padding: 20, margin: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }
const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 12 }
const lbl = { fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }
const err = { color: '#e57373', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fdecea', borderRadius: 8 }
const ok  = { color: '#2d5a3d', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#e8f5e0', borderRadius: 8 }
const hero = (p = '48px 24px 36px') => ({ background: '#2d5a3d', padding: p, textAlign: 'center', color: 'white' })

export default function AuthScreen({ onLogin }) {
  const [mode, setMode]     = useState('home')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [pass2, setPass2]   = useState('')
  const [error, setError]   = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy]     = useState(false)

  const reset = (m) => { setMode(m); setError(''); setNotice(''); setEmail(''); setPass(''); setPass2('') }

  const doLogin = async () => {
    if (!email || !pass) return setError('Please enter your email and password')
    setBusy(true); setError('')
    try { const data = await signIn(email.trim(), pass); onLogin(data.user) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const doRegister = async () => {
    if (!email || !pass) return setError('Please fill in all fields')
    if (pass.length < 6) return setError('Password must be at least 6 characters')
    if (pass !== pass2) return setError('Passwords do not match')
    setBusy(true); setError('')
    try { await signUp(email.trim(), pass); reset('login'); setNotice('Account created! Check your email to confirm, then log in.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  if (mode === 'home') return (
    <div style={pg}>
      <div style={hero()}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🌿</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Inner Peace Tracker</div>
        <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
          A private daily tracker for anxiety management and pre-therapy practice.
        </div>
      </div>
      <div style={{ padding: '20px 16px 0' }}>
        <button style={btn()} onClick={() => reset('login')}>Log in</button>
        <button style={btn('outline')} onClick={() => reset('register')}>Create account</button>
        <p style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>Your data is stored securely and privately per account.</p>
      </div>
    </div>
  )

  if (mode === 'login') return (
    <div style={pg}>
      <div style={hero('32px 24px 28px')}><div style={{ fontSize: 22, fontWeight: 700 }}>Welcome back</div></div>
      <div style={crd}>
        {notice && <div style={ok}>{notice}</div>}
        {error  && <div style={err}>{error}</div>}
        <label style={lbl}>Email</label>
        <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoCapitalize="none" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <label style={lbl}>Password</label>
        <input style={inp} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <button style={btn()} onClick={doLogin} disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <button style={btn('outline')} onClick={() => reset('home')}>← Back</button>
        <p style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>No account? <span style={{ color: '#2d5a3d', cursor: 'pointer', fontWeight: 600 }} onClick={() => reset('register')}>Create one</span></p>
      </div>
    </div>
  )

  return (
    <div style={pg}>
      <div style={hero('32px 24px 28px')}><div style={{ fontSize: 22, fontWeight: 700 }}>Create account</div></div>
      <div style={crd}>
        {error && <div style={err}>{error}</div>}
        <label style={lbl}>Email</label>
        <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoCapitalize="none" />
        <label style={lbl}>Password</label>
        <input style={inp} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="At least 6 characters" />
        <label style={lbl}>Confirm password</label>
        <input style={inp} type="password" value={pass2} onChange={e => setPass2(e.target.value)} placeholder="Repeat password" onKeyDown={e => e.key === 'Enter' && doRegister()} />
        <button style={btn()} onClick={doRegister} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <button style={btn('outline')} onClick={() => reset('home')}>← Back</button>
        <p style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>You will receive a confirmation email before you can log in.</p>
      </div>
    </div>
  )
}
