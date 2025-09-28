<template>
  <div class="navigation-buttons">
    <button
      v-if="canGoBack && !isLoginOrRegister"
      @click="goBack"
      class="bg-lightsteelblue hover:bg-steelblue text-darkslateblue px-4 py-2 rounded-md text-sm font-medium transition transform hover:scale-105"
    >
      Voltar
    </button>
    <button
      @click="logout"
      class="bg-midnightblue hover:bg-darkslateblue text-white px-4 py-2 rounded-md text-sm font-medium transition transform hover:scale-105"
    >
      Sair
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/api/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const canGoBack = ref(false);
const isLoginOrRegister = computed(() => {
  return ['login', 'register', 'usuario-banido'].includes(router.currentRoute.value.name as string);
});

onMounted(() => {
  canGoBack.value = window.history.length > 1;
});

function goBack() {
  if (canGoBack.value) {
    router.back();
  }
}

async function logout() {
  if (!authStore.user) {
    alert('Você não está logado.');
    return;
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    router.replace('/login'); 
    alert('Você saiu com sucesso!');
  } catch (err: any) {
    console.error('Erro ao sair:', err);
    alert('Falha ao sair. Tente novamente.');
  }
}
</script>

<style scoped>
.navigation-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
