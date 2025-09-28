// src/types/email-log.d.ts
export interface EmailLog {
  id: number
  denuncia_id: number
  secretaria_email: string
  status: 'sucesso' | 'falha'
  enviado_em: string
}