<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50 px-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">📝 Criar Conta no SOSJAC</h2>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Seu e-mail"
            required
            autocomplete="email"
          />
        </div>
        <div>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Senha (mínimo 6 caracteres)"
            required
            autocomplete="new-password"
          />
        </div>
        <button
          :disabled="loading"
          class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          {{ loading ? 'Criando conta...' : 'Registrar-se' }}
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">
        Já tem conta?
        <a @click="goToLogin" class="text-blue-600 hover:underline cursor-pointer">
          Fazer login
        </a>
      </p>
    </div>
  </div>
</template>

<script>
import { signUp } from '../services/supabaseClient'

export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      if (this.password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.')
        return
      }

      this.loading = true
      const { error } = await signUp(this.email, this.password)
      this.loading = false

      if (error) {
        alert('Erro: ' + error.message)
      } else {
        alert('Conta criada com sucesso! Faça login.')
        this.$router.push('/login')
      }
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>