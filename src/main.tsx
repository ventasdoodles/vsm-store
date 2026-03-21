import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SafetyProvider } from '@/contexts/SafetyContext';
import { queryClient } from '@/lib/react-query';
import { runtimeBuildInfo } from '@/lib/runtime-build';

import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initMonitoring } from './services/monitoring.service';
import './index.css';

// Graceful PWA cache hygiene.
// We keep one local runtime fingerprint marker so diagnostics can compare the
// current shell against the last loaded build without forcing a blind reload.
if (typeof window !== 'undefined') {
    const lastVersion = localStorage.getItem('vsm_runtime_fingerprint');

    if (lastVersion !== __RUNTIME_BUILD_FINGERPRINT__) {
        console.warn(
            `[PARITY] Build drift detected: ${lastVersion} -> ${__RUNTIME_BUILD_FINGERPRINT__}. Refresh marker updated.`,
        );
        localStorage.setItem('vsm_runtime_fingerprint', __RUNTIME_BUILD_FINGERPRINT__);
    }

    // Direct DOM injection for Dark Mode (bypasses React dispatcher for stability)
    document.documentElement.classList.add('dark');
    localStorage.removeItem('vsm-theme');
}

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

// Register the service worker with a versioned URL so the runtime shell,
// cache namespace, and operator-visible fingerprint all point at the same truth.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        let lastUpdateCheck = 0;

        const refreshRegistration = () => {
            const now = Date.now();
            if (now - lastUpdateCheck < 60_000) return;
            lastUpdateCheck = now;

            void navigator.serviceWorker.getRegistration()
                .then((registration) => registration?.update())
                .catch((err) => {
                    if (import.meta.env.DEV) console.error('[PWA] SW update check error:', err);
                });
        };

        navigator.serviceWorker
            .register(`/sw.js?v=${encodeURIComponent(runtimeBuildInfo.runtimeBuildFingerprint)}`)
            .then((registration) => {
                void registration.update();

                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.warn('[SW] New version detected, forcing skipWaiting...');
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    }
                });
            })
            .catch((err) => {
                if (import.meta.env.DEV) console.error('[PWA] SW error:', err);
            });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                console.warn('[SW] Controller updated. Reloading app preventively...');
                window.location.reload();
            }
        });

        window.addEventListener('focus', refreshRegistration);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                refreshRegistration();
            }
        });
    });
}
