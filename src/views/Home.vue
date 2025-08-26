<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <!-- Ícone à esquerda -->
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>

    <!-- Título da página (centro) -->
    <h2 class="text-lg font-semibold flex-1 text-center">🏠 Home</h2>

    <!-- Usuário e Sair (direita) -->
    <div class="flex items-center space-x-4">
      <span class="text-sm">Olá, {{ user?.email }}</span>
      <button @click="handleLogout" class="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded-lg">
        Sair
      </button>
    </div>
  </header>

  <!-- Conteúdo principal (com espaço para o cabeçalho fixo) -->
  <main class="min-h-screen bg-blue-900 pt-24 pb-8 px-6 text-white">
    <!-- Botão Voltar (no final, lado direito) -->
    <div class="text-right mb-6">
      <button
        @click="$router.back()"
        class="flex items-center space-x-2 ml-auto px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl shadow-lg transition-transform duration-200 transform hover:scale-105 font-semibold"
      >
        <span>←</span>
        <span>Voltar</span>
      </button>
    </div>

    <!-- Botões de Ação -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <button @click="$router.push('/reportar')" class="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl shadow transition">
        📝 Registrar Problema
      </button>
      <button @click="$router.push('/mapa-admin')" class="bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl shadow transition">
        🗺️ Ver no Mapa
      </button>
      <button @click="$router.push('/minhas-denuncias')" class="bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl shadow transition">
        📋 Minhas Denúncias
      </button>
    </div>

    <!-- Título do Mapa -->
    <div class="max-w-6xl mx-auto bg-blue-800 rounded-xl shadow p-6 mb-6 text-center">
      <h2 class="text-2xl font-bold mb-2">🗺️ Mapa de Denúncias - SOSJAC</h2>
      <p class="text-blue-200">Visualização completa de todos os problemas reportados</p>
    </div>

    <!-- Mapa -->
    <div class="max-w-6xl mx-auto bg-white rounded-xl shadow p-6 text-gray-800">
      <DenunciasMap />
    </div>
  </main>
</template>

<script>
import { supabase } from '../services/supabaseClient'
import DenunciasMap from '../components/DenunciasMap.vue'

export default {
  components: { DenunciasMap },
  data() {
    return { user: null }
  },
  async mounted() {
    const { data } = await supabase.auth.getUser()
    this.user = data.user
  },
  methods: {
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>