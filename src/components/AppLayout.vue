<template>
  <!-- Se esta for a instância raiz do layout (rota pai) mostramos cabeçalho + router-view + footer -->
  <div v-if="isRootLayout" class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white shadow p-3 sm:p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Botão Voltar (sem fundo atrás, sem duplicação) -->
          <button
            v-if="showBackButtonComputed"
            @click="goBack"
            class="text-blue-600 hover:underline text-sm sm:text-base"
            aria-label="Voltar"
          >
            ← Voltar
          </button>

          <!-- Título maior que os botões -->
          <h1 class="text-2xl sm:text-3xl font-bold leading-none ml-2">
            {{ titleComputed }}
          </h1>
        </div>

        <!-- Botão Sair -->
        <button
          v-if="showLogoutButtonComputed"
          @click="handleLogout"
          class="text-red-600 hover:underline text-sm sm:text-base"
        >
          Sair
        </button>
      </div>
    </header>

    <main class="flex-1 p-4 sm:p-6">
      <!-- Aqui é onde as páginas-filho do router serão renderizadas -->
      <router-view />
    </main>

    <footer class="bg-white shadow p-3 sm:p-4 text-center text-gray-500">
      &copy; 2025 SOSJAC. Todos os direitos reservados. Angélica Varella
    </footer>
  </div>

  <!-- Se esta for uma instância NESTED do AppLayout (p.ex. a página ainda usa <AppLayout>),
       renderizamos somente o conteúdo (slot) — sem cabeçalho, sem router-view, sem footer -->
  <div v-else class="w-full">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'

// Chave (mesma referência no módulo): usada para marcar presença do layout no ancestor tree
const LAYOUT_KEY = Symbol.for('sosjac.appLayout')

// defineProps para compatibilidade: páginas antigas que passavam props continuarão sem erro
const props = defineProps<{
  showBackButton?: boolean
  showLogoutButton?: boolean
  title?: string
}>()

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// detecta se já existe um AppLayout acima desta instância
const parentHasLayout = inject<boolean | undefined>(LAYOUT_KEY, false)

// marcamos que agora existe um AppLayout nesta árvore (para filhos)
provide(LAYOUT_KEY, true)

// se não existe parentHasLayout -> somos a instância RAIZ (aquela que deve renderizar header/footer e router-view)
const isRootLayout = computed(() => !parentHasLayout)

const showBackButtonComputed = computed(() => {
  // se a prop foi passada explicitamente, respeitamos
  if (props.showBackButton !== undefined) return props.showBackButton

  // padrão: mostramos voltar em todas as rotas internas exceto Home / Login / Register / UsuarioBanido
  const skip = ['Home', 'Login', 'Register', 'UsuarioBanido']
  return !skip.includes(String(route.name))
})

const showLogoutButtonComputed = computed(() => {
  if (props.showLogoutButton !== undefined) return props.showLogoutButton
  return auth.isLoggedIn && !auth.isBanned
})

// Título: prioridade -> prop.title -> route.meta.title -> mapa por route.name -> fallback
const routeNameMap: Record<string, string> = {
  Home: 'SOSJAC',
  Reportar: 'Registrar Denúncia',
  MinhasDenuncias: 'Minhas Denúncias',
  DenunciaDetalhe: 'Detalhes da Denúncia',
  Usuarios: 'Gerenciar Usuários',
  Estatisticas: 'Estatísticas',
  Relatorios: 'Relatórios',
  MapaAdmin: 'Mapa Administrativo',
  TodasDenuncias: 'Todas as Denúncias',
  GerenciarUsuarios: 'Gerenciar Usuários'
}

const titleComputed = computed(() => {
  if (props.title) return props.title
  if (route.meta && route.meta.title) return String(route.meta.title)
  const name = String(route.name || '')
  return routeNameMap[name] || 'SOSJAC'
})

function goBack() {
  // Simples: volta no histórico do navegador
  router.back()
}

async function handleLogout() {
  try {
    await auth.logout()
  } catch (err) {
    console.error('[AppLayout] Erro ao deslogar:', err)
  } finally {
    // Use replace para não acumular histórico
    router.replace({ name: 'Login' })
  }
}
</script>

<style scoped>
/* nenhum background extra atrás dos botões — mantém header limpo */
/* ajuste fino visual se desejar */
</style>
