<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="flex-1 flex flex-col items-center justify-center p-6">
      <h2 class="text-2xl font-bold mb-6">Login</h2>

      <!-- ✅ Mantido: Cabeçalho e Rodapé preservados -->
      <form @submit.prevent="handleLogin" class="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <fieldset :disabled="isSubmitting" class="space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-darkslategray" for="email">Email</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              placeholder="exemplo@dominio.com"
              class="w-full p-2 border border-cornflowerblue rounded-md focus:outline-none focus:ring-2 focus:ring-dodgerblue focus:border-transparent"
              required
            />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-darkslategray" for="password">Senha</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Mínimo 6 dígitos"
              minlength="6"
              class="w-full p-2 border border-cornflowerblue rounded-md focus:outline-none focus:ring-2 focus:ring-dodgerblue focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-steelblue text-white p-2 rounded-md hover:bg-royalblue font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
            :aria-busy="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Entrando... ⏳
            </span>
            <span v-else>Entrar</span>
          </button>
        </fieldset>

        <p v-if="successMessage" class="text-mediumaquamarine mt-2 flex items-center gap-2 text-sm">
          ✅ {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="text-red-600 mt-2 flex items-center gap-2 text-sm">
          ❌ {{ errorMessage }}
        </p>

        <p class="text-sm mt-4 text-darkslategray text-center">
          Não tem conta?
          <router-link to="/register" class="text-dodgerblue hover:underline font-medium">
            Registre-se aqui
          </router-link>
        </p>
      </form>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// Estado do formulário
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Mensagens centralizadas
const errorMessages: Record<string, string> = {
  invalid: 'Credenciais de login inválidas. Verifique seu e-mail e senha.',
  banned: 'Acesso negado. Sua conta foi banida.',
  unexpected: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
}

// Feedback de registro via query
onMounted(() => {
  if (route.query.registerSuccess === 'true') {
    successMessage.value = 'Registro realizado com sucesso! Faça login agora.'
  }
})

// ✅ Limpa mensagem de sucesso ao sair da página
onBeforeUnmount(() => {
  successMessage.value = ''
})

async function handleLogin() {
  errorMessage.value = ''
  successMessage.value = ''

  // ✅ Validação adicional (embora o HTML já faça isso)
  if (!email.value || password.value.length < 6) {
    errorMessage.value = 'Informe um e-mail válido e senha com pelo menos 6 caracteres.'
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)

    // ✅ Nova Verificação de Segurança: Garante que o usuário não está banido
    if (auth.user?.is_banned) {
      throw new Error('Usuário banido')
    }

    // Reset do formulário
    email.value = ''
    password.value = ''

    // Redireciona para a página inicial
    router.push('/')
  } catch (err: any) {
    console.error('Erro de login:', err)

    const msg = (err?.message || '').toLowerCase() || JSON.stringify(err)

    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
      errorMessage.value = errorMessages.invalid
    } else if (msg.includes('usuário banido') || msg.includes('banned')) {
      errorMessage.value = errorMessages.banned
    } else {
      errorMessage.value = errorMessages.unexpected
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>