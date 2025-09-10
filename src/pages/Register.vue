<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
    <h1 class="text-2xl font-bold mb-6">Registrar Usuário</h1>

    <form @submit.prevent="handleRegister" class="bg-white p-6 rounded shadow w-full max-w-md">
      <label class="block mb-2">Nome</label>
      <input v-model="nome" type="text" class="w-full p-2 mb-4 border rounded" required />

      <label class="block mb-2">Email</label>
      <input v-model="email" type="email" class="w-full p-2 mb-4 border rounded" required />

      <label class="block mb-2">Senha</label>
      <input v-model="password" type="password" class="w-full p-2 mb-4 border rounded" required />

      <button type="submit" class="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
        Registrar
      </button>
    </form>

    <p v-if="error" class="text-red-600 mt-4">{{ error }}</p>
    <p v-if="success" class="text-green-600 mt-4">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'

const auth = useAuthStore()
const router = useRouter()
const nome = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')

async function handleRegister() {
  error.value = ''
  success.value = ''
  try {
    await auth.register(email.value, password.value, nome.value)
    success.value = 'Registro realizado com sucesso!'
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Erro ao registrar usuário'
  }
}
</script>
