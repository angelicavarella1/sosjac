<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="flex-1 flex flex-col items-center justify-center p-6">
      <h2 class="text-2xl font-bold mb-6">Registrar Usuário</h2>

      <form @submit.prevent="handleRegister" class="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <fieldset :disabled="loading" class="space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-darkslategray" for="nome">Nome</label>
            <input
              id="nome"
              v-model.trim="nome"
              type="text"
              placeholder="Seu nome completo"
              class="w-full p-2 border border-cornflowerblue rounded-md focus:outline-none focus:ring-2 focus:ring-dodgerblue focus:border-transparent"
              required
            />
          </div>

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

          <div class="mt-2 flex items-start gap-2">
            <input type="checkbox" id="consent" v-model="consent" required class="mt-1 accent-dodgerblue"/>
            <label for="consent" class="text-sm text-darkslategray">
              Autorizo o uso dos meus dados para fins de gestão de denúncias públicas, conforme a Política de Privacidade.
            </label>
          </div>

          <button
            type="submit"
            :aria-busy="loading"
            class="w-full bg-mediumaquamarine text-white p-2 rounded-md hover:bg-aquamarine font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Registrando...
            </span>
            <span v-else>Registrar</span>
          </button>
        </fieldset>

        <div v-if="success" class="p-3 bg-mintcream text-mediumaquamarine rounded-lg text-sm flex items-center gap-2">
          <span>✅</span>
          <span>{{ success }}</span>
        </div>

        <div v-if="error" class="p-3 bg-mistyrose text-red-600 rounded-lg text-sm flex items-center gap-2">
          <span>❌</span>
          <span>{{ error }}</span>
        </div>

        <p class="text-sm mt-4 text-darkslategray text-center">
          Já tem conta?
          <router-link to="/login" class="text-dodgerblue hover:underline font-medium">
            Faça login aqui
          </router-link>
        </p>
      </form>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const auth = useAuthStore()
const router = useRouter()

const nome = ref('')
const email = ref('')
const password = ref('')
const consent = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(false)

const errorMessages: Record<string, string> = {
  emailExists: 'Este e-mail já está registrado.',
  invalidEmail: 'Formato de e-mail inválido.',
  weakPassword: 'Senha fraca. Use pelo menos 6 caracteres.',
  banned: 'Este e-mail está banido. Contate o suporte.',
  unexpected: 'Erro inesperado. Tente novamente mais tarde.'
}

async function handleRegister() {
  error.value = ''
  success.value = ''

  if (!nome.value.trim() || !email.value.trim() || password.value.length < 6 || !consent.value) {
    error.value = 'Preencha todos os campos corretamente e aceite o consentimento.'
    return
  }

  loading.value = true
  try {
    await auth.register(email.value, password.value, nome.value)

    success.value = 'Registro realizado com sucesso! Redirecionando para login...'

    // Reset do formulário
    nome.value = ''
    email.value = ''
    password.value = ''
    consent.value = false

    setTimeout(() => {
      router.push({ name: 'Login', query: { registerSuccess: 'true' } })
    }, 2000)
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase()
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      error.value = errorMessages.emailExists
    } else if (msg.includes('invalid email')) {
      error.value = errorMessages.invalidEmail
    } else if (msg.includes('password')) {
      error.value = errorMessages.weakPassword
    } else if (msg.includes('banned') || msg.includes('banido')) {
      error.value = errorMessages.banned
    } else {
      error.value = errorMessages.unexpected
    }
  } finally {
    loading.value = false
  }
}
</script>