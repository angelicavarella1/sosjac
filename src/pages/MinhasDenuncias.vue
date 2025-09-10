<template>
  <!-- Botões de navegação -->
  <NavigationButtons />

  <!-- Loading -->
  <div v-if="auth.loading || !auth.user" class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <p class="text-xl text-gray-700 font-semibold">Carregando suas denúncias...</p>
    <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <!-- Conteúdo -->
  <div v-else class="max-w-5xl mx-auto p-6 bg-white rounded shadow-md mt-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4 text-center">Minhas Denúncias</h1>

    <div v-if="loading" class="text-gray-500 text-center">Carregando...</div>
    <div v-else-if="denuncias.length === 0" class="text-gray-600 text-center">Você ainda não registrou nenhuma denúncia.</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="denuncia in denuncias" :key="denuncia.id"
           class="border rounded p-4 hover:shadow-lg cursor-pointer transition transform hover:scale-105"
           @click="verDetalhe(denuncia.id)">
        <h2 class="font-bold text-lg mb-2">{{ denuncia.titulo }}</h2>
        <p class="text-gray-700 mb-2 whitespace-pre-line">{{ denuncia.descricao.substring(0,100) }}...</p>
        <p class="text-sm text-gray-500">Categoria: {{ formatCategoria(denuncia.categoria) }}</p>
        <p class="text-sm text-gray-500">Criado em: {{ formatDate(denuncia.created_at) }}</p>
      </div>
    </div>

    <div v-if="error" class="text-red-600 mt-4 p-3 bg-red-50 rounded text-center">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'

interface Denuncia { 
  id: string; 
  titulo: string; 
  descricao: string; 
  categoria: string; 
  created_at: string 
}

const auth = useAuthStore()
const router = useRouter()
const denuncias = ref<Denuncia[]>([])
const loading = ref(true)
const error = ref('')

function formatCategoria(categoria: string) {
  const map: Record<string,string> = {
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

function verDetalhe(id: string) { router.push({ name: 'DenunciaDetalhe', params: { id } }) }

async function loadDenuncias() {
  if (!auth.user) return
  loading.value = true
  error.value = ''
  try {
    const { data, error: supaError } = await supabase
      .from('denuncias')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending:false })
    if (supaError) throw supaError
    denuncias.value = data || []
  } catch (err) {
    console.error('[MinhasDenuncias.vue] erro:', err)
    error.value = 'Erro ao carregar suas denúncias.'
  } finally {
    loading.value = false
  }
}

onMounted(() => { 
  if(auth.user) loadDenuncias()
  else router.replace('/login')
})
</script>
