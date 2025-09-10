<template>
  <div class="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
    <!-- Botões de navegação -->
    <NavigationButtons />

    <h1 class="text-2xl font-bold mb-6 text-center">Gráficos Administrativos</h1>

    <div v-if="auth.loading || !auth.user" class="flex flex-col items-center justify-center min-h-[300px]">
      <p class="text-gray-700 font-semibold mb-2">Carregando dados...</p>
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <!-- Gráfico de denúncias por categoria -->
      <Charts
        type="bar"
        :title="'Denúncias por Categoria'"
        :data="denunciasPorCategoriaChart"
      />

      <!-- Gráfico de usuários ativos vs banidos -->
      <Charts
        type="pie"
        :title="'Usuários Ativos vs Banidos'"
        :data="usuariosAtivosBanidosChart"
      />

      <!-- Gráfico de status das denúncias -->
      <Charts
        type="pie"
        :title="'Status das Denúncias'"
        :data="denunciasPorStatusChart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'
import Charts from '@/components/Charts.vue'
import type { ChartData } from 'chart.js'

const auth = useAuthStore()

// Dados para gráficos
const denunciasPorCategoriaChart = ref<ChartData<'bar', number[], string>>({
  labels: [],
  datasets: []
})
const usuariosAtivosBanidosChart = ref<ChartData<'pie', number[], string>>({
  labels: [],
  datasets: []
})
const denunciasPorStatusChart = ref<ChartData<'pie', number[], string>>({
  labels: [],
  datasets: []
})

// Função para formatar categorias
function formatCategoria(categoria: string) {
  const map: Record<string, string> = {
    iluminacao_publica: 'Iluminação Pública',
    saneamento_basico: 'Saneamento Básico',
    limpeza_conservacao: 'Limpeza e Conservação',
    pavimentacao_asfalto: 'Pavimentação/Asfalto',
    seguranca_publica: 'Segurança Pública',
    posto_saude: 'Posto de Saúde',
    outros: 'Outros'
  }
  return map[categoria] || categoria
}

async function loadGraficos() {
  if (!auth.user || !auth.isAdmin) return

  try {
    // Denúncias por categoria
    const { data: denuncias } = await supabase.from('denuncias').select('categoria, status')
    if (denuncias) {
      const categoriasCount: Record<string, number> = {}
      const statusCount: Record<string, number> = {}

      denuncias.forEach(d => {
        categoriasCount[d.categoria] = (categoriasCount[d.categoria] || 0) + 1
        statusCount[d.status] = (statusCount[d.status] || 0) + 1
      })

      denunciasPorCategoriaChart.value = {
        labels: Object.keys(categoriasCount).map(formatCategoria),
        datasets: [
          {
            label: 'Quantidade',
            data: Object.values(categoriasCount),
            backgroundColor: '#3B82F6'
          }
        ]
      }

      denunciasPorStatusChart.value = {
        labels: Object.keys(statusCount),
        datasets: [
          {
            label: 'Quantidade',
            data: Object.values(statusCount),
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'] // Resolvido, Em andamento, Registrado
          }
        ]
      }
    }

    // Usuários ativos vs banidos
    const { count: totalUsuarios } = await supabase.from('usuarios').select('id', { count: 'exact', head: true })
    const { count: totalBanidos } = await supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('is_banned', true)
    const totalAtivos = (totalUsuarios || 0) - (totalBanidos || 0)

    usuariosAtivosBanidosChart.value = {
      labels: ['Ativos', 'Banidos'],
      datasets: [
        {
          label: 'Usuários',
          data: [totalAtivos, totalBanidos || 0],
          backgroundColor: ['#3B82F6', '#EF4444']
        }
      ]
    }
  } catch (err) {
    console.error('[Graficos.vue] Erro ao carregar gráficos:', err)
  }
}

// Watcher para carregar gráficos assim que o usuário estiver pronto
watch(() => auth.user, (user) => {
  if (user) loadGraficos()
}, { immediate: true })
</script>
