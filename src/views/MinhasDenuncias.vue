<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>
    <h2 class="text-lg font-semibold flex-1 text-center">📌 Minhas Denúncias</h2>
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
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">📌 Minhas Denúncias</h2>

      <div v-if="reports.length === 0" class="text-center py-8">
        <p class="text-gray-500">Nenhuma denúncia encontrada.</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="r in reports" :key="r.id" class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <h3 class="text-lg font-semibold text-gray-800 break-words">{{ r.titulo }}</h3>
          <p><strong>Status:</strong> 
            <span :style="{ color: statusColor(r.status) }" class="font-medium">{{ r.status }}</span>
          </p>
          <p><strong>Categoria:</strong> {{ getCategoriaLabel(r.categoria) }}</p>
          <p class="break-words whitespace-pre-line"><strong>Descrição:</strong> {{ r.descricao }}</p>
          <p><strong>Data:</strong> {{ new Date(r.created_at).toLocaleString('pt-BR') }}</p>
          
          <div v-if="r.url_foto" class="mt-4">
            <img 
              :src="r.url_foto" 
              alt="Foto da denúncia" 
              class="w-full max-w-full h-auto rounded-lg shadow border border-gray-200 object-cover"
            />
          </div>

          <button 
            @click="$router.push('/denuncia/' + r.id)" 
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Ver detalhes
          </button>
        </div>
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