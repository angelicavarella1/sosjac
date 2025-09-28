// src/types/global.d.ts
import { Pinia } from 'pinia'
import { useAuthStore } from '@/store/useAuthStore'

declare global {
  interface Window {
    __APP__?: {
      pinia: Pinia
    }
  }
}

// Tipagem opcional do estado do auth store
export type AuthState = ReturnType<typeof useAuthStore>['$state']
