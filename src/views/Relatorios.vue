<!-- src/views/Relatorios.vue -->
<template>
  <div v-if="userIsAdmin" class="max-w-6xl mx-auto px-6 py-12">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">📊 Relatórios por Categoria</h2>
      <p class="text-gray-600 mb-6">Período: Mês atual</p>

      <!-- Gráfico -->
      <div class="chart-container mb-8">
        <canvas ref="barChart"></canvas>
      </div>

      <!-- Tabela de estatísticas -->
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2 text-left">Categoria</th>
            <th class="border border-gray-300 px-4 py-2 text-right">Denúncias</th>
            <th class="border border-gray-300 px-4 py-2 text-right">Proporção</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categorias" :key="cat.value">
            <td class="border border-gray-300 px-4 py-2">{{ cat.label }}</td>
            <td class="border border-gray-300 px-4 py-2 text-right">{{ cat.total }}</td>
            <td class="border border-gray-300 px-4 py-2 text-right">{{ cat.percent }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="flex items-center justify-center min-h-screen">
    <p class="text-red-600 text-xl">Acesso negado. Você não é administrador.</p>
  </div>
</template>

<script>
import { supabase } from '../services/supabaseClient'
import Chart from 'chart.js/auto'

export default {
  data() {
    return {
      userIsAdmin: false,
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
    const user = data?.user
    if (!user) return this.$router.push('/login')

    // Verifica se é admin
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    if (error || !adminData) {
      this.userIsAdmin = false
      return
    }

    this.userIsAdmin = true
    await this.loadStats()
    this.renderChart()
  },
  methods: {
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
        data: { labels, datasets: [{ label: 'Denúncias por Categoria', data, backgroundColor: '#3B82F6', borderColor: '#1E40AF', borderWidth: 1 }] },
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
    }
  },
  beforeUnmount() {
    if (this.chart) this.chart.destroy()
  }
}
</script>

<style>
.chart-container {
  height: 400px;
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}
</style>