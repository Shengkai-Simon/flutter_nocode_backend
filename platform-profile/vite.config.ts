import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- server config ---
  server: {
    proxy: {
      '/auth-service': 'http://localhost:8080',
      '/user-service': 'http://localhost:8080',
    }
  }
})
