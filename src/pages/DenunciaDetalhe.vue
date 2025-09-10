<template>
  <!-- Botões de navegação -->
  <NavigationButtons />

  <!-- Loading -->
  <div v-if="auth.loading || !auth.user || loading" class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <p class="text-xl text-gray-700 font-semibold">Carregando denúncia...</p>
    <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <!-- Conteúdo da denúncia -->
  <div v-else class="max-w-4xl mx-auto p-6 bg-white rounded shadow-md mt-6 space-y-4">
    <h1 class="text-2xl font-bold mb-2">{{ denuncia?.titulo }}</h1>
    <p class="text-gray-700">{{ denuncia?.descricao }}</p>
    <p class="text-sm text-gray-500">Categoria: {{ formatCategoria(denuncia?.categoria) }}</p>
    <p class="text-sm text-gray-500">Criado em: {{ formatDate(denuncia?.created_at) }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'

interface Denuncia { id: string; titulo: string; descricao: string; categoria: string; created_at: string }

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const denuncia = ref<Denuncia | null>(null)
const loading = ref(true)

function formatCategoria(cat: string | undefined) {
  if (!cat) return ''
  const map: Record<string,string> = {
    iluminacao_publica: 'Iluminação Pública',
    saneamento_basico: 'Saneamento Básico',
    limpeza_conservacao: 'Limpeza e Conservação',
    pavimentacao_asfalto: 'Pavimentação/Asfalto',
    seguranca_publica: 'Segurança Pública',
    posto_saude: 'Posto de Saúde',
    outros: 'Outros'
  }
  return map[cat] || cat
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

async function loadDenuncia() {
  if (!auth.user) return
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('denuncias')
      .select('*')
      .eq('id', route.params.id)
      .single()
    if (error) throw error
    denuncia.value = data
  } catch (err) {
    console.error('[DenunciaDetalhe.vue] erro:', err)
    router.push({ name: 'MinhasDenuncias' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if(auth.user) loadDenuncia()
  else router.replace('/login')
})
</script>
