<template>
  <div class="h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
    <div class="bg-white p-8 rounded shadow text-center max-w-md">
      <h1 class="text-3xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
      <p class="text-gray-700 mb-6 text-lg">
        Sua conta foi <strong>banida</strong> e você não pode acessar o sistema.
      </p>
      <p class="text-gray-600 mb-8 text-sm">
        Entre em contato com o administrador para mais informações.
      </p>
      <button
        @click="logout"
        :disabled="isLoggingOut"
        class="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        aria-label="Encerrar sessão e sair do sistema"
      >
        <span v-if="isLoggingOut">Saindo... ⏳</span>
        <span v-else>Sair</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// ✅ Adicionado: importação da função 'ref' do 'vue'
import { onMounted, watch, ref } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const isLoggingOut = ref(false)

// Redireciona caso o usuário não esteja mais banido (reativo)
watch(
  () => auth.isBanned,
  (isBanned) => {
    if (!isBanned && auth.user) {
      router.replace({ name: 'Home' })
    }
  },
  { immediate: true }
)

// Redireciona caso o usuário não esteja logado ou não seja mais banido
onMounted(() => {
  if (!auth.user || !auth.isBanned) {
    router.replace({ name: 'Home' })
  }
})

// Função de logout segura
async function logout() {
  isLoggingOut.value = true
  try {
    await auth.logout()
    router.replace({ name: 'Login' })
  } catch (err) {
    console.error('[UsuarioBanido.vue] Erro ao fazer logout:', err)
    // Mesmo com erro, força redirecionamento
    router.replace({ name: 'Login' })
  }
}
</script>