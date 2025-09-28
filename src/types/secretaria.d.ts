// src/types/secretaria.d.ts
export interface Secretaria {
  id: number
  nome: string
  secretario: string
  endereco: string
  telefone: string
  email_contato: string // permanece igual, como no banco
  site: string          // ✅ adicionado para TypeScript reconhecer
}
