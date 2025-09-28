<template>
  <div class="max-w-4xl mx-auto p-6">
    <NavigationButtons />
    <h1 class="text-2xl font-bold mb-4">📧 Enviar para Secretarias</h1>
    <p class="mb-4">Denúncia: <strong>{{ denuncia?.titulo }}</strong></p>

    <div v-if="loading" class="flex justify-center items-center h-32">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dodgerblue"></div>
    </div>

    <div v-else-if="secretarias.length === 0" class="text-gray-500 italic">
      Nenhuma secretaria sugerida para esta denúncia.
    </div>

    <div v-else class="space-y-4">
      <div v-for="s in secretarias" :key="s.id" class="border p-4 rounded shadow-sm">
        <h3 class="font-semibold text-lg">{{ s.nome }}</h3>
        <p class="text-sm text-gray-600 mb-2">{{ s.email }}</p>
        <a
          v-if="s.site"
          :href="s.site"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-aquamarine hover:underline"
        >
          🌐 Site oficial
        </a>
        <button
          @click="abrirModal(s)"
          class="mt-3 px-4 py-2 bg-dodgerblue text-white rounded hover:bg-royalblue transition"
        >
          Enviar E-mail
        </button>
      </div>
    </div>

    <!-- Modal de E-mail -->
    <div v-if="secretariaSelecionada" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-xl font-bold">✉️ Enviar E-mail</h2>
          <button @click="fecharModal" class="text-gray-500 text-2xl hover:text-gray-700">&times;</button>
        </div>

        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Para:</label>
            <input
              :value="secretariaSelecionada.email"
              type="email"
              class="w-full p-2 border rounded bg-gray-100"
              readonly
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Assunto:</label>
            <input
              v-model="assunto"
              type="text"
              class="w-full p-2 border rounded"
              placeholder="Assunto do e-mail"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Mensagem:</label>
            <textarea
              v-model="mensagem"
              rows="8"
              class="w-full p-2 border rounded"
              placeholder="Escreva sua mensagem..."
            ></textarea>
          </div>
        </div>

        <div class="p-4 border-t flex gap-3">
          <button
            @click="enviarEmail"
            :disabled="!assunto.trim() || !mensagem.trim() || enviando"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <span v-if="enviando" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            <span>Enviar E-mail</span>
          </button>
          <button
            @click="fecharModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import NavigationButtons from '@/components/NavigationButtons.vue'
import { categoriasPorSecretaria } from '@/data/SecretariasCategorias'

interface Denuncia {
  id: string
  titulo: string
  categoria: string
}

interface Secretaria {
  id: number
  nome: string
  email: string
  site?: string
}

const route = useRoute()
const denuncia = ref<Denuncia | null>(null)
const secretarias = ref<Secretaria[]>([])
const secretariaSelecionada = ref<Secretaria | null>(null)
const assunto = ref('')
const mensagem = ref('')
const enviando = ref(false)
const loading = ref(true)

async function loadDenuncia() {
  const denunciaId = route.params.denunciaId as string
  if (!denunciaId) {
    loading.value = false
    return
  }

  try {
    // ✅ Correção 1: usar { data, error } — não { denunciaData, error }
    const { data, error } = await supabase
      .from('denuncias')
      .select('id, titulo, categoria')
      .eq('id', denunciaId)
      .single()

    if (error || !data) {
      console.error('Erro ao carregar denúncia:', error)
      return
    }

    denuncia.value = data

    const categoriaNormalizada = data.categoria
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

    // ✅ Correção 2: garantir que categoriasPorSecretaria seja Record<string, number[]>
    const idsSecretarias = categoriasPorSecretaria[categoriaNormalizada] || []

    if (idsSecretarias.length === 0) {
      secretarias.value = []
      return
    }

    // ✅ Correção 3: usar { data: secretariasData, error } — não { secretariasData, error }
    const { data: secretariasData, error: secretariasError } = await supabase
      .from('secretarias')
      .select('id, nome, email, site')
      .in('id', idsSecretarias)

    if (secretariasError) {
      console.error('Erro ao carregar secretarias:', secretariasError)
      secretarias.value = []
    } else {
      secretarias.value = secretariasData
    }
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    secretarias.value = []
  } finally {
    loading.value = false
  }
}

function abrirModal(secretaria: Secretaria) {
  secretariaSelecionada.value = secretaria
  assunto.value = `SOSJAC - Nova Denúncia: ${denuncia.value?.titulo}`
  mensagem.value = `Prezado(a) ${secretaria.nome},

Foi registrada uma nova denúncia no sistema SOSJAC que requer sua atenção:

Título: ${denuncia.value?.titulo}
Categoria: ${denuncia.value?.categoria}

Por favor, verifique e tome as providências necessárias.

Atenciosamente,
Equipe SOSJAC`
}

function fecharModal() {
  secretariaSelecionada.value = null
  assunto.value = ''
  mensagem.value = ''
}

async function enviarEmail() {
  if (!secretariaSelecionada.value || !assunto.value.trim() || !mensagem.value.trim()) return

  enviando.value = true
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      alert('É necessário estar logado para enviar e-mails.')
      return
    }

    const response = await fetch('/functions/v1/enviar-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        denuncia_id: denuncia.value?.id,
        to: secretariaSelecionada.value.email,
        categoria: denuncia.value?.categoria,
        mensagem_adicional: mensagem.value.trim() || null
      }),
    })

    if (response.ok) {
      alert('✅ E-mail enviado com sucesso!')
      fecharModal()
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('Erro da Edge Function:', errorData)
      alert('❌ Falha ao enviar e-mail. Verifique o console.')
    }
  } catch (err) {
    console.error('Erro na requisição:', err)
    alert('❌ Erro de conexão. Tente novamente.')
  } finally {
    enviando.value = false
  }
}

onMounted(loadDenuncia)
</script>