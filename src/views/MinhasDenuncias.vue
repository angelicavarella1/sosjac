<template>
  <div class="max-w-4xl mx-auto px-6 py-12">
    <!-- Botão Voltar -->
<div class="px-6 py-4">
  <button @click="$router.back()" class="flex items-center space-x-2 text-blue-300 hover:text-blue-200">
    <span>←</span>
    <span>Voltar</span>
  </button>
</div>
    <div class="bg-white rounded-2xl shadow-xl p-8">
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
  </div>
</template>

<script>
import { supabase } from '../services/supabaseClient' // ✅ Importe aqui

export default {
  data() {
    return {
      reports: []
    }
  },
  async mounted() {
    const user = await this.getCurrentUser()
    if (!user) return this.$router.push('/login')

    const { data } = await supabase
      .from('denuncia')
      .select('*')
      .eq('email_usuario', user.email)
      .order('created_at', { ascending: false })

    this.reports = data
  },
  methods: {
    async getCurrentUser() {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
    statusColor(status) {
      if (status === 'resolvido') return 'green'
      if (status === 'em_andamento') return 'orange'
      return 'red'
    }
  }
}
</script>