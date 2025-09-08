<template>
  <div class="h-[500px] w-full rounded shadow">
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import L, { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/api/supabaseClient'
import mapConfig from '@/config/mapConfig.js'

interface Denuncia {
  id: number
  titulo: string
  descricao: string
  latitude: number
  longitude: number
}

const mapContainer = ref<HTMLDivElement | null>(null)
let map: LeafletMap | null = null
const markers = ref<LeafletMarker[]>([])

onMounted(async () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView(
    [mapConfig.center.lat, mapConfig.center.lng],
    mapConfig.zoom
  )

  L.tileLayer(mapConfig.tileLayerUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })

  const { data: denuncias, error } = await supabase
    .from<'denuncias', Denuncia>('denuncias')
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  denuncias?.forEach(d => {
    if (map) {
      const marker: LeafletMarker = L.marker([d.latitude, d.longitude])
        .addTo(map)
        .bindPopup(`
          <b>${d.titulo}</b><br/>
          ${d.descricao}<br/>
          <a href="/denuncia/${d.id}">Ver Detalhes</a>
        `)
      markers.value.push(marker)
    }
  })
})

// ✅ Melhoria: Destruir o mapa quando o componente for desmontado
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  markers.value = []
})
</script>

<style scoped>
/* Ajustes opcionais para o mapa */
</style>