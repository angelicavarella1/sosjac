<template>
  <div class="bg-white p-4 rounded shadow mb-4">
    <h3 class="font-bold text-lg">{{ denuncia.titulo }}</h3>
    <p class="text-gray-700 mt-1">{{ denuncia.descricao }}</p>

    <div class="mt-3 text-sm text-gray-600">
      <strong>Categoria:</strong> {{ denuncia.categoria.join(', ') || 'Não informada' }}
    </div>

    <div class="mt-3 text-sm text-gray-600">
      <strong>Autor:</strong> {{ denuncia.autor_nome || 'Desconhecido' }}
      ({{ denuncia.autor_email || 'Desconhecido' }})
    </div>

    <div class="mt-2 text-sm text-gray-600">
      <strong>Endereço:</strong> {{ denuncia.endereco || 'Não informado' }}
    </div>

    <div class="mt-4 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <span
          :class="{
            'bg-cornflowerblue text-darkslateblue': denuncia.status === 'pendente',
            'bg-mediumaquamarine text-darkslategray': denuncia.status === 'aprovada',
            'bg-slategray text-white': denuncia.status === 'rejeitada'
          }"
          class="px-2 py-1 text-xs rounded-full"
        >
          {{ formatStatus(denuncia.status) }}
        </span>

        <span
          v-if="authStore.user?.role === 'admin' && denuncia.total_comentarios && denuncia.total_comentarios > 0"
          class="flex items-center gap-1 text-sm text-gray-600"
        >
          💬 {{ denuncia.total_comentarios }}
        </span>
        <span
          v-else-if="authStore.user?.role === 'admin'"
          class="text-sm text-gray-400"
        >
          —
        </span>

        <span
          v-if="(authStore.user?.role === 'admin' || denuncia.usuario_id === authStore.user?.id) && denuncia.total_anexos && denuncia.total_anexos > 0"
          class="flex items-center gap-1 text-sm text-gray-600"
        >
          📎 {{ denuncia.total_anexos }}
        </span>
        <span
          v-else-if="authStore.user?.role === 'admin' || denuncia.usuario_id === authStore.user?.id"
          class="text-sm text-gray-400"
        >
          —
        </span>
      </div>

      <!-- ✅ CORREÇÃO DO ITEM 1: Botão "Enviar Email" só para administradores -->
      <button
        v-if="authStore.user?.role === 'admin'"
        @click="openEmailModal"
        class="text-royalblue hover:text-navy text-sm font-medium"
      >
        Enviar Email
      </button>
    </div>
  </div>

  <EnviarEmailModal
    v-if="showEmailModal"
    :denuncia="{ ...denuncia, id: denuncia.id.toString(), categoria: denuncia.categoria.join(', ') }"
    @close="showEmailModal = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EnviarEmailModal from './EnviarEmailModal.vue'
import type { DenunciaExpandida } from '@/types/denuncia'
import { useAuthStore } from '@/store/useAuthStore'

// ✅ Adição das propriedades faltantes na tipagem
interface DenunciaExpandidaComExtras extends DenunciaExpandida {
  total_comentarios?: number;
  total_anexos?: number;
  usuario_id?: string;
}

// Props explícitas
// ✅ Usando a nova interface para incluir as propriedades extras
const props = defineProps<{ denuncia: DenunciaExpandidaComExtras }>()

// Injeção do store de autenticação
const authStore = useAuthStore()

// Estado do modal
const showEmailModal = ref(false)

// Funções
function openEmailModal() {
  showEmailModal.value = true
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada'
  }
  return map[status] || status
}
</script>

<style scoped>
.denuncia-detalhe {
  padding: 1rem;
}
.comentario {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>