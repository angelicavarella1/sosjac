import { defineStore } from 'pinia'
import { supabase } from '@/api/supabaseClient'

export const useEmailLogsStore = defineStore('emailLogs', {
  state: () => ({
    logs: [] as any[],
    loading: false,
  }),

  actions: {
    async fetchLogs() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('emails_enviados')
          .select(`
            *,
            denuncias_expandida(titulo, categoria)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        this.logs = data || []
      } catch (err) {
        console.error('Erro ao carregar logs de e-mail:', err)
      } finally {
        this.loading = false
      }
    },
  },
})