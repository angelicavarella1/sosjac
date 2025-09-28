<template>
  <div class="flex flex-col w-full max-w-6xl mt-6 p-6 bg-white rounded shadow space-y-6">

    <NavigationButtons />

    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">📊 Estatísticas e Relatórios</h1>
      <!-- ✅ Botão Gerar PDF (substitui ExportarPDF) -->
      <button
        @click="gerarPDF"
        class="px-4 py-2 bg-dodgerblue text-white rounded hover:bg-royalblue flex items-center gap-2"
      >
        📄 Gerar PDF
      </button>
    </div>

    <div v-if="store.loading" class="text-darkslategray">Carregando estatísticas...</div>
    <div v-if="store.error" class="text-red-600">{{ store.error }}</div>

    <div v-else class="estatisticas-list">
      <div class="mb-6">
        <p class="text-lg font-semibold">Resumo Geral</p>
        <ul class="list-disc list-inside text-darkslategray mt-2">
          <li>Total de denúncias: {{ store.totalDenuncias }}</li>
          <li>Total de usuários banidos: {{ store.totalBanidos }}</li>
        </ul>
      </div>

      <div class="mb-6">
        <p class="text-lg font-semibold">Denúncias por Categoria</p>
        <ul class="list-disc list-inside text-darkslategray mt-2">
          <li v-for="(item, index) in store.denunciasPorCategoria" :key="item.categoria + '-' + index">
            {{ formatCategoria(item.categoria) }}: {{ item.total }}
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <p class="text-lg font-semibold">Denúncias por Secretaria</p>
        <ul class="list-disc list-inside text-darkslategray mt-2">
          <li v-for="(item, index) in store.denunciasPorSecretaria" :key="item.secretaria_nome + '-' + index">
            {{ formatSecretaria(item.secretaria_nome) }}: {{ item.total }}
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <p class="text-lg font-semibold">Evolução das Denúncias (por mês)</p>
        <ul class="list-disc list-inside text-darkslategray mt-2">
          <li v-for="(item, index) in store.denunciasPorPeriodo" :key="item.mes + '-' + index">
            {{ item.mes }}: {{ item.total }} denúncias
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRelatoriosStore } from '@/store/useRelatoriosStore'
import NavigationButtons from '@/components/NavigationButtons.vue'
import html2pdf from 'html2pdf.js'

const store = useRelatoriosStore()

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

function formatSecretaria(secretaria: string) {
  const map: Record<string, string> = {
    educacao: 'Educação',
    saude: 'Saúde',
    infraestrutura: 'Infraestrutura',
    seguranca: 'Segurança',
    outros: 'Outros'
  }
  return map[secretaria] || secretaria
}

function gerarPDF() {
  const element = document.querySelector('.flex.flex-col.w-full.max-w-6xl') as HTMLElement
  if (!element) return
  html2pdf().from(element).save('estatisticas-denuncias.pdf')
}

onMounted(() => {
  store.loadResumo()
})
</script>

<style scoped>
.estatisticas-list ul {
  margin-top: 0.25rem;
}
</style>