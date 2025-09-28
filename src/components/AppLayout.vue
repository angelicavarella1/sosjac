<!-- src/components/AppLayout.vue -->
<template>
  <div v-if="isRootLayout" class="min-h-screen flex flex-col bg-slate-100">
    <AppHeader :title="titleComputed" />
    <main role="main" class="flex-1 p-4 sm:p-6">
      <router-view />
    </main>
    <AppFooter />
  </div>

  <div v-else class="w-full">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, inject } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const LAYOUT_KEY = Symbol.for('sosjac.appLayout')

const props = defineProps<{
  title?: string
}>()

const route = useRoute()

const parentHasLayout = inject<boolean | undefined>(LAYOUT_KEY, false)
provide(LAYOUT_KEY, true)

const isRootLayout = computed(() => !parentHasLayout)

const routeNameMap: Record<string, string> = {
  Home: 'SOSJAC',
  Reportar: 'Registrar Denúncia',
  MinhasDenuncias: 'Minhas Denúncias',
  DenunciaDetalhe: 'Detalhes da Denúncia',
  Usuarios: 'Gerenciar Usuários',
  Estatisticas: 'Estatísticas',
  // ❌ REMOVIDO: Relatorios
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
</script>