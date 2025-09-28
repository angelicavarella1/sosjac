<template>
  <div class="push-notification">
    <button
      v-if="!permissaoConcedida"
      @click="solicitarPermissao"
      class="btn-permissao"
    >
      🔔 Ativar Notificações Push
    </button>
    <span v-else class="status-ativo">✅ Notificações Push Ativas</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

const authStore = useAuthStore()
const permissaoConcedida = ref(false)

onMounted(async () => {
  permissaoConcedida.value = await verificarPermissao()
})

async function verificarPermissao() {
  if (!('Notification' in window)) return false
  return Notification.permission === 'granted'
}

async function solicitarPermissao() {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      alert('⚠️ Permissão negada.')
      return
    }

    const reg = await navigator.serviceWorker.ready
    const applicationServerKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    })

    // Salva no Supabase (opcional — para múltiplos dispositivos)
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: authStore.user.id,
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth'))
      })

    if (error) console.warn('Erro ao salvar inscrição:', error)

    // ✅ TESTE IMEDIATO: exibe notificação agora!
    await exibirNotificacaoTeste()

    permissaoConcedida.value = true
    alert('✅ Notificações ativadas!')

  } catch (err) {
    console.error('Erro:', err)
    alert('❌ Erro ao ativar notificações.')
  }
}

async function exibirNotificacaoTeste() {
  const reg = await navigator.serviceWorker.ready
  reg.showNotification('🔔 SOSJAC', {
    body: 'Notificações push ativadas com sucesso!',
    icon: '/logo.png',
    badge: '/logo192.png',
    data: { url: '/dashboard' },
    requireInteraction: true
  })
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as BufferSource
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
</script>

<style scoped>
.push-notification { margin: 1rem 0; }
.btn-permissao {
  background: #007bff; color: white; border: none;
  padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
}
.status-ativo { color: #28a745; font-weight: bold; }
</style>