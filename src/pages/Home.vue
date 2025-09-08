<template>
  <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6">
    <h1 class="text-3xl font-bold mb-6">
      Bem-vindo ao SOSJAC<span v-if="auth.nome">, {{ auth.nome }}</span>!
    </h1>
    <p class="text-gray-700 mb-6">
      Aqui você pode reportar problemas urbanos, acompanhar suas denúncias e visualizar informações da comunidade.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <router-link
        v-if="!isAdmin"
        to="/reportar"
        class="p-4 bg-blue-600 text-white rounded shadow hover:bg-blue-700 text-center"
      >
        Reportar Denúncia
      </router-link>

      <router-link
        to="/minhas-denuncias"
        class="p-4 bg-green-600 text-white rounded shadow hover:bg-green-700 text-center"
      >
        Minhas Denúncias
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/mapa-admin"
        class="p-4 bg-purple-600 text-white rounded shadow hover:bg-purple-700 text-center"
      >
        Mapa Administrativo
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/todas-denuncias"
        class="p-4 bg-yellow-600 text-white rounded shadow hover:bg-yellow-700 text-center"
      >
        Todas as Denúncias
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/gerenciar-usuarios"
        class="p-4 bg-red-600 text-white rounded shadow hover:bg-red-700 text-center"
      >
        Gerenciar Usuários
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/relatorios"
        class="p-4 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 text-center"
      >
        Relatórios
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-gray-100 rounded shadow text-center">
        <p class="text-xl font-bold">{{ totalDenuncias }}</p>
        <p class="text-gray-600">Denúncias Totais</p>
      </div>
      <div class="p-4 bg-gray-100 rounded shadow text-center">
        <p class="text-xl font-bold">{{ totalUsuarios }}</p>
        <p class="text-gray-600">Usuários</p>
      </div>
      <div v-if="isAdmin" class="p-4 bg-gray-100 rounded shadow text-center">
        <p class="text-xl font-bold">{{ totalBanidos }}</p>
        <p class="text-gray-600">Usuários Banidos</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

const auth = useAuthStore()
const isAdmin = computed<boolean>(() => auth.isAdmin ?? false)

const totalDenuncias = ref<number>(0)
const totalUsuarios = ref<number>(0)
const totalBanidos = ref<number>(0)

async function loadStats() {
  try {
    const promises = [
      supabase.from('denuncias').select('id', { count: 'exact', head: true }),
      supabase.from('usuarios').select('id', { count: 'exact', head: true })
    ];

    if (isAdmin.value) {
      promises.push(
        supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('is_banned', true)
      );
    }

    const [denunciasData, usuariosData, banidosData] = await Promise.all(promises);

    totalDenuncias.value = denunciasData.count ?? 0;
    totalUsuarios.value = usuariosData.count ?? 0;

    if (isAdmin.value && banidosData) {
      totalBanidos.value = banidosData.count ?? 0;
    }
  } catch (err) {
    console.error('[Home.vue] Erro ao carregar estatísticas:', err);
  }
}

onMounted(() => {
  if (auth.user) {
    loadStats();
  }
});
</script>