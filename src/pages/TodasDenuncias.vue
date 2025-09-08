<template>
  <AppLayout
    :show-back-button="true"
    :show-logout-button="true"
    title="Todas as Denúncias"
  >
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div v-if="loading" class="text-gray-500">
        Carregando todas as denúncias...
      </div>

      <div v-else-if="denuncias.length === 0" class="text-gray-600">
        Nenhuma denúncia registrada até o momento.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="denuncia in denuncias"
          :key="denuncia.id"
          class="border rounded p-4 hover:shadow cursor-pointer"
          @click="verDetalhe(denuncia.id)"
        >
          <h2 class="font-bold text-lg mb-2">{{ denuncia.titulo }}</h2>
          <p class="text-gray-700 mb-2 whitespace-pre-line">{{ denuncia.descricao.substring(0, 100) }}...</p>
          <p class="text-sm text-gray-500 mb-1">
            Categoria: {{ formatCategoria(denuncia.categoria) }}
          </p>
          <p class="text-sm text-gray-500">
            Criado por: {{ denuncia.user_nome || 'Anônimo' }}
          </p>
          <p class="text-sm text-gray-500">
            Criado em: {{ formatDate(denuncia.created_at) }}
          </p>
        </div>
      </div>

      <div v-if="error" class="text-red-600 mt-4 p-3 bg-red-50 rounded">{{ error }}</div>
      
      <div class="flex justify-center mt-6 space-x-2">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Anterior
        </button>
        <span class="px-3 py-1 border rounded">Página {{ page }} de {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Próxima
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

interface Denuncia {
  id: string
  titulo: string
  descricao: string
  categoria: string
  user_nome?: string
  created_at: string
}

const denuncias = ref<Denuncia[]>([])
const loading = ref(true)
const error = ref('')
const router = useRouter()

// Estados da paginação
const page = ref(1);
const perPage = 10; // ✅ Defina a quantidade de itens por página
const totalPages = ref(1);

function formatCategoria(categoria: string): string {
  const map: Record<string, string> = {
    iluminacao_publica: 'Iluminação Pública',
    saneamento_basico: 'Saneamento Básico',
    limpeza_conservacao: 'Limpeza e Conservação',
    pavimentacao_asfalto: 'Pavimentação/Asfalto',
    seguranca_publica: 'Segurança Pública',
    posto_saude: 'Posto de Saúde',
    outros: 'Outros',
  };
  return map[categoria] || categoria;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function verDetalhe(id: string) {
  router.push({ name: 'DenunciaDetalhe', params: { id } });
}

// Funções para navegar nas páginas
function prevPage() {
  if (page.value > 1) {
    page.value--;
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
  }
}

async function loadDenuncias() {
  loading.value = true;
  error.value = '';

  const start = (page.value - 1) * perPage;
  const end = start + perPage - 1;

  try {
    const { data, error: supaError, count } = await supabase
      .from('denuncias')
      .select('id, titulo, descricao, categoria, created_at, user:user_id(nome)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (supaError) throw supaError;
    
    denuncias.value = (data || []).map((d: any) => ({
      id: d.id,
      titulo: d.titulo,
      descricao: d.descricao,
      categoria: d.categoria,
      created_at: d.created_at,
      user_nome: d.user?.nome,
    }));

    totalPages.value = Math.ceil((count || 0) / perPage);

  } catch (err: unknown) {
    console.error('[TodasDenuncias.vue] Erro ao carregar denúncias:', err);
    error.value = 'Erro ao carregar todas as denúncias.';
  } finally {
    loading.value = false;
  }
}

// Assista a 'page' e recarregue os dados sempre que ela mudar
watch(page, loadDenuncias);

// Carregue os dados iniciais quando o componente for montado
onMounted(() => {
  loadDenuncias();
});
</script>