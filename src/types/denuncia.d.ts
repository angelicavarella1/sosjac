// src/types/denuncia.ts
export interface Denuncia {
  id: number
  titulo: string
  descricao: string
  categoria: string[]
  status: 'pendente' | 'aprovada' | 'rejeitada'
  endereco: string | null
  latitude: number | null
  longitude: number | null
  user_id: string
  secretaria_id: number | null
  avaliado_por: string | null
  data_avaliacao: string | null
  created_at: string
  updated_at: string
}

export interface DenunciaExpandida extends Denuncia {
  autor_nome: string
  autor_email: string
  secretaria_nome: string | null
}