import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/seo/SEO';
import { Home } from '@/pages/Home';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { OrderNotifications } from '@/components/notifications/OrderNotifications';
import { SocialProofToast } from '@/components/ui/SocialProofToast';

// Lazy-loaded storefront pages
const SearchResults = lazy(() => import('@/pages/SearchResults').then(m => ({ default: m.SearchResults })));
const SectionSlugResolver = lazy(() => import('@/pages/SectionSlugResolver').then(m => ({ default: m.SectionSlugResolver })));
const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const SignUp = lazy(() => import('@/pages/auth/SignUp').then(m => ({ default: m.SignUp })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Addresses = lazy(() => import('@/pages/Addresses').then(m => ({ default: m.Addresses })));
const Orders = lazy(() => import('@/pages/Orders').then(m => ({ default: m.Orders })));
const OrderDetail = lazy(() => import('@/pages/OrderDetail').then(m => ({ default: m.OrderDetail })));
const Loyalty = lazy(() => import('@/pages/Loyalty').then(m => ({ default: m.Loyalty })));
const Stats = lazy(() => import('@/pages/Stats').then(m => ({ default: m.Stats })));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure').then(m => ({ default: m.PaymentFailure })));
const PaymentPending = lazy(() => import('@/pages/PaymentPending').then(m => ({ default: m.PaymentPending })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));
const Checkout = lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })));

// Lazy-loaded admin pages (separate chunk)
const AdminGuard = lazy(() => import('@/components/admin/AdminGuard').then(m => ({ default: m.AdminGuard })));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm').then(m => ({ default: m.AdminProductForm })));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminCoupons = lazy(() => import('@/pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

// Minimal loading fallback
function PageLoader() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-700 border-t-vape-500" />
        </div>
    );
}

export function App() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    // Admin panel: completely separate layout (no storefront header/footer/cart)
    if (isAdmin) {
        return (
            <Suspense fallback={<PageLoader />}>
                <AdminGuard>
                    <AdminLayout>
                        <Routes>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/products" element={<AdminProducts />} />
                            <Route path="/admin/products/new" element={<AdminProductForm />} />
                            <Route path="/admin/products/:id" element={<AdminProductForm />} />
                            <Route path="/admin/orders" element={<AdminOrders />} />
                            <Route path="/admin/categories" element={<AdminCategories />} />
                            <Route path="/admin/customers" element={<AdminCustomers />} />
                            <Route path="/admin/coupons" element={<AdminCoupons />} />
                            <Route path="/admin/coupons" element={<AdminCoupons />} />
                            <Route path="/admin/settings" element={<AdminSettings />} />
                            <Route path="/admin/*" element={<NotFound />} />
                        </Routes>
                    </AdminLayout>
                </AdminGuard>
            </Suspense>
        );
    }

    return (
        <>
            <SEO />
            <Layout>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/buscar" element={<SearchResults />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                        <Route path="/loyalty" element={<ProtectedRoute><Loyalty /></ProtectedRoute>} />
                        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/vape/:slug" element={<SectionSlugResolver />} />
                        <Route path="/420/:slug" element={<SectionSlugResolver />} />
                        <Route path="/payment/success" element={<PaymentSuccess />} />
                        <Route path="/payment/failure" element={<PaymentFailure />} />
                        <Route path="/payment/pending" element={<PaymentPending />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </Layout>
            <CartSidebar />
            <ToastContainer />
            <OrderNotifications />
            <SocialProofToast />
        </>
    );
}
