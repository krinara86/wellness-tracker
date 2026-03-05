import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://emslqtlwalcopgjsvufb.supabase.co',
  'sb_publishable_y-_Y_uJjXJ5vSnPm9qBLAw_aLP_Y8yO'
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(error.message)
  return data
}
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}
export async function signOut() { await supabase.auth.signOut() }

// ── Entries ───────────────────────────────────────────────────────────────────
export async function loadEntries() {
  const { data, error } = await supabase.from('entries').select('*').order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}
export async function upsertEntry(entry) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { error } = await supabase.from('entries')
    .upsert({ ...entry, user_id: user.id }, { onConflict: 'user_id,date' })
  if (error) throw new Error(error.message)
}

// ── Custom techniques ─────────────────────────────────────────────────────────
export async function loadUserTechniques() {
  const { data, error } = await supabase.from('user_techniques').select('*').order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}
export async function addUserTechnique(technique) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { error } = await supabase.from('user_techniques').insert({ ...technique, user_id: user.id })
  if (error) throw new Error(error.message)
}
export async function deleteUserTechnique(id) {
  const { error } = await supabase.from('user_techniques').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Preferences (stores HF key) ───────────────────────────────────────────────
export async function loadPreferences() {
  const { data, error } = await supabase.from('user_preferences').select('*').maybeSingle()
  if (error) throw new Error(error.message)
  return data || {}
}
export async function savePreferences(prefs) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { error } = await supabase.from('user_preferences')
    .upsert({ ...prefs, user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) throw new Error(error.message)
}
