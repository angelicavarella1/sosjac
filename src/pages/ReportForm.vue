<template>
  <AppLayout
    :show-back-button="true"
    :show-logout-button="true"
    title="Registrar Denúncia"
  >
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Título</label>
          <input
            v-model="titulo"
            type="text"
            required
            placeholder="Informe um título"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block mb-1 font-medium">Categoria</label>
          <select
            v-model="categoria"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <textarea
            v-model="descricao"
            rows="6"
            required
            placeholder="Descreva a denúncia detalhadamente"
            class="w-full px-3 py-2 border rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="h-64 w-full relative mb-2">
          <Map v-model="posicao" />
          <p class="text-sm text-gray-500 mt-2">
            Clique no mapa para marcar a localização da denúncia.
          </p>
        </div>

        <div class="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div class="flex-1">
            <p class="text-sm text-gray-700 mt-1">
              Coordenadas: {{ posicao.lat.toFixed(6) }}, {{ posicao.lng.toFixed(6) }}
            </p>
            <button
              type="button"
              @click="usarMinhaLocalizacao"
              class="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
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
              class="block w-full text-sm text-gray-700 border rounded p-1 cursor-pointer"
            />
            <div v-if="files.length" class="mt-2 text-sm text-gray-600">
              Arquivos selecionados:
              <ul class="list-disc list-inside">
                <li v-for="(file, index) in files" :key="index">{{ file.name }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="error" class="text-red-600 p-3 bg-red-50 rounded">{{ error }}</div>
        <div v-if="success" class="text-green-600 p-3 bg-green-50 rounded">{{ success }}</div>

        <div class="mt-4">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Enviando... ⏳</span>
            <span v-else>Enviar Denúncia</span>
          </button>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import Map from '@/components/Map.vue'
import AppLayout from '@/components/AppLayout.vue'

interface Position { lat: number; lng: number }

const titulo = ref('')
const categoria = ref('')
const descricao = ref('')
const posicao = ref<Position>({ lat: -22.956633, lng: -42.952338 })
const files = ref<File[]>([])
const error = ref('')
const success = ref('')
const isSubmitting = ref(false)

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (!auth.user) await router.replace('/login')
})

function handleFiles(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files) return
  files.value = Array.from(target.files)
}

function usarMinhaLocalizacao() {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada pelo navegador.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      posicao.value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }
    },
    (err) => {
      if (err.code === 1) {
        alert('Permissão de localização negada. Por favor, ative nas configurações do navegador.')
      } else {
        alert('Não foi possível obter sua localização. Tente novamente.')
      }
    },
    {
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

async function submitForm() {
  error.value = ''
  success.value = ''

  if (!titulo.value.trim() || !categoria.value || !descricao.value.trim()) {
    error.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  if (!auth.user) {
    error.value = 'Usuário não autenticado. Faça login novamente.'
    return
  }

  isSubmitting.value = true

  try {
    const { data: denuncia, error: insertError } = await supabase
      .from('denuncias')
      .insert([{
        titulo: titulo.value.trim(),
        categoria: categoria.value,
        descricao: descricao.value.trim(),
        latitude: posicao.value.lat,
        longitude: posicao.value.lng,
        user_id: auth.user.id
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // ✅ Otimização: Upload de mídias em paralelo
    if (files.value.length > 0) {
      const uploadPromises = files.value.map(file => {
        const fileName = `${Date.now()}_${file.name}`;
        return supabase.storage.from('fotos-denuncias').upload(fileName, file);
      });

      const uploadResults = await Promise.all(uploadPromises);
      let errosUpload = 0;

      for (const [index, result] of uploadResults.entries()) {
        if (result.error) {
          console.error(`[ReportForm] Falha ao fazer upload de ${files.value[index].name}:`, result.error);
          errosUpload++;
          continue;
        }

        const urlPublica = supabase.storage.from('fotos-denuncias').getPublicUrl(result.data.path).data.publicUrl;
        const { error: insertMediaError } = await supabase.from('fotos_videos').insert([{
          denuncia_id: denuncia.id,
          url_publica: urlPublica,
          tipo: files.value[index].type
        }]);

        if (insertMediaError) {
          console.error(`[ReportForm] Falha ao registrar mídia no banco:`, insertMediaError);
          errosUpload++;
        }
      }

      if (errosUpload > 0) {
        error.value = `Atenção: ${errosUpload} mídia(s) não foram enviadas. Denúncia registrada com sucesso.`
      }
    }

    success.value = 'Denúncia enviada com sucesso!'
    setTimeout(() => {
      router.replace('/minhas-denuncias')
    }, 1500)
  } catch (err) {
    console.error('[ReportForm] Erro ao enviar denúncia:', err)
    error.value = 'Erro ao enviar denúncia. Verifique sua conexão e tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>