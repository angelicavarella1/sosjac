<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <div class="bg-white rounded shadow p-8 max-w-md w-full">
      <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block mb-1 font-medium">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label for="senha" class="block mb-1 font-medium">Senha</label>
          <input
            id="senha"
            v-model="senha"
            type="password"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm p-2 bg-red-50 rounded">
          {{ error }}
        </div>
        <div v-if="success" class="text-green-600 text-sm p-2 bg-green-50 rounded">
          {{ success }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          <span v-if="loading">Entrando... ⏳</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <p class="mt-4 text-center text-gray-600">
        Não possui conta?
        <router-link to="/Register" class="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">
          Cadastrar-se
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'vue-router'

// Estado do formulário
const email = ref<string>('')
const senha = ref<string>('')
const error = ref<string>('')
const success = ref<string>('')
const loading = ref<boolean>(false)

// Store e router
const auth = useAuthStore()
const router = useRouter()

async function handleLogin(): Promise<void> {
  error.value = ''
  success.value = ''
  loading.value = true

  // Validação básica no frontend
  if (!email.value.trim() || !senha.value.trim()) {
    error.value = 'Preencha e-mail e senha.'
    loading.value = false
    return
  }

  try {
    // Realiza login
    await auth.login(email.value.trim(), senha.value)

    // Aguarda dados do usuário carregarem
    await auth.loadUser()

    // Verifica se usuário está banido
    if (auth.isBanned) {
      error.value = 'Sua conta está banida. Entre em contato com o administrador.'
      return
    }

    // Mensagem de sucesso
    success.value = 'Login realizado com sucesso! Redirecionando...'

    // Redireciona após 1 segundo
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (err: unknown) {
    console.error('[Login.vue] Erro no login:', err)
    if (err instanceof Error) {
      if (err.message.includes('banido')) {
        error.value = 'Sua conta está banida.'
      } else if (err.message.includes('Invalid login credentials')) {
        error.value = 'E-mail ou senha inválidos.'
      } else {
        error.value = err.message
      }
    } else {
      error.value = 'Erro ao tentar fazer login. Verifique sua conexão.'
    }
  } finally {
    loading.value = false
  }
}
</script>