import { lazy, Suspense, useEffect, useState } from 'react';

import { useLocation, Outlet } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
// ─── Componentes críticos (no lazy — necesarios en primer render) ─────────────
import { Layout } from '@/components/layout/Layout';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { SEO } from '@/components/seo/SEO';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAppMonitoring } from '@/hooks/useAppMonitoring';
import { useCartValidator } from '@/hooks/useCartValidator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import {
    bootstrapPilotFromSearch,
    isPilotActive,
    PILOT_ACTIVATION_EVENT,
    resolveStorefrontAIExposure,
} from '@/lib/pilot-activation';
import { TacticalProvider } from '@/contexts/TacticalContext';
import { VerticalPackProvider } from '@/contexts/VerticalPackContext';


// ─── Admin entry point (completely isolated lazy bundle) ──────────────────────
const AdminApp = lazy(() => import('./AdminApp').then(m => ({ default: m.AdminApp })));

// ─── Componentes lazy del shell (no se necesitan en primer render) ────────────
const CartSidebar = lazy(() => import('@/components/cart/CartSidebar').then(m => ({ default: m.CartSidebar })));
const OrderNotifications = lazy(() => import('@/components/notifications/OrderNotifications').then(m => ({ default: m.OrderNotifications })));
const SocialProofToast = lazy(() => import('@/components/ui/SocialProofToast').then(m => ({ default: m.SocialProofToast })));
const WhatsAppFloat = lazy(() => import('@/components/ui/WhatsAppFloat').then(m => ({ default: m.WhatsAppFloat })));
const AIConcierge = lazy(() => import('@/components/ui/ai/AIConcierge').then(m => ({ default: m.AIConcierge })));
const SmartRewardToast = lazy(() => import('@/components/loyalty/SmartRewardToast').then(m => ({ default: m.SmartRewardToast })));
import { PilotDebugBadge } from '@/components/ui/ai/PilotDebugBadge';


const ProductSurfaceFixture = import.meta.env.DEV
    ? lazy(() => import('@/pages/ProductSurfaceFixture').then(m => ({ default: m.ProductSurfaceFixture })))
    : null;
const ProductGridStatesFixture = import.meta.env.DEV
    ? lazy(() => import('@/pages/ProductGridStatesFixture').then(m => ({ default: m.ProductGridStatesFixture })))
    : null;
const SecondVerticalProofFixture = import.meta.env.DEV
    ? lazy(() => import('@/pages/SecondVerticalProofFixture').then(m => ({ default: m.SecondVerticalProofFixture })))
    : null;


// Minimal loading fallback
function PageLoader() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme border-t-vape-500" />
        </div>
    );
}



export function App() {
    const { pathname } = useLocation();

    if (import.meta.env.DEV && pathname === '/__qa/product-surface' && ProductSurfaceFixture) {
        return <ProductSurfaceFixture />;
    }

    if (import.meta.env.DEV && pathname === '/__qa/product-grid-states' && ProductGridStatesFixture) {
        return <ProductGridStatesFixture />;
    }

    if (import.meta.env.DEV && pathname === '/__qa/second-vertical-proof' && SecondVerticalProofFixture) {
        return <SecondVerticalProofFixture />;
    }

    // Admin panel: completely separate lazy bundle — no admin code loads for storefront users
    if (pathname.startsWith('/admin')) {
        return (
            <Suspense fallback={<PageLoader />}>
                <AdminApp />
            </Suspense>
        );
    }

    return (
        <VerticalPackProvider>
            <StorefrontApp />
        </VerticalPackProvider>
    );
}

