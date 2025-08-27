<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <!-- Ícone à esquerda -->
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>

    <!-- Título da página (centro) -->
    <h2 class="text-lg font-semibold flex-1 text-center">🔐 Painel do Administrador</h2>

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

    <!-- CONTEÚDO ORIGINAL (sem alterações) -->
    <header class="bg-blue-800 shadow-lg border-b border-blue-600 px-6 py-4 rounded-xl mb-8">
      <h1 class="text-3xl font-bold text-blue-300">🔐 Painel do Administrador</h1>
      <p class="text-blue-200 mt-2">Gerencie todas as denúncias do Jardim Atlântico Central</p>
    </header>

    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6 text-blue-300">📋 Denúncias Recebidas</h2>

      <div v-if="reports.length === 0" class="text-center py-10 text-gray-400">
        <p>Nenhuma denúncia registrada no momento.</p>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="r in reports"
          :key="r.id"
          class="bg-blue-800 rounded-xl p-6 shadow-lg border border-blue-600 hover:bg-blue-750 transition"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold text-blue-200">{{ r.titulo }}</h3>
            <span
              :style="{ color: statusColor(r.status) }"
              class="px-3 py-1 rounded-full text-sm font-medium bg-opacity-20"
              :class="statusBg(r.status)"
            >
              {{ r.status }}
            </span>
          </div>

          <p><strong>Categoria:</strong> {{ r.categoria }}</p>
          <p><strong>Morador:</strong> {{ r.email_usuario }}</p>
          <p><strong>Data:</strong> {{ new Date(r.created_at).toLocaleString('pt-BR') }}</p>

          <!-- Foto da denúncia -->
          <img
            v-if="r.url_foto"
            :src="r.url_foto"
            alt="Foto da denúncia"
            class="mt-4 rounded-lg max-w-full shadow-md border border-blue-500"
            @click="openImageModal(r.url_foto)"
          />

          <!-- Atualizar status -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-blue-200 mb-2">Atualizar Status</label>
            <select
              v-model="r.status"
              @change="updateStatus(r)"
              class="w-full px-4 py-3 border border-blue-500 rounded-lg bg-blue-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="registrado">Registrado</option>
              <option value="em_analise">Em análise</option>
              <option value="encaminhado">Encaminhado</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal da imagem -->
    <div
      v-if="modalImage"
      class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      @click="closeImageModal"
    >
      <div class="relative max-w-3xl max-h-full">
        <img :src="modalImage" alt="Ampliada" class="max-w-full max-h-screen rounded-lg shadow-2xl" />
        <button
          @click="closeImageModal"
          class="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-500 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
        >
          ×
        </button>
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
      reports: [],
      modalImage: null
    }
  },
  async mounted() {
    const { data } = await supabase.auth.getUser()
    this.user = data.user

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
    statusColor(status) {
      if (status === 'resolvido') return 'lightgreen'
      if (status === 'em_analise') return 'orange'
      if (status === 'encaminhado') return 'skyblue'
      return 'red'
    },
    statusBg(status) {
      if (status === 'resolvido') return 'bg-green-500'
      if (status === 'em_analise') return 'bg-yellow-500'
      if (status === 'encaminhado') return 'bg-blue-500'
      return 'bg-red-500'
    },
    openImageModal(url) {
      this.modalImage = url
    },
    closeImageModal() {
      this.modalImage = null
    },
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    },
    async banirUsuario(email) {
      const { error } = await supabase
        .from('perfis')
        .update({
          status: 'banido',
          motivo_banimento: 'Violação das regras do aplicativo',
          data_banimento: new Date().toISOString()
        })
        .eq('email', email)

      if (error) {
        alert('Erro ao banir usuário')
      } else {
        alert(`${email} foi banido com sucesso.`)
        await this.loadReports()
      }
    }
  }
}
</script>