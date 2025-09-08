// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Adicione outras variáveis VITE_ aqui se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}