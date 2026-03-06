import React from 'react';
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
