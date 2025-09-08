import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

// ✅ CORREÇÃO: Inicialize o Pinia antes do roteador.
app.use(pinia)
app.use(router)

app.mount('#app')