<template>
  <div class="flex-1 w-full max-w-4xl mx-auto p-4 mt-6">
    <div v-if="auth.loading || !auth.user" class="flex justify-center items-center h-96">
      <span class="animate-spin border-4 border-dodgerblue border-t-transparent rounded-full w-12 h-12"></span>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md p-6 mt-6 space-y-6">
      <NavigationButtons />

      <form @submit.prevent="submitForm" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block mb-1 font-medium">Título</label>
            <input
              v-model="titulo"
              type="text"
              required
              placeholder="Informe um título"
              class="w-full px-4 py-2 border border-cornflowerblue rounded-xl focus:outline-none focus:ring-2 focus:ring-dodgerblue"
            />
          </div>

          <div>
            <label class="block mb-1 font-medium">Categoria</label>
            <select
              v-model="categoria"
              required
              class="w-full px-4 py-2 border border-cornflowerblue rounded-xl focus:outline-none focus:ring-2 focus:ring-dodgerblue"
            >
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
            <p class="mt-1 text-xs text-slategray">
              Por favor, descreva o problema com o máximo de detalhes possível, incluindo referências e características do local.
            </p>
            <textarea
              v-model="descricao"
              rows="6"
              required
              placeholder="Descreva a denúncia detalhadamente"
              class="w-full px-4 py-2 border border-cornflowerblue rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-dodgerblue"
            ></textarea>
          </div>

          <div>
            <label class="block mb-1 font-medium">Endereço</label>
            <input
              v-model="endereco"
              type="text"
              required
              placeholder="Clique no mapa para preencher o endereço"
              class="w-full px-4 py-2 border border-cornflowerblue rounded-xl focus:outline-none focus:ring-2 focus:ring-dodgerblue"
              readonly
            />
          </div>
          
          <!-- ✅ NOVO CAMPO: Complemento de Endereço (não obrigatório) -->
          <div>
            <label class="block mb-1 font-medium">Complemento de Endereço (opcional)</label>
            <input
              v-model="complementoEndereco"
              type="text"
              placeholder="Ex: Próximo à padaria, Apto 101, Fundos"
              class="w-full px-4 py-2 border border-cornflowerblue rounded-xl focus:outline-none focus:ring-2 focus:ring-dodgerblue"
            />
          </div>
          <!-- FIM NOVO CAMPO -->

        </div>

        <div class="min-h-64 w-full relative mb-8">
          <Map v-model="posicao" @update:endereco="atualizarEndereco" />
          <p class="text-sm text-darkslategray mt-2">
            Clique no mapa ou arraste o marcador para marcar a localização da denúncia.
          </p>
        </div>

        <div class="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 mb-6">
          <div class="flex-1">
            <p class="text-sm text-darkslategray mt-1">
              Coordenadas: {{ posicao.lat.toFixed(6) }}, {{ posicao.lng.toFixed(6) }}
            </p>
            <button
              type="button"
              @click="usarMinhaLocalizacao"
              class="mt-2 px-4 py-2 bg-steelblue text-white rounded-xl hover:bg-royalblue font-semibold transition transform hover:scale-105"
            >
              Usar minha localização
            </button>
          </div>
          <div class="flex-1">
            <label class="block mb-1 font-medium">Fotos/Vídeos (opcional)</label>
            <input
              type="file"
              multiple
              @change="handleFiles"
              accept="image/*,video/*"
              class="block w-full text-sm text-darkslategray border border-cornflowerblue rounded-xl p-2 cursor-pointer"
            />
            <div v-if="midiasPreview.length" class="mt-2 text-sm text-darkslategray">
              Arquivos selecionados:
              <ul class="list-disc list-inside">
                <li v-for="(item, index) in midiasPreview" :key="index">{{ item.file?.name }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="midiasPreview.length" class="mt-4">
          <h2 class="font-semibold text-lg mb-2">Pré-visualização de mídias</h2>
          <ul class="flex flex-wrap gap-4">
            <li v-for="(item, i) in midiasPreview" :key="i">
              <template v-if="item.tipo === 'foto'">
                <img :src="item.url" alt="Foto denúncia" class="w-32 rounded-xl shadow" />
              </template>
              <template v-else-if="item.tipo === 'video'">
                <video controls class="w-32 rounded-xl shadow">
                  <source :src="item.url" :type="item.file?.type" />
                </video>
              </template>
            </li>
          </ul>
        </div>

        <div v-if="error" class="text-red-600 p-3 bg-mistyrose rounded-xl">{{ error }}</div>
        <div v-if="success" class="text-mediumaquamarine p-3 bg-mintcream rounded-xl">{{ success }}</div>

        <div class="mt-4">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-mediumaquamarine text-white py-2 rounded-xl hover:bg-aquamarine font-semibold text-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Enviando... ⏳</span>
            <span v-else>Enviar Denúncia</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import Map from '@/components/Map.vue'
import NavigationButtons from '@/components/NavigationButtons.vue'
import { supabase } from '@/api/supabaseClient'
import mapConfig from '@/config/mapConfig'

interface Position { lat: number; lng: number }
interface MidiaPreview { url: string; tipo: 'foto' | 'video'; file?: File }
interface GeolocationAddress { rua?: string; numero?: string; bairro?: string; cidade?: string; estado?: string; cep?: string; pais?: string }

const auth = useAuthStore()
const router = useRouter()
const titulo = ref('')
const categoria = ref('')
const descricao = ref('')
const endereco = ref('')
// ✅ NOVO ESTADO: Adicionado campo para o complemento
const complementoEndereco = ref('') 
const posicao = ref<Position>({ lat: mapConfig.center.lat, lng: mapConfig.center.lng })
const files = ref<File[]>([])
const midiasPreview = ref<MidiaPreview[]>([])
const error = ref('')
const success = ref('')
const isSubmitting = ref(false)
const rua = ref(''), numero = ref(''), bairro = ref(''), cidade = ref(''), estado = ref(''), cep = ref(''), pais = ref('')

function handleFiles(event: Event) {
  midiasPreview.value.forEach(item => URL.revokeObjectURL(item.url))
  const target = event.target as HTMLInputElement
  if (!target.files) return
  files.value = Array.from(target.files)
  midiasPreview.value = files.value.map(file => ({
    url: URL.createObjectURL(file),
    tipo: file.type.startsWith('image') ? 'foto' : 'video',
    file
  }))
}

function usarMinhaLocalizacao() {
  if (!navigator.geolocation) return alert('Geolocalização não suportada.')
  navigator.geolocation.getCurrentPosition(
    pos => posicao.value = { lat: pos.coords.latitude, lng: pos.coords.longitude },
    err => alert(err.code === 1 ? 'Permissão negada.' : 'Não foi possível obter localização.'),
    { timeout: 10000, maximumAge: 60000 }
  )
}

function atualizarEndereco(e: GeolocationAddress) {
  rua.value = e.rua || ''
  numero.value = e.numero || ''
  bairro.value = e.bairro || ''
  cidade.value = e.cidade || ''
  estado.value = e.estado || ''
  cep.value = e.cep || ''
  pais.value = e.pais || ''
  endereco.value = [rua.value, numero.value, bairro.value, cidade.value, estado.value, cep.value, pais.value].filter(Boolean).join(', ')
  // Se você quiser limpar o complemento toda vez que o endereço principal é alterado, descomente a linha abaixo
  // complementoEndereco.value = '' 
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
    // 1. Cria a denúncia (incluindo o novo campo 'complemento')
    const { data: denunciaData, error: denunciaError } = await supabase.from('denuncias').insert({
      titulo: titulo.value,
      descricao: descricao.value,
      status: 'pendente',
      latitude: posicao.value.lat,
      longitude: posicao.value.lng,
      // ✅ INCLUÍDO NO PAYLOAD: Complemento
      endereco: endereco.value + (complementoEndereco.value ? `, ${complementoEndereco.value}` : ''),
      complemento: complementoEndereco.value, 
      user_id: auth.user!.id
    }).select().single()
    if (denunciaError) throw denunciaError

    // 2. Busca o ID da categoria na tabela `categorias`
    const { data: categoriaData, error: categoriaError } = await supabase
      .from('categorias')
      .select('id')
      .eq('nome', categoria.value) // Busca pelo nome da categoria
      .single()
    if (categoriaError) throw new Error(`Categoria '${categoria.value}' não encontrada.`)

    // 3. Insere o relacionamento na tabela `denuncia_categorias`
    const { error: relacaoError } = await supabase
      .from('denuncia_categorias')
      .insert({
        denuncia_id: denunciaData.id,
        categoria_id: categoriaData.id
      })
    if (relacaoError) throw relacaoError

    // 4. Upload de arquivos 
    for (const file of files.value) {
      const ext = file.name.split('.').pop()
      const fileName = `${denunciaData.id}/${crypto.randomUUID()}.${ext}`
      
      const { error: uploadError } = await supabase.storage.from('fotos_videos').upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      await supabase.from('fotos_videos').insert({
        denuncia_id: denunciaData.id,
        caminho: fileName,
        tipo: file.type.startsWith('image') ? 'foto' : 'video'
      })
    }

    success.value = 'Denúncia enviada com sucesso!'
    router.push({ name: 'DenunciaDetalhe', params: { id: denunciaData.id } })

  } catch (err: any) {
    console.error(err)
    error.value = 'Erro ao enviar denúncia: ' + (err.message || err)
  } finally {
    isSubmitting.value = false
  }
}

onBeforeUnmount(() => midiasPreview.value.forEach(item => URL.revokeObjectURL(item.url)))
</script>

<style scoped>
img, video { max-width: 100%; display: block; }
input, select, textarea, button { transition: all 0.2s ease; }
.rounded-xl { border-radius: 0.75rem; }
</style>
