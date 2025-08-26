<!-- src/views/DenunciaDetalhe.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-12">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">📌 Detalhes da Denúncia</h2>

      <div v-if="report" class="space-y-4">
        <h3 class="text-xl font-semibold">{{ report.titulo }}</h3>
        <p><strong>Status:</strong> 
          <span :style="{ color: statusColor(report.status) }" class="font-medium">{{ report.status }}</span>
        </p>
        <p><strong>Categoria:</strong> {{ report.categoria }}</p>
        <p><strong>Descrição:</strong> {{ report.descricao }}</p>
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

      <button @click="$router.back()" class="mt-8 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
        Voltar
      </button>
    </div>
  </div>
</template>

<script>
import { supabase } from '../services/supabaseClient'

export default {
  data() {
    return {
      report: null
    }
  },
  async mounted() {
    // Verifica se o usuário está logado
    const user = await this.getCurrentUser()
    if (!user) return this.$router.push('/login')

    // Pega o ID da denúncia da URL
    const id = this.$route.params.id

    // Busca a denúncia no Supabase
    const { data, error } = await supabase
      .from('denuncia')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      alert('Erro ao carregar denúncia.')
      return
    }

    // Verifica se o usuário é o denunciante ou admin
    const isAdmin = await this.checkIfAdmin(user.email)
    if (data.email_usuario !== user.email && !isAdmin) {
      alert('Acesso negado. Você não tem permissão para ver esta denúncia.')
      this.$router.push('/home')
      return
    }

    // Tudo certo, mostra a denúncia
    this.report = data
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
      if (status === 'em_andamento') return 'orange'
      return 'red'
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