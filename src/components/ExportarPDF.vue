<template>
  <button
    @click="gerarPDF"
    :disabled="loading"
    class="bg-dodgerblue hover:bg-royalblue disabled:opacity-50 text-white font-semibold py-2 px-4 rounded shadow transition flex items-center gap-2"
  >
    <span v-if="loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
    <span v-else>Exportar Estatísticas em PDF</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRelatoriosStore } from '@/store/useRelatoriosStore'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/api/supabaseClient'
import jsPDF from 'jspdf'

const authStore = useAuthStore()
const store = useRelatoriosStore()
const loading = ref(false)

const gerarPDF = async () => {
  if (!authStore.isAdmin) {
    alert('Acesso negado: somente administradores podem gerar relatórios.')
    return
  }

  loading.value = true
  try {
    // Buscar dados completos das denúncias — SEM 'usuarios'
    const { data: denuncias, error: denunciasError } = await supabase
      .from('denuncias')
      .select(`
        id,
        titulo,
        status,
        categoria,
        created_at,
        secretarias(nome)
      `)
      .order('created_at', { ascending: false })

    if (denunciasError) throw denunciasError

    if (!denuncias || denuncias.length === 0) {
      alert('Nenhuma denúncia encontrada para gerar relatório.')
      return
    }

    // Criar PDF
    const doc = new jsPDF()

    // Configurações iniciais
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let y = 20

    // Título
    doc.setFontSize(20)
    doc.text('Relatório de Estatísticas - SOSJAC', 14, y)
    y += 10

    // Data e total
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, y)
    y += 6
    doc.text(`Total de denúncias: ${denuncias.length}`, 14, y)
    y += 10

    // Agrupar por status
    const statusCount: Record<string, number> = {}
    denuncias.forEach(d => {
      statusCount[d.status] = (statusCount[d.status] || 0) + 1
    })

    // Gráfico de status (texto)
    doc.setFontSize(12)
    doc.text('📊 Estatísticas por Status:', 14, y)
    y += 8

    Object.entries(statusCount).forEach(([status, count]) => {
      doc.setFontSize(10)
      doc.text(`${status}: ${count} denúncias`, 14, y)
      y += 6
    })

    // Tabela de denúncias — SEM coluna 'Autor'
    y += 10
    doc.setFontSize(12)
    doc.text('📋 Lista de Denúncias:', 14, y)
    y += 8

    // Cabeçalhos da tabela
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    const headers = ['#', 'Título', 'Status', 'Categoria', 'Data']
    const columnWidths = [10, 60, 25, 30, 25]
    let x = 14

    headers.forEach((header, index) => {
      doc.text(header, x, y)
      x += columnWidths[index]
    })
    y += 6

    // Dados da tabela
    doc.setFont('helvetica', 'normal')
    denuncias.forEach((d: any, index: number) => {
      if (y > pageHeight - 20) {
        doc.addPage()
        y = 20
      }

      x = 14
      const row = [
        (index + 1).toString(),
        d.titulo.substring(0, 25) + (d.titulo.length > 25 ? '...' : ''),
        d.status,
        d.categoria || 'Geral',
        new Date(d.created_at).toLocaleDateString('pt-BR')
      ]

      row.forEach((cell, cellIndex) => {
        doc.text(cell, x, y)
        x += columnWidths[cellIndex]
      })
      y += 6
    })

    // Salvar PDF
    const fileName = `Estatisticas_Oficial_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)

    alert('✅ Relatório gerado com sucesso!')

  } catch (err: any) {
    console.error('❌ Erro ao gerar PDF:', err)
    alert('Falha ao gerar relatório: ' + (err.message || 'Erro desconhecido'))
  } finally {
    loading.value = false
  }
}
</script>