import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js', // para suportar templates inline sem warnings
    },
  },
  server: {
    hmr: { overlay: true },
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // redireciona para o backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // remove /api antes de enviar
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