function StorefrontApp() {
    const { pathname, search } = useLocation();
    const { user } = useAuth();
    const { data: settings } = useStoreSettings();

    // Pilot Gate: durable client-side exposure flag shared across storefront contexts
    const [isPilotAuthorized, setIsPilotAuthorized] = useState(() => {
        if (typeof window === 'undefined') return false;
        
        if (bootstrapPilotFromSearch(window.location.search)) {
            console.warn('[Pilot Gate] Activated via query param in eager boot.');
            return true;
        }
        
        if (isPilotActive()) {
            console.warn('[Pilot Gate] Restored from durable client state.');
            return true;
        }

        return false;
    });

    // Detect pilot activation via ?pilot=cesarin and persist durably before cleaning the URL
    useEffect(() => {
        if (bootstrapPilotFromSearch(window.location.search)) {
            setIsPilotAuthorized(true);
            console.warn('[Pilot Gate] Activated via route change.');

            // Cleanup URL cleanly
            const newParams = new URLSearchParams(search);
            newParams.delete('pilot');
            const cleanSearch = newParams.toString();
            const newUrl = pathname + (cleanSearch ? `?${cleanSearch}` : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, [search, pathname]);

    useEffect(() => {
        const syncPilotAuthorization = () => {
            setIsPilotAuthorized(isPilotActive());
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                syncPilotAuthorization();
            }
        };

        syncPilotAuthorization();
        window.addEventListener(PILOT_ACTIVATION_EVENT, syncPilotAuthorization as EventListener);
        window.addEventListener('focus', syncPilotAuthorization);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener(PILOT_ACTIVATION_EVENT, syncPilotAuthorization as EventListener);
            window.removeEventListener('focus', syncPilotAuthorization);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Inicializar monitoreo global (Presence + Errores)
    useAppMonitoring();



    // Validar carrito contra API al cargar (solo storefront)
    useCartValidator();

    const storefrontAIExposure = resolveStorefrontAIExposure({
        isGlobalEnabled: settings?.is_ai_assistant_enabled,
        isPilotAuthorized,
    });

    if (!isSupabaseConfigured) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-theme-primary p-4 text-center text-white">
                <div className="rounded-xl bg-red-500/10 p-8 border border-red-500/20 max-w-md">
                    <h1 className="mb-4 text-2xl font-bold text-red-400">Error de Configuración</h1>
                    <p className="mb-6 text-theme-secondary">
                        No se ha configurado la conexión con Supabase.
                    </p>
                    <div className="text-left text-sm bg-black/30 p-4 rounded-lg font-mono text-theme-secondary">
                        <p>Crea un archivo <span className="text-white">.env</span> en la raíz del proyecto con:</p>
                        <ul className="list-disc pl-4 mt-2 space-y-1">
                            <li>VITE_SUPABASE_URL</li>
                            <li>VITE_SUPABASE_ANON_KEY</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary componentName="StorefrontRoot">
            <LazyMotion features={domAnimation}>
            <TacticalProvider>
                {/* 🍞 Notificaciones Globales (Toaster) */}
                <Toaster
                    position="bottom-left"
                    toastOptions={{
                        duration: 3500,
                        className: '!bg-theme-secondary/80 !backdrop-blur-xl !border !border-theme !text-theme-primary !shadow-2xl',
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
                <SEO />
                <Layout>
                    <Suspense fallback={<PageLoader />}>
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </Suspense>
                </Layout>
                <Suspense fallback={null}>
                    <ErrorBoundary>
                        <CartSidebar />
                    </ErrorBoundary>
                </Suspense>
                <ToastContainer />
                {user && (
                    <Suspense fallback={null}>
                        <ErrorBoundary>
                            <OrderNotifications />
                        </ErrorBoundary>
                    </Suspense>
                )}
                <Suspense fallback={null}>
                    <ErrorBoundary>
                        <SocialProofToast />
                    </ErrorBoundary>
                </Suspense>
                <Suspense fallback={null}>
                    <ErrorBoundary>
                        {user && <SmartRewardToast />}
                    </ErrorBoundary>
                </Suspense>
                <Suspense fallback={null}>
                    <ErrorBoundary>
                        <WhatsAppFloat />
                    </ErrorBoundary>
                </Suspense>
                <Suspense fallback={null}>
                    <ErrorBoundary>
                        {/* Storefront exposure: global-on for all users, pilot retained as bounded QA override when global is off */}
                        {storefrontAIExposure.isVisible && <AIConcierge />}
                    </ErrorBoundary>
                </Suspense>

                {/* Visible Debug State (Only for Pilot) */}
                <PilotDebugBadge 
                    isAuthorized={isPilotAuthorized} 
                    isGlobalEnabled={settings?.is_ai_assistant_enabled} 
                />


            </TacticalProvider>
            </LazyMotion>
        </ErrorBoundary>
    );
}
