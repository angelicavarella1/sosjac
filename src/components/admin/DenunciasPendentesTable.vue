<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDenunciasStore } from '@/store/useDenunciasStore'
import { useNotificacaoStore } from '@/store/useNotificacaoStore'
import type { DenunciaExpandida } from '@/store/useDenunciasStore'
import NavigationButtons from '@/components/NavigationButtons.vue'

const denunciasStore = useDenunciasStore()
const notificacaoStore = useNotificacaoStore()
const router = useRouter()

const loading = ref(false)
const denunciasPendentes = ref<DenunciaExpandida[]>([])

const fetchDenuncias = async () => {
  loading.value = true
  try {
    await denunciasStore.fetchDenuncias()
    denunciasPendentes.value = [...denunciasStore.pendentes]
  } catch (err) {
    console.error('Erro ao buscar denúncias pendentes:', err)
    notificacaoStore.adicionar('Erro ao carregar denúncias pendentes', 'erro')
    denunciasPendentes.value = []
  } finally {
    loading.value = false
  }
}

const avaliar = async (id: string, status: 'aprovada' | 'rejeitada') => {
  // Impede que o clique no botão dispare a navegação
  event?.stopPropagation()
  
  loading.value = true
  try {
    await denunciasStore.avaliarDenuncia(id, status)
    notificacaoStore.adicionar(`Denúncia ${status === 'aprovada' ? 'aprovada' : 'rejeitada'} com sucesso!`, 'sucesso')
    await fetchDenuncias()
  } catch (err) {
    console.error('Erro ao avaliar denúncia:', err)
    notificacaoStore.adicionar('Erro ao avaliar denúncia', 'erro')
  } finally {
    loading.value = false
  }
}

const irParaDetalhe = (id: string) => {
  router.push(`/denuncia/${id}`)
}

onMounted(() => {
  fetchDenuncias()
})
</script>

<template>
  <div class="flex flex-col w-full max-w-5xl mx-auto p-4">
    <NavigationButtons />

    <div class="bg-white rounded-xl shadow p-6 mt-6 space-y-6">
      <h1 class="text-2xl font-bold mb-4">📋 Denúncias Pendentes para Avaliação</h1>

      <div v-if="loading" class="text-darkslategray flex justify-center items-center h-32">
        <span class="animate-spin border-4 border-dodgerblue border-t-transparent rounded-full w-8 h-8 mr-2"></span>
        Carregando...
      </div>

      <div v-else-if="denunciasPendentes.length === 0" class="text-darkslategray text-center py-8">
        Nenhuma denúncia pendente no momento.
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="d in denunciasPendentes"
          :key="d.id"
          @click="irParaDetalhe(d.id)"
          class="p-4 border border-cornflowerblue rounded bg-white shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <h2 class="font-bold text-lg mb-2">{{ d.titulo }}</h2>
          <p class="text-darkslategray mb-2 line-clamp-2">{{ d.descricao }}</p>
          <p class="text-sm text-darkslategray mb-1">Categoria: {{ d.categoria || 'Sem categoria' }}</p>
          <p class="text-sm text-darkslategray mb-1">Autor: {{ d.autor_nome || 'Desconhecido' }} ({{ d.autor_email || 'Desconhecido' }})</p>
          <p class="text-sm text-darkslategray mb-3">Criado em: {{ new Date(d.created_at).toLocaleDateString('pt-BR') }}</p>

          <!-- Botões de ação (não disparam navegação) -->
          <div class="flex gap-3 pt-2 border-t border-gray-100">
            <button
              @click.stop="avaliar(d.id, 'aprovada')"
              class="px-4 py-2 bg-mediumaquamarine text-darkslategray rounded font-medium hover:bg-aquamarine transition"
            >
              ✅ Aprovar
            </button>
            <button
              @click.stop="avaliar(d.id, 'rejeitada')"
              class="px-4 py-2 bg-slategray text-white rounded font-medium hover:bg-darkslategray transition"
            >
              ❌ Rejeitar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>