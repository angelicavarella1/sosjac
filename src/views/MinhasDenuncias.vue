<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <!-- Ícone à esquerda -->
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>

    <!-- Título da página (centro) -->
    <h2 class="text-lg font-semibold flex-1 text-center">📌 Minhas Denúncias</h2>

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

    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">📌 Minhas Denúncias</h2>

      <div v-if="reports.length === 0" class="text-center py-8">
        <p class="text-gray-500">Nenhuma denúncia encontrada.</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="r in reports" :key="r.id" class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <h3 class="text-lg font-semibold text-gray-800">{{ r.titulo }}</h3>
          <p><strong>Status:</strong> 
            <span :style="{ color: statusColor(r.status) }" class="font-medium">{{ r.status }}</span>
          </p>
          <p><strong>Categoria:</strong> {{ r.categoria }}</p>
          <p><strong>Descrição:</strong> {{ r.descricao }}</p>
          <p><strong>Data:</strong> {{ new Date(r.created_at).toLocaleString('pt-BR') }}</p>
          
          <img v-if="r.url_foto" :src="r.url_foto" alt="Foto da denúncia" class="mt-4 rounded-lg max-w-full shadow" />

          <button 
            @click="$router.push('/denuncia/' + r.id)" 
            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { supabase } from '../services/supabaseClient'

export default {
  data() {
    return {
      user: null,
      reports: []
    }
  },
  async mounted() {
    const { data } = await supabase.auth.getUser()
    this.user = data.user

    if (!this.user) return this.$router.push('/login')

    const { data: reportsData } = await supabase
      .from('denuncia')
      .select('*')
      .eq('email_usuario', this.user.email)
      .order('created_at', { ascending: false })

    this.reports = reportsData
  },
  methods: {
    statusColor(status) {
      if (status === 'resolvido') return 'green'
      if (status === 'em_andamento') return 'orange'
      return 'red'
    },
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>