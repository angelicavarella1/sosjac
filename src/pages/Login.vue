<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Cabeçalho -->
    <header class="bg-white shadow p-3 sm:p-4 text-center">
      <h1 class="text-2xl sm:text-3xl font-bold">SOSJAC</h1>
    </header>

    <!-- Conteúdo principal -->
    <main class="flex-1 flex flex-col items-center justify-center p-6">
      <h2 class="text-2xl font-bold mb-6">Login</h2>

      <form @submit.prevent="handleLogin" class="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <div>
          <label class="block mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="exemplo@dominio.com"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block mb-1">Senha</label>
          <input
            v-model="password"
            type="password"
            placeholder="Mínimo 6 dígitos"
            minlength="6"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold flex items-center justify-center"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Entrando... ⏳</span>
          <span v-else>Entrar</span>
        </button>

        <!-- Mensagens de feedback -->
        <p v-if="successMessage" class="text-green-600 mt-2 flex items-center gap-2">
          ✅ {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="text-red-600 mt-2 flex items-center gap-2">
          ❌ {{ errorMessage }}
        </p>

        <!-- Link de registro -->
        <p class="text-sm mt-2 text-gray-700">
          Não tem conta?
          <span
            @click="goToRegister"
            class="text-blue-600 hover:underline cursor-pointer"
          >Registre-se aqui</span>
        </p>
      </form>
    </main>

    <!-- Rodapé -->
    <footer class="bg-white shadow p-3 sm:p-4 text-center text-gray-500">
      &copy; 2025 SOSJAC. Todos os direitos reservados. Angélica Varella
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()
const auth = useAuthStore()

async function handleLogin() {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)
    successMessage.value = 'Login realizado com sucesso!'
    setTimeout(() => router.push('/'), 1000)
  } catch (err: any) {
    if (err.message?.includes('Usuário não encontrado')) {
      errorMessage.value = 'Usuário não existe.'
    } else if (err.message?.includes('Senha inválida')) {
      errorMessage.value = 'Senha incorreta.'
    } else {
      errorMessage.value = err.message || 'Erro ao efetuar login.'
    }
  } finally {
    isSubmitting.value = false
  }
}

function goToRegister() {
  router.push({ name: 'Register' })
}
</script>
