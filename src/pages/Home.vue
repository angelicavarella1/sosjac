<template>
  <!-- Botões de navegação -->
  <NavigationButtons :disable-back="true" />

  <!-- Loading -->
  <div v-if="auth.loading || !auth.user" class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <p class="text-xl text-gray-700 font-semibold">Carregando dados do usuário...</p>
    <div class="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <!-- Conteúdo principal -->
  <div v-else class="min-h-screen flex flex-col items-center bg-gray-100 p-6">
    <div class="w-full max-w-3xl bg-white rounded shadow-md p-6">
      <h1 class="text-3xl font-bold mb-8 text-center">
        Bem-vindo ao SOSJAC<span v-if="auth.nome">, {{ auth.nome }}</span>!
      </h1>

      <!-- Ações do Usuário -->
      <div class="mb-10 flex flex-col items-center w-full">
        <h2 class="text-xl font-semibold mb-4 text-center">Ações do Usuário</h2>
        <div class="flex justify-center gap-x-4 w-full">
          <router-link to="/reportar" class="action-button bg-primary-light hover:bg-primary text-white transition-all">
            Reportar Denúncia
          </router-link>
          <router-link to="/minhas-denuncias" class="action-button bg-secondary-light hover:bg-secondary text-white transition-all">
            Minhas Denúncias
          </router-link>
        </div>
      </div>

      <!-- Painel do Administrador -->
      <div v-if="auth.isAdmin" class="mb-10 p-6 bg-gray-50 rounded shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-center">Painel do Administrador</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
          <router-link to="/mapa-admin" class="action-button bg-purple-400 hover:bg-purple-600 text-white transition-all">
            Mapa Administrativo
          </router-link>
          <router-link to="/todas-denuncias" class="action-button bg-indigo-400 hover:bg-indigo-600 text-white transition-all">
            Todas Denúncias
          </router-link>
          <router-link to="/usuarios" class="action-button bg-yellow-400 hover:bg-yellow-600 text-neutral-dark transition-all">
            Gerenciar Usuários
          </router-link>
          <router-link to="/estatisticas" class="action-button bg-pink-400 hover:bg-pink-600 text-white transition-all">
            Estatísticas
          </router-link>
          <router-link to="/graficos" class="action-button bg-green-600 hover:bg-green-700 text-white transition-all">
            Gráficos
          </router-link>
          <router-link to="/relatorios" class="action-button bg-neutral-light hover:bg-neutral text-white transition-all">
            Relatórios
          </router-link>
        </div>
      </div>

      <!-- Estatísticas (somente admin) -->
      <div v-if="auth.isAdmin" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
        <div class="p-4 bg-blue-50 rounded shadow text-center w-full max-w-[280px] hover:shadow-lg transition-all">
          <p class="text-lg font-medium mb-2">Total de Denúncias</p>
          <p class="text-2xl font-bold">{{ totalDenuncias }}</p>
        </div>
        <div class="p-4 bg-green-50 rounded shadow text-center w-full max-w-[280px] hover:shadow-lg transition-all">
          <p class="text-lg font-medium mb-2">Total de Usuários</p>
          <p class="text-2xl font-bold">{{ totalUsuarios }}</p>
        </div>
        <div class="p-4 bg-red-50 rounded shadow text-center w-full max-w-[280px] hover:shadow-lg transition-all">
          <p class="text-lg font-medium mb-2">Total de Banidos</p>
          <p class="text-2xl font-bold">{{ totalBanidos }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavigationButtons from '@/components/NavigationButtons.vue';
import { ref, watch } from 'vue';
import { supabase } from '@/api/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';

const auth = useAuthStore();
const totalDenuncias = ref<number>(0);
const totalUsuarios = ref<number>(0);
const totalBanidos = ref<number>(0);

async function loadStats() {
  if (!auth.user) return;
  try {
    const promises = [
      supabase.from('denuncias').select('id', { count: 'exact', head: true }),
      supabase.from('usuarios').select('id', { count: 'exact', head: true })
    ];
    if (auth.isAdmin) {
      promises.push(
        supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('is_banned', true)
      );
    }
    const [denunciasData, usuariosData, banidosData] = await Promise.all(promises);
    totalDenuncias.value = denunciasData.count ?? 0;
    totalUsuarios.value = usuariosData.count ?? 0;
    if (auth.isAdmin && banidosData) totalBanidos.value = banidosData.count ?? 0;
  } catch (err) {
    console.error('[Home.vue] Erro ao carregar estatísticas:', err);
  }
}

watch(() => auth.user, (newUser) => { if (newUser) loadStats() }, { immediate: true });
</script>

<style scoped lang="postcss">
.action-button {
  @apply p-6 rounded shadow flex items-center justify-center text-center transition-all min-h-[80px] w-full max-w-[320px] font-semibold transform;
}
.action-button:hover {
  @apply scale-105 shadow-lg;
}
</style>
