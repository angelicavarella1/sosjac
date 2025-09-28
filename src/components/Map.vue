<template>
  <div class="h-[500px] w-full rounded shadow">
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapConfig from '@/config/mapConfig'

// ✅ CORREÇÃO: Corrige ícones do Leaflet no Vite
delete (window as any).L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// ✅ Tipagem para a posição
interface Position {
  lat: number
  lng: number
}

// ✅ Tipagem para o endereço formatado
interface EnderecoFormatado {
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  pais: string
}

const props = defineProps<{
  modelValue: Position
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Position): void
  (e: 'update:endereco', value: EnderecoFormatado): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null
let abortController: AbortController | null = null

// Inicializa o mapa
onMounted(() => {
  if (!mapContainer.value) return

  const { lat, lng } = props.modelValue
  if (isNaN(lat) || isNaN(lng)) return

  map = L.map(mapContainer.value).setView([lat, lng], mapConfig.zoom)

  L.tileLayer(mapConfig.tileLayerUrl, {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  nextTick(() => {
    map?.invalidateSize(true)
  })

  marker = L.marker([lat, lng], {
    draggable: true,
    autoPan: true
  }).addTo(map)

  marker.on('dragend', () => {
    if (!marker) return
    const pos = marker.getLatLng()
    const newPos = { lat: pos.lat, lng: pos.lng }
    emit('update:modelValue', newPos)
    buscarEndereco(newPos)
  })

  map.on('click', (e: L.LeafletMouseEvent) => {
    if (!marker) return
    const newPos = { lat: e.latlng.lat, lng: e.latlng.lng }
    marker.setLatLng(newPos)
    emit('update:modelValue', newPos)
    buscarEndereco(newPos)
  })
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (!marker || !map) return
    if (isNaN(newVal.lat) || isNaN(newVal.lng)) return

    marker.setLatLng([newVal.lat, newVal.lng])
    map.setView([newVal.lat, newVal.lng], mapConfig.zoom)
  },
  { deep: true }
)

async function buscarEndereco(pos: Position) {
  if (isNaN(pos.lat) || isNaN(pos.lng)) return

  abortController?.abort()
  abortController = new AbortController()

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.lat}&lon=${pos.lng}`,
      {
        headers: {
          'User-Agent': 'Denuncia App - v1.0.0'
        },
        signal: abortController.signal
      }
    )

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()

    if (data?.address) {
      const e = data.address
      const enderecoFormatado: EnderecoFormatado = {
        rua: (e.road || e.pedestrian || e.cycleway || '').trim() || 'Não informado',
        numero: (e.house_number || '').trim() || 'S/N',
        bairro: (e.suburb || e.neighbourhood || '').trim() || 'Não informado',
        cidade: (e.city || e.town || e.village || '').trim() || 'Não informado',
        estado: (e.state || '').trim() || 'Não informado',
        cep: (e.postcode || '').trim().replace(/\D/g, '') || '00000-000',
        pais: (e.country || '').trim() || 'Brasil'
      }
      emit('update:endereco', enderecoFormatado)
    } else {
      emit('update:endereco', {
        rua: 'Endereço não encontrado',
        numero: 'S/N',
        bairro: 'Não informado',
        cidade: 'Não informado',
        estado: 'Não informado',
        cep: '00000-000',
        pais: 'Brasil'
      })
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return
    console.error('Erro ao buscar endereço:', err)
    emit('update:endereco', {
      rua: 'Erro ao buscar endereço',
      numero: 'S/N',
      bairro: 'Não informado',
      cidade: 'Não informado',
      estado: 'Não informado',
      cep: '00000-000',
      pais: 'Brasil'
    })
  }
}

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (marker) {
    marker.remove()
    marker = null
  }
  abortController?.abort()
})
</script>

<style scoped>
.leaflet-container {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
}

.leaflet-layer {
  z-index: 1 !important;
}

.leaflet-tile,
.leaflet-marker-icon {
  max-width: none !important;
  max-height: none !important;
}
</style>