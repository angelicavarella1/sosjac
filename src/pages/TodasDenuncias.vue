<template>
  <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
    <!-- Botões de navegação -->
    <NavigationButtons />

    <h1 class="text-2xl font-bold mb-4">📋 Todas as Denúncias</h1>

    <div v-if="loading" class="text-gray-500">Carregando todas as denúncias...</div>
    <div v-else-if="denuncias.length === 0" class="text-gray-600">Nenhuma denúncia registrada até o momento.</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="d in denuncias" :key="d.id" class="border rounded p-4 hover:shadow cursor-pointer" @click="verDetalhe(d.id)">
        <h2 class="font-bold text-lg mb-2">{{ d.titulo }}</h2>
        <p class="text-gray-700 mb-2 whitespace-pre-line">{{ d.descricao.substring(0,100) }}...</p>
        <p class="text-sm text-gray-500 mb-1">Categoria: {{ formatCategoria(d.categoria) }}</p>
        <p class="text-sm text-gray-500">Criado em: {{ formatDate(d.created_at) }}</p>
      </div>
    </div>

    <div class="flex justify-center mt-6 space-x-2">
      <button @click="prevPage" :disabled="page===1" class="px-3 py-1 border rounded hover:bg-gray-100">Anterior</button>
      <span class="px-3 py-1 border rounded">Página {{ page }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page===totalPages" class="px-3 py-1 border rounded hover:bg-gray-100">Próxima</button>
    </div>

    <div v-if="error" class="text-red-600 mt-4 p-3 bg-red-50 rounded">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import NavigationButtons from '@/components/NavigationButtons.vue'

interface Denuncia { id:string; titulo:string; descricao:string; categoria:string; created_at:string }

const denuncias = ref<Denuncia[]>([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
const perPage = 10
const totalPages = ref(1)
const router = useRouter()

function formatCategoria(cat:string) {
  const map: Record<string,string> = {
    iluminacao_publica:'Iluminação Pública',
    saneamento_basico:'Saneamento Básico',
    limpeza_conservacao:'Limpeza e Conservação',
    pavimentacao_asfalto:'Pavimentação/Asfalto',
    seguranca_publica:'Segurança Pública',
    posto_saude:'Posto de Saúde',
    outros:'Outros'
  }
  return map[cat] || cat
}

function formatDate(dateStr:string) {
  return new Date(dateStr).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})
}

function verDetalhe(id:string){ router.push({ name:'DenunciaDetalhe', params:{id} }) }
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<totalPages.value) page.value++ }

async function loadDenuncias() {
  loading.value = true
  error.value = ''
  const start=(page.value-1)*perPage
  const end=start+perPage-1
  try {
    const { data,count,error: supaError } = await supabase.from('denuncias').select('*',{ count:'exact' }).order('created_at',{ ascending:false }).range(start,end)
    if(supaError) throw supaError
    denuncias.value = data || []
    totalPages.value = Math.ceil((count||0)/perPage)
  } catch(err) {
    console.error('[TodasDenuncias.vue] erro:', err)
    error.value='Erro ao carregar denúncias.'
  } finally { loading.value=false }
}

watch(page, loadDenuncias)
onMounted(loadDenuncias)
</script>
