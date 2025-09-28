<template>
  <div class="h-[500px] w-full rounded shadow">
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/api/supabaseClient'
import mapConfig from '@/config/mapConfig'

// ✅ CORREÇÃO: Corrige ícones do Leaflet no Vite
delete (window as any).L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// ✅ Tipagem para a denúncia
interface Denuncia {
  id: string
  titulo: string
  descricao: string
  latitude: number
  longitude: number
  status: 'pendente' | 'aberta' | 'em_progresso' | 'concluida' | 'rejeitada'
}

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let markers: L.Marker[] = []

onMounted(async () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView(
    [mapConfig.center.lat, mapConfig.center.lng],
    mapConfig.zoom
  )

  L.tileLayer(mapConfig.tileLayerUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  map.invalidateSize(true)

  // ✅ CORREÇÃO 1: usar 'data', não 'denuncias'
  const {  data, error } = await supabase
    .from('denuncias')
    .select(`
      id,
      titulo,
      descricao,
      latitude,
      longitude,
      status
    `)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  if (error) {
    console.error('[MapaAdministrativo] Erro ao carregar denúncias:', error)
    return
  }

  // ✅ CORREÇÃO 2: tipagem explícita para 'd'
  data?.forEach((d: Denuncia) => {
    if (d.latitude && d.longitude) {
      const marker = L.marker([d.latitude, d.longitude])
        .addTo(map!)
        .bindPopup(`
          <b>${d.titulo}</b><br/>
          ${d.descricao}<br/>
          <small><a class="map-link" href="/denuncia/${d.id}" target="_blank">Ver Detalhes</a></small>
        `)
      markers.push(marker)
    }
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  markers = []
})
</script>

<style scoped>
.map-link {
  color: #4169E1; /* royalblue */
  text-decoration: underline;
  font-weight: 500;
}

.map-link:hover {
  color: #191970; /* midnightblue */
}

.map-link:active {
  color: #000080; /* navy */
}
</style>