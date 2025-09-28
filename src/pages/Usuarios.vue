<template>
  <div class="w-full max-w-5xl mx-auto p-4 mt-6">
    <div class="p-6 bg-white rounded-xl shadow space-y-6">
      <NavigationButtons />

      <h1 class="text-2xl font-bold mb-4">Gerenciar Usuários</h1>

      <div v-if="success" class="text-mediumaquamarine mt-2 p-3 bg-aquamarine rounded-xl">{{ success }}</div>
      <div v-if="error" class="text-red-600 mt-2 p-3 bg-mistyrose rounded-xl">{{ error }}</div>

      <table class="min-w-full bg-white border border-cornflowerblue rounded-xl overflow-hidden">
        <thead>
          <tr class="bg-cornflowerblue text-white">
            <th class="py-2 px-4 border-b">Nome</th>
            <th class="py-2 px-4 border-b">Email</th>
            <th class="py-2 px-4 border-b">Admin</th>
            <th class="py-2 px-4 border-b">Banido</th>
            <th class="py-2 px-4 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuarios" :key="user.id" class="text-center hover:bg-aliceblue transition">
            <td class="py-2 px-4 border-b">{{ user.nome }}</td>
            <td class="py-2 px-4 border-b">{{ user.email }}</td>
            <td class="py-2 px-4 border-b">{{ user.is_admin ? 'Sim' : 'Não' }}</td>
            <td class="py-2 px-4 border-b">{{ user.is_banned ? 'Sim' : 'Não' }}</td>
            <td class="py-2 px-4 border-b space-x-2">
              <button @click="toggleBan(user)" class="text-red-600 hover:underline">
                {{ user.is_banned ? 'Desbanir' : 'Banir' }}
              </button>
              <button @click="toggleAdmin(user)" class="text-steelblue hover:underline">
                {{ user.is_admin ? 'Remover Admin' : 'Tornar Admin' }}
              </button>
              <button @click="openHistory(user)" class="text-slategray hover:underline">Histórico</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="showHistoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white w-full md:w-3/4 lg:w-2/3 rounded-xl shadow-lg relative max-h-[80vh] flex flex-col">
          
          <div class="flex justify-between items-center p-4 border-b border-cornflowerblue bg-aliceblue rounded-t-xl sticky top-0 z-10">
            <h2 class="text-xl font-bold">Histórico de {{ currentUser?.nome }}</h2>
            <button @click="closeHistory" class="text-red-600 hover:underline">Fechar</button>
          </div>

          <div class="overflow-y-auto p-4 flex-1">
            <div v-if="loadingHistory" class="flex justify-center items-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dodgerblue"></div>
            </div>
            
            <div v-else-if="userHistory.length === 0" class="text-center py-8 text-gray-500">
              Nenhum registro de histórico encontrado.
            </div>
            
            <table v-else class="min-w-full border border-cornflowerblue rounded-xl overflow-hidden">
              <thead class="bg-cornflowerblue text-white sticky top-0">
                <tr>
                  <th class="py-2 px-4 border-b text-center">Data</th>
                  <th class="py-2 px-4 border-b text-center">Ação</th>
                  <th class="py-2 px-4 border-b text-center">Admin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in userHistory" :key="entry.id"
                  :class="getHistoricoClass(entry.action)"
                  class="text-center hover:bg-aliceblue transition">
                  <td class="py-2 px-4 border-b">{{ new Date(entry.created_at).toLocaleString('pt-BR') }}</td>
                  <td class="py-2 px-4 border-b font-medium">{{ entry.action }}</td>
                  <td class="py-2 px-4 border-b">{{ entry.admin_name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabaseClient'
import NavigationButtons from '@/components/NavigationButtons.vue'

interface Usuario {
  id: string
  nome: string
  email: string
  is_admin: boolean
  is_banned: boolean
}

interface Historico {
  id: string
  action: string
  admin_name: string
  created_at: string
}

const usuarios = ref<Usuario[]>([])
const error = ref('')
const success = ref('')

const showHistoryModal = ref(false)
const currentUser = ref<Usuario | null>(null)
const userHistory = ref<Historico[]>([])
const loadingHistory = ref(false)

async function loadUsuarios() {
  try {
    const { data, error: supaError } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome', { ascending: true })

    if (supaError) throw supaError
    usuarios.value = data || []
  } catch (err: any) {
    console.error('[Usuarios.vue] erro ao carregar usuários:', err)
    error.value = 'Erro ao carregar usuários.'
  }
}

function clearMessages() {
  setTimeout(() => {
    error.value = ''
    success.value = ''
  }, 3000)
}

async function toggleBan(user: Usuario) {
  try {
    // ✅ Atualiza SEM .select().single()
    const { error } = await supabase
      .from('usuarios')
      .update({ is_banned: !user.is_banned })
      .eq('id', user.id)

    if (error) throw error

    const action = user.is_banned ? 'Desbanido' : 'Banido'
    await logHistorico(user.id, action)

    // ✅ Atualiza UI localmente com nova referência
    const index = usuarios.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      usuarios.value[index] = { ...user, is_banned: !user.is_banned }
    }

    success.value = `${user.nome} foi ${action.toLowerCase()} com sucesso.`
    clearMessages()
  } catch (err: any) {
    console.error('[Usuarios.vue] erro ao atualizar banimento:', err)
    error.value = 'Falha ao atualizar banimento.'
    clearMessages()
  }
}

async function toggleAdmin(user: Usuario) {
  try {
    // ✅ Atualiza SEM .select().single()
    const { error } = await supabase
      .from('usuarios')
      .update({ is_admin: !user.is_admin })
      .eq('id', user.id)

    if (error) throw error

    const action = user.is_admin ? 'Removido Admin' : 'Tornado Admin'
    await logHistorico(user.id, action)

    // ✅ Atualiza UI localmente com nova referência
    const index = usuarios.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      usuarios.value[index] = { ...user, is_admin: !user.is_admin }
    }

    success.value = `${user.nome} agora é ${action.toLowerCase().split(' ')[1]}`
    clearMessages()
  } catch (err: any) {
    console.error('[Usuarios.vue] erro ao atualizar admin:', err)
    error.value = 'Falha ao atualizar status de admin.'
    clearMessages()
  }
}

