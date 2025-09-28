// src/store/useAuthStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabaseClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    loading: true,
    isLoaded: false,
    isAdmin: false,
    isBanned: false,
    nome: '',
    listener: null as any,
    privateLoadingFlag: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    async loadUser() {
      console.log('1. [AuthStore] loadUser() iniciado.')
      if (this.privateLoadingFlag) {
        console.log('1a. [AuthStore] Já carregando. Interrompendo.')
        return
      }
      this.privateLoadingFlag = true
      this.loading = true
      this.isLoaded = false
      try {
        console.log('2. Tentando obter sessão do Supabase...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('3. Sessão recebida.')
        if (sessionError || !session?.user) {
          console.log('4. Nenhuma sessão encontrada. Resetando estado.')
          this.resetAuthState()
          return
        }
        const user = session.user
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome, is_admin, is_banned')
          .eq('id', user.id)
          .single()
        if (userError) {
          console.error('❌ Erro ao buscar dados do usuário:', userError)
          this.user = { ...user } 
          return
        }
        this.user = {
          ...user,
          nome: userData?.nome || user.user_metadata?.full_name || user.email,
          role: userData?.is_admin ? 'admin' : 'user',
          is_banned: userData?.is_banned || false,
        }
        this.nome = this.user.nome
        this.isAdmin = this.user.role === 'admin'
        this.isBanned = this.user.is_banned
        if (this.isBanned) {
          console.log('8. Usuário banido. Saindo da sessão.')
          await supabase.auth.signOut()
          this.resetAuthState()
        }
        console.log('9. Usuário carregado com sucesso.')
      } catch (err: any) {
        console.error('❌ Erro fatal durante loadUser:', err)
        this.resetAuthState()
      } finally {
        this.loading = false
        this.isLoaded = true
        this.privateLoadingFlag = false
        console.log('10. loadUser finalizado.')
        if (!this.listener) {
          console.log('11. Inicializando listener de sessão.')
          const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
              this.loadUser() 
            } else {
              this.resetAuthState()
            }
          })
          this.listener = listener
          console.log('12. Listener inicializado com sucesso.')
        }
      }
    },

    resetAuthState() {
      console.log('🔄 Resetando estado de autenticação.')
      this.user = null
      this.nome = ''
      this.isAdmin = false
      this.isBanned = false
      this.loading = false
      this.isLoaded = true
      if (this.listener) {
        try {
          this.listener.subscription.unsubscribe()
        } catch (e) {
        }
        this.listener = null
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      this.resetAuthState()
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (!data.user) throw new Error('Falha ao autenticar o usuário.')
        await this.loadUser()
        if (this.isBanned) {
          await supabase.auth.signOut()
          throw new Error('Usuário banido.')
        }
      } catch (err: any) {
        this.resetAuthState()
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(email: string, password: string, nomeCompleto: string) {
      this.loading = true
      this.resetAuthState()
      
      try {
        // 1. Tentar registrar o usuário no sistema de autenticação,
        //    enviando o nome diretamente nos metadados.
        const { data: { user }, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: nomeCompleto }
          }
        })
        if (authError) throw authError
        if (!user) throw new Error('Falha ao registrar no Auth.')

        // 2. Checar se o perfil já existe na tabela 'usuarios'
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', user.id)
          .single()

        if (existingUser) {
          console.log('[AuthStore] Perfil de usuário já existe, evitando criação duplicada.')
          return
        }

        // 3. Inserir o perfil na sua tabela 'usuarios'
        const userProfile = {
          id: user.id, 
          nome: nomeCompleto, 
          email: email,
          is_admin: false, 
          is_banned: false 
        }

        const { error: insertError } = await supabase
          .from('usuarios')
          .insert(userProfile)
          
        if (insertError) throw insertError

      } catch (err: any) {
        console.error('[AuthStore] register error:', err)
        throw err
      } finally {
        this.loading = false
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
    }
  },
})