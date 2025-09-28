<template>
  <div class="w-full max-w-5xl mx-auto p-4 mt-6">
    <div class="p-6 bg-white rounded-xl shadow space-y-6">
      <NavigationButtons />

      <h1 class="text-2xl font-bold mb-4">🏛️ Secretarias Municipais</h1>

      <div class="mb-4">
        <label class="block font-semibold mb-2">Categoria da denúncia</label>
        <select
          v-model="categoriaSelecionada"
          class="border border-cornflowerblue px-3 py-2 rounded-xl w-full max-w-md focus:outline-none focus:ring-2 focus:ring-dodgerblue"
        >
          <option value="">-- Todas as categorias --</option>
          <option v-for="c in categoriasDenuncias" :key="c" :value="c">{{ formatCategoria(c) }}</option>
        </select>
      </div>

      <div v-if="categoriaSelecionada && secretariasFiltradas.length > 0" class="mb-4">
        <button
          @click="enviarParaTodas()"
          :disabled="isEnviandoEmail"
          class="px-4 py-2 bg-steelblue text-white rounded-xl hover:bg-royalblue disabled:opacity-50"
        >
          <span v-if="isEnviandoEmail && emailSelecionado === 'TODAS'">Enviando...</span>
          <span v-else>Enviar para todas as secretarias desta categoria</span>
        </button>
      </div>

      <div v-if="isEnviandoEmail && emailSelecionado === 'TODAS'" class="mt-4">
        <p class="mb-1">Progresso: {{ progresso }}%</p>
        <div class="w-full bg-lightsteelblue rounded-xl h-4">
          <div class="bg-steelblue h-4 rounded-xl" :style="{ width: progresso + '%' }"></div>
        </div>
        <p class="mt-2 text-sm text-darkslategray">
          ✅ Sucesso: {{ contadorSucesso }} | ❌ Falha: {{ contadorFalha }} | Total: {{ secretariasFiltradas.length }}
        </p>
      </div>

      <div v-if="secretariasFiltradas.length === 0" class="text-darkslategray">
        Nenhuma secretaria cadastrada para esta categoria.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="s in secretariasFiltradas"
          :key="s.id"
          class="border border-cornflowerblue rounded-xl p-4 hover:shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-dodgerblue"
          tabindex="0"
        >
          <h2 class="font-bold text-lg mb-2">{{ s.nome }}</h2>
          <p class="text-darkslategray mb-1"><strong>Secretário:</strong> {{ s.secretario || 'Não informado' }}</p>
          <p class="text-darkslategray mb-1"><strong>Email:</strong> {{ maskEmail(s.email) }}</p>
          <p class="text-darkslategray"><strong>Telefone:</strong> {{ s.telefone || 'Não informado' }}</p>

          <div class="mt-2 flex flex-wrap gap-2">
            <button 
              class="px-2 py-1 bg-steelblue text-white rounded-xl hover:bg-royalblue transition text-sm"
              @click="abrirModalEmail(s)"
              :disabled="isEnviandoEmail"
            >
              ✉️ Enviar e-mail
            </button>

            <a
              v-if="s.site"
              :href="s.site"
              target="_blank"
              rel="noopener noreferrer"
              class="px-2 py-1 bg-aquamarine text-darkslategray rounded-xl hover:bg-mediumaquamarine transition text-sm font-medium"
            >
              🌐 Site oficial
            </a>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <h2 class="font-semibold text-lg mb-2">Enviar para outro e-mail</h2>
        <div class="flex flex-col sm:flex-row gap-2 max-w-md">
          <input 
            v-model="emailManual" 
            type="email" 
            placeholder="Digite o e-mail" 
            class="border border-cornflowerblue px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-dodgerblue"
          />
          <button 
            @click="abrirModalEmailManual(emailManual)"
            :disabled="!emailManual || isEnviandoEmail"
            class="px-4 py-2 bg-mediumaquamarine text-white rounded-xl hover:bg-aquamarine disabled:opacity-50 whitespace-nowrap"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModalEmail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">📧 Editar e Enviar E-mail</h3>
          <button @click="fecharModalEmail" class="text-gray-500 text-2xl">&times;</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Para:</label>
            <input
              v-model="emailPara"
              type="email"
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="email@secretaria.gov.br"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Assunto:</label>
            <input
              v-model="emailAssunto"
              type="text"
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="Assunto do e-mail"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mensagem:</label>
            <textarea
              v-model="emailCorpo"
              class="w-full p-2 border border-gray-300 rounded font-mono text-sm"
              rows="12"
              placeholder="Escreva sua mensagem..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="fecharModalEmail"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            @click="enviarEmail"
            :disabled="enviandoEmail"
            class="px-4 py-2 bg-dodgerblue text-white rounded hover:bg-royalblue disabled:opacity-50"
          >
            <span v-if="enviandoEmail">Enviando...</span>
            <span v-else>Enviar E-mail</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavigationButtons from '@/components/NavigationButtons.vue'
