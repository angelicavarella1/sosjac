<!-- NavigationButtons.vue -->
<template>
  <div class="navigation-buttons">
    <button v-if="canGoBack" @click="goBack">Voltar</button>
    <button @click="logout">Sair</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
// se @ aponta para src  se @ aponta para src
// ajuste o caminho se necessário

const router = useRouter()
const canGoBack = ref(false)

onMounted(() => {
  // Verifica se existe página anterior
  canGoBack.value = window.history.length > 1
})

function goBack() {
  window.history.back()
}

async function logout() {
  try {
    // Limpa a sessão do Supabase
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Erro ao sair:', error.message)
    
    // Redireciona para a página de login
    router.push('/login')
  } catch (err) {
    console.error('Erro inesperado ao sair:', err)
  }
}
</script>

<style scoped>
.navigation-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.navigation-buttons button {
  padding: 10px 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.navigation-buttons button:hover {
  background-color: #e0e0e0;
}

.navigation-buttons button:last-child {
  background-color: #dc3545;
  color: white;
  border: none;
}

.navigation-buttons button:last-child:hover {
  background-color: #c82333;
}
</style>