async function openHistory(user: Usuario) {
  currentUser.value = user
  showHistoryModal.value = true
  loadingHistory.value = true
  userHistory.value = []

  try {
    const { data, error: supaError } = await supabase
      .from('historico_usuarios')
      .select('id, acao, created_at, admin_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (supaError) throw supaError

    const historyWithNames = await Promise.all(
      data.map(async (item: any) => {
        let adminName = 'Sistema'
        if (item.admin_id) {
          const { data: adminData } = await supabase
            .from('usuarios')
            .select('nome')
            .eq('id', item.admin_id)
            .single()
          adminName = adminData?.nome || 'Desconhecido'
        }
        return {
          id: item.id,
          action: item.acao,
          created_at: item.created_at,
          admin_name: adminName
        } as Historico
      })
    )

    userHistory.value = historyWithNames
  } catch (err: any) {
    console.error('[Usuarios.vue] erro ao carregar histórico:', err)
    error.value = 'Falha ao carregar histórico.'
    clearMessages()
  } finally {
    loadingHistory.value = false
  }
}

function closeHistory() {
  showHistoryModal.value = false
  currentUser.value = null
  userHistory.value = []
}

async function logHistorico(user_id: string, action: string) {
  try {
    // CORREÇÃO: Desestruturação correta do objeto retornado por getUser()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('historico_usuarios').insert([{
      user_id,
      acao: action,      // coluna correta no banco
      admin_id: user.id
    }])
  } catch (err) {
    console.warn('[Usuarios.vue] falha ao registrar histórico:', err)
  }
}

function getHistoricoClass(action: string) {
  switch (action) {
    case 'Banido':
      return 'bg-red-50 text-red-700'
    case 'Desbanido':
      return 'bg-green-50 text-green-700'
    case 'Tornado Admin':
      return 'bg-blue-50 text-blue-700'
    case 'Removido Admin':
      return 'bg-yellow-50 text-yellow-700'
    default:
      return 'bg-gray-50 text-gray-700'
  }
}

onMounted(loadUsuarios)
</script>