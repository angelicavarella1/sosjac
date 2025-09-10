<template>
  <!-- Botões de navegação -->
  <NavigationButtons :disable-back="true" />

  <!-- Loading -->
  <div v-if="auth.loading || !auth.user" class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <p class="text-xl text-gray-700 font-semibold">Carregando o formulário...</p>
    <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <!-- Formulário -->
  <div v-else class="max-w-4xl mx-auto p-6 bg-white rounded shadow-md mt-6 space-y-6">
    <form @submit.prevent="submitForm" class="space-y-6">

      <!-- Campos de formulário -->
      <div class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Título</label>
          <input v-model="titulo" type="text" required placeholder="Informe um título"
                 class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div>
          <label class="block mb-1 font-medium">Categoria</label>
          <select v-model="categoria" required
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="" disabled>Selecione uma categoria</option>
            <option value="iluminacao_publica">Iluminação Pública</option>
            <option value="saneamento_basico">Saneamento Básico</option>
            <option value="limpeza_conservacao">Limpeza e Conservação</option>
            <option value="pavimentacao_asfalto">Pavimentação/Asfalto</option>
            <option value="seguranca_publica">Segurança Pública</option>
            <option value="posto_saude">Posto de Saúde</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div>
          <label class="block mb-1 font-medium">Descrição</label>
          <textarea v-model="descricao" rows="6" required placeholder="Descreva a denúncia detalhadamente"
                    class="w-full px-3 py-2 border rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <div>
          <label class="block mb-1 font-medium">Endereço</label>
          <input v-model="endereco" type="text" required placeholder="Clique no mapa para preencher o endereço"
                 class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" readonly/>
        </div>
      </div>

      <!-- Mapa -->
      <div class="h-72 w-full relative mb-8">
        <Map v-model="posicao" @update:endereco="endereco = $event"/>
        <p class="text-sm text-gray-500 mt-2">Clique no mapa ou arraste o marcador para marcar a localização da denúncia.</p>
      </div>

      <!-- Coordenadas e arquivos -->
      <div class="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 mb-6">
        <div class="flex-1">
          <p class="text-sm text-gray-700 mt-1">Coordenadas: {{ posicao.lat.toFixed(6) }}, {{ posicao.lng.toFixed(6) }}</p>
          <button type="button" @click="usarMinhaLocalizacao"
                  class="mt-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition transform hover:scale-105">
            Usar minha localização
          </button>
        </div>

        <div class="flex-1">
          <label class="block mb-1 font-medium">Fotos/Vídeos (opcional)</label>
          <input type="file" multiple @change="handleFiles"
                 accept="image/*,video/*"
                 class="block w-full text-sm text-gray-700 border rounded p-1 cursor-pointer"/>
          <div v-if="files.length" class="mt-2 text-sm text-gray-600">
            Arquivos selecionados:
            <ul class="list-disc list-inside">
              <li v-for="(file, index) in files" :key="index">{{ file.name }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Mensagens -->
      <div v-if="error" class="text-red-600 p-3 bg-red-50 rounded">{{ error }}</div>
      <div v-if="success" class="text-green-600 p-3 bg-green-50 rounded">{{ success }}</div>

      <!-- Botão enviar -->
      <div class="mt-4">
        <button type="submit" :disabled="isSubmitting"
                class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold text-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="isSubmitting">Enviando... ⏳</span>
          <span v-else>Enviar Denúncia</span>
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import Map from '@/components/Map.vue'
import NavigationButtons from '@/components/NavigationButtons.vue'
import { supabase } from '@/api/supabaseClient'

interface Position { lat: number; lng: number }

const auth = useAuthStore()
const router = useRouter()

const titulo = ref('')
const categoria = ref('')
const descricao = ref('')
const endereco = ref('')
const posicao = ref<Position>({ lat: -22.956633, lng: -42.952338 })
const files = ref<File[]>([])
const error = ref('')
const success = ref('')
const isSubmitting = ref(false)

onMounted(async () => {
  if (!auth.user) await router.replace('/login')
})

function handleFiles(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files) return
  files.value = Array.from(target.files)
}

function usarMinhaLocalizacao() {
  if (!navigator.geolocation) { alert('Geolocalização não suportada.'); return }
  navigator.geolocation.getCurrentPosition(
    pos => { posicao.value = { lat: pos.coords.latitude, lng: pos.coords.longitude } },
    err => { alert(err.code === 1 ? 'Permissão negada.' : 'Não foi possível obter localização.') },
    { timeout: 10000, maximumAge: 60000 }
  )
}

async function submitForm() {
  if (!titulo.value || !categoria.value || !descricao.value || !endereco.value) {
    error.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  isSubmitting.value = true
  error.value = ''
  success.value = ''

  try {
    // Inserir denúncia na tabela 'denuncias'
    const { data: denunciaData, error: denunciaError } = await supabase
      .from('denuncias')
      .insert({
        user_id: auth.user.id,
        titulo: titulo.value,
        descricao: descricao.value,
        categoria: categoria.value,
        status: 'registrado',
        latitude: posicao.value.lat,
        longitude: posicao.value.lng,
        endereco: endereco.value
      })
      .select()
      .single()

    if (denunciaError) throw denunciaError

    // Upload de arquivos no bucket 'fotos_videos' e registro na tabela 'fotos_videos'
    for (const file of files.value) {
      const ext = file.name.split('.').pop()
      const fileName = `${denunciaData.id}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('fotos_videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      await supabase.from('fotos_videos').insert({
        denuncia_id: denunciaData.id,
        path: fileName,
        tipo: file.type.startsWith('image') ? 'imagem' : 'video'
      })
    }

    success.value = 'Denúncia enviada com sucesso!'
    titulo.value = ''
    categoria.value = ''
    descricao.value = ''
    endereco.value = ''
    files.value = []

  } catch (err: any) {
    console.error(err)
    error.value = 'Erro ao enviar denúncia: ' + (err.message || err)
  } finally {
    isSubmitting.value = false
  }
}
</script>
