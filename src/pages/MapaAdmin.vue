<template>
  <AppLayout
    :showBackButton="true"
    :showLogoutButton="true"
    title="Mapa Administrativo de Denúncias"
  >
    <div class="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div v-if="loading" class="text-center text-gray-500">Carregando mapa...</div>
      <div v-if="error" class="text-center text-red-600 mt-4">{{ error }}</div>
      <div v-else ref="mapContainer" class="h-[600px] w-full rounded shadow"></div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/api/supabaseClient'
import L, { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapConfig from '@/config/mapConfig'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout from '@/components/AppLayout.vue'

interface UsuarioData {
  latitude: number | null
  longitude: number | null
}

interface Denuncia {
  id: string
  titulo: string
  categoria: string
  latitude: number | null
  longitude: number | null
}

const mapContainer = ref<HTMLDivElement | null>(null)
const auth = useAuthStore()
const loading = ref(true)
const error = ref('')

let map: LeafletMap | null = null

// ✅ Melhoria: Funções separadas para maior clareza
const loadUserData = async () => {
  if (!auth.user) {
    console.warn('[MapaAdmin.vue] Usuário não autenticado.')
    return null
  }
  const { data, error: userError } = await supabase
    .from('usuarios')
    .select('latitude, longitude')
    .eq('id', auth.user.id)
    .single()

  if (userError) {
    console.warn('[MapaAdmin.vue] Não foi possível carregar localização do admin:', userError)
    return null
  }
  return data as UsuarioData
}

const loadDenuncias = async () => {
  const { data, error: denunciaError } = await supabase
    .from('denuncias')
    .select('id, titulo, categoria, latitude, longitude')
  if (denunciaError) throw denunciaError
  return data as Denuncia[]
}

const setupMap = (denuncias: Denuncia[], userData: UsuarioData | null) => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView(
    [mapConfig.center.lat, mapConfig.center.lng],
    mapConfig.zoom
  )

  L.tileLayer(mapConfig.tileLayerUrl, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  // Corrigir ícones do Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })

  if (map && userData && userData.latitude !== null && userData.longitude !== null) {
    L.marker([userData.latitude, userData.longitude])
      .addTo(map)
      .bindPopup('Você está aqui (Admin)')
  }

  denuncias.forEach(d => {
    if (d.latitude !== null && d.longitude !== null && map) {
      L.marker([d.latitude, d.longitude])
        .addTo(map)
        .bindPopup(`<strong>${d.titulo}</strong><br>${d.categoria}`)
    } else {
      console.warn(`[MapaAdmin.vue] Denúncia ID ${d.id} sem coordenadas válidas.`)
    }
  })
}

onMounted(async () => {
  try {
    // ✅ Melhoria: Carregar dados em paralelo
    const [userData, denuncias] = await Promise.all([
      loadUserData(),
      loadDenuncias()
    ])

    setupMap(denuncias, userData)
  } catch (err: unknown) {
    console.error('[MapaAdmin.vue] Erro ao carregar dados:', err)
    error.value = 'Erro ao carregar os dados do mapa.'
  } finally {
    loading.value = false
  }
})

// ✅ Melhoria: Limpar o mapa ao sair da página
onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
/* Estilos opcionais para o mapa */
</style>