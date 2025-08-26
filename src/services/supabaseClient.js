import { createClient } from '@supabase/supabase-js'

// Lê as variáveis de ambiente do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para login
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// Função para cadastro
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

// Função para logout
export const signOut = async () => {
  await supabase.auth.signOut()
}

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user
}

// Função para verificar se o usuário é admin
export const isAdmin = async () => {
  const user = await getCurrentUser()
  if (!user) return false

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    // Se retornar erro mas for "PGRST116" (registro não encontrado), não é erro de permissão
    if (error && error.code !== 'PGRST116') return false
    return !!data
  } catch (err) {
    return false
  }
}