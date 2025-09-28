<template>
  <div class="flex flex-col items-center p-4">
    <NavigationButtons :disable-back="true" class="mt-2 w-full max-w-6xl" />

    <main class="flex-1 w-full max-w-6xl mt-6">
      <div v-if="auth.loading || !auth.isLoaded" class="flex justify-center items-center h-96">
        <span class="animate-spin border-4 border-dodgerblue border-t-transparent rounded-full w-12 h-12"></span>
      </div>

      <div v-else class="bg-white rounded-xl shadow-md p-6 mb-10">
        <h1 class="text-3xl font-bold mb-8 text-center">
          Bem-vindo ao SOSJAC<span v-if="auth.nome">, {{ auth.nome }}</span>!
        </h1>

        <!-- ✅ BOTÃO DE NOTIFICAÇÕES PUSH — NOVO! -->
        <div class="mb-8 flex justify-center">
          <NotificacoesPushButton />
        </div>

        <div class="mb-10 flex flex-wrap justify-center gap-6">
          <router-link
            to="/reportar"
            class="dashboard-card bg-gradient-to-br from-lightsteelblue to-cornflowerblue hover:from-steelblue hover:to-royalblue"
            title="Registrar uma nova denúncia"
          >
            <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
            <span class="text-lg font-semibold">Reportar Denúncia</span>
          </router-link>

          <router-link
            to="/minhas-denuncias"
            class="dashboard-card bg-gradient-to-br from-aquamarine to-mediumaquamarine hover:from-mediumaquamarine hover:to-darkslategray"
            title="Ver suas denúncias registradas"
          >
            <i class="fas fa-list text-3xl mb-2"></i>
            <span class="text-lg font-semibold">Minhas Denúncias</span>
          </router-link>
        </div>

        <div class="flex justify-center gap-4 flex-wrap">
          <div class="mini-card bg-cornflowerblue text-darkslateblue" title="Denúncias pendentes">
            <p class="font-bold text-2xl">{{ denunciasPendentes }}</p>
            <p class="text-sm uppercase tracking-wider">Pendentes</p>
          </div>

          <div class="mini-card bg-lightsteelblue text-darkslateblue" title="Denúncias abertas">
            <p class="font-bold text-2xl">{{ denunciasAbertas }}</p>
            <p class="text-sm uppercase tracking-wider">Abertas</p>
          </div>

          <div class="mini-card bg-aquamarine text-darkslategray" title="Denúncias concluídas">
            <p class="font-bold text-2xl">{{ denunciasConcluidas }}</p>
            <p class="text-sm uppercase tracking-wider">Concluídas</p>
          </div>

          <div class="mini-card bg-slategray text-white" title="Denúncias rejeitadas">
            <p class="font-bold text-2xl">{{ denunciasRejeitadas }}</p>
            <p class="text-sm uppercase tracking-wider">Rejeitadas</p>
          </div>
        </div>
      </div>

      <div v-if="auth.isAdmin" class="bg-white rounded-xl shadow-md p-6 mt-6 flex justify-center">
        <router-link
          to="/admin"
          class="dashboard-card bg-gradient-to-br from-royalblue to-darkslateblue hover:from-darkslateblue hover:to-midnightblue w-full max-w-3xl flex flex-col items-center justify-center p-8 text-center"
          title="Acessar painel principal de análise e gestão"
        >
          <span class="text-2xl font-bold text-white">Dashboard Administrativo</span>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'
import NotificacoesPushButton from '@/components/NotificacoesPushButton.vue' // ✅ IMPORTADO AQUI

interface DenunciaStatus {
  status: 'pendente' | 'aberta' | 'concluida' | 'rejeitada'
}

const auth = useAuthStore()

const denunciasPendentes = ref(0)
const denunciasAbertas = ref(0)
const denunciasConcluidas = ref(0)
const denunciasRejeitadas = ref(0)

async function loadUserStats() {
  if (!auth.user?.id) return
  try {
    const { data, error } = await supabase
      .from('denuncias')
      .select('status')
      .eq('user_id', auth.user.id)

    if (error) throw error

    const denuncias = data as DenunciaStatus[]

    const counts = denuncias.reduce((acc: Record<string, number>, d: DenunciaStatus) => {
      acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    }, {})

    denunciasPendentes.value = counts.pendente || 0
    denunciasAbertas.value = counts.aberta || 0
    denunciasConcluidas.value = counts.concluida || 0
    denunciasRejeitadas.value = counts.rejeitada || 0

  } catch (err) {
    console.error('Erro ao carregar estatísticas do usuário:', err)
  }
}

onMounted(() => {
  auth.loadUser()
})

watch(() => auth.user, (newUser) => {
  if (newUser) loadUserStats()
}, { immediate: true })
</script>

<style scoped lang="postcss">
.dashboard-card {
  @apply flex flex-col items-center justify-center p-6 rounded-xl shadow-md text-white font-semibold text-center transition-transform transform min-w-[200px] max-w-[250px] h-28 hover:scale-105 hover:shadow-lg cursor-pointer;
  background-size: 200% 200%;
}

.dashboard-card i {
  @apply mb-2;
}

.mini-card {
  @apply flex flex-col items-center justify-center rounded-lg shadow-md px-6 py-4 w-48 h-28 text-center transition-transform hover:scale-105 cursor-pointer;
}
</style>