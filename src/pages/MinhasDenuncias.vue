<template>
  <AppLayout
    :show-back-button="true"
    :show-logout-button="true"
    title="Minhas Denúncias"
  >
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div v-if="loading" class="text-gray-500 text-center py-10">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando suas denúncias...
        </div>
      </div>

      <div v-else-if="denuncias.length === 0" class="text-gray-600 text-center py-10">
        Você ainda não registrou nenhuma denúncia.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="denuncia in denuncias"
          :key="denuncia.id"
          class="border rounded p-4 hover:shadow cursor-pointer transition"
          @click="verDetalhe(denuncia.id)"
        >
          <h2 class="font-bold text-lg mb-2">{{ denuncia.titulo }}</h2>
          <p class="text-gray-700 mb-2 whitespace-pre-line line-clamp-3">
            {{ denuncia.descricao }}
          </p>
          <p class="text-sm text-gray-500 mb-1">
            Categoria: {{ formatCategoria(denuncia.categoria) }}
          </p>
          <p class="text-sm text-gray-500">
            Criado em: {{ formatDate(denuncia.created_at) }}
          </p>
        </div>
      </div>

      <div v-if="error" class="text-red-600 mt-4 p-3 bg-red-50 rounded text-center">
        {{ error }}
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

// ✅ Correção: id tipado como string
interface Denuncia {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  created_at: string;
}

const denuncias = ref<Denuncia[]>([])
const loading = ref(true)
const error = ref('')
const auth = useAuthStore()
const router = useRouter()

function formatCategoria(categoria: string): string {
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ✅ Correção: id tipado como string
function verDetalhe(id: string) {
  router.push({ name: 'DenunciaDetalhe', params: { id } })
}

async function loadDenuncias() {
  if (!auth.user?.id) {
    error.value = 'Usuário não autenticado.'
    loading.value = false
    return
  }

  try {
    // ✅ Correção: use select com a string de colunas e tipa o resultado
    const { data, error: supaError } = await supabase
      .from('denuncias')
      .select('id, titulo, descricao, categoria, created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (supaError) throw supaError
    
    // ✅ Mapeia os dados para a interface Denuncia, garantindo a consistência do tipo do id
    denuncias.value = (data || []).map((d: any) => ({
      id: d.id,
      titulo: d.titulo,
      descricao: d.descricao,
      categoria: d.categoria,
      created_at: d.created_at,
    }));
  } catch (err: unknown) {
    console.error('[MinhasDenuncias.vue] Erro ao carregar denúncias:', err)
    error.value = 'Erro ao carregar suas denúncias. Tente novamente.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDenuncias()
})
</script>