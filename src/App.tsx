import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { OrderNotifications } from '@/components/notifications/OrderNotifications';

// Lazy-loaded pages (reduce initial bundle size)
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

// Minimal loading fallback
function PageLoader() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-700 border-t-vape-500" />
        </div>
    );
}

export function App() {
    return (
        <>
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
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </Layout>
            <CartSidebar />
            <ToastContainer />
            <OrderNotifications />
        </>
    );
}
