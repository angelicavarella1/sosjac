<template>
  <AppLayout
    :show-back-button="true"
    :show-logout-button="true"
    :title="denuncia.titulo || 'Detalhe da Denúncia'"
  >
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div v-if="loading" class="text-gray-500 text-center">
        Carregando detalhes...
      </div>
      <div v-else-if="error" class="text-red-600 text-center p-4 bg-red-50 rounded">
        {{ error }}
      </div>
      <div v-else>
        <p class="text-gray-700 mb-2">
          <strong>Categoria:</strong> {{ denuncia.categoria }}
        </p>
        <p class="text-gray-700 mb-4 whitespace-pre-line">
          <strong>Descrição:</strong> {{ denuncia.descricao }}
        </p>
        <p class="text-gray-500 mb-4">
          <strong>Data de criação:</strong>
          {{ new Date(denuncia.created_at).toLocaleString() }}
        </p>

        <div v-if="denuncia.latitude !== null && denuncia.longitude !== null" class="h-64 w-full mb-4">
          <div ref="mapContainer" class="h-full w-full rounded"></div>
        </div>

        <div v-if="midias.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(item, index) in midias" :key="index">
            <img
              v-if="item.tipo.startsWith('image/')"
              :src="item.url_publica"
              class="w-full rounded object-cover"
              :alt="`Mídia ${index + 1} da denúncia`"
            />
            <video v-else controls class="w-full rounded" :title="`Vídeo ${index + 1}`">
              <source :src="item.url_publica" :type="item.tipo" />
              Seu navegador não suporta este vídeo.
            </video>
          </div>
        </div>
        <div v-else class="text-gray-600 py-4">Nenhuma mídia disponível.</div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import L, { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/api/supabaseClient'
import mapConfig from '@/config/mapConfig'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

interface Denuncia {
  id: string
  titulo: string
  categoria: string
  descricao: string
  latitude: number | null
  longitude: number | null
  created_at: string
}

interface Midia {
  id: string
  denuncia_id: string
  url_publica: string
  tipo: string
}

const route = useRoute()
const loading = ref(true)
const error = ref('')
const denuncia = ref<Denuncia | null>(null) // ✅ Mudado para null
const midias = ref<Midia[]>([])
const mapContainer = ref<HTMLDivElement | null>(null)

let mapInstance: LeafletMap | null = null

// ✅ Melhoria: Lógica de inicialização do mapa em uma função separada
const initMap = (lat: number, lng: number, title: string) => {
  if (mapContainer.value) {
    mapInstance = L.map(mapContainer.value).setView([lat, lng], mapConfig.zoom)

    L.tileLayer(mapConfig.tileLayerUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance)

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
      iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
      shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    });

    L.marker([lat, lng])
      .addTo(mapInstance)
      .bindPopup(title || 'Local da denúncia');
  }
}

// ✅ Melhoria: Lógica de carregamento de dados separada
async function loadData() {
  const denunciaId = route.params.id as string;
  try {
    const { data: denunciaData, error: denunciaError } = await supabase
      .from('denuncias')
      .select('*')
      .eq('id', denunciaId)
      .single();

    if (denunciaError || !denunciaData) {
      error.value = 'Denúncia não encontrada ou erro ao carregar.';
      return;
    }
    
    denuncia.value = denunciaData as Denuncia;

    const { data: midiasData, error: midiasError } = await supabase
      .from('fotos_videos')
      .select('*')
      .eq('denuncia_id', denuncia.value.id);

    if (midiasError) throw midiasError;
    midias.value = (midiasData || []) as Midia[];

  } catch (err: unknown) {
    console.error('[DenunciaDetalhe.vue] Erro ao carregar dados:', err);
    if (!error.value) error.value = 'Erro ao carregar os dados da denúncia.';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadData();
  if (denuncia.value && denuncia.value.latitude !== null && denuncia.value.longitude !== null) {
    initMap(denuncia.value.latitude, denuncia.value.longitude, denuncia.value.titulo);
  }
});

// ✅ Melhoria: Limpar o mapa ao sair da página
onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
  }
});
</script>

<style scoped>
video {
  max-height: 300px;
  width: 100%;
  object-fit: cover;
  background: #000;
}
</style>