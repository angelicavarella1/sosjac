<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="close">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">📧 Enviar Mensagem para {{ secretaria.nome }}</h2>
        <button type="button" @click="close" class="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none" aria-label="Fechar">&times;</button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p class="text-sm text-blue-800">
            <strong>Destinatário:</strong> {{ secretaria.email }}
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 font-medium mb-1">Assunto *</label>
            <input
              v-model="assunto"
              type="text"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Solicitação de Informação"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-1">Mensagem *</label>
            <textarea
              v-model="mensagem"
              rows="8"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Digite sua mensagem aqui..."
              required
            ></textarea>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div class="flex gap-3">
          <button
            type="button"
            @click="enviar"
            :disabled="!isValid || loading"
            class="px-4 py-2 bg-royalblue text-white rounded font-medium hover:bg-darkslateblue disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span v-if="loading">Enviando...</span>
            <span v-else>Enviar Mensagem</span>
          </button>
          <button
            type="button"
            @click="close"
            :disabled="loading"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>

        <div v-if="erro" class="mt-3 p-2 bg-red-100 text-red-700 rounded text-sm font-medium">{{ erro }}</div>
        <div v-if="sucesso" class="mt-3 p-2 bg-green-100 text-green-700 rounded text-sm font-medium">{{ sucesso }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Secretaria {
  nome: string
  email: string
}

const props = defineProps<{ secretaria: Secretaria }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const show = ref(true)
const assunto = ref('')
const mensagem = ref('')
const loading = ref(false)
const erro = ref('')
const sucesso = ref('')

const isValid = computed(() => assunto.value.trim() !== '' && mensagem.value.trim() !== '')

const close = () => emit('close')

const enviar = async () => {
  if (!isValid.value) return

  loading.value = true
  erro.value = ''
  sucesso.value = ''

  try {
    const htmlCorpo = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${assunto.value}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
          .mensagem { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="color: #2c3e50; margin: 0;">Nova Mensagem Institucional</h2>
          <p style="margin: 8px 0; color: #666;">
            <strong>De:</strong> Sistema SOSJAC Denúncias<br>
            <strong>Para:</strong> ${props.secretaria.nome}<br>
            <strong>Assunto:</strong> ${assunto.value}
          </p>
        </div>
        <div class="mensagem">
          ${mensagem.value.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin: 24px 0; border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 0.85em; color: #777;">
          Esta mensagem foi enviada através da plataforma SOSJAC Denúncias.<br>
          Não responda diretamente a este e-mail.
        </p>
      </body>
      </html>
    `

    const SUPABASE_URL = 'https://wrsfytnvermgxkksdzxf.supabase.co'
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyc2Z5dG52ZXJtZ3hra3NkenhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NzgwMzYsImV4cCI6MjA3MTU1NDAzNn0.Yr91rUuRx4wuHFfEeYv7UOdkb-PDwoQJe-d8VeSSNNc'

    const response = await fetch(`${SUPABASE_URL}/functions/v1/enviar-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        destinatario: props.secretaria.email,
        assunto: assunto.value,
        corpoHtml: htmlCorpo
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Erro ao enviar e-mail')
    }

    sucesso.value = 'Mensagem enviada com sucesso!'
    setTimeout(close, 1500)
  } catch (err: any) {
    console.error('Erro ao enviar e-mail:', err)
    erro.value = 'Falha ao enviar mensagem. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>