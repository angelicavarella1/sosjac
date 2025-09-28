<template>
  <div class="bg-white p-6 rounded-lg shadow h-64">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    <div class="h-48 relative">
      <Bar
        v-if="type === 'bar'"
        :data="barData"
        :options="options"
        class="h-full"
        @click="handleChartClick"
      />
      <Pie
        v-else-if="type === 'pie'"
        :data="pieData"
        :options="options"
        class="h-full"
        @click="handleChartClick"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        Tipo de gráfico inválido ou dados não carregados.
      </div>

      <!-- Overlay de erro (opcional) -->
      <div v-if="hasError" class="absolute inset-0 bg-red-50 bg-opacity-90 flex flex-col items-center justify-center rounded-lg">
        <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-2"></i>
        <p class="text-red-700 font-medium">Erro ao carregar gráfico</p>
        <button @click="retry" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
          Tentar novamente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  ChartData
} from 'chart.js'

// ✅ Importe as cores da sua paleta
import { COLOR_PALETTE } from '@/config/theme'

// ✅ Registrar plugins do Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

// ✅ Definir emit
const emit = defineEmits<{
  (e: 'error', error: unknown): void
  (e: 'click', event: any): void
}>()

interface ChartProps {
  type: 'bar' | 'pie'
  data: ChartData<'bar' | 'pie', number[], string>
  title?: string
}

const props = defineProps<ChartProps>()
const type = props.type
const title = computed(() => props.title || '')

// ✅ Estado de erro
const hasError = ref(false)

// ✅ Função para emitir erro
function emitError(err: unknown) {
  hasError.value = true
  emit('error', err)
}

// ✅ Função para tentar novamente (opcional)
function retry() {
  hasError.value = false
  initChart()
}

// ✅ Função para lidar com cliques (opcional)
function handleChartClick(event: any) {
  emit('click', event)
}

// ✅ Gerar cores dinamicamente
const getChartColors = (count: number) => {
  const colors = [
    COLOR_PALETTE.dodgerblue,
    COLOR_PALETTE.darkturquoise,
    COLOR_PALETTE.steelblue,
    COLOR_PALETTE.darkslateblue,
    COLOR_PALETTE.mediumblue,
    COLOR_PALETTE.lightseagreen,
    COLOR_PALETTE.cadetblue,
    COLOR_PALETTE.mediumaquamarine,
    COLOR_PALETTE.royalblue,
    COLOR_PALETTE.slategray
  ]
  return colors.slice(0, count)
}

// ✅ Dados para gráfico de barras
const barData = computed<ChartData<'bar', number[], string>>(() => {
  if (type === 'bar') {
    try {
      return {
        labels: props.data.labels || [],
        datasets: props.data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: getChartColors(dataset.data.length),
          borderColor: COLOR_PALETTE.lightcyan,
          borderWidth: 1
        }))
      } as ChartData<'bar', number[], string>
    } catch (err) {
      emitError(err)
      return { labels: [], datasets: [] }
    }
  }
  return { labels: [], datasets: [] }
})

// ✅ Dados para gráfico de pizza
const pieData = computed<ChartData<'pie', number[], string>>(() => {
  if (type === 'pie') {
    try {
      return {
        labels: props.data.labels || [],
        datasets: props.data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: getChartColors(dataset.data.length)
        }))
      } as ChartData<'pie', number[], string>
    } catch (err) {
      emitError(err)
      return { labels: [], datasets: [] }
    }
  }
  return { labels: [], datasets: [] }
})

// ✅ Opções do gráfico
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    },
    title: {
      display: false
    }
  }
}

// ✅ Inicializar gráfico com tratamento de erro
function initChart() {
  hasError.value = false
  try {
    // Força reatividade — nada a fazer aqui, pois os dados são computed
  } catch (err) {
    emitError(err)
  }
}

onMounted(() => {
  initChart()
})
</script>