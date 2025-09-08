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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', pos: Position): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: LeafletMap | null = null
let marker: LeafletMarker | null = null
const markerIcon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href
const shadowIcon = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href

// Otimização: Apenas uma função de observação
watch(() => props.modelValue, (newVal) => {
  if (marker) {
    marker.setLatLng([newVal.lat, newVal.lng])
  }
  if (map) {
    map.setView([newVal.lat, newVal.lng], map.getZoom())
  }
}, { deep: true })

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

  // Corrigir ícones do Leaflet
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
    })

    map.on('click', (e: LeafletMouseEvent) => {
      if (marker) {
        marker.setLatLng(e.latlng)
      }
      emit('update:modelValue', e.latlng)
    })
  }
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