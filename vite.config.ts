import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { getBuildInfo } from './scripts/build-info.js'

const { canonBaseBuild, runtimeBuildFingerprint, buildTimestamp } = getBuildInfo()

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  define: {
    __CANON_BASE_BUILD__: JSON.stringify(canonBaseBuild),
    __RUNTIME_BUILD_FINGERPRINT__: JSON.stringify(runtimeBuildFingerprint),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  build: {
    // Hidden source maps: genera .map para Sentry pero el browser no los descarga
    sourcemap: 'hidden',

    target: 'es2020',

    // Strip console.log in production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    rollupOptions: {
      output: {
        // Vendor splitting: cada lib en su propio chunk cacheable
        // Si se actualiza solo el app code, los vendor chunks no se re-descargan
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/zod')) {
            return 'vendor-zod';
          }
        },
      },
    },
  },
})
