import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },

  server: {
    proxy: {
      // Sign-in goes to the real backend (NestJS on port 3000, which keeps the /api prefix).
      // It must come before '/api' so it matches first.
      '/api/auth': {
        target: 'http://localhost:3000',
      },

      // MPDSR lists already served by the real backend. Add each one here as it moves off db.json.
      '/api/icd11-causes': {
        target: 'http://localhost:3000',
      },
      '/api/contributing-factors': {
        target: 'http://localhost:3000',
      },

      // MPDSR and other programme data — db.json
      '/api': {
        target: 'http://localhost:3001',
      },

      // EmONC curriculum data — emoncdb.json
      '/emonc-api': {
        target: 'http://localhost:3001',
      },
    },
  },
})