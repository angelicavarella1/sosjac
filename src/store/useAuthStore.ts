// src/store/useAuthStore.ts
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabaseClient'

interface UsuarioData {
  id: string
  nome: string
  is_admin: boolean
  is_banned: boolean
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    loading: true,
    isAdmin: false,
    isBanned: false,
    nome: ''
  }),
  getters: {
    isLoggedIn: (state): boolean => !!state.user
  },
  actions: {
    async loadUser() {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        const session = data?.session ?? null
        if (!session?.user) {
          this.resetAuthState()
          return
        }

        this.user = session.user

        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome, is_admin, is_banned')
          .eq('id', session.user.id)
          .single()

        if (userError) throw userError

        this.nome = userData?.nome || session.user.user_metadata?.full_name || session.user.email
        this.isAdmin = !!userData?.is_admin
        this.isBanned = !!userData?.is_banned

      } catch (err: any) {
        console.error('[AuthStore] loadUser error:', err)
        if (err instanceof Error) console.error('[AuthStore] loadUser message:', err.message)
        if (err?.status) console.error('[AuthStore] loadUser status:', err.status)
        this.resetAuthState()
      } finally {
        this.loading = false
      }
    },

    resetAuthState() {
      this.user = null
      this.nome = ''
      this.isAdmin = false
      this.isBanned = false
    },

    async login(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        if (!data.user) throw new Error('Falha ao autenticar o usuário.')

        this.user = data.user
        await this.loadUser()

        if (this.isBanned) throw new Error('Usuário banido.')
      } catch (err: any) {
        console.error('[AuthStore] login error:', err)
        throw err
      }
    },

    async register(email: string, password: string, nome: string) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: nome } }
        })
        if (error) throw error

        if (data.user?.id) {
          const { error: insertError } = await supabase.from('usuarios').insert([{
            id: data.user.id,
            email,
            nome,
            is_admin: false,
            is_banned: false
          }])
          if (insertError) throw insertError
        }

        this.user = data.user
        this.nome = nome
        this.isAdmin = false
        this.isBanned = false
      } catch (err: any) {
        console.error('[AuthStore] register error:', err)
        throw err
      }
    },

    async logout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      } catch (err: any) {
        console.error('[AuthStore] logout error:', err)
      } finally {
        this.resetAuthState()
      }
    },

    listenToAuthChanges() {
      supabase.auth.onAuthStateChange(async (_, session) => {
        if (session?.user) {
          this.user = session.user
          await this.loadUser()
        } else {
          this.resetAuthState()
        }
      })
    }
  }
})
