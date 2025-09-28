<!-- src/components/ModalEnviarEmail.vue -->
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
      <!-- Cabeçalho -->
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">✉️ Enviar E-mail para Secretaria</h2>
        <button 
          @click="fechar" 
          class="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Fechar"
        >
          &times;
        </button>
      </div>

      <!-- Conteúdo com scroll -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Dados da denúncia -->
        <div class="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
          <h3 class="font-semibold text-gray-800 mb-1">📌 Referência da Denúncia:</h3>
          <p class="text-sm"><strong>Título:</strong> {{ denuncia.titulo }}</p>
          <p class="text-sm"><strong>Categoria:</strong> {{ denuncia.categoria }}</p>
          <p class="text-sm"><strong>Status:</strong> {{ denuncia.status }}</p>
          <p class="text-sm"><strong>Autor:</strong> {{ denuncia.autor_nome || 'Anônimo' }}</p>
          <p class="text-sm"><strong>Descrição:</strong></p>
          <p class="text-sm bg-white p-2 rounded border">{{ denuncia.descricao }}</p>
        </div>

        <!-- Formulário -->
        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 font-medium mb-1">📧 Para:</label>
            <input
              v-model="emailDestinatario"
              type="email"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-1">📄 Observação Opcional (será incluída no e-mail):</label>
            <textarea
              v-model="mensagemAdicional"
              rows="6"
              placeholder="Ex: 'Prezados, essa denúncia é urgente devido a...' ou deixe em branco para usar apenas o modelo padrão."
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Rodapé -->
      <div class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div class="flex gap-3">
          <button
            @click="enviar"
            :disabled="isEnviando || !emailDestinatario"
            class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <span v-if="isEnviando" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            <span>{{ isEnviando ? 'Enviando...' : 'Enviar E-mail' }}</span>
          </button>
          <button
            @click="fechar"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>

        <div v-if="mensagemSucesso" class="mt-3 p-2 bg-green-100 text-green-700 rounded text-sm">
          {{ mensagemSucesso }}
        </div>
        <div v-if="mensagemErro" class="mt-3 p-2 bg-red-100 text-red-700 rounded text-sm">
          {{ mensagemErro }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { supabase } from '@/api/supabaseClient'

const props = defineProps<{
  denuncia: {
    id: string
    titulo: string
    categoria: string
    status: string
    autor_nome?: string
    descricao: string
  }
  secretariaEmail?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const show = ref(true)
const emailDestinatario = ref(props.secretariaEmail || '')
const mensagemAdicional = ref('')
const isEnviando = ref(false)
const mensagemSucesso = ref('')
const mensagemErro = ref('')

const fechar = () => {
  emit('close')
}

const enviar = async () => {
  if (!emailDestinatario.value) {
    mensagemErro.value = 'Informe o e-mail do destinatário.'
    return
  }

  isEnviando.value = true
  mensagemSucesso.value = ''
  mensagemErro.value = ''

  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch('/functions/v1/enviar-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        denuncia_id: props.denuncia.id,
        to: emailDestinatario.value,
        categoria: props.denuncia.categoria, // ✅ ADICIONADO: necessário para formatação no e-mail
        mensagem_adicional: mensagemAdicional.value.trim() || null
      }),
    })

    if (response.ok) {
      mensagemSucesso.value = '✅ E-mail enviado com sucesso!'
      setTimeout(fechar, 2000)
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Falha ao enviar e-mail')
    }
  } catch (err: any) {
    console.error('Erro ao enviar e-mail:', err)
    mensagemErro.value = '❌ ' + (err.message || 'Erro desconhecido. Tente novamente.')
  } finally {
    isEnviando.value = false
  }
}
</script>