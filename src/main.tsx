import React from 'react';
import { Toaster } from 'react-hot-toast';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';
import './index.css';

// Inicializar monitoreo (Sentry)
initMonitoring();

// Configuración de React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <ThemeProvider>
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10B981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#EF4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                    <AuthProvider>
                        <QueryClientProvider client={queryClient}>
                            <HelmetProvider>
                                <App />
                            </HelmetProvider>
                        </QueryClientProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>,
);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => console.log('[PWA] SW registrado:', reg.scope))
            .catch((err) => console.error('[PWA] SW error:', err));
    });
}
