<!-- src/pages/InstructionsPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 md:p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bem-vindo(a) ao SOSJAC DENUNCIAS</h1>
        <p class="text-gray-600">Por favor, leia atentamente as orientações abaixo antes de continuar.</p>
      </div>

      <div class="space-y-4 text-gray-700 mb-6 max-h-[400px] overflow-y-auto pr-2">
        <div>
          <h2 class="font-semibold text-lg text-blue-700 mb-1">📌 Objetivo do Sistema</h2>
          <p>Este sistema permite o registro e acompanhamento de denúncias relacionadas à limpeza urbana, conservação, postura, transporte e outras áreas de gestão municipal.</p>
        </div>

        <div>
          <h2 class="font-semibold text-lg text-blue-700 mb-1">📸 Envio de Fotos e Vídeos</h2>
          <p>Você pode anexar imagens ou vídeos para comprovar sua denúncia. Certifique-se de que os arquivos estejam nítidos e representem fielmente a situação relatada.</p>
        </div>

        <div>
          <h2 class="font-semibold text-lg text-blue-700 mb-1">🗺️ Localização</h2>
          <p>O sistema utiliza o OpenStreetMap para registrar a localização da denúncia. A precisão da localização ajuda a agilizar o atendimento pela secretaria competente.</p>
        </div>

        <div>
          <h2 class="font-semibold text-lg text-blue-700 mb-1">📧 Encaminhamento de Denúncias</h2>
          <p>Após o registro, você poderá acompanhar o status da denúncia diretamente no aplicativo. Seja preciso nos detalhes da informação para que seja possível compreender a situação descrita. Complete o endereço com número da residência, quadra e lote.</p>
          <p class="mt-2">A administração da AMAJAC vai encaminhar por e-mail, para a secretaria responsável com todas as informações, fotos e localização incorporadas na mensagem.</p>
        </div>

        <div>
          <h2 class="font-semibold text-lg text-blue-700 mb-1">🔒 Privacidade</h2>
          <p>Seus dados pessoais (nome e e-mail) são usados apenas para contato institucional e não serão compartilhados com terceiros.</p>
        </div>
      </div>

      <form @submit.prevent="handleContinue">
        <div class="flex items-center mb-4">
          <input
            id="confirmar-leitura"
            v-model="aceitou"
            type="checkbox"
            class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label for="confirmar-leitura" class="ml-2 text-sm text-gray-700">
            Confirmo que li e compreendi as orientações acima.
          </label>
        </div>

        <button
          :disabled="!aceitou"
          type="submit"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
        >
          Continuar para o Login
        </button>
      </form>
    </div>

    <p class="mt-6 text-sm text-gray-500 text-center max-w-md">
      Ao continuar, você concorda com o uso responsável do sistema conforme as diretrizes da AMAJAC.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirstVisit } from '@/composables/useFirstVisit'

const aceitou = ref(false)
const router = useRouter()
const { markAsSeen } = useFirstVisit()

const handleContinue = () => {
  if (aceitou.value) {
    markAsSeen()
    router.push('/login')
  }
}
</script>