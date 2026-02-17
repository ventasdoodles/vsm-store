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
        manualChunks: {
          // Vendor: no cambian entre deploys, cache-friendly
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // Admin: nunca debe descargarlo un cliente del storefront
          'admin': [
            './src/pages/admin/AdminDashboard',
            './src/pages/admin/AdminProducts',
            './src/pages/admin/AdminProductForm',
            './src/pages/admin/AdminOrders',
            './src/pages/admin/AdminCategories',
            './src/pages/admin/AdminCustomers',
            './src/pages/admin/AdminCustomerDetails',
            './src/pages/admin/AdminCoupons',
            './src/pages/admin/AdminSettings',
            './src/pages/admin/AdminMonitoring',
          ],
        },
      },
    },
  },
})
