<template>
  <div class="w-full max-w-6xl mx-auto mt-6 p-6 bg-white rounded shadow space-y-6">
    <NavigationButtons />

    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">📊 Relatórios e Estatísticas</h1>
      <button
        @click="gerarPDF"
        class="px-4 py-2 bg-dodgerblue text-white rounded hover:bg-royalblue flex items-center gap-2"
      >
        📄 Gerar PDF
      </button>
    </div>

    <div v-if="store.loading" class="text-darkslategray flex justify-center items-center h-32">
      <span class="animate-spin border-4 border-dodgerblue border-t-transparent rounded-full w-8 h-8 mr-2"></span>
      Carregando relatórios...
    </div>
    <div v-if="store.error" class="text-red-600 p-3 bg-mistyrose rounded-lg">{{ store.error }}</div>

    <div v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-lightsteelblue p-4 rounded shadow text-center">
          <p class="text-lg font-semibold">Total Denúncias</p>
          <p class="text-2xl font-bold text-darkslateblue">{{ store.totalDenuncias }}</p>
        </div>
        <div class="bg-slategray p-4 rounded shadow text-center text-white">
          <p class="text-lg font-semibold">Usuários Banidos</p>
          <p class="text-2xl font-bold text-midnightblue">{{ store.totalBanidos }}</p>
        </div>
      </div>

      <!-- ✅ RESTAURADO: Denúncias por Categoria -->
      <div class="bg-powderblue p-4 rounded shadow mb-6">
        <h2 class="text-xl font-bold mb-2">Denúncias por Categoria</h2>
        <Charts
          v-if="store.denunciasPorCategoria.length"
          type="bar"
          :data="denunciasPorCategoriaChart"
          title="Denúncias por Categoria"
          @error="onChartError('Denúncias por Categoria')"
        />
        <p v-else class="text-darkslategray">Nenhuma denúncia registrada.</p>
      </div>

      <!-- ✅ Mantido: Denúncias por Secretaria -->
      <div class="bg-powderblue p-4 rounded shadow mb-6">
        <h2 class="text-xl font-bold mb-2">Denúncias por Secretaria</h2>
        <Charts
          v-if="store.denunciasPorSecretaria.length"
          type="bar"
          :data="denunciasPorSecretariaChart"
          title="Denúncias por Secretaria"
          @error="onChartError('Denúncias por Secretaria')"
        />
        <p v-else class="text-darkslategray">Nenhuma denúncia registrada.</p>
      </div>

      <div class="bg-powderblue p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Evolução das Denúncias (por mês)</h2>
        <Charts
          v-if="store.denunciasPorPeriodo.length"
          type="bar"
          :data="denunciasPorPeriodoChart"
          title="Evolução das Denúncias (por mês)"
          @error="onChartError('Evolução das Denúncias')"
        />
        <p v-else class="text-darkslategray">Nenhuma denúncia registrada.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRelatoriosStore } from '@/store/useRelatoriosStore'
import NavigationButtons from '@/components/NavigationButtons.vue'
import Charts from '@/components/Charts.vue'
import html2pdf from 'html2pdf.js'
import type { ChartData } from 'chart.js'

const store = useRelatoriosStore()

// ✅ RESTAURADO: Gráfico por Categoria
const denunciasPorCategoriaChart = computed<ChartData<'bar', number[], string>>(() => ({
  labels: store.denunciasPorCategoria.map(d => formatCategoria(d.categoria)),
  datasets: [
    {
      label: 'Denúncias',
      data: store.denunciasPorCategoria.map(d => d.total),
      backgroundColor: '#4682B4' // steelblue
    }
  ]
}))

const denunciasPorSecretariaChart = computed<ChartData<'bar', number[], string>>(() => ({
  labels: store.denunciasPorSecretaria.map(d => d.secretaria_nome),
  datasets: [
    {
      label: 'Denúncias',
      data: store.denunciasPorSecretaria.map(d => d.total),
      backgroundColor: '#7FFFD4' // aquamarine
    }
  ]
}))

const denunciasPorPeriodoChart = computed<ChartData<'bar', number[], string>>(() => ({
  labels: store.denunciasPorPeriodo.map(d => d.mes),
  datasets: [
    {
      label: 'Denúncias',
      data: store.denunciasPorPeriodo.map(d => d.total),
      backgroundColor: '#191970' // midnightblue
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
  console.warn(`[Relatorios.vue] Erro ao renderizar gráfico: ${chartName}`)
}

function gerarPDF() {
  const element = document.querySelector('.w-full.max-w-6xl') as HTMLElement
  if (!element) return

  const opt = {
    margin: 10,
    filename: 'relatorio-denuncias.pdf',
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