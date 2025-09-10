<template>
  <div class="h-64 w-full rounded shadow overflow-hidden">
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import L, { Map as LeafletMap, Marker as LeafletMarker, LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Position {
  lat: number
  lng: number
}

const props = defineProps<{
  modelValue: Position
  readonly?: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', pos: Position): void
  (e: 'update:endereco', endereco: string): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: LeafletMap | null = null
let marker: LeafletMarker | null = null
const markerIcon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href
const shadowIcon = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href

// Observa posição
watch(() => props.modelValue, (newVal) => {
  if (marker) marker.setLatLng([newVal.lat, newVal.lng])
  if (map) map.setView([newVal.lat, newVal.lng], map.getZoom())
}, { deep: true })

// Função para buscar endereço via Nominatim
async function buscarEndereco(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
    const data = await res.json()
    const endereco = data.display_name || ''
    emit('update:endereco', endereco)
  } catch (err) {
    console.warn('[Map] Não foi possível obter o endereço:', err)
  }
}

onMounted(() => {
  if (!mapContainer.value) return

  const safePos = {
    lat: props.modelValue?.lat ?? -22.956633,
    lng: props.modelValue?.lng ?? -42.952338
  }

  map = L.map(mapContainer.value).setView([safePos.lat, safePos.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Corrigir ícones
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon,
    iconUrl: markerIcon,
    shadowUrl: shadowIcon,
  })

  marker = L.marker([safePos.lat, safePos.lng], { draggable: !props.readonly }).addTo(map)

  if (!props.readonly && map && marker) {
    marker.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng()
      emit('update:modelValue', { lat, lng })
      buscarEndereco(lat, lng)
    })

    map.on('click', (e: LeafletMouseEvent) => {
      if (marker) marker.setLatLng(e.latlng)
      emit('update:modelValue', e.latlng)
      buscarEndereco(e.latlng.lat, e.latlng.lng)
    })
  }

  // Busca inicial de endereço
  buscarEndereco(safePos.lat, safePos.lng)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (marker) {
    marker.remove()
    marker = null
  }
})
</script>
