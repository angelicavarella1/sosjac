<template>
  <div class="w-full max-w-6xl mt-6 p-6 bg-white rounded shadow space-y-6">

    <NavigationButtons />

    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">📈 Gráficos Administrativos</h1>
      <!-- ✅ Botão Gerar PDF -->
      <button
        @click="gerarPDF"
        class="px-4 py-2 bg-dodgerblue text-white rounded hover:bg-royalblue flex items-center gap-2"
      >
        📄 Gerar PDF
      </button>
    </div>

    <div v-if="store.loading" class="flex flex-col items-center justify-center min-h-[300px]">
      <p class="text-darkslategray font-semibold mb-2">Carregando dados...</p>
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dodgerblue"></div>
    </div>

    <div v-else-if="store.error" class="text-red-600 text-center p-4 bg-mistyrose rounded">
      {{ store.error }}
    </div>

    <div v-else-if="!store.denunciasPorCategoria.length && !store.denunciasPorSecretaria.length && !store.denunciasPorPeriodo.length" class="text-darkslategray text-center p-6 bg-aliceblue rounded">
      <p>📊 Nenhum dado disponível para exibir gráficos.</p>
      <p class="text-sm mt-1">Tente recarregar ou verifique se há denúncias registradas.</p>
    </div>

    <div v-else class="space-y-8">
      <Charts
        type="bar"
        title="Denúncias por Categoria"
        :data="denunciasPorCategoriaChart"
        @error="onChartError('Denúncias por Categoria')"
      />

      <Charts
        type="pie"
        title="Denúncias por Status de Usuário"
        subtitle="Considera denúncias feitas por usuários ATIVOS vs BANIDOS"
        :data="usuariosAtivosBanidosChart"
        @error="onChartError('Usuários Ativos vs Banidos')"
      />

      <Charts
        type="bar"
        title="Denúncias por Secretaria"
        :data="denunciasPorSecretariaChart"
        @error="onChartError('Denúncias por Secretaria')"
      />

      <Charts
        type="bar"
        title="Evolução das Denúncias (por mês)"
        :data="denunciasPorPeriodoChart"
        @error="onChartError('Evolução das Denúncias')"
      />
    </div>

    <!-- Exibe erros específicos (opcional) -->
    <div v-if="Object.keys(chartErrors).length > 0" class="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
      <p class="font-semibold">⚠️ Erros encontrados:</p>
      <ul class="list-disc list-inside mt-1">
        <li v-for="(erro, nome) in chartErrors" :key="nome">
          {{ nome }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRelatoriosStore } from '@/store/useRelatoriosStore'
import NavigationButtons from '@/components/NavigationButtons.vue'
import Charts from '@/components/Charts.vue'
import html2pdf from 'html2pdf.js'
import type { ChartData } from 'chart.js'

const CORES_GRAFICOS = {
  steelblue: '#4682B4',
  mediumaquamarine: '#66CDAA',
  slategray: '#708090',
  aquamarine: '#7FFFD4',
  midnightblue: '#191970',
  dodgerblue: '#1E90FF',
  royalblue: '#4169E1',
  cornflowerblue: '#6495ED'
} as const

const store = useRelatoriosStore()
const chartErrors = ref<Record<string, boolean>>({})

const denunciasPorCategoriaChart = computed<ChartData<'bar', number[], string>>(() => ({
  labels: store.denunciasPorCategoria.map(d => formatCategoria(d.categoria)),
  datasets: [
    {
      label: 'Denúncias',
      data: store.denunciasPorCategoria.map(d => d.total),
      backgroundColor: CORES_GRAFICOS.steelblue
    }
  ]
}))

const usuariosAtivosBanidosChart = computed<ChartData<'pie', number[], string>>(() => {
  const denunciasPorUsuariosNaoBanidos = Math.max(0, store.totalDenuncias - store.totalBanidos)
  return {
    labels: ['Feitas por usuários ativos', 'Feitas por usuários banidos'],
    datasets: [
      {
        label: 'Denúncias',
        data: [denunciasPorUsuariosNaoBanidos, store.totalBanidos],
        backgroundColor: [CORES_GRAFICOS.mediumaquamarine, CORES_GRAFICOS.slategray]
      }
    ]
  }
})

const denunciasPorSecretariaChart = computed<ChartData<'bar', number[], string>>(() => ({
  labels: store.denunciasPorSecretaria.map(d => d.secretaria_nome),
  datasets: [
    {
      label: 'Denúncias',
      data: store.denunciasPorSecretaria.map(d => d.total),
      backgroundColor: CORES_GRAFICOS.aquamarine
    }
  ]
}))

const denunciasPorPeriodoChart = computed<ChartData<'bar', number[], string>>(() => ({
  labels: store.denunciasPorPeriodo.map(d => d.mes),
  datasets: [
    {
      label: 'Denúncias',
      data: store.denunciasPorPeriodo.map(d => d.total),
      backgroundColor: CORES_GRAFICOS.midnightblue
    }
  ]
}))

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

function onChartError(chartName: string) {
  chartErrors.value[chartName] = true
  console.warn(`[Graficos.vue] Erro ao renderizar gráfico: ${chartName}`)
}

function gerarPDF() {
  const element = document.querySelector('.w-full.max-w-6xl') as HTMLElement
  if (!element) return

  const opt = {
    margin: 10,
    filename: 'graficos-denuncias.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const 
    }
  }

  html2pdf().set(opt).from(element).save()
}

onMounted(() => {
  if (!store.denunciasPorCategoria.length) {
    store.loadResumo()
  }
})
</script>