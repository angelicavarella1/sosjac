// src/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não foram definidas')
}

// Cria cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
