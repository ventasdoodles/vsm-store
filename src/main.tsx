import React from 'react';
import { Toaster } from 'react-hot-toast';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/react-query';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';
import './index.css';

// Inicializar monitoreo (Sentry)
initMonitoring();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <ThemeProvider>
                    <Toaster
                        position="bottom-left"
                        toastOptions={{
                            duration: 3500,
                            className: '!bg-theme-secondary/80 !backdrop-blur-xl !border !border-white/10 !text-theme-primary !shadow-2xl',
                            style: {
                                borderRadius: '16px',
                                padding: '16px 20px',
                                background: 'transparent',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10B981',
                                    secondary: '#000',
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
