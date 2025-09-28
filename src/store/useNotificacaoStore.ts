// src/store/useNotificacaoStore.ts
import { defineStore } from 'pinia'

export interface Notificacao {
  id: string
  mensagem: string
  tipo: 'info' | 'sucesso' | 'erro' | 'alerta'
  lida: boolean
  created_at: Date
}

export const useNotificacaoStore = defineStore('notificacoes', {
  state: () => ({
    lista: [] as Notificacao[],
  }),

  actions: {
    // ✅ Nova ação: Inicializa o store (carrega do localStorage se necessário)
    inicializar() {
      // Se você quiser persistir notificações entre sessões, descomente o bloco abaixo.
      /*
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('notificacoes')
        if (saved) {
          this.lista = JSON.parse(saved).map((n: any) => ({
            ...n,
            created_at: new Date(n.created_at)
          }))
        }
      }
      */
      console.log('✅ Store de notificações inicializado.')
    },

    // ✅ Aprimorado: Adiciona e mantém a lista ordenada (mais recente primeiro)
    adicionar(mensagem: string, tipo: 'info' | 'sucesso' | 'erro' | 'alerta' = 'info') {
      const nova: Notificacao = {
        id: crypto.randomUUID(),
        mensagem,
        tipo,
        lida: false,
        created_at: new Date(),
      }

      // Adiciona ao início da lista (mais recente primeiro)
      this.lista.unshift(nova)

      // Agenda remoção automática
      setTimeout(() => {
        this.remover(nova.id)
      }, 5000)

      // ✅ Opcional: Salvar no localStorage
      /*
      if (typeof window !== 'undefined') {
        localStorage.setItem('notificacoes', JSON.stringify(this.lista))
      }
      */
    },

    marcarComoLida(id: string) {
      const not = this.lista.find((n) => n.id === id)
      if (not) {
        not.lida = true
        // ✅ Opcional: Salvar no localStorage
        /*
        if (typeof window !== 'undefined') {
          localStorage.setItem('notificacoes', JSON.stringify(this.lista))
        }
        */
      }
    },

    remover(id: string) {
      this.lista = this.lista.filter((n) => n.id !== id)
      // ✅ Opcional: Salvar no localStorage
      /*
      if (typeof window !== 'undefined') {
        localStorage.setItem('notificacoes', JSON.stringify(this.lista))
      }
      */
    },

    limparTodas() {
      this.lista = []
      // ✅ Opcional: Limpar do localStorage
      /*
      if (typeof window !== 'undefined') {
        localStorage.removeItem('notificacoes')
      }
      */
    },
  },

  // ✅ Getter: Retorna apenas notificações não lidas (útil para badges ou contadores)
  getters: {
    naoLidas: (state) => {
      return state.lista.filter((n) => !n.lida)
    },
  },
})