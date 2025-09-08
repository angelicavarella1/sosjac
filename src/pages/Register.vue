<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <div class="bg-white rounded shadow p-8 max-w-md w-full">
      <h1 class="text-2xl font-bold mb-6 text-center">Cadastro</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="nome" class="block mb-1 font-medium">Nome</label>
          <input
            id="nome"
            v-model="nome"
            type="text"
            required
            minlength="2"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label for="email" class="block mb-1 font-medium">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
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
            minlength="6"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Mínimo 6 caracteres"
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
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          <span v-if="loading">Cadastrando... ⏳</span>
          <span v-else>Cadastrar</span>
        </button>
      </form>

      <p class="mt-4 text-center text-gray-600">
        Já possui conta?
        <router-link to="/Login" class="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">
          Entrar
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'vue-router'

const nome = ref<string>('')
const email = ref<string>('')
const senha = ref<string>('')
const error = ref<string>('')
const success = ref<string>('')
const loading = ref<boolean>(false)

const auth = useAuthStore()
const router = useRouter()

async function handleRegister(): Promise<void> {
  error.value = ''
  success.value = ''
  loading.value = true

  // Validação básica no frontend
  if (!nome.value.trim() || nome.value.length < 2) {
    error.value = 'Nome inválido. Informe seu nome completo.'
    loading.value = false
    return
  }

  if (!email.value.trim()) {
    error.value = 'E-mail é obrigatório.'
    loading.value = false
    return
  }

  if (!senha.value.trim() || senha.value.length < 6) {
    error.value = 'Senha deve ter pelo menos 6 caracteres.'
    loading.value = false
    return
  }

  try {
    await auth.register(email.value.trim(), senha.value, nome.value.trim())
    success.value = 'Conta criada com sucesso! Redirecionando para login...'

    setTimeout(() => {
      router.push('/Login')
    }, 2000)
  } catch (err: unknown) {
    console.error('[Register.vue] Erro no cadastro:', err)
    if (err instanceof Error) {
      if (err.message.includes('User already registered')) {
        error.value = 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.'
      } else if (err.message.includes('Password is too weak')) {
        error.value = 'Senha muito fraca. Use pelo menos 6 caracteres.'
      } else {
        error.value = err.message
      }
    } else {
      error.value = 'Erro ao tentar cadastrar. Verifique sua conexão e tente novamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>