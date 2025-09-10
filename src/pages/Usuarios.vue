<template>
  <div class="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
    <!-- Botões de navegação -->
    <NavigationButtons />

    <h1 class="text-2xl font-bold mb-4">Gerenciar Usuários</h1>

    <table class="min-w-full bg-white border">
      <thead>
        <tr class="bg-gray-100">
          <th class="py-2 px-4 border-b">Nome</th>
          <th class="py-2 px-4 border-b">Email</th>
          <th class="py-2 px-4 border-b">Admin</th>
          <th class="py-2 px-4 border-b">Banido</th>
          <th class="py-2 px-4 border-b">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in usuarios" :key="user.id" class="text-center hover:bg-gray-50 transition">
          <td class="py-2 px-4 border-b">{{ user.nome }}</td>
          <td class="py-2 px-4 border-b">{{ user.email }}</td>
          <td class="py-2 px-4 border-b">{{ user.is_admin ? 'Sim' : 'Não' }}</td>
          <td class="py-2 px-4 border-b">{{ user.is_banned ? 'Sim' : 'Não' }}</td>
          <td class="py-2 px-4 border-b">
            <button @click="toggleBan(user)" class="text-red-600 hover:underline">
              {{ user.is_banned ? 'Desbanir' : 'Banir' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import NavigationButtons from '@/components/NavigationButtons.vue'

const auth = useAuthStore()
const usuarios = ref<any[]>([])

async function loadUsuarios() {
  if (!auth.user) return
  try {
    const { data, error } = await supabase.from('usuarios').select('*')
    if (error) throw error
    usuarios.value = data
  } catch (err) {
    console.error('[Usuarios.vue] erro ao carregar usuários:', err)
  }
}

async function toggleBan(user: any) {
  try {
    await supabase.from('usuarios').update({ is_banned: !user.is_banned }).eq('id', user.id)
    user.is_banned = !user.is_banned
  } catch (err) {
    console.error('[Usuarios.vue] erro ao atualizar banimento:', err)
  }
}

watch(
  () => auth.user,
  (newUser) => {
    if (newUser) loadUsuarios()
  },
  { immediate: true }
)
</script>
