<template>
  <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
    <!-- Botões de navegação -->
    <NavigationButtons />

    <h1 class="text-2xl font-bold mb-4">Estatísticas Detalhadas</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-gray-100 rounded shadow">
        <p class="text-lg font-bold">Denúncias por Categoria</p>
        <ul class="mt-2 list-disc list-inside text-gray-700">
          <li v-for="(count, cat) in denunciasPorCategoria" :key="cat">
            {{ formatCategoria(cat) }}: {{ count }}
          </li>
        </ul>
      </div>
      <div class="p-4 bg-gray-100 rounded shadow">
        <p class="text-lg font-bold">Usuários Ativos vs Banidos</p>
        <p class="mt-2 text-gray-700">Ativos: {{ totalAtivos }}</p>
        <p class="text-gray-700">Banidos: {{ totalBanidos }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'

const auth = useAuthStore()
const denunciasPorCategoria = ref<Record<string, number>>({})
const totalAtivos = ref(0)
const totalBanidos = ref(0)

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

async function loadEstatisticas() {
  if (!auth.user) return

  try {
    const { data: denunciasData } = await supabase.from('denuncias').select('categoria')
    denunciasPorCategoria.value = {}
    denunciasData?.forEach(d => {
      denunciasPorCategoria.value[d.categoria] = (denunciasPorCategoria.value[d.categoria] || 0) + 1
    })

    const { count: totalUsuarios } = await supabase.from('usuarios').select('id', { count: 'exact', head: true })
    const { count: totalBans } = await supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('is_banned', true)

    totalBanidos.value = totalBans || 0
    totalAtivos.value = (totalUsuarios || 0) - totalBanidos.value
  } catch (err) {
    console.error('[Estatisticas.vue] erro ao carregar estatísticas:', err)
  }
}

watch(() => auth.user, (newUser) => {
  if (newUser) loadEstatisticas()
}, { immediate: true })
</script>
