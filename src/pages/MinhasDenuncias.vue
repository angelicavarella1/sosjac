<template>
  <div class="flex flex-col w-full max-w-5xl mx-auto p-4">
    <div class="bg-white rounded-xl shadow p-6 mt-6 space-y-6">
      <NavigationButtons />
      <h1 class="text-2xl font-bold mb-4">📋 Minhas Denúncias</h1>

      <div v-if="loading" class="text-darkslategray flex justify-center items-center h-32">
        <span class="animate-spin border-4 border-dodgerblue border-t-transparent rounded-full w-8 h-8 mr-2"></span>
        Carregando suas denúncias...
      </div>

      <div v-else-if="denuncias.length === 0" class="text-darkslategray text-center py-8">
        Você ainda não fez nenhuma denúncia.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="d in denuncias"
          :key="d.id"
          class="p-4 border border-cornflowerblue rounded bg-white transition-transform transform hover:-translate-y-2 hover:scale-105 hover:shadow-lg"
        >
          <h2 class="font-bold text-lg mb-2">{{ d.titulo }}</h2>
          <p class="text-darkslategray mb-2 overflow-hidden text-wrap">{{ d.descricao.substring(0, 100) }}...</p>
          <p class="text-sm text-darkslategray mb-1">Categoria: {{ formatCategoria(d.categoria) }}</p>
          <p class="text-sm text-darkslategray">Criado em: {{ formatDate(d.created_at) }}</p>
          <p class="text-sm text-darkslategray">Status: {{ formatStatus(d.status) }}</p>

          <div class="mt-3 flex justify-between">
            <button
              @click="verDetalhe(d.id)"
              class="text-royalblue hover:text-navy text-sm font-medium"
            >
              Ver Detalhes
            </button>
            <!-- ✅ REMOVIDO: "Enviar Email" não aparece nas minhas denúncias -->
          </div>
        </div>
      </div>

      <div v-if="error" class="text-red-600 mt-4 p-3 bg-mistyrose rounded-xl">{{ error }}</div>
    </div>

    <!-- ❌ REMOVIDO: Modal de e-mail não é usado aqui -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import NavigationButtons from '@/components/NavigationButtons.vue'
// ❌ REMOVIDO: EnviarEmailModal não é usado aqui
import { formatCategoria, formatStatus } from '@/utils/formatters'
import { useAuthStore } from '@/store/useAuthStore'

// ✅ Denuncia.id agora é string (UUID do Supabase)
interface Denuncia {
  id: string
  titulo: string
  descricao: string
  categoria: string
  status: 'pendente' | 'aberta' | 'em_progresso' | 'concluida' | 'rejeitada'
  created_at: string
  user_id: string
  autor_nome?: string
}

const auth = useAuthStore()
const denuncias = ref<Denuncia[]>([])
const loading = ref(true)
const error = ref('')
const router = useRouter()
const route = useRoute()

// ❌ REMOVIDO: refs de modal de e-mail
// const showEmailModal = ref(false)
// const denunciaSelecionada = ref<Denuncia | null>(null)

async function loadDenuncias() {
  if (!auth.user?.id) return

  loading.value = true
  error.value = ''

  try {
    const { data, error: supaError } = await supabase
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
      `)
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (supaError) throw supaError

    denuncias.value = (data || []).map(d => {
      const categoriasNomes = d.denuncia_categorias
        ?.map((dc: any) => dc.categorias?.nome)
        .filter((nome: string | undefined): nome is string => !!nome)
        || []

      return {
        ...d,
        id: d.id.toString(),
        categoria: categoriasNomes.length > 0 ? categoriasNomes.join(', ') : 'Sem categoria'
      }
    })
  } catch (err: any) {
    console.error('[MinhasDenuncias.vue] erro:', err)
    error.value = 'Erro ao carregar suas denúncias.'
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

// ❌ REMOVIDO: openEmailModal

// Segurança: só carrega quando auth está pronto
onMounted(() => {
  if (auth.isLoaded) {
    loadDenuncias()
  } else {
    const unwatch = watch(() => auth.isLoaded, (isLoaded: boolean) => {
      if (isLoaded) {
        loadDenuncias()
        unwatch()
      }
    })
  }
})
</script>