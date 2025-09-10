import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '@/store/useAuthStore';
import { watch } from 'vue';

// Componentes
import AppLayout from '@/components/AppLayout.vue';
import Home from '@/pages/Home.vue';
import Login from '@/pages/Login.vue';
import Register from '@/pages/Register.vue';
import ReportForm from '@/pages/ReportForm.vue';
import MinhasDenuncias from '@/pages/MinhasDenuncias.vue';
import DenunciaDetalhe from '@/pages/DenunciaDetalhe.vue';
import Usuarios from '@/pages/Usuarios.vue';
import Estatisticas from '@/pages/Estatisticas.vue';
import Relatorios from '@/pages/Relatorios.vue';
import MapaAdmin from '@/pages/MapaAdmin.vue';
import UsuarioBanido from '@/pages/UsuarioBanido.vue';
import TodasDenuncias from '@/pages/TodasDenuncias.vue';
import Graficos from '@/pages/Graficos.vue'; // ✅ novo import

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/usuario-banido', name: 'UsuarioBanido', component: UsuarioBanido },

  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'reportar', name: 'Reportar', component: ReportForm },
      { path: 'minhas-denuncias', name: 'MinhasDenuncias', component: MinhasDenuncias },
      { path: 'denuncia/:id', name: 'DenunciaDetalhe', component: DenunciaDetalhe },
      { path: 'usuarios', name: 'Usuarios', component: Usuarios, meta: { requiresAdmin: true } },
      { path: 'estatisticas', name: 'Estatisticas', component: Estatisticas, meta: { requiresAdmin: true } },
      { path: 'relatorios', name: 'Relatorios', component: Relatorios, meta: { requiresAdmin: true } },
      { path: 'mapa-admin', name: 'MapaAdmin', component: MapaAdmin, meta: { requiresAdmin: true } },
      { path: 'todas-denuncias', name: 'TodasDenuncias', component: TodasDenuncias, meta: { requiresAdmin: true } },
      { path: 'graficos', name: 'Graficos', component: Graficos, meta: { requiresAdmin: true } }, // ✅ nova rota
      { path: 'gerenciar-usuarios', name: 'GerenciarUsuarios', component: Usuarios, meta: { requiresAdmin: true } },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore();

  if (authStore.loading) {
    console.log('[Router] Esperando authStore carregar...');
    await new Promise<void>((resolve) => {
      const unwatch = watch(
        () => authStore.loading,
        (loading) => {
          if (!loading) {
            unwatch();
            resolve();
          }
        }
      );
    });
  }

  const isLoggedIn = authStore.isLoggedIn;
  const isAdmin = authStore.isAdmin;
  const isBanned = authStore.isBanned;

  console.log('[Router] Checando rota', to.name, { isLoggedIn, isAdmin, isBanned });

  if (isBanned && to.name !== 'UsuarioBanido') return next({ name: 'UsuarioBanido' });
  if (to.meta.requiresAuth && !isLoggedIn) return next({ name: 'Login' });
  if (to.meta.requiresAdmin && !isAdmin) return next({ name: 'Home' });
  if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) return next({ name: 'Home' });

  next();
});

export default router;
