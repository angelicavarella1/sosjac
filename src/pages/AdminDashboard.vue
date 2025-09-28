<template>
  <div class="flex-1 p-4 sm:p-6">
    <div class="flex justify-end items-center mb-6">
      <NavigationButtons />
    </div>

    <div class="flex justify-center mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-4/5 xl:w-3/4">
        <router-link
          to="/todas-denuncias?status=pendente"
          class="stats-card status-pendente"
          role="button"
          tabindex="0"
          aria-label="Ver denúncias pendentes"
        >
          <p class="text-base font-medium mb-1">Pendentes</p>
          <p class="text-xl font-bold">{{ pendentes }}</p>
        </router-link>
        <router-link
          to="/todas-denuncias?status=aberta"
          class="stats-card status-aberta"
          role="button"
          tabindex="0"
          aria-label="Ver denúncias abertas"
        >
          <p class="text-base font-medium mb-1">Abertas</p>
          <p class="text-xl font-bold">{{ abertas }}</p>
        </router-link>
        <router-link
          to="/todas-denuncias?status=concluida"
          class="stats-card status-concluida"
          role="button"
          tabindex="0"
          aria-label="Ver denúncias concluídas"
        >
          <p class="text-base font-medium mb-1">Concluídas</p>
          <p class="text-xl font-bold">{{ concluidas }}</p>
        </router-link>
        <router-link
          to="/todas-denuncias?status=rejeitada"
          class="stats-card status-rejeitada"
          role="button"
          tabindex="0"
          aria-label="Ver denúncias rejeitadas"
        >
          <p class="text-base font-medium mb-1">Rejeitadas</p>
          <p class="text-xl font-bold">{{ rejeitadas }}</p>
        </router-link>
      </div>
    </div>
    
    <div class="flex justify-center mb-6">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full lg:w-4/5 xl:w-3/4">
        <router-link
          to="/mapa-admin"
          class="dashboard-card card-base bg-dodgerblue hover:bg-royalblue"
          title="Visualizar todas as denúncias no mapa"
          role="button"
          tabindex="0"
          aria-label="Acessar o mapa administrativo"
        >
          <i class="fas fa-map-marked-alt text-2xl mb-1" aria-hidden="true"></i>
          <span class="text-sm">Mapa Administrativo</span>
        </router-link>
        
        <router-link
          to="/todas-denuncias"
          class="dashboard-card card-base bg-royalblue hover:bg-darkslateblue"
          title="Acessar todas as denúncias registradas"
          role="button"
          tabindex="0"
          aria-label="Ver todas as denúncias"
        >
          <i class="fas fa-clipboard-list text-2xl mb-1" aria-hidden="true"></i>
          <span class="text-sm">Todas Denúncias</span>
        </router-link>

        <router-link
          to="/usuarios"
          class="dashboard-card card-base bg-aquamarine hover:bg-mediumaquamarine text-darkslategray"
          title="Gerenciar usuários e permissões"
          role="button"
          tabindex="0"
          aria-label="Gerenciar usuários"
        >
          <i class="fas fa-users-cog text-2xl mb-1" aria-hidden="true"></i>
          <span class="text-sm">Usuários</span>
        </router-link>

        <router-link
          to="/estatisticas"
          class="dashboard-card card-base bg-steelblue hover:bg-royalblue"
          title="Visualizar estatísticas gerais"
          role="button"
          tabindex="0"
          aria-label="Ver estatísticas gerais"
        >
          <i class="fas fa-chart-bar text-2xl mb-1" aria-hidden="true"></i>
          <span class="text-sm">Estatísticas</span>
        </router-link>

        <router-link
          to="/graficos"
          class="dashboard-card card-base bg-steelblue hover:bg-royalblue"
          title="Gráficos detalhados"
          role="button"
          tabindex="0"
          aria-label="Ver gráficos detalhados"
        >
          <i class="fas fa-chart-pie text-2xl mb-1" aria-hidden="true"></i>
          <span class="text-sm">Gráficos</span>
        </router-link>

        <router-link
          to="/relatorios"
          class="dashboard-card card-base bg-lightsteelblue text-darkslategray hover:bg-slategray"
          title="Gerar relatórios completos"
          role="button"
          tabindex="0"
          aria-label="Gerar relatórios completos"
        >
          <i class="fas fa-file-alt text-2xl mb-1" aria-hidden="true"></i>
          <span class="text-sm">Relatórios</span>
        </router-link>

        <router-link
          to="/secretarias"
          class="dashboard-card card-base bg-midnightblue hover:bg-darkslateblue"
          title="Gerenciar e enviar e-mails às secretarias"
          role="button"
          tabindex="0"
          aria-label="Gerenciar secretarias"
        >
          <i class="fas fa-building text-2xl mb-1" aria-hidden="true"></i>
          <span class="text-sm">Secretarias</span>
        </router-link>
      </div>
    </div>

    <!-- Feedback de erro (se houver) -->
    <div v-if="error" class="text-red-600 text-center p-3 bg-mistyrose rounded-lg mt-4">
      ❌ {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { useAuthStore } from '@/store/useAuthStore';
// ✅ Removido: useRouter não é mais necessário
import NavigationButtons from '@/components/NavigationButtons.vue';

const denunciasStore = useDenunciasStore();
const authStore = useAuthStore();

const pendentes = ref(0);
const abertas = ref(0);
const concluidas = ref(0);
const rejeitadas = ref(0);
const error = ref<string | null>(null);

// ✅ Aprimorado: Função de carregamento com proteção contra chamadas múltiplas
let isFetching = false;

async function loadDashboardStats() {
  if (isFetching) return; // Evita chamadas múltiplas

  isFetching = true;
  try {
    error.value = null;
    await denunciasStore.fetchDenuncias();
    pendentes.value = denunciasStore.pendentes.length;
    abertas.value = denunciasStore.abertas.length;
    concluidas.value = denunciasStore.concluidas.length;
    rejeitadas.value = denunciasStore.rejeitadas.length;
  } catch (err) {
    console.error('[DashboardAdmin] Erro ao carregar estatísticas:', err);
    error.value = 'Não foi possível carregar as estatísticas. Tente recarregar a página.';
  } finally {
    isFetching = false;
  }
}

watch(() => authStore.isLoaded, (isLoaded) => {
  if (isLoaded && authStore.isAdmin) {
    loadDashboardStats();
  } else if (isLoaded && !authStore.isAdmin) {
    // ✅ Removido: useRouter
    window.location.href = '/login';
  }
}, { immediate: true });
</script>

<style scoped lang="postcss">
/* Classe base para cards */
.card-base {
  @apply flex flex-col items-center justify-center p-4 rounded-lg shadow-md font-semibold text-center transition-transform transform min-h-[100px] hover:scale-105 hover:shadow-lg cursor-pointer;
}

.card-base i {
  @apply mb-1;
}

/* Cards de status - mantêm as cores originais */
.stats-card {
  @apply p-3 rounded-lg shadow text-center w-full max-w-[220px] hover:shadow-lg transition-all;
  font-size: 0.9rem;
}

.status-pendente {
  @apply bg-powderblue text-darkslateblue;
}

.status-aberta {
  @apply bg-cornflowerblue text-white;
}

.status-concluida {
  @apply bg-mediumaquamarine text-darkslategray;
}

.status-rejeitada {
  @apply bg-slategray text-white;
}

/* Dashboard cards - já usam card-base, então apenas cores específicas */
.dashboard-card {
  @apply text-white;
}
</style>