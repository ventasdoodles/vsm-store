import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    // Source maps para debugging real en producción
    // No son públicos por defecto — subirlos a Sentry cuando se implemente
    sourcemap: true,

    target: 'es2020',

    rollupOptions: {
      output: {
        // Let Vite handle chunks automatically to prevent Circular Dependency crashes on Cloudflare Pages
      },
    },
  },
})
