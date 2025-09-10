import { defineStore } from 'pinia';
import { supabase } from '@/api/supabaseClient';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    loading: true,
    isLoaded: false,
    isAdmin: false,
    isBanned: false,
    nome: '',
    listener: null as any,
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.user,
  },

  actions: {
    async loadUser() {
      this.loading = true;
      this.isLoaded = false;
      console.log('[AuthStore] Carregando usuário...');

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          this.resetAuthState();
          return;
        }

        const user = session.user;
        this.user = user;

        // Pode não existir usuário cadastrado, usamos maybeSingle
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome')
          .eq('id', user.id)
          .maybeSingle();

        const { data: adminData, error: adminError } = await supabase
          .from('administradores')
          .select('id')
          .eq('id', String(user.id))
          .maybeSingle();

        const { data: bannedData, error: bannedError } = await supabase
          .from('bans')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) console.warn('[AuthStore] erro user:', userError);
        if (adminError) console.warn('[AuthStore] erro admin:', adminError);
        if (bannedError) console.warn('[AuthStore] erro banned:', bannedError);

        this.nome = userData?.nome || user.user_metadata?.full_name || user.email;
        this.isAdmin = !!adminData;
        this.isBanned = !!bannedData;

        console.log('[AuthStore] Usuário logado:', this.user);

        if (this.isBanned) {
          await supabase.auth.signOut();
          this.resetAuthState();
          console.warn('[AuthStore] Usuário banido.');
        }

      } catch (err) {
        console.error('[AuthStore] Erro ao carregar usuário:', err);
        this.resetAuthState();
      } finally {
        this.loading = false;
        this.isLoaded = true;

        // Configura listener apenas uma vez
        if (!this.listener) {
          const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[AuthStore] onAuthStateChange', event, session);
            if (session?.user) {
              this.user = session.user;
              this.loadUser(); // atualiza admin/ban
            } else {
              this.resetAuthState();
            }
          });
          this.listener = listener;
        }
      }
    },

    resetAuthState() {
      this.user = null;
      this.nome = '';
      this.isAdmin = false;
      this.isBanned = false;
      this.loading = false;
      this.isLoaded = true;
    },

    async login(email: string, password: string) {
      this.loading = true;
      this.resetAuthState();
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error('Falha ao autenticar o usuário.');

        await this.loadUser();

        if (this.isBanned) {
          await supabase.auth.signOut();
          throw new Error('Usuário banido.');
        }
      } catch (err: any) {
        this.resetAuthState();
        console.error('[AuthStore] login error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(email: string, password: string, nome: string) {
      this.loading = true;
      this.resetAuthState();
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: nome } }
        });
        if (error) throw error;
        if (!data.user) throw new Error('Falha ao registrar o usuário.');

        this.user = data.user;
        this.nome = nome;
        this.isAdmin = false;
        this.isBanned = false;
      } catch (err: any) {
        console.error('[AuthStore] register error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (err: any) {
        console.error('[AuthStore] logout error:', err);
      } finally {
        this.resetAuthState();
        if (this.listener) {
          this.listener.subscription.unsubscribe();
          this.listener = null;
        }
      }
    },
  }
});
