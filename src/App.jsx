import { useState, useEffect } from 'react'
import { supabase, signOut, loadEntries, upsertEntry } from './supabase.js'
import AuthScreen from './AuthScreen.jsx'

const TECHNIQUES = [
  { id: 'grey_rock',  emoji: '🪨', label: 'Grey Rock',           desc: 'Stayed neutral / redirected in a conversation' },
  { id: 'rumination', emoji: '🛑', label: 'Rumination Interrupt', desc: 'Caught & stopped an imaginary argument loop' },
  { id: 'defusion',   emoji: '🌫️', label: 'ACT Defusion',         desc: 'Labelled a thought instead of engaging with it' },
  { id: 'values',     emoji: '⚓', label: 'Values Anchor',        desc: 'Reconnected with what actually matters to me' },
  { id: 'news_diet',  emoji: '📵', label: 'News Diet',            desc: 'Kept news to my 20-minute window' },
]

const MOODS       = ['😰', '😟', '😐', '🙂', '😌']
const MOOD_LABELS = ['Very anxious', 'Anxious', 'Neutral', 'Calm', 'At peace']
const MOOD_COLORS = ['#e57373', '#ffb74d', '#fff176', '#aed581', '#81c784']

const todayStr = () => new Date().toISOString().split('T')[0]
const fmtDate  = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

