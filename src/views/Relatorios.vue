<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <!-- Ícone à esquerda -->
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>

    <!-- Título da página (centro) -->
    <h2 class="text-lg font-semibold flex-1 text-center">📊 Relatórios Administrativos</h2>

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

    <!-- Conteúdo -->
    <div v-if="userIsAdmin" class="max-w-7xl mx-auto">
      <!-- Título -->
      <div class="bg-blue-800 rounded-xl shadow p-6 mb-8 text-center">
        <h2 class="text-2xl font-bold">📊 Relatórios de Denúncias</h2>
        <p class="text-blue-200">Período: Mês atual</p>
      </div>

      <!-- Gráfico -->
      <div class="bg-white rounded-xl shadow-xl p-8 mb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4">📈 Denúncias por Categoria</h3>
        <div class="chart-container">
          <canvas ref="barChart"></canvas>
        </div>
      </div>

      <!-- Tabela de Denúncias -->
      <div class="bg-white rounded-xl shadow-xl p-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4">📋 Todas as Denúncias</h3>
        <table class="w-full border-collapse border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 px-4 py-2 text-left">Título</th>
              <th class="border border-gray-300 px-4 py-2 text-left">Usuário</th>
              <th class="border border-gray-300 px-4 py-2 text-left">Categoria</th>
              <th class="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th class="border border-gray-300 px-4 py-2 text-left">Data</th>
              <th class="border border-gray-300 px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reports" :key="r.id" class="hover:bg-gray-50">
              <td class="border border-gray-300 px-4 py-2">{{ r.titulo }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ r.email_usuario }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ r.categoria }}</td>
              <td class="border border-gray-300 px-4 py-2">
                <span :style="{ color: statusColor(r.status) }" class="font-medium">{{ r.status }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ new Date(r.created_at).toLocaleDateString() }}</td>
              <td class="border border-gray-300 px-4 py-2">
                <button @click="editStatus(r)" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Alterar Status
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Acesso negado -->
    <div v-else class="max-w-4xl mx-auto text-center py-12">
      <p class="text-red-600 text-xl font-semibold">Acesso negado. Você não é administrador.</p>
      <button
        @click="$router.push('/home')"
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        Voltar para Home
      </button>
    </div>
  </main>
</template>

<script>
import { supabase } from '../services/supabaseClient'
import Chart from 'chart.js/auto'

export default {
  data() {
    return {
      user: null,
      userIsAdmin: false,
      reports: [],
      categorias: [
        { value: 'buraco', label: 'Buraco na via', total: 0 },
        { value: 'entulho', label: 'Entulho ou lixo', total: 0 },
        { value: 'iluminacao', label: 'Falta de iluminação', total: 0 },
        { value: 'alagamento', label: 'Alagamento / drenagem', total: 0 },
        { value: 'mato_alto', label: 'Mato alto / terreno irregular', total: 0 },
        { value: 'estrutura_precaria', label: 'Estrutura urbana precária', total: 0 },
        { value: 'sinalizacao', label: 'Falta de sinalização', total: 0 }
      ],
      chart: null
    }
  },
  async mounted() {
    const { data } = await supabase.auth.getUser()
    this.user = data?.user
    if (!this.user) return this.$router.push('/login')

    // Verifica se é admin
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', this.user.email)
      .single()

    if (error || !adminData) {
      this.userIsAdmin = false
      return
    }

    this.userIsAdmin = true
    await this.loadReports()
    await this.loadStats()
    this.renderChart()
  },
  methods: {
    async loadReports() {
      const { data, error } = await supabase
        .from('denuncia')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        alert('Erro ao carregar denúncias.')
      } else {
        this.reports = data
      }
    },
    async loadStats() {
      const now = new Date()
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data, error } = await supabase
        .from('denuncia')
        .select('categoria')
        .gte('created_at', inicioMes)

      if (error) {
        alert('Erro ao carregar estatísticas.')
        return
      }

      const map = {
        buraco: 'buraco',
        entulho: 'entulho',
        iluminacao: 'iluminacao',
        alagamento: 'alagamento',
        mato_alto: 'mato_alto',
        estrutura_precaria: 'estrutura_precaria',
        sinalizacao: 'sinalizacao'
      }

      const contagem = {}
      data.forEach(d => {
        const key = map[d.categoria] || 'outro'
        contagem[key] = (contagem[key] || 0) + 1
      })

      let total = 0
      this.categorias.forEach(c => {
        c.total = contagem[c.value] || 0
        total += c.total
      })

      this.categorias.forEach(c => {
        c.percent = total > 0 ? ((c.total / total) * 100).toFixed(1) : '0.0'
      })
    },
    renderChart() {
      const labels = this.categorias.map(c => c.label)
      const data = this.categorias.map(c => c.total)
      const ctx = this.$refs.barChart

      if (this.chart) this.chart.destroy()

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: { 
          labels, 
          datasets: [{
            label: 'Denúncias por Categoria',
            data,
            backgroundColor: '#3B82F6',
            borderColor: '#1E40AF',
            borderWidth: 1
          }] 
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { color: '#1F2937' } },
            x: { ticks: { color: '#1F2937' } }
          },
          plugins: {
            legend: { labels: { color: '#1F2937' } }
          }
        }
      })
    },
    async editStatus(report) {
      const newStatus = prompt('Novo status (registrado, em_analise, encaminhado, resolvido):', report.status)
      if (newStatus) {
        const { error } = await supabase
          .from('denuncia')
          .update({ status: newStatus })
          .eq('id', report.id)
        
        if (error) {
          alert('Erro ao atualizar status.')
        } else {
          report.status = newStatus
          alert('Status atualizado com sucesso.')
        }
      }
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
  },
  beforeUnmount() {
    if (this.chart) this.chart.destroy()
  }
}
</script>

<style scoped>
.chart-container {
  height: 400px;
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}
</style>