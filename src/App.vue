<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificacaoStore } from '@/store/useNotificacaoStore'

const notificacaoStore = useNotificacaoStore()

// Apenas inicializa a store se houver algum método necessário já implementado
onMounted(() => {
  // Se houver algum método de inicialização existente, chame aqui
  // Ex: notificacaoStore.carregarNotificacoes()
})
</script>

<style>
/* Estilos globais, se houver */
</style>