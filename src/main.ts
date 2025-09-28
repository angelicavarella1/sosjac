import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'

// Importa o store de autenticação
import { useAuthStore } from '@/store/useAuthStore'

/**
 * Inicializa a aplicação de forma segura:
 * - Carrega a sessão do usuário antes de montar
 * - Garante que o router esteja pronto
 * - Trata erros silenciosos
 */
async function initApp() {
  const app = createApp(App)
  const pinia = createPinia()

  // ✅ Instala os plugins
  app.use(pinia)
  app.use(router)

  // Obtém o store de autenticação
  const authStore = useAuthStore()

  // ✅ Evita chamadas múltiplas
  if (!authStore.isLoaded) {
    try {
      console.log('🚀 Iniciando carregamento da sessão do usuário...')
      await authStore.loadUser()
      console.log('✅ Sessão do usuário carregada com sucesso')
    } catch (err) {
      console.error('❌ Falha ao inicializar a sessão do usuário:', err)
      // Não interrompe a montagem — apenas loga o erro
      // O usuário será redirecionado para login se não estiver autenticado
    }
  }

  // Aguarda o router estar pronto antes de montar a app
  await router.isReady()
  app.mount('#app')

  // 📲 Registrar Service Worker para Notificações Push (PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ [SOSJAC] Service Worker registrado com sucesso:', reg.scope);
      })
      .catch(err => {
        console.error('❌ [SOSJAC] Falha ao registrar Service Worker:', err);
      });
  }
}

// Inicia a aplicação
initApp()