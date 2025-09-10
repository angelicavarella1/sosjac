import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'

import { useAuthStore } from '@/store/useAuthStore'

async function initApp() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  const authStore = useAuthStore()
  try {
    await authStore.loadUser()
  } catch (err) {
    console.error('Falha ao inicializar a sessão do usuário:', err)
  }

  router.isReady().then(() => {
    app.mount('#app')
  })
}

initApp()
