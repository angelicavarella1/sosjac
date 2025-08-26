import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export const isAdmin = async () => {
  const user = await getCurrentUser()
  if (!user) return false

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    if (error && error.code !== 'PGRST116') return false
    return !!data
  } catch (err) {
    return false
  }
}