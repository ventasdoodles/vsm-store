import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { LazyMotion, domAnimation } from 'framer-motion';

// ─── Admin lazy pages ─────────────────────────────────────────────────────────
const AdminGuard = lazy(() => import('@/components/admin/AdminGuard').then(m => ({ default: m.AdminGuard })));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminErrorBoundary = lazy(() => import('@/components/admin/AdminErrorBoundary').then(m => ({ default: m.AdminErrorBoundary })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm').then(m => ({ default: m.AdminProductForm })));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands').then(m => ({ default: m.AdminBrands })));
const AdminTags = lazy(() => import('@/pages/admin/AdminTags').then(m => ({ default: m.AdminTags })));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminCustomerDetails = lazy(() => import('@/pages/admin/AdminCustomerDetails').then(m => ({ default: m.AdminCustomerDetails })));
const AdminCoupons = lazy(() => import('@/pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminHomeSliders = lazy(() => import('@/pages/admin/AdminHomeSliders').then(m => ({ default: m.AdminHomeSliders })));
const AdminMonitoring = lazy(() => import('@/pages/admin/AdminMonitoring').then(m => ({ default: m.AdminMonitoring })));
const AdminTestimonials = lazy(() => import('@/pages/admin/AdminTestimonials').then(m => ({ default: m.AdminTestimonials })));
const AdminHomeEditor = lazy(() => import('@/pages/admin/AdminHomeEditor').then(m => ({ default: m.AdminHomeEditor })));
const AdminLoyalty = lazy(() => import('@/pages/admin/AdminLoyalty').then(m => ({ default: m.AdminLoyalty })));
const AdminFlashDeals = lazy(() => import('@/pages/admin/AdminFlashDeals').then(m => ({ default: m.AdminFlashDeals })));
const AdminAttributes = lazy(() => import('@/pages/admin/AdminAttributes').then(m => ({ default: m.AdminAttributes })));
const AdminWheelGame  = lazy(() => import('@/pages/admin/AdminWheelGame').then(m => ({ default: m.AdminWheelGame })));
const AdminBatchManager = lazy(() => import('@/pages/admin/AdminBatchManager').then(m => ({ default: m.AdminBatchManager })));
const AdminCesarinOS = lazy(() => import('@/pages/admin/AdminCesarinOS').then(m => ({ default: m.AdminCesarinOS })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));

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
                            <Routes>
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/products" element={<AdminProducts />} />
                                <Route path="/admin/products/new" element={<AdminProductForm />} />
                                <Route path="/admin/products/:id" element={<AdminProductForm />} />
                                <Route path="/admin/orders" element={<AdminOrders />} />
                                <Route path="/admin/categories" element={<AdminCategories />} />
                                <Route path="/admin/brands" element={<AdminBrands />} />
                                <Route path="/admin/tags" element={<AdminTags />} />
                                <Route path="/admin/customers" element={<AdminCustomers />} />
                                <Route path="/admin/customers/:id" element={<AdminCustomerDetails />} />
                                <Route path="/admin/coupons" element={<AdminCoupons />} />
                                <Route path="/admin/settings" element={<AdminSettings />} />
                                <Route path="/admin/sliders" element={<AdminHomeSliders />} />
                                <Route path="/admin/monitoring" element={<AdminMonitoring />} />
                                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                                <Route path="/admin/home-editor" element={<AdminHomeEditor />} />
                                <Route path="/admin/loyalty" element={<AdminLoyalty />} />
                                <Route path="/admin/flash-deals" element={<AdminFlashDeals />} />
                                <Route path="/admin/attributes" element={<AdminAttributes />} />
                                <Route path="/admin/wheel-game" element={<AdminWheelGame />} />
                                <Route path="/admin/batch-manager" element={<AdminBatchManager />} />
                                <Route path="/admin/cesarin" element={<AdminCesarinOS />} />
                                <Route path="/admin/*" element={<NotFound />} />
                            </Routes>
                        </AdminErrorBoundary>
                    </AdminLayout>
                </AdminGuard>
            </Suspense>
        </LazyMotion>
        </>
    );
}
