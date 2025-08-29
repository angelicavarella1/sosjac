<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>
    <h2 class="text-lg font-semibold flex-1 text-center">📌 Detalhes da Denúncia</h2>
    <button @click="handleLogout" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow transition">
      Sair
    </button>
  </header>

  <!-- Espaço para o header fixo -->
  <div class="h-16"></div>

  <!-- Conteúdo principal -->
  <main class="min-h-screen bg-blue-950 pt-8 pb-8 px-6">
    <!-- Botão Voltar -->
    <div class="p-6 flex justify-end">
      <button
        @click="$router.back()"
        class="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-transform duration-200 transform hover:scale-105 font-semibold"
      >
        <span>←</span>
        <span>Voltar</span>
      </button>
    </div>

    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">📌 Detalhes da Denúncia</h2>

      <div v-if="report" class="space-y-4 text-gray-800">
        <h3 class="text-xl font-semibold break-words">{{ report.titulo }}</h3>
        <p><strong>Status:</strong> 
          <span :style="{ color: statusColor(report.status) }" class="font-medium">{{ report.status }}</span>
        </p>
        <p><strong>Categoria:</strong> {{ getCategoriaLabel(report.categoria) }}</p>
        <p class="break-words whitespace-pre-line">
          <strong>Descrição:</strong> {{ report?.['DESCRIÇÃO'] || report?.descricao || 'Descrição não fornecida' }}
        </p>
        <p><strong>Localização:</strong> {{ report.latitude }}, {{ report.longitude }}</p>
        <p><strong>Data:</strong> {{ new Date(report.created_at).toLocaleString('pt-BR') }}</p>
        <p><strong>Enviado por:</strong> {{ report.email_usuario }}</p>
        
        <!-- Foto da denúncia -->
        <img v-if="report.url_foto" :src="report.url_foto" alt="Foto da denúncia" class="mt-4 rounded-lg max-w-full shadow-lg border border-gray-200" />

        <!-- Link para Google Maps -->
        <div class="mt-6">
          <a :href="`https://www.google.com/maps?q=${report.latitude},${report.longitude}`" target="_blank" class="text-blue-600 hover:underline">
            📍 Ver localização no Google Maps
          </a>
        </div>
      </div>
      <div v-else>
        <p class="text-gray-600 text-center">Carregando... ou acesso negado.</p>
      </div>
    </div>

    <!-- ✅ RODAPÉ COM AUTORIA -->
    <footer class="p-6 text-center text-blue-300 text-sm bg-blue-900 border-t border-blue-700">
      <p>Projeto desenvolvido por <strong class="text-white">Angélica Varella</strong> ❤️</p>
    </footer>
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
    if (!this.user) return this.$router.push('/login')

    const id = this.$route.params.id
    const { data: dataReport, error } = await supabase
      .from('denuncia')
      .select('id,titulo,categoria,descricao,url_foto,latitude,longitude,email_usuario,status,created_at')
      .eq('id', id)
      .single()

    if (error) {
      alert('Erro ao carregar denúncia.')
      return
    }

    const isAdmin = await this.checkIfAdmin(this.user.email)
    if (dataReport.email_usuario !== this.user.email && !isAdmin) {
      alert('Acesso negado.')
      this.$router.push('/home')
      return
    }

    this.report = dataReport
  },
  methods: {
    async checkIfAdmin(email) {
      const { data, error } = await supabase.from('admins').select('email').eq('email', email).single()
      return !error && data
    },
    statusColor(status) {
      if (status === 'resolvido') return 'green'
      if (status === 'em_analise') return 'orange'
      return 'red'
    },
    // ✅ Método adicionado: exibe nome completo da categoria
    getCategoriaLabel(categoria) {
      const labels = {
        iluminacao_publica: 'ILUMINAÇÃO PÚBLICA',
        saneamento_basico: 'SANEAMENTO BÁSICO',
        limpeza_conservacao: 'LIMPEZA E CONSERVAÇÃO DAS VIAS',
        pavimentacao_asfalto: 'PAVIMENTAÇÃO E ASFALTO',
        seguranca_publica: 'SEGURANÇA PÚBLICA',
        posto_saude: 'POSTO DE SAÚDE',
        outros: 'OUTROS'
      }
      return labels[categoria] || categoria
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