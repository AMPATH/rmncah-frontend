
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
