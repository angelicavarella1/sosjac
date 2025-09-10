<template>
  <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
    <!-- Botões de navegação -->
    <NavigationButtons />

    <h1 class="text-2xl font-bold mb-4">Relatórios</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-gray-100 rounded shadow">
        <p class="text-lg font-bold">Total de Denúncias</p>
        <p class="text-gray-600">{{ totalDenuncias }} denúncias cadastradas</p>
      </div>
      <div class="p-4 bg-gray-100 rounded shadow">
        <p class="text-lg font-bold">Usuários Banidos</p>
        <p class="text-gray-600">{{ totalBanidos }} usuários banidos</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'

const auth = useAuthStore()
const totalDenuncias = ref(0)
const totalBanidos = ref(0)

async function loadStats() {
  if (!auth.user) return
  try {
    const denunciasRes = await supabase.from('denuncias').select('id', { count: 'exact', head: true })
    totalDenuncias.value = denunciasRes.count || 0

    if (auth.isAdmin) {
      const banidosRes = await supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('is_banned', true)
      totalBanidos.value = banidosRes.count || 0
    }
  } catch (err) {
    console.error('[Relatorios.vue] erro ao carregar stats:', err)
  }
}

// Atualiza assim que auth estiver pronto
watch(() => auth.user, (newUser) => {
  if (newUser) loadStats()
}, { immediate: true })
</script>
