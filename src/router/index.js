import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabaseClient'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('../views/Home.vue'), meta: { requiresAuth: true } },
  { path: '/minhas-denuncias', component: () => import('../views/MinhasDenuncias.vue'), meta: { requiresAuth: true } },
  { path: '/denuncia/:id', component: () => import('../views/DenunciaDetalhe.vue'), meta: { requiresAuth: true } },
  { path: '/reportar', component: () => import('../views/ReportForm.vue'), meta: { requiresAuth: true } },
  { path: '/mapa-admin', component: () => import('../views/MapaAdmin.vue'), meta: { requiresAuth: true } },
  { path: '/relatorios', component: () => import('../views/Relatorios.vue'), meta: { requiresAuth: true } },
  { path: '/usuario-banido', component: () => import('../views/UsuarioBanido.vue'), meta: { requiresAuth: false } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  // Se a rota exige autenticação e o usuário não está logado
  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }

  // Se o usuário está logado e tenta acessar /login ou /register
  if (['/login', '/register'].includes(to.path) && user) {
    next('/home')
    return
  }

  // Libera a rota
  next()
})

export default router