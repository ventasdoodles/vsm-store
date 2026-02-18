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
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack') || id.includes('react-query')) {
              return 'vendor-query';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor'; // Resto de node_modules
          }

          // Admin panel splitting
          if (id.includes('/src/pages/admin/')) {
            return 'admin-panel';
          }

          // Storefront pages splitting
          if (id.includes('/src/pages/')) {
            // Agrupar legal pages
            if (id.includes('/legal/')) return 'legal-pages';

            // Por defecto, cada página en su chunk si es dinámica
            // Vite hace esto automágicamente con dynamic imports, 
            // pero podemos forzar nombres si quisiéramos.
            // Dejamos que Vite maneje el resto.
          }
        },
      },
    },
  },
})
