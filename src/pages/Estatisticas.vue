<template>
  <AppLayout title="Estatísticas do Sistema" :show-back-button="true" :show-logout-button="true">
    <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-blue-100 p-4 rounded shadow text-center">
          <p class="text-lg font-medium">Denúncias</p>
          <p class="text-3xl font-bold mt-2">{{ totalDenuncias }}</p>
        </div>
        <div class="bg-green-100 p-4 rounded shadow text-center">
          <p class="text-lg font-medium">Usuários</p>
          <p class="text-3xl font-bold mt-2">{{ totalUsuarios }}</p>
        </div>
        <div class="bg-red-100 p-4 rounded shadow text-center">
          <p class="text-lg font-medium">Usuários Banidos</p>
          <p class="text-3xl font-bold mt-2">{{ totalBanidos }}</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabaseClient'
import AppLayout from '@/components/AppLayout.vue'

const totalDenuncias = ref<number>(0)
const totalUsuarios = ref<number>(0)
const totalBanidos = ref<number>(0)

async function loadEstatisticas() {
  try {
    // ✅ Otimização: Carregar as três requisições em paralelo
    const [denunciasData, usuariosData, banidosData] = await Promise.all([
      supabase.from('denuncias').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('is_banned', true)
    ])

    totalDenuncias.value = denunciasData.count ?? 0
    totalUsuarios.value = usuariosData.count ?? 0
    totalBanidos.value = banidosData.count ?? 0

  } catch (err) {
    console.error('[Estatisticas.vue] Erro ao carregar estatísticas:', err)
  }
}

onMounted(() => {
  loadEstatisticas()
})
</script>