import { useState } from 'react'
import { signIn, signUp } from './supabase.js'

const S = {
  page: { fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f8f6f2' },
  hero: (p) => ({ background: '#2d5a3d', padding: p || '48px 24px 36px', textAlign: 'center', color: 'white' }),
  card: { background: 'white', borderRadius: 14, padding: 20, margin: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  inp:  { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 12 },
  lbl:  { fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 },
  err:  { color: '#e57373', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fdecea', borderRadius: 8 },
  ok:   { color: '#2d5a3d', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#e8f5e0', borderRadius: 8 },
  note: { color: '#888', fontSize: 12, textAlign: 'center', lineHeight: 1.6, margin: '8px 0 0' },
}

const Btn = ({ children, variant, ...props }) => (
  <button {...props} style={{
    width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700,
    cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit',
    border: variant === 'outline' ? '1.5px solid #2d5a3d' : 'none',
    background: variant === 'outline' ? 'white' : '#2d5a3d',
    color: variant === 'outline' ? '#2d5a3d' : 'white',
    opacity: props.disabled ? 0.6 : 1,
  }}>{children}</button>
)

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
    try {
      const data = await signIn(email.trim(), pass)
      onLogin(data.user)
    } catch (e) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  const doRegister = async () => {
    if (!email || !pass) return setError('Please fill in all fields')
    if (pass.length < 6) return setError('Password must be at least 6 characters')
    if (pass !== pass2) return setError('Passwords do not match')
    setBusy(true); setError('')
    try {
      await signUp(email.trim(), pass)
      reset('login')
      setNotice('Account created! Check your email to confirm, then log in.')
    } catch (e) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  if (mode === 'home') return (
    <div style={S.page}>
      <div style={S.hero()}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🌿</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Inner Peace Tracker</div>
        <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
          A private daily tracker for anxiety management and pre-therapy practice.
        </div>
      </div>
      <div style={{ padding: '20px 16px 0' }}>
        <Btn onClick={() => reset('login')}>Log in</Btn>
        <Btn variant="outline" onClick={() => reset('register')}>Create account</Btn>
        <p style={S.note}>Your data is stored securely and privately per account.</p>
      </div>
      <div style={{ ...S.card, background: '#f1f8f4', border: '1px solid #c8e6c9' }}>
        <div style={{ fontWeight: 600, color: '#2d5a3d', marginBottom: 6, fontSize: 14 }}>What is this?</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
          Practise anxiety management techniques — grey rock, ACT defusion, rumination
          interrupts — and track your mood and progress before starting therapy.
        </div>
      </div>
    </div>
  )

  if (mode === 'login') return (
    <div style={S.page}>
      <div style={S.hero('32px 24px 28px')}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Welcome back</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Log in to your tracker</div>
      </div>
      <div style={S.card}>
        {notice && <div style={S.ok}>{notice}</div>}
        {error  && <div style={S.err}>{error}</div>}
        <label style={S.lbl}>Email</label>
        <input style={S.inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" autoCapitalize="none"
          onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <label style={S.lbl}>Password</label>
        <input style={S.inp} type="password" value={pass} onChange={e => setPass(e.target.value)}
          placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <Btn onClick={doLogin} disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Btn>
        <Btn variant="outline" onClick={() => reset('home')}>← Back</Btn>
        <p style={S.note}>No account?{' '}
          <span style={{ color: '#2d5a3d', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => reset('register')}>Create one</span>
        </p>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={S.hero('32px 24px 28px')}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Create account</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Free, private, yours</div>
      </div>
      <div style={S.card}>
        {error && <div style={S.err}>{error}</div>}
        <label style={S.lbl}>Email</label>
        <input style={S.inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" autoCapitalize="none" />
        <label style={S.lbl}>Password</label>
        <input style={S.inp} type="password" value={pass} onChange={e => setPass(e.target.value)}
          placeholder="At least 6 characters" />
        <label style={S.lbl}>Confirm password</label>
        <input style={S.inp} type="password" value={pass2} onChange={e => setPass2(e.target.value)}
          placeholder="Repeat password" onKeyDown={e => e.key === 'Enter' && doRegister()} />
        <Btn onClick={doRegister} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Btn>
        <Btn variant="outline" onClick={() => reset('home')}>← Back</Btn>
        <p style={S.note}>You will receive a confirmation email before you can log in.</p>
      </div>
    </div>
  )
}
