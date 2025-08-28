<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <!-- Ícone à esquerda -->
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>

    <!-- Título da página (centro) -->
    <h2 class="text-lg font-semibold flex-1 text-center">🚫 Acesso Bloqueado</h2>

    <!-- Usuário e Sair (direita) -->
    <div class="flex items-center space-x-4">
      <span class="text-sm">Usuário</span>
      <button @click="handleLogout" class="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded-lg">
        Sair
      </button>
    </div>
  </header>

  <!-- Conteúdo principal -->
  <main class="min-h-screen bg-blue-900 pt-24 pb-8 px-6 text-white flex items-center justify-center">
    <div class="max-w-lg text-center">
      <h1 class="text-3xl font-bold mb-4">🚫 Acesso Bloqueado</h1>
      <p class="text-lg mb-2">Seu acesso ao SOSJAC foi suspenso por violação das regras da comunidade.</p>
      <p class="text-sm text-blue-300">Se acredita que foi um erro, entre em contato com a administração.</p>
    </div>
  </main>
</template>

<script>
import { supabase } from '../services/supabaseClient'

export default {
  data() {
    return {}
  },
  methods: {
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>
