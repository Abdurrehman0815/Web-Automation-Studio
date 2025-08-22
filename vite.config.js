import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ✅ This replaces PostCSS configuration
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
})
