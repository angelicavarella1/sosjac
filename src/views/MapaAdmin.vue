<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Cabe�alho -->
    <header class="bg-white shadow-sm border-b px-6 py-4">
      <h1 class="text-2xl font-bold text-blue-900">Mapa de Den�ncias - SOSJAC</h1>
      <p class="text-gray-600">Visualiza��o completa de todos os problemas reportados</p>
    </header>

    <!-- Conte�do -->
    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Mapa Interativo</h2>
        <DenunciasMap />
      </div>
    </main>
  </div>
</template>

<script>
import DenunciasMap from '../components/DenunciasMap.vue'

export default {
  components: { DenunciasMap }
}
</script>
