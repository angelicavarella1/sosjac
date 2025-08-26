import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabaseClient'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('../views/Home.vue'), meta: { requiresAuth: true } },
  { path: '/minhas-denuncias', component: () => import('../views/MinhasDenuncias.vue'), meta: { requiresAuth: true } },
  { path: '/denuncia/:id', component: () => import('../views/DenunciaDetalhe.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router