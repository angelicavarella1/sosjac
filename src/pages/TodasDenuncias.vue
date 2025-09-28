<template>
  <div class="flex flex-col w-full max-w-5xl mx-auto p-4">
    <div class="bg-white rounded-xl shadow p-6 mt-6 space-y-6">
      <NavigationButtons />
      <h1 class="text-2xl font-bold mb-4">
        📋 Todas as Denúncias
        <span v-if="filteredStatus" class="text-xl text-royalblue font-medium">
          (Status: {{ formatStatus(filteredStatus) }})
        </span>
      </h1>

      <div v-if="loading" class="text-darkslategray flex justify-center items-center h-32">
        <span class="animate-spin border-4 border-dodgerblue border-t-transparent rounded-full w-8 h-8 mr-2"></span>
        Carregando denúncias...
      </div>

      <div v-else-if="denuncias.length === 0" class="text-darkslategray text-center py-8">
        Nenhuma denúncia registrada com este status.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="d in denuncias"
          :key="d.id"
          @click="verDetalhe(d.id)"
          class="p-4 border border-cornflowerblue rounded cursor-pointer bg-white transition-transform transform hover:-translate-y-2 hover:scale-105 hover:shadow-lg"
        >
          <h2 class="font-bold text-lg mb-2">{{ d.titulo }}</h2>
          <p class="text-darkslategray mb-2 overflow-hidden text-wrap">{{ d.descricao.substring(0, 100) }}...</p>
          <p class="text-sm text-darkslategray mb-1">Categoria: {{ formatCategoria(d.categoria) }}</p>
          <p class="text-sm text-darkslategray">Criado em: {{ formatDate(d.created_at) }}</p>
          <p class="text-sm text-darkslategray">Status: {{ formatStatus(d.status) }}</p>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-6 space-x-2">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border border-cornflowerblue rounded-xl bg-midnightblue text-white hover:bg-darkslateblue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span class="px-3 py-1 border border-cornflowerblue rounded-xl bg-lightsteelblue text-darkslategray">Página {{ page }} de {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-3 py-1 border border-cornflowerblue rounded-xl bg-midnightblue text-white hover:bg-darkslateblue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>

      <div v-if="error" class="text-red-600 mt-4 p-3 bg-mistyrose rounded-xl">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import NavigationButtons from '@/components/NavigationButtons.vue'
import { formatCategoria, formatStatus } from '@/utils/formatters'
import { useAuthStore } from '@/store/useAuthStore'

// ✅ Tipos reutilizáveis — alinhado com DenunciaDetalhe.vue e o banco de dados
type StatusDenuncia = 'pendente' | 'aberta' | 'em_progresso' | 'concluida' | 'rejeitada'

// ✅ Interface atualizada — categoria é derivada, status tipado corretamente
interface Denuncia {
  id: string
  titulo: string
  descricao: string
  // ⚠️ Comentário explicativo: campo derivado da relação N:N
  categoria: string
  status: StatusDenuncia
  created_at: string
  user_id: string
}

const auth = useAuthStore()
const denuncias = ref<Denuncia[]>([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
const perPage = 10
const totalPages = ref(1)
const filteredStatus = ref<string | null>(null)

const router = useRouter()
const route = useRoute()

async function loadDenuncias() {
  loading.value = true
  error.value = ''

  const start = (page.value - 1) * perPage
  const end = start + perPage - 1

  try {
    let query = supabase
      .from('denuncias')
      .select(`
        id,
        titulo,
        descricao,
        status,
        created_at,
        user_id,
        denuncia_categorias (
          categorias (
            nome
          )
        )
      `, { count: 'exact' })

    if (filteredStatus.value) {
      query = query.eq('status', filteredStatus.value)
    }

    const { data, count, error: supaError } = await query
      .order('created_at', { ascending: false })
      .range(start, end)

    if (supaError) throw supaError
    
    // ✅ Extração segura das categorias
    denuncias.value = (data || []).map(d => {
      const categoriasNomes = d.denuncia_categorias
        ?.map((dc: any) => dc.categorias?.nome)
        .filter((nome: string | undefined): nome is string => !!nome) // remove null/undefined
        || []
      
      return {
        ...d,
        categoria: categoriasNomes.length > 0 ? categoriasNomes.join(', ') : 'Sem categoria'
      }
    })
    
    totalPages.value = Math.ceil((count || 0) / perPage)
  } catch (err: any) {
    console.error('[TodasDenuncias.vue] erro:', err)
    error.value = 'Erro ao carregar denúncias.'
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function verDetalhe(id: string) {
  router.push({ name: 'DenunciaDetalhe', params: { id } })
}

function prevPage() {
  if (page.value > 1) {
    page.value--
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
  }
}

watch(() => auth.isLoaded, (isLoaded) => {
  if (isLoaded) {
    if (auth.isAdmin) {
      filteredStatus.value = route.query.status as string || null;
      page.value = 1;
      loadDenuncias();
    } else {
      router.replace('/login');
    }
  }
}, { immediate: true });

watch([() => route.query.status, page], ([newStatus, newPage], [oldStatus, oldPage]) => {
  if (newStatus !== oldStatus) {
    page.value = 1;
    filteredStatus.value = newStatus as string || null;
    loadDenuncias();
  } else if (newPage !== oldPage) {
    loadDenuncias();
  }
});
</script>