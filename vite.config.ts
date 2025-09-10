// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: true, // Mostra erros do Vue na tela
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }, // Silencia warning comum do Vite
  },
})
