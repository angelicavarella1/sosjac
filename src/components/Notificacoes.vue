<template>
  <div class="notifications">
    <div
      v-for="n in notificacaoStore.lista"
      :key="n.id"
      :class="['notification', n.tipo]"
    >
      {{ n.mensagem }}
      <button @click="notificacaoStore.remover(n.id)">X</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNotificacaoStore } from '@/store/useNotificacaoStore'

const notificacaoStore = useNotificacaoStore()

onMounted(() => {
  console.log('🔔 Notificações iniciadas')
})

onUnmounted(() => {
  notificacaoStore.limparTodas()
})
</script>

<style scoped>
.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Paleta de cores atualizada */
.notification.info { background: #4169E1; } /* royalblue */
.notification.sucesso { background: #66CDAA; } /* mediumaquamarine */
.notification.erro { background: #708090; } /* slategray */
.notification.alerta { background: #4682B4; } /* steelblue */

.notification button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
  margin-left: 0.5rem;
}
</style>