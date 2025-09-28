<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-mistyrose p-6"
    role="alert"
    aria-live="assertive"
  >
    <h1 class="text-3xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
    <p class="text-xl text-darkslateblue text-center">
      Sua conta está banida. Entre em contato com o suporte para mais informações.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@vueuse/head'

// ✅ Adicionado: Título dinâmico para SEO
useHead({
  title: 'Acesso Negado - SOSJAC',
  meta: [
    { name: 'description', content: 'Sua conta foi banida. Entre em contato com o suporte.' }
  ]
})
</script>