<template>
  <div class="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-sm border border-lightsteelblue">
    <h3 class="font-bold text-lg text-darkslateblue mb-2">{{ secretaria.nome }}</h3>
    <p class="text-darkslategray mb-1">
      <strong>Secretário:</strong> {{ secretaria.secretario || 'Não informado' }}
    </p>
    <p class="text-darkslategray mb-1">
      <strong>Endereço:</strong> {{ secretaria.endereco || 'Não informado' }}
    </p>
    <p class="text-darkslategray mb-1">
      <strong>Telefone:</strong> {{ secretaria.telefone || 'Não informado' }}
    </p>
    <p class="text-darkslategray">
      <strong>Email:</strong>
      <span :class="{ 'text-royalblue font-medium': isAdmin }">
        {{ maskEmail(secretaria.email) }}
      </span>
    </p>

    <!-- 🔗 Acesso ao site oficial (se disponível) -->
    <div v-if="secretaria.site" class="mt-3">
      <a
        :href="secretaria.site"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block px-3 py-1.5 bg-aquamarine text-darkslategray rounded-lg hover:bg-mediumaquamarine transition-colors text-sm font-medium"
      >
        🌐 Visitar site oficial
      </a>
    </div>

    <!-- Ações administrativas (apenas para admins) -->
    <div v-if="isAdmin" class="mt-4 pt-3 border-t border-slate-100">
      <p class="font-semibold text-darkslateblue mb-2">Ações administrativas:</p>
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          @click="$emit('editar', secretaria)"
          class="px-3 py-1.5 bg-steelblue text-white rounded-lg hover:bg-royalblue transition-colors text-sm font-medium flex-1"
          aria-label="Editar secretaria"
        >
          Editar
        </button>
        <button
          @click="$emit('deletar', secretaria.id)"
          class="px-3 py-1.5 bg-slategray text-white rounded-lg hover:bg-darkslategray transition-colors text-sm font-medium flex-1"
          aria-label="Excluir secretaria"
        >
          Excluir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { maskEmail } from '@/utils/formatters'

// ✅ Interface com tipagem completa e compatível com o banco
interface SecretariaProps {
  id: number
  nome: string
  secretario?: string | null
  endereco?: string | null
  telefone?: string | null
  email: string
  site?: string | null // 👈 campo adicionado, opcional
}

defineProps<{
  secretaria: SecretariaProps
}>()

// ✅ Emits mantidos exatamente como antes
defineEmits<{
  (e: 'editar', secretaria: SecretariaProps): void
  (e: 'deletar', id: number): void
}>()

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
</script>