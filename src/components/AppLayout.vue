<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex justify-between items-center p-4 bg-gray-100 shadow">
      <button
        v-if="showBackButton"
        @click="handleBack"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        aria-label="Voltar para a página anterior"
      >
        ← Voltar
      </button>

      <span class="text-xl font-bold text-center flex-1 mx-4">{{ displayTitle }}</span>

      <button
        v-if="showLogoutButton"
        @click="handleLogout"
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
        aria-label="Encerrar sessão"
      >
        Sair
      </button>
    </header>

    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// ✅ Adicionado: importação da função 'computed' do 'vue'
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/useAuthStore';

// Props com valores padrão e tipagem explícita
const props = defineProps({
  showBackButton: { type: Boolean, default: false },
  showLogoutButton: { type: Boolean, default: false },
  title: { type: String, default: '' }
});

// Título com fallback
const displayTitle = computed(() => props.title || 'SOSJAC');

const router = useRouter();
const auth = useAuthStore();

function handleBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}

async function handleLogout() {
  try {
    await auth.logout();
    router.push('/login');
  } catch (err) {
    console.error('[AppLayout] Erro ao fazer logout:', err);
    router.push('/login');
  }
}
</script>

<style scoped>
/* Layout simples, cabeçalho fixo já estilizado via Tailwind */
</style>