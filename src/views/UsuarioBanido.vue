<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>
    <h2 class="text-lg font-semibold flex-1 text-center">🚫 Acesso Bloqueado</h2>
    <button @click="handleLogout" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow transition">
      Sair
    </button>
  </header>

  <!-- Espaço para o header fixo -->
  <div class="h-16"></div>

  <!-- Conteúdo principal -->
  <main class="min-h-screen bg-blue-950 pt-24 pb-8 px-6 text-white flex items-center justify-center">
    <div class="max-w-lg text-center bg-white rounded-2xl shadow-xl p-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">🚫 Acesso Bloqueado</h1>
      <p class="text-lg mb-2 text-gray-700">Seu acesso ao SOSJAC foi suspenso por violação das regras da comunidade.</p>
      <p class="text-sm text-blue-600">Se acredita que foi um erro, entre em contato com a administração.</p>
    </div>
  </main>

  <!-- ✅ RODAPÉ COM AUTORIA -->
  <footer class="p-6 text-center text-blue-300 text-sm bg-blue-900 border-t border-blue-700">
    <p>Projeto desenvolvido por <strong class="text-white">Angélica Varella</strong> ❤️</p>
  </footer>
</template>

<script>
import { supabase } from '../services/supabaseClient'

export default {
  methods: {
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>