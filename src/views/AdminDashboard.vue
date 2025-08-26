<!-- src/views/AdminDashboard.vue -->
<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Cabeçalho -->
    <header class="bg-gray-800 shadow-sm border-b px-6 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-blue-400">🔐 Painel do Administrador</h1>
      <button @click="handleLogout" class="text-red-400 hover:text-red-300">Sair</button>
    </header>

    <!-- Botão Voltar -->
    <div class="px-6 py-4">
      <button @click="$router.back()" class="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
        <span>←</span>
        <span>Voltar</span>
      </button>
    </div>

    <!-- Conteúdo -->
    <main class="max-w-6xl mx-auto px-6 py-8">
      <h2 class="text-xl font-semibold mb-6">📋 Denúncias Recebidas</h2>

      <div v-if="reports.length === 0" class="text-center py-8 text-gray-500">
        Nenhuma denúncia registrada.
      </div>

      <div v-else class="space-y-6">
        <div v-for="r in reports" :key="r.id" class="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 class="text-lg font-semibold text-blue-300">{{ r.titulo }}</h3>
          <p><strong>Categoria:</strong> {{ r.categoria }}</p>
          <p><strong>Status:</strong> 
            <span :style="{ color: statusColor(r.status) }" class="font-medium">{{ r.status }}</span>
          </p>
          <p><strong>Morador:</strong> {{ r.email_usuario }}</p>
          <p><strong>Data:</strong> {{ new Date(r.created_at).toLocaleString('pt-BR') }}</p>
          
          <img v-if="r.url_foto" :src="r.url_foto" alt="Foto da denúncia" class="mt-4 rounded-lg max-w-full shadow" />

          <!-- Atualizar status -->
          <div class="mt-4">
            <select v-model="r.status" @change="updateStatus(r)" class="px-3 py-2 bg-gray-700 rounded-lg text-white">
              <option value="registrado">Registrado</option>
              <option value="em_analise">Em análise</option>
              <option value="encaminhado">Encaminhado</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { supabase } from '../services/supabaseClient'

export default {
  data() {
    return { reports: [] }
  },
  async mounted() {
    const user = await this.getCurrentUser()
    if (!user || !(await this.isAdmin())) {
      this.$router.push('/login')
    }
    await this.loadReports()
  },
  methods: {
    async getCurrentUser() {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
    async isAdmin() {
      const user = await this.getCurrentUser()
      if (!user) return false
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single()
      return !!data
    },
    async loadReports() {
      const { data, error } = await supabase.from('denuncia').select('*').order('created_at', { ascending: false })
      if (error) console.error('Erro ao carregar denúncias:', error)
      else this.reports = data
    },
    async updateStatus(r) {
      const { error } = await supabase
        .from('denuncia')
        .update({ status: r.status })
        .eq('id', r.id)
      if (error) alert('Erro ao atualizar status')
    },
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    },
    statusColor(status) {
      if (status === 'resolvido') return 'green'
      if (status === 'em_analise') return 'orange'
      return 'red'
    }
  }
}
</script>