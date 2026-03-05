import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://emslqtlwalcopgjsvufb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_y-_Y_uJjXJ5vSnPm9qBLAw_aLP_Y8yO'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

export async function signOut() {
  await supabase.auth.signOut()
}

export async function loadEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

export async function upsertEntry(entry) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { error } = await supabase
    .from('entries')
    .upsert({ ...entry, user_id: user.id }, { onConflict: 'user_id,date' })
  if (error) throw new Error(error.message)
}
