<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>
    <h2 class="text-lg font-semibold flex-1 text-center">🔐 Entrar no SOSJAC</h2>
    <button @click="handleLogout" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow transition">
      Sair
    </button>
  </header>

  <!-- Espaço para o header fixo -->
  <div class="h-16"></div>

  <!-- Conteúdo principal -->
  <main class="min-h-screen bg-blue-950 pt-8 pb-8 px-6 flex items-center justify-center">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">🔐 Entrar no SOSJAC</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 placeholder-gray-500"
            placeholder="E-mail"
            required
            autocomplete="username"
          />
        </div>
        <div>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 placeholder-gray-500"
            placeholder="Senha"
            required
            autocomplete="current-password"
          />
        </div>
        <button
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-transform duration-200 transform hover:scale-105"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">
        Não tem conta?
        <a @click="$router.push('/register')" class="text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer transition">
          Registre-se
        </a>
      </p>
    </div>
  </main>

  <!-- ✅ RODAPÉ COM AUTORIA -->
  <footer class="p-6 text-center text-blue-300 text-sm bg-blue-900 border-t border-blue-700">
    <p>Projeto desenvolvido por <strong class="text-white">Angélica Varella</strong> ❤️</p>
  </footer>
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
    },
    async handleLogout() {
      // Redireciona para login (pode ser útil se alguém acessar direto)
      this.$router.push('/login')
    }
  }
}
</script>