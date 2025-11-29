import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Redirige las peticiones que empiezan con /api al backend
      '/api': {
        target: 'http://localhost:3000', // La URL de tu backend NestJS
        changeOrigin: true, // Necesario para que el backend acepte la petición
        // No necesitamos 'rewrite' porque tu backend ya espera el prefijo '/api'
      },
    },
  },
})