<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b px-6 py-4">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold text-blue-900">SOSJAC</h1>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">Olá, {{ user?.email }}</span>
          <button @click="handleLogout" class="text-red-600 hover:underline text-sm">Sair</button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button @click="$router.push('/reportar')" class="bg-blue-600 text-white py-4 rounded-xl shadow hover:bg-blue-700 transition">
          📝 Registrar Problema
        </button>
        <button @click="$router.push('/mapa-admin')" class="bg-green-600 text-white py-4 rounded-xl shadow hover:bg-green-700 transition">
          🗺️ Ver no Mapa
        </button>
        <button @click="$router.push('/minhas-denuncias')" class="bg-purple-600 text-white py-4 rounded-xl shadow hover:bg-purple-700 transition">
          📋 Minhas Denúncias
        </button>
      </div>

      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Mapa de Problemas</h2>
        <DenunciasMap />
      </div>
    </main>
  </div>
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