import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SafetyProvider } from '@/contexts/SafetyContext';
import { queryClient } from '@/lib/react-query';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initMonitoring } from './services/monitoring.service';
import './index.css';

// 🚀 CACHE BUSTER & STABILITY FORCING (Wave 24.1)
// Clears stale service workers and forces a clean reload if version mismatch
const VSM_VERSION = '24.1.1';
if (typeof window !== 'undefined') {
    const currentVersion = localStorage.getItem('vsm_app_version');
    if (currentVersion !== VSM_VERSION) {
        localStorage.setItem('vsm_app_version', VSM_VERSION);
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(r => r.unregister());
                window.location.reload();
            });
        }
    }
    
    // Direct DOM injection for Dark Mode (Bypasses React Dispatcher for stability)
    document.documentElement.classList.add('dark');
    localStorage.removeItem('vsm-theme');
}

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
                                <SafetyProvider>
                                    <App />
                                </SafetyProvider>
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
            .catch((err) => {
                if (import.meta.env.DEV) console.error('[PWA] SW error:', err);
            });
    });
}
