<template>
  <div v-if="auth.loading || !auth.user" class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <p class="text-xl text-gray-700 font-semibold">Carregando mapa...</p>
    <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dodgerblue"></div>
  </div>

  <div v-else class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
    <NavigationButtons />

    <h1 class="text-2xl font-bold mb-4">Mapa de Denúncias</h1>

    <div class="mb-4 flex flex-wrap gap-4">
      <select v-model="filtroCategoria" class="border border-cornflowerblue rounded p-2 focus:outline-none focus:ring-2 focus:ring-dodgerblue">
        <option value="">Todas as categorias</option>
        <option v-for="cat in categoriasDisponiveis" :key="cat" :value="cat">{{ formatCategoria(cat) }}</option>
      </select>

      <select v-model="filtroStatus" class="border border-cornflowerblue rounded p-2 focus:outline-none focus:ring-2 focus:ring-dodgerblue">
        <option value="">Todos os status</option>
        <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ formatStatus(s) }}</option>
      </select>
    </div>

    <div class="h-[500px] w-full rounded shadow">
      <div ref="mapContainer" class="h-full w-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'
import mapConfig from '@/config/mapConfig'

interface CategoriaRelacionada {
  nome: string | null
}

interface DenunciaRaw {
  id: string
  titulo: string
  latitude: number | null
  longitude: number | null
  status: 'pendente' | 'aberta' | 'em_progresso' | 'concluida' | 'rejeitada'
  denuncia_categorias: {
    categorias: CategoriaRelacionada | CategoriaRelacionada[] | null
  }[] | null
}

interface DenunciaComCategoria {
  id: string
  titulo: string
  latitude: number | null
  longitude: number | null
  categoria: string
  status: 'pendente' | 'aberta' | 'em_progresso' | 'concluida' | 'rejeitada'
}

const auth = useAuthStore()
const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let markers: L.Marker[] = []

const filtroCategoria = ref<string>('')
const filtroStatus = ref<string>('')

const categoriasDisponiveis = ref<string[]>([])
const statusDisponiveis = ref<string[]>([])

function formatCategoria(categoria: string) {
  const map: Record<string, string> = {
    iluminacao_publica: 'Iluminação Pública',
    saneamento_basico: 'Saneamento Básico',
    limpeza_conservacao: 'Limpeza e Conservação',
    pavimentacao_asfalto: 'Pavimentação/Asfalto',
    seguranca_publica: 'Segurança Pública',
    posto_saude: 'Posto de Saúde',
    outros: 'Outros'
  }
  return map[categoria] || categoria
}

function formatStatus(status: string) {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    aberta: 'Aberta',
    em_progresso: 'Em Progresso',
    concluida: 'Concluída',
    rejeitada: 'Rejeitada'
  }
  return map[status] || status
}

// ✅ Função para gerar ícone SVG por status
function createStatusIcon(status: string): L.DivIcon {
  let color = '#808080' // cinza padrão
  let borderColor = '#666'

  switch (status) {
    case 'pendente':
      color = '#ef4444' // vermelho
      borderColor = '#b91c1c'
      break
    case 'aberta':
    case 'em_progresso':
      color = '#3b82f6' // azul
      borderColor = '#1d4ed8'
      break
    case 'concluida':
      color = '#22c55e' // verde
      borderColor = '#16a34a'
      break
    case 'rejeitada':
      color = '#9ca3af' // cinza claro
      borderColor = '#6b7280'
      break
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path fill="${color}" stroke="${borderColor}" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3" fill="white" stroke="${borderColor}" stroke-width="1"/>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
}

async function loadMapa() {
  if (!mapContainer.value) return

  if (!map) {
    map = L.map(mapContainer.value).setView(
      [mapConfig.center.lat, mapConfig.center.lng],
      mapConfig.zoom
    )

    L.tileLayer(mapConfig.tileLayerUrl, {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    nextTick(() => {
      map?.invalidateSize(true)
    })
  }

  markers.forEach(m => map?.removeLayer(m))
  markers = []

  try {
    // ✅ CORREÇÃO: usar 'data', não 'denuncias'
    const {  data, error } = await supabase
      .from('denuncias')
      .select(`
        id,
        titulo,
        latitude,
        longitude,
        status,
        denuncia_categorias (
          categorias (
            nome
          )
        )
      `)

    if (error) {
      console.error('[MapaAdmin.vue] erro ao carregar denúncias:', error)
      return
    }

    const denunciasComCategoria: DenunciaComCategoria[] = (data || []).map((d: DenunciaRaw) => {
      let categoria = 'outros'
      if (d.denuncia_categorias?.length) {
        const primeira = d.denuncia_categorias[0]
        if (primeira.categorias) {
          if (Array.isArray(primeira.categorias)) {
            categoria = primeira.categorias[0]?.nome || 'outros'
          } else {
            categoria = primeira.categorias.nome || 'outros'
          }
        }
      }
      return {
        id: d.id,
        titulo: d.titulo,
        latitude: d.latitude,
        longitude: d.longitude,
        status: d.status,
        categoria
      }
    })

    categoriasDisponiveis.value = Array.from(
      new Set(denunciasComCategoria.map(d => d.categoria))
    )
    statusDisponiveis.value = Array.from(
      new Set(denunciasComCategoria.map(d => d.status))
    )

    denunciasComCategoria.forEach(d => {
      if (d.latitude != null && d.longitude != null) {
        if ((filtroCategoria.value && d.categoria !== filtroCategoria.value) ||
            (filtroStatus.value && d.status !== filtroStatus.value)) {
          return
        }

        const icon = createStatusIcon(d.status)
        const marker = L.marker([d.latitude, d.longitude], { icon })
          .addTo(map!)
          .bindPopup(`<b>${d.titulo}</b><br>Categoria: ${formatCategoria(d.categoria)}<br>Status: ${formatStatus(d.status)}`)
        markers.push(marker)
      }
    })
  } catch (err) {
    console.error('[MapaAdmin.vue] erro ao carregar denúncias:', err)
  }
}

watch([filtroCategoria, filtroStatus], () => {
  loadMapa()
}, { immediate: true })

onMounted(() => {
  if (auth.user) loadMapa()
})

onUnmounted(() => {
  if (map) {
    markers.forEach(m => map?.removeLayer(m))
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.leaflet-container {
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>