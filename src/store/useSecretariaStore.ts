// src/store/useSecretariaStore.ts
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabaseClient'
import type { Secretaria } from '@/types/secretaria'

export const useSecretariaStore = defineStore('secretaria', {
  state: () => ({
    secretarias: [] as Secretaria[],
    loading: false,
  }),

  actions: {
    async listarSecretarias(): Promise<Secretaria[]> {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('secretarias')
          .select('*')
          .order('nome')

        if (error) throw error
        this.secretarias = data || []
        return this.secretarias
      } catch (err: any) {
        console.error('[SecretariaStore] erro ao listar:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async criarSecretaria(secretaria: Omit<Secretaria, 'id'>): Promise<Secretaria> {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('secretarias')
          .insert([secretaria])
          .select()
          .single()

        if (error) throw error
        this.secretarias.push(data)
        return data
      } catch (err: any) {
        console.error('[SecretariaStore] erro ao criar:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async atualizarSecretaria(id: number, updates: Partial<Secretaria>): Promise<Secretaria> {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('secretarias')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        const index = this.secretarias.findIndex(s => s.id === id)
        if (index !== -1) this.secretarias[index] = data

        return data
      } catch (err: any) {
        console.error('[SecretariaStore] erro ao atualizar:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deletarSecretaria(id: number): Promise<void> {
      this.loading = true
      try {
        const { error } = await supabase
          .from('secretarias')
          .delete()
          .eq('id', id)

        if (error) throw error

        this.secretarias = this.secretarias.filter(s => s.id !== id)
      } catch (err: any) {
        console.error('[SecretariaStore] erro ao deletar:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})