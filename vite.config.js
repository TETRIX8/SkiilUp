import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {
      REACT_APP_BACKEND_URL: JSON.stringify(process.env.REACT_APP_BACKEND_URL || 'https://29277d95-378d-4981-95d0-550dfc73e43a.preview.emergentagent.com')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      ".preview.emergentagent.com"
    ]
  },
})
