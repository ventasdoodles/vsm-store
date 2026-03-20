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

// 🚀 GRACEFUL PWA CACHE HYGIENE (Post-Wave 192 Parity)
// Eliminado el "nuclear reset" bruto (W143-RECOVERY-A) para evitar romper estado offline innecesariamente.
// Delegamos el invalidation al ciclo de vida nativo del Service Worker vía updatefound.
if (typeof window !== 'undefined') {
    const lastVersion = localStorage.getItem('vsm_runtime_fingerprint');
    
    // Si detectamos un cambio de build físico, solo limpiamos el registro local para forzar que los componentes lean fresco,
    // pero dejamos que el SW.js elimine las caches de disco en su evento 'activate'.
    if (lastVersion !== __RUNTIME_BUILD_FINGERPRINT__) {
        console.warn(`[PARITY] Build drift detected: ${lastVersion} -> ${__RUNTIME_BUILD_FINGERPRINT__}. Enforcing gentle reload.`);
        localStorage.setItem('vsm_runtime_fingerprint', __RUNTIME_BUILD_FINGERPRINT__);
        // Reload suave solo si teníamos una versión previa (para no loopear en la primera carga)
        if (lastVersion) location.reload();
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
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

// Registrar Service Worker para PWA con Listener de Update Grácil
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                // Si ya hay un update disponible al cargar
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                // Detectar cuando entra una nueva versión del SW
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Nueva actualización disponible, forzamos skipWaiting para activarla
                                console.warn('[SW] Nueva versión detectada, forzando skipWaiting...');
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    }
                });
            })
            .catch((err) => {
                if (import.meta.env.DEV) console.error('[PWA] SW error:', err);
            });

        // Cuando el SW toma el control, refrescamos la app
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                console.warn('[SW] Controlador actualizado. Recargando app preventivamente...');
                window.location.reload();
            }
        });
    });
}
