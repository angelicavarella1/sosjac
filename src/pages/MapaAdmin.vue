<template>
  <div v-if="auth.loading || !auth.user" class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <p class="text-xl text-gray-700 font-semibold">Carregando mapa...</p>
    <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <div v-else class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
    <!-- Botões de navegação -->
    <NavigationButtons />

    <h1 class="text-2xl font-bold mb-4">Mapa de Denúncias</h1>
    <div class="h-[500px] w-full rounded shadow">
      <div ref="mapContainer" class="h-full w-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'

const auth = useAuthStore()
const mapContainer = ref<HTMLDivElement | null>(null)

async function loadMapa() {
  if (!mapContainer.value) return

  // Inicializa o mapa
  const map = L.map(mapContainer.value).setView([-22.956633, -42.952338], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  try {
    const { data: denuncias } = await supabase
      .from('denuncias')
      .select('titulo, latitude, longitude')

    denuncias?.forEach(d => {
      if (d.latitude != null && d.longitude != null) {
        L.marker([d.latitude, d.longitude])
          .addTo(map)
          .bindPopup(d.titulo)
      }
    })
  } catch (err) {
    console.error('[MapaAdmin.vue] erro ao carregar denúncias:', err)
  }
}

onMounted(() => {
  if (auth.user) loadMapa()
})
</script>

<style scoped>
/* Ajuste simples para o mapa ocupar toda a div */
</style>
