import { lazy, Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { LazyMotion, domAnimation } from 'framer-motion';

// ─── Admin lazy pages ─────────────────────────────────────────────────────────
const AdminGuard = lazy(() => import('@/components/admin/AdminGuard').then(m => ({ default: m.AdminGuard })));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminErrorBoundary = lazy(() => import('@/components/admin/AdminErrorBoundary').then(m => ({ default: m.AdminErrorBoundary })));

// Minimal loading fallback
function PageLoader() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme border-t-vape-500" />
        </div>
    );
}

export function AdminApp() {
    return (
        <>
            <Toaster
                position="bottom-right"
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
            <LazyMotion features={domAnimation}>
            <ToastContainer />
            <Suspense fallback={<PageLoader />}>
                <AdminGuard>
                    <AdminLayout>
                        <AdminErrorBoundary>
                            <Outlet />
                        </AdminErrorBoundary>
                    </AdminLayout>
                </AdminGuard>
            </Suspense>
        </LazyMotion>
        </>
    );
}
