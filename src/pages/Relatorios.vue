<template>
  <AppLayout title="Relatórios de Denúncias" :showBackButton="true" :showLogoutButton="true">
    <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div class="mb-4">
        <label class="block mb-1 font-medium">Filtrar por Usuário:</label>
        <select v-model="filtroUsuario" @change="loadDenuncias" class="w-full px-3 py-2 border rounded">
          <option value="">Todos</option>
          <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.nome }}</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Filtrar por Categoria:</label>
        <select v-model="filtroCategoria" @change="loadDenuncias" class="w-full px-3 py-2 border rounded">
          <option value="">Todas</option>
          <option value="iluminacao_publica">Iluminação Pública</option>
          <option value="saneamento_basico">Saneamento Básico</option>
          <option value="limpeza_conservacao">Limpeza e Conservação</option>
          <option value="pavimentacao_asfalto">Pavimentação/Asfalto</option>
          <option value="seguranca_publica">Segurança Pública</option>
          <option value="posto_saude">Posto de Saúde</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-2">
        <div>
          <label class="block mb-1 font-medium">Data Inicial:</label>
          <input type="date" v-model="filtroDataInicio" @change="loadDenuncias" class="w-full px-3 py-2 border rounded">
        </div>
        <div>
          <label class="block mb-1 font-medium">Data Final:</label>
          <input type="date" v-model="filtroDataFim" @change="loadDenuncias" class="w-full px-3 py-2 border rounded">
        </div>
      </div>

      <div v-if="denuncias.length === 0" class="text-gray-600">Nenhuma denúncia encontrada.</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="denuncia in denuncias" :key="denuncia.id" class="border rounded p-4 hover:shadow cursor-pointer" @click="verDetalhe(denuncia.id)">
          <h2 class="font-bold text-lg mb-1">{{ denuncia.titulo }}</h2>
          <p class="text-gray-700 mb-2">{{ denuncia.descricao.substring(0, 100) }}...</p>
          <p class="text-sm text-gray-500">Categoria: {{ denuncia.categoria }}</p>
          <p class="text-sm text-gray-500">Usuário: {{ denuncia.user_nome || 'Anônimo' }}</p>
          <p class="text-sm text-gray-500">Criado em: {{ new Date(denuncia.created_at).toLocaleDateString() }}</p>
        </div>
      </div>

      <div class="flex justify-center mt-6 space-x-2">
        <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 border rounded hover:bg-gray-100">Anterior</button>
        <span class="px-3 py-1 border rounded">Página {{ page }} de {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page === totalPages" class="px-3 py-1 border rounded hover:bg-gray-100">Próxima</button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

interface Usuario {
  id: string
  nome: string
}

interface Denuncia {
  id: string
  titulo: string
  descricao: string
  categoria: string
  user_id: string
  user_nome?: string
  created_at: string
}

const denuncias = ref<Denuncia[]>([])
const usuarios = ref<Usuario[]>([])
const filtroUsuario = ref<string>('')
const filtroCategoria = ref<string>('')
const filtroDataInicio = ref<string>('')
const filtroDataFim = ref<string>('')
const page = ref<number>(1)
const perPage = 6
const totalPages = ref<number>(1)
const router = useRouter()

async function loadDenuncias(): Promise<void> {
  const start = (page.value - 1) * perPage
  const end = start + perPage - 1

  let query = supabase
    .from('denuncias')
    .select('*, user:user_id(nome)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filtroUsuario.value) query = query.eq('user_id', filtroUsuario.value)
  if (filtroCategoria.value) query = query.eq('categoria', filtroCategoria.value)
  if (filtroDataInicio.value) query = query.gte('created_at', filtroDataInicio.value)
  if (filtroDataFim.value) query = query.lte('created_at', filtroDataFim.value)

  const { data, count, error } = await query.range(start, end)
  
  if (!error && data) {
    denuncias.value = (data as Denuncia[]).map(d => ({
      ...d,
      user_nome: (d as any).user?.nome || undefined
    }))
    totalPages.value = Math.ceil((count || 0) / perPage)
  } else if (error) {
    console.error('[Relatorios.vue] Erro ao carregar denúncias:', error)
  }
}

function verDetalhe(id: string): void {
  router.push({ name: 'DenunciaDetalhe', params: { id } })
}

function prevPage(): void {
  if (page.value > 1) page.value--
}

function nextPage(): void {
  if (page.value < totalPages.value) page.value++
}

watch(page, loadDenuncias)
watch([filtroUsuario, filtroCategoria, filtroDataInicio, filtroDataFim], () => (page.value = 1))

onMounted(async () => {
  // ✅ Melhoria: Carregar usuários e a primeira página de denúncias em paralelo
  const [usuariosData, denunciasData] = await Promise.all([
    supabase.from('usuarios').select('id,nome'),
    supabase.from('denuncias').select('*, user:user_id(nome)', { count: 'exact' }).order('created_at', { ascending: false }).range(0, perPage - 1)
  ]);
  
  if (usuariosData && usuariosData.data) {
    usuarios.value = usuariosData.data as Usuario[];
  }

  if (denunciasData && denunciasData.data) {
    denuncias.value = (denunciasData.data as Denuncia[]).map(d => ({
      ...d,
      user_nome: (d as any).user?.nome || undefined
    }));
    totalPages.value = Math.ceil((denunciasData.count || 0) / perPage);
  }
})
</script>