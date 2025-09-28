// src/store/useDenunciasStore.ts
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabaseClient'

// ✅ Tipos reutilizáveis — alinhado com os componentes
export type StatusDenuncia = 'pendente' | 'aprovada' | 'rejeitada' | 'aberta' | 'concluida'

export interface DenunciaExpandida {
  id: string
  titulo: string
  descricao: string
  // ⚠️ Comentário: campo derivado da relação N:N (não coluna direta na tabela `denuncias`)
  categoria: string
  status: StatusDenuncia
  endereco: string | null
  lat: number | null
  lng: number | null
  user_id: string | null
  secretaria_id: number | null
  data_avaliacao: string | null
  avaliado_por: string | null
  created_at: string
  updated_at: string
  autor_nome: string | null
  autor_email: string | null
  avaliador_nome: string | null
  avaliador_email: string | null
  secretaria_nome: string | null
}

export const useDenunciasStore = defineStore('denuncias', {
  state: () => ({
    denuncias: [] as DenunciaExpandida[],
    loading: false,
  }),

  getters: {
    pendentes: (state) => state.denuncias.filter(d => d.status === 'pendente'),
    aprovadas: (state) => state.denuncias.filter(d => d.status === 'aprovada'),
    rejeitadas: (state) => state.denuncias.filter(d => d.status === 'rejeitada'),
    abertas: (state) => state.denuncias.filter(d => d.status === 'aberta'),
    concluidas: (state) => state.denuncias.filter(d => d.status === 'concluida'),
  },

  actions: {
    async fetchDenuncias() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('denuncias')
          .select(`
            id,
            titulo,
            descricao,
            status,
            endereco,
            latitude,
            longitude,
            user_id,
            secretaria_id,
            data_avaliacao,
            avaliado_por,
            created_at,
            updated_at,
            usuarios!denuncias_user_id_fkey (nome, email) as autor,
            usuarios!denuncias_avaliado_por_fkey (nome, email) as avaliador,
            secretarias (nome) as secretaria,
            denuncia_categorias (
              categorias (nome)
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        // ✅ Força o tipo como `any[]` para evitar erro de inferência do Supabase
        const rawData = data as any[]

        this.denuncias = (rawData || []).map((d): DenunciaExpandida => {
          // ✅ Seguro: extrai nomes das categorias ou retorna "Sem categoria"
          const categoriasNomes = d.denuncia_categorias
            ?.map((dc: any) => dc.categorias?.nome)
            .filter((nome: string | undefined): nome is string => !!nome) // remove null/undefined
            || []

          return {
            id: d.id,
            titulo: d.titulo,
            descricao: d.descricao,
            status: d.status,
            endereco: d.endereco,
            lat: d.latitude,
            lng: d.longitude,
            user_id: d.user_id,
            secretaria_id: d.secretaria_id,
            data_avaliacao: d.data_avaliacao,
            avaliado_por: d.avaliado_por,
            created_at: d.created_at,
            updated_at: d.updated_at,
            autor_nome: d.autor?.nome || null,
            autor_email: d.autor?.email || null,
            avaliador_nome: d.avaliador?.nome || null,
            avaliador_email: d.avaliador?.email || null,
            secretaria_nome: d.secretaria?.nome || null,
            categoria: categoriasNomes.length > 0 ? categoriasNomes.join(', ') : 'Sem categoria',
          }
        })
      } catch (err) {
        console.error('Erro ao carregar denúncias:', err)
      } finally {
        this.loading = false
      }
    },

    async avaliarDenuncia(denunciaId: string, status: 'aprovada' | 'rejeitada') {
      try {
        const { data, error } = await supabase.functions.invoke('avaliar-denuncia', {
          body: { denunciaId, status }
        })

        if (error) throw error

        const index = this.denuncias.findIndex(d => d.id === denunciaId)
        if (index !== -1) {
          this.denuncias[index].status = status
          this.denuncias[index].data_avaliacao = new Date().toISOString()
        }

        return data
      } catch (err) {
        console.error('Erro ao avaliar denúncia:', err)
        throw err
      }
    },
  },
})