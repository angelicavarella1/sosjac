// src/store/useRelatoriosStore.ts
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabaseClient'

interface DenunciaPorCategoria {
  categoria: string
  total: number
}

interface DenunciaPorSecretaria {
  secretaria_nome: string
  total: number
}

interface DenunciaPorMes {
  mes: string
  total: number
}

export const useRelatoriosStore = defineStore('relatorios', {
  state: () => ({
    totalDenuncias: 0,
    totalBanidos: 0,
    denunciasPorCategoria: [] as DenunciaPorCategoria[],
    denunciasPorSecretaria: [] as DenunciaPorSecretaria[],
    denunciasPorPeriodo: [] as DenunciaPorMes[],
    loading: false,
    error: '',
  }),

  actions: {
    async loadResumo() {
      this.loading = true
      this.error = ''

      try {
        // 🔹 Total de denúncias
        const { count: totalDenuncias } = await supabase
          .from('denuncias')
          .select('*', { count: 'exact' })
        this.totalDenuncias = totalDenuncias || 0

        // 🔹 Total de usuários banidos
        const { count: totalBanidos } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact' })
          .eq('is_banned', true)
        this.totalBanidos = totalBanidos || 0

        // 🔹 Relatórios agregados via RPC
        const { data: catData, error: catErr } = await supabase.rpc('get_relatorio_por_categoria')
        if (catErr) throw catErr
        this.denunciasPorCategoria = catData || []

        const { data: secData, error: secErr } = await supabase.rpc('get_relatorio_secretarias')
        if (secErr) throw secErr
        this.denunciasPorSecretaria = secData || []

        const { data: mesData, error: mesErr } = await supabase.rpc('get_relatorio_mensal')
        if (mesErr) throw mesErr
        this.denunciasPorPeriodo = mesData || []
      } catch (err: any) {
        console.error('[RelatoriosStore] erro:', err)
        this.error = 'Erro ao carregar dados de relatórios'
      } finally {
        this.loading = false
      }
    },
  },
})
