<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>
    <h2 class="text-lg font-semibold flex-1 text-center">🏠 Home</h2>
    <button @click="handleLogout" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow transition">
      Sair
    </button>
  </header>

  <!-- Espaço para o header fixo -->
  <div class="h-16"></div>

  <!-- Conteúdo principal -->
  <main class="min-h-screen bg-blue-950 pt-8 pb-8 px-6">
    <!-- Botões de Ação -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <button @click="$router.push('/reportar')" class="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl shadow-lg transition-transform duration-200 transform hover:scale-105 font-semibold">
        📝 Registrar Problema
      </button>
      <button @click="$router.push('/mapa-admin')" class="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl shadow-lg transition-transform duration-200 transform hover:scale-105 font-semibold">
        🗺️ Ver no Mapa
      </button>
      <button @click="$router.push('/minhas-denuncias')" class="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl shadow-lg transition-transform duration-200 transform hover:scale-105 font-semibold">
        📋 Minhas Denúncias
      </button>
    </div>

    <!-- Título do Mapa -->
    <div class="max-w-6xl mx-auto bg-blue-800 rounded-xl shadow p-6 mb-6 text-center">
      <h2 class="text-2xl font-bold text-white">📍 Localizar no Mapa</h2>
      <p class="text-blue-200">Veja sua denúncia no mapa e ajuste a localização se necessário</p>
    </div>

    <!-- Mapa -->
    <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
      <DenunciasMap />
    </div>

    <!-- ✅ RODAPÉ COM AUTORIA -->
    <footer class="p-6 text-center text-blue-300 text-sm bg-blue-900 border-t border-blue-700">
      <p>Projeto desenvolvido por <strong class="text-white">Angélica Varella</strong> ❤️</p>
    </footer>
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
    // Se não estiver logado, redireciona
    if (!this.user) {
      this.$router.push('/login')
    }
  },
  methods: {
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>