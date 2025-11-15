import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // URL de tu backend NestJS
        changeOrigin: true,
        // Reescribe la ruta: elimina '/api' del principio de la URL
        // para que '/api/auth/register' se convierta en '/auth/register' al llegar al backend.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