const S = {
  page:    { fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto', padding: '16px 16px 40px', background: '#f8f6f2', minHeight: '100vh' },
  card:    { background: 'white', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  hdr:     { background: '#2d5a3d', borderRadius: 16, padding: 20, marginBottom: 16, color: 'white' },
  navbtn:  (on) => ({ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? '#2d5a3d' : 'white', color: on ? 'white' : '#555', fontWeight: on ? 700 : 400, fontSize: 13, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }),
  primary: { background: '#2d5a3d', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit' },
  inp:     { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  lbl:     { fontWeight: 600, marginBottom: 8, display: 'block', color: '#333', fontSize: 15 },
  techrow: (on) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 8, borderRadius: 10, cursor: 'pointer', background: on ? '#e8f5e0' : '#f8f8f8', border: `1.5px solid ${on ? '#2d5a3d' : 'transparent'}` }),
}

export default function App() {
  const [user, setUser]       = useState(null)
  const [booting, setBooting] = useState(true)
  const [entries, setEntries] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [view, setView]       = useState('log')
  const [mood, setMood]       = useState(2)
  const [checked, setChecked] = useState({})
  const [note, setNote]       = useState('')
  const [trigger, setTrigger] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setBooting(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    loadEntries()
      .then(data => {
        setEntries(data)
        const te = data.find(e => e.date === todayStr())
        if (te) {
          setMood(te.mood ?? 2)
          setChecked(te.techniques ?? {})
          setNote(te.note ?? '')
          setTrigger(te.trigger ?? '')
        }
      })
      .catch(e => setSyncMsg('Load failed: ' + e.message))
  }, [user])

  const save = async () => {
    setSyncing(true); setSyncMsg('')
    try {
      await upsertEntry({
        date: todayStr(), mood, techniques: checked,
        note, trigger, saved_at: new Date().toISOString(),
      })
      const fresh = await loadEntries()
      setEntries(fresh)
      setSyncMsg('✓ Saved')
    } catch (e) {
      setSyncMsg('⚠ ' + e.message)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 3000)
    }
  }

  const toggle  = (id) => setChecked(p => ({ ...p, [id]: !p[id] }))
  const logout  = async () => { await signOut(); setUser(null); setEntries([]) }

  const streak = () => {
    let n = 0, d = new Date()
    while (entries.find(e => e.date === d.toISOString().split('T')[0])) {
      n++; d.setDate(d.getDate() - 1)
    }
    return n
  }

  const avgMood   = entries.length ? (entries.reduce((a, e) => a + (e.mood ?? 0), 0) / entries.length).toFixed(1) : null
  const techCount = (id) => entries.filter(e => e.techniques?.[id]).length
  const last14    = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
  const bestTech  = TECHNIQUES.reduce((b, t) => techCount(t.id) > techCount(b.id) ? t : b, TECHNIQUES[0])

  if (booting) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: 48 }}>🌿</div>
  )

  if (!user) return <AuthScreen onLogin={u => setUser(u)} />

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.hdr}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Inner Peace Tracker</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
              {user.email.split('@')[0]} 👋
            </div>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            Log out
          </button>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
          {[[streak(), 'day streak'], [entries.length, 'entries'], [avgMood ? MOODS[Math.round(avgMood)] : '–', 'avg mood']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l}</div>
            </div>
          ))}
        </div>
        {syncMsg && (
          <div style={{ marginTop: 10, fontSize: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', display: 'inline-block' }}>
            {syncMsg}
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['log', '📝 Today'], ['history', '📅 History'], ['insights', '💡 Insights']].map(([v, l]) => (
          <button key={v} style={S.navbtn(view === v)} onClick={() => setView(v)}>{l}</button>
        ))}
      </div>

      {/* TODAY */}
      {view === 'log' && <>
        <div style={S.card}>
          <label style={S.lbl}>How are you feeling today?</label>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i)} style={{
                fontSize: 28, background: mood === i ? '#e8f5e0' : 'transparent',
                border: `2px solid ${mood === i ? '#2d5a3d' : 'transparent'}`,
                borderRadius: 12, padding: '6px 10px', cursor: 'pointer',
              }}>{m}</button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: MOOD_COLORS[mood], fontWeight: 600 }}>
            {MOOD_LABELS[mood]}
          </div>
        </div>

        <div style={S.card}>
          <label style={S.lbl}>What did you practise today?</label>
          {TECHNIQUES.map(t => (
            <div key={t.id} style={S.techrow(checked[t.id])} onClick={() => toggle(t.id)}>
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{t.desc}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: checked[t.id] ? '#2d5a3d' : 'white',
                border: `2px solid ${checked[t.id] ? '#2d5a3d' : '#ccc'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 700,
              }}>{checked[t.id] ? '✓' : ''}</div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <label style={S.lbl}>
            Any trigger today?{' '}
            <span style={{ fontWeight: 400, color: '#888', fontSize: 13 }}>(optional)</span>
          </label>
          <input style={S.inp} value={trigger} onChange={e => setTrigger(e.target.value)}
            placeholder="e.g. WhatsApp from family, read news…" />
        </div>

        <div style={S.card}>
          <label style={S.lbl}>
            One honest sentence about today{' '}
            <span style={{ fontWeight: 400, color: '#888', fontSize: 13 }}>(optional)</span>
          </label>
          <textarea style={{ ...S.inp, resize: 'vertical' }} rows={3} value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What helped? What didn't?" />
        </div>

        <button style={S.primary} onClick={save} disabled={syncing}>
          {syncing ? '⏳ Saving…' : '💾 Save'}
        </button>
      </>}

      {/* HISTORY */}
      {view === 'history' && <>
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>No entries yet — start logging today!</div>
        )}
        {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
          <div key={e.date} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{fmtDate(e.date)}</div>
              <div style={{ fontSize: 26 }}>{MOODS[e.mood]}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {TECHNIQUES.filter(t => e.techniques?.[t.id]).map(t => (
                <span key={t.id} style={{ background: '#e8f5e0', color: '#2d5a3d', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                  {t.emoji} {t.label}
                </span>
              ))}
              {!TECHNIQUES.some(t => e.techniques?.[t.id]) && (
                <span style={{ color: '#ccc', fontSize: 13 }}>No techniques logged</span>
              )}
            </div>
            {e.trigger && <div style={{ fontSize: 13, color: '#e57373', marginBottom: 4 }}>⚡ {e.trigger}</div>}
            {e.note && <div style={{ fontSize: 14, color: '#555', fontStyle: 'italic' }}>"{e.note}"</div>}
          </div>
        ))}
      </>}

      {/* INSIGHTS */}
      {view === 'insights' && <>
        <div style={S.card}>
          <label style={S.lbl}>Mood — last 14 days</label>
          {last14.length < 2
            ? <div style={{ color: '#aaa', fontSize: 13 }}>Log at least 2 days to see a trend</div>
            : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80, marginTop: 8 }}>
                {last14.map(e => (
                  <div key={e.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: '100%', borderRadius: 4, minHeight: 8, background: MOOD_COLORS[e.mood], height: `${((e.mood + 1) / 5) * 68}px` }} />
                    <div style={{ fontSize: 9, color: '#aaa' }}>{fmtDate(e.date).split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        <div style={S.card}>
          <label style={S.lbl}>Technique frequency</label>
          {TECHNIQUES.map(t => {
            const count = techCount(t.id)
            const pct   = entries.length ? Math.round((count / entries.length) * 100) : 0
            return (
              <div key={t.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{t.emoji} {t.label}</span>
                  <span style={{ color: '#888' }}>{count}x ({pct}%)</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: 6, height: 8 }}>
                  <div style={{ background: '#2d5a3d', width: `${pct}%`, height: 8, borderRadius: 6 }} />
                </div>
              </div>
            )
          })}
        </div>

        {entries.some(e => e.trigger) && (
          <div style={S.card}>
            <label style={S.lbl}>Recent triggers</label>
            {[...entries].filter(e => e.trigger).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(e => (
              <div key={e.date} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', marginTop: 2 }}>{fmtDate(e.date)}</span>
                <span style={{ fontSize: 13, color: '#555' }}>⚡ {e.trigger}</span>
              </div>
            ))}
          </div>
        )}

        {entries.length > 0 && (
          <div style={{ ...S.card, background: '#e8f5e0', border: '1.5px solid #2d5a3d' }}>
            <div style={{ fontWeight: 600, color: '#2d5a3d', marginBottom: 8 }}>💬 For your first therapy session</div>
            <div style={{ padding: 10, background: 'white', borderRadius: 10, fontSize: 13, lineHeight: 1.8 }}>
              📅 {entries.length} days logged · 🔥 {streak()} day streak<br />
              😌 Average mood: {avgMood ? MOOD_LABELS[Math.round(avgMood)] : '—'}<br />
              🏆 Most used: {bestTech.emoji} {bestTech.label}
            </div>
          </div>
        )}
      </>}
    </div>
  )
}
