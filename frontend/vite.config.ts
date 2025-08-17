import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // if your Go server does NOT include the /api prefix, uncomment:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})