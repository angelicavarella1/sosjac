<template>
  <div class="bg-white p-6 rounded-lg shadow h-64">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    <div class="h-48">
      <Bar
        v-if="type === 'bar' && barDataReady"
        :data="barData"
        :options="options"
        class="h-full"
      />
      <Pie
        v-else-if="type === 'pie' && pieDataReady"
        :data="pieData"
        :options="options"
        class="h-full"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        Tipo de gráfico inválido ou dados não carregados.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

// Registrar componentes ChartJS
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

interface ChartProps {
  type: 'bar' | 'pie'
  data: ChartData<'bar' | 'pie', number[], string>
  title?: string
}

const props = defineProps<ChartProps>()
const type = props.type
const title = computed(() => props.title || '')

// Controle para quando os dados estiverem prontos
const barDataReady = ref(false)
const pieDataReady = ref(false)

// Dados com casting seguro
const barData = computed<ChartData<'bar', number[], string>>(() => {
  if (type === 'bar') {
    barDataReady.value = true
    pieDataReady.value = false
    return props.data as ChartData<'bar', number[], string>
  } else {
    barDataReady.value = false
    return { labels: [], datasets: [] }
  }
})

const pieData = computed<ChartData<'pie', number[], string>>(() => {
  if (type === 'pie') {
    pieDataReady.value = true
    barDataReady.value = false
    return props.data as ChartData<'pie', number[], string>
  } else {
    pieDataReady.value = false
    return { labels: [], datasets: [] }
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}
</script>
