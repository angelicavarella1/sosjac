import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout from '@/components/AppLayout.vue'

// ✅ Lazy imports — mantidos
const Login = () => import('@/pages/Login.vue')
const Register = () => import('@/pages/Register.vue')
const Home = () => import('@/pages/Home.vue')
const ReportForm = () => import('@/pages/ReportForm.vue')
const MinhasDenuncias = () => import('@/pages/MinhasDenuncias.vue')
const AdminDashboard = () => import('@/pages/AdminDashboard.vue')
const ColorPalette = () => import('@/components/temp/ColorPalettePreview.vue')
const TodasDenuncias = () => import('@/pages/TodasDenuncias.vue')
const Graficos = () => import('@/pages/Graficos.vue')
const Relatorios = () => import('@/pages/Relatorios.vue')
const Estatisticas = () => import('@/pages/Estatisticas.vue')
const Secretarias = () => import('@/pages/Secretarias.vue')
const MapaAdmin = () => import('@/pages/MapaAdmin.vue')
const Usuarios = () => import('@/pages/Usuarios.vue')
const DenunciaDetalhe = () => import('@/pages/DenunciaDetalhe.vue')
const SecretariasDenuncia = () => import('@/pages/SecretariasDenuncia.vue') // ✅ Nova rota
const NotFound = () => import('@/pages/NotFound.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'reportar', name: 'ReportForm', component: ReportForm },
      { path: 'minhas-denuncias', name: 'MinhasDenuncias', component: MinhasDenuncias },
      {
        path: 'denuncia/:id',
        name: 'DenunciaDetalhe',
        component: DenunciaDetalhe,
        props: true
      },
      // ✅ Nova rota: secretarias por denúncia (só para admins)
      {
        path: 'secretarias/:denunciaId',
        name: 'SecretariasDenuncia',
        component: SecretariasDenuncia,
        meta: { requiresAdmin: true },
        props: true
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAdmin: true }
      },
      { path: 'color-palette', name: 'ColorPalette', component: ColorPalette, meta: { requiresAdmin: true } },
      { path: 'todas-denuncias', name: 'TodasDenuncias', component: TodasDenuncias, meta: { requiresAdmin: true } },
      { path: 'graficos', name: 'Graficos', component: Graficos, meta: { requiresAdmin: true } },
      { path: 'relatorios', name: 'Relatorios', component: Relatorios, meta: { requiresAdmin: true } },
      { path: 'estatisticas', name: 'Estatisticas', component: Estatisticas, meta: { requiresAdmin: true } },
      { path: 'secretarias', name: 'Secretarias', component: Secretarias, meta: { requiresAdmin: true } },
      { path: 'mapa-admin', name: 'MapaAdmin', component: MapaAdmin, meta: { requiresAdmin: true } },
      { path: 'usuarios', name: 'Usuarios', component: Usuarios, meta: { requiresAdmin: true } },
    ]
  },
  { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // ✅ Garante que a sessão seja carregada ANTES de qualquer verificação
  if (!authStore.isLoaded) {
    await authStore.loadUser()
  }

  // ✅ Agora verifica as permissões com dados carregados
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login')
  }

  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return next('/')
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/')
  }

  next()
})

export default router