import { categoriasDenuncias, categoriasPorSecretaria } from '@/data/SecretariasCategorias'
import { useSecretariaStore } from '@/store/useSecretariaStore'
import { formatCategoria, maskEmail } from '@/utils/formatters'
import { supabase } from '@/api/supabaseClient'

interface Secretaria {
  id: number
  nome: string
  secretario: string | null
  endereco: string | null
  telefone: string | null
  email: string
  site: string | null
}

const categoriaSelecionada = ref<string>('')
const isEnviandoEmail = ref(false)
const emailSelecionado = ref('')
const emailManual = ref('')
const contadorSucesso = ref(0)
const contadorFalha = ref(0)
const progresso = ref(0)

const showModalEmail = ref(false)
const emailPara = ref('')
const emailAssunto = ref('')
const emailCorpo = ref('')
const enviandoEmail = ref(false)
const secretariaSelecionada = ref<Secretaria | null>(null)

const secretariaStore = useSecretariaStore()
const secretariasList = ref<Secretaria[]>([])

const secretariasFiltradas = computed(() => {
  if (!categoriaSelecionada.value) return secretariasList.value
  const ids = categoriasPorSecretaria[categoriaSelecionada.value] || []
  return secretariasList.value.filter(s => ids.includes(s.id))
})

onMounted(async () => {
  try {
    await secretariaStore.listarSecretarias()
    secretariasList.value = secretariaStore.secretarias.map(s => ({
      id: s.id,
      nome: s.nome,
      secretario: s.secretario ?? null,
      endereco: s.endereco ?? null,
      telefone: s.telefone ?? null,
      email: s.email_contato,  // ✅ corrige para email_contato do banco
      site: s.site ?? null      // ✅ adiciona site
    }))
  } catch (err) {
    console.error('Erro ao carregar secretarias:', err)
  }
})

function abrirModalEmail(secretaria: Secretaria) {
  secretariaSelecionada.value = secretaria
  emailPara.value = secretaria.email
  emailAssunto.value = ''

  const corpo = `Atenciosamente,

MOVIMENTO SOS-JAC
AMAJAC – Associação de Moradores e Amigos do Bairro Jardim Atlântico Central
Rua Izabel Cristina Ouvina, 112, Jardim Atlântico Central
Maricá – RJ, CEP: 24.934-405

Destinatário: ${secretaria.secretario || secretaria.nome}`

  emailCorpo.value = corpo
  showModalEmail.value = true
}

function abrirModalEmailManual(email: string) {
  if (!email) return
  secretariaSelecionada.value = null
  emailPara.value = email
  emailAssunto.value = ''
  emailCorpo.value = `Atenciosamente,

MOVIMENTO SOS-JAC
AMAJAC – Associação de Moradores e Amigos do Bairro Jardim Atlântico Central
Rua Izabel Cristina Ouvina, 112, Jardim Atlântico Central
Maricá – RJ, CEP: 24.934-405`
  showModalEmail.value = true
}

async function enviarEmail() {
  if (!emailPara.value || !emailAssunto.value || !emailCorpo.value.trim()) {
    alert('Preencha todos os campos do e-mail.')
    return
  }

  enviandoEmail.value = true
  try {
    const { error } = await supabase.functions.invoke('enviar-email', {
      body: {
        denuncia_id: null,
        to: emailPara.value,
        subject: emailAssunto.value,
        text: emailCorpo.value
      }
    })

    if (error) throw error

    alert('✅ E-mail enviado com sucesso!')
    fecharModalEmail()
  } catch (err: any) {
    console.error('Erro ao enviar e-mail:', err)
    alert('❌ Falha ao enviar e-mail: ' + (err.message || 'tente novamente'))
  } finally {
    enviandoEmail.value = false
  }
}

function fecharModalEmail() {
  showModalEmail.value = false
  emailPara.value = ''
  emailAssunto.value = ''
  emailCorpo.value = ''
  secretariaSelecionada.value = null
}

function enviarParaTodas() {
  if (secretariasFiltradas.value.length === 0) return
  isEnviandoEmail.value = true
  emailSelecionado.value = 'TODAS'

  contadorSucesso.value = 0
  contadorFalha.value = 0
  progresso.value = 0

  const total = secretariasFiltradas.value.length
  let enviados = 0

  const interval = setInterval(() => {
    enviados++
    contadorSucesso.value = enviados
    progresso.value = Math.round((enviados / total) * 100)
    if (enviados >= total) {
      clearInterval(interval)
      setTimeout(() => {
        alert(`Envio finalizado!\n✅ Sucesso: ${contadorSucesso.value}\n❌ Falha: ${contadorFalha.value}`)
        isEnviandoEmail.value = false
        emailSelecionado.value = ''
      }, 500)
    }
  }, 100)
}
</script>
