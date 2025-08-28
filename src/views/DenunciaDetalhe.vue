<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <!-- Ícone à esquerda -->
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>

    <!-- Título da página (centro) -->
    <h2 class="text-lg font-semibold flex-1 text-center">📌 Detalhes da Denúncia</h2>

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
      <h2 class="text-2xl font-bold text-gray-800 mb-6">📌 Detalhes da Denúncia</h2>

      <div v-if="report" class="space-y-4">
        <h3 class="text-xl font-semibold">{{ report.titulo }}</h3>
        <p><strong>Status:</strong> 
          <span :style="{ color: statusColor(report.status) }" class="font-medium">{{ report.status }}</span>
        </p>
        <p><strong>Categoria:</strong> {{ report.categoria }}</p>
        <p><strong>Descrição:</strong> {{ report?.['DESCRIÇÃO'] || report?.descricao || 'Descrição não fornecida' }}</p>
        <p><strong>Localização:</strong> {{ report.latitude }}, {{ report.longitude }}</p>
        <p><strong>Data:</strong> {{ new Date(report.created_at).toLocaleString('pt-BR') }}</p>
        <p><strong>Enviado por:</strong> {{ report.email_usuario }}</p>
        
        <!-- Foto da denúncia -->
        <img v-if="report.url_foto" :src="report.url_foto" alt="Foto da denúncia" class="mt-4 rounded-lg max-w-full shadow-lg" />

        <!-- Link para abrir no Google Maps -->
        <div class="mt-6">
          <a :href="`https://www.google.com/maps?q=${report.latitude},${report.longitude}`" target="_blank" class="text-blue-600 hover:underline">
            📍 Ver localização no Google Maps
          </a>
        </div>
      </div>
      <div v-else>
        <p class="text-gray-600">Carregando... ou acesso negado.</p>
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
      report: null
    }
  },
  async mounted() {
    const { data } = await supabase.auth.getUser()
    this.user = data.user

    // Verifica se o usuário está logado
    const user = await this.getCurrentUser()
    if (!user) return this.$router.push('/login')

    // Pega o ID da denúncia da URL
    const id = this.$route.params.id

    // Busca a denúncia no Supabase — com campos explícitos
    const { data: dataReport, error } = await supabase
      .from('denuncia')
      .select('id,titulo,categoria,descricao,url_foto,latitude,longitude,email_usuario,status,created_at')
      .eq('id', id)
      .single()

    if (error) {
      alert('Erro ao carregar denúncia.')
      return
    }

    // Verifica se o usuário é o denunciante ou admin
    const isAdmin = await this.checkIfAdmin(user.email)
    if (dataReport.email_usuario !== user.email && !isAdmin) {
      alert('Acesso negado. Você não tem permissão para ver esta denúncia.')
      this.$router.push('/home')
      return
    }

    // Tudo certo, mostra a denúncia
    this.report = dataReport

    // Para depuração
    console.log('Denúncia carregada:', this.report)
  },
  methods: {
    async getCurrentUser() {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
    async checkIfAdmin(email) {
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email)
        .single()
      return !error && data
    },
    statusColor(status) {
      if (status === 'resolvido') return 'green'
      if (status === 'em_analise') return 'orange'
      return 'red'
    },
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
img {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>