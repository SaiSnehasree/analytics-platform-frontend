import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    // Fix SockJS / sockjs-client "global is not defined" in Vite ESM builds
    global: 'globalThis',
  },
  server: {
    port: 5173,
  },
})