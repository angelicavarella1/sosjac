// src/composables/useFirstVisit.ts
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'instrucoes_lidas_sosjac'

export function useFirstVisit() {
  const hasSeenInstructions = ref(false)
  const isLoading = ref(true)

  const markAsSeen = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    hasSeenInstructions.value = true
  }

  const resetInstructions = () => {
    localStorage.removeItem(STORAGE_KEY)
    hasSeenInstructions.value = false
  }

  onMounted(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY) === 'true'
    hasSeenInstructions.value = hasSeen
    isLoading.value = false
  })

  return {
    hasSeenInstructions,
    isLoading,
    markAsSeen,
    resetInstructions
  }
}