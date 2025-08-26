<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50 px-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">🔐 Entrar no SOSJAC</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="E-mail"
            required
            autocomplete="username"
          />
        </div>
        <div>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Senha"
            required
            autocomplete="current-password"
          />
        </div>
        <button
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">
        Não tem conta?
        <a @click="$router.push('/register')" class="text-blue-600 hover:underline cursor-pointer">
          Registre-se
        </a>
      </p>
    </div>
  </div>
</template>

<script>
import { signIn } from '../services/supabaseClient'

export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      const { error } = await signIn(this.email, this.password)
      this.loading = false

      if (error) {
        alert('Erro: ' + error.message)
      } else {
        this.$router.push('/home')
      }
    }
  }
}
</script>