<template>
  <AppLayout title="Gerenciamento de Usuários" :show-back-button="true" :show-logout-button="true">
    <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div v-if="loading" class="text-gray-500 text-center py-10">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando usuários...
        </div>
      </div>

      <div v-else-if="usuarios.length === 0" class="text-gray-600 text-center py-10">
        Nenhum usuário encontrado.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="usuario in usuarios"
          :key="usuario.id"
          class="border rounded p-4 flex justify-between items-center"
        >
          <div>
            <p class="font-bold">{{ usuario.nome }}</p>
            <p class="text-sm text-gray-500">{{ usuario.email }}</p>
            <p class="text-sm text-gray-500">Admin: {{ usuario.is_admin ? 'Sim' : 'Não' }}</p>
            <p class="text-sm text-gray-500">Banido: {{ usuario.is_banned ? 'Sim' : 'Não' }}</p>
          </div>
          <button
            @click="toggleBan(usuario)"
            :disabled="usuario.isUpdating"
            :class="[
              usuario.isUpdating ? 'bg-gray-400 cursor-not-allowed' : (usuario.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'),
              'text-white px-3 py-1 rounded transition'
            ]"
          >
            <span v-if="usuario.isUpdating">Aguarde...</span>
            <span v-else>{{ usuario.is_banned ? 'Desbanir' : 'Banir' }}</span>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { supabase } from '@/api/supabaseClient'

interface Usuario {
  id: string // ✅ Padronizado como string (UUID)
  nome: string
  email: string
  is_admin: boolean
  is_banned: boolean
  isUpdating?: boolean // ✅ Estado local para feedback de UI
}

const usuarios = ref<Usuario[]>([])
const loading = ref(true)

async function loadUsuarios() {
  loading.value = true
  try {
    const {  data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    // ✅ Inicializa isUpdating como false para cada usuário
    usuarios.value = (data as Usuario[]).map(u => ({ ...u, isUpdating: false }))
  } catch (err) {
    console.error('[Usuarios.vue] Erro ao carregar usuários:', err)
    alert('Erro ao carregar lista de usuários. Tente novamente.')
  } finally {
    loading.value = false
  }
}

async function toggleBan(usuario: Usuario) {
  // ✅ Evita múltiplos cliques
  if (usuario.isUpdating) return

  // ✅ Atualiza estado local imediatamente para feedback visual
  usuario.isUpdating = true
  const previousState = usuario.is_banned

  try {
    const {  error } = await supabase
      .from('usuarios')
      .update({ is_banned: !usuario.is_banned })
      .eq('id', usuario.id)

    if (error) throw error

    // ✅ Atualiza estado local apenas se backend confirmar
    usuario.is_banned = !usuario.is_banned
  } catch (err) {
    console.error('[Usuarios.vue] Erro ao atualizar banimento:', err)
    alert('Erro ao atualizar status do usuário. Verifique sua conexão.')
    // ✅ Reverte estado local em caso de erro
    usuario.is_banned = previousState
  } finally {
    usuario.isUpdating = false
  }
}

onMounted(() => {
  loadUsuarios()
})
</script>