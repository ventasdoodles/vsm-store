import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// ─── Componentes críticos (no lazy — necesarios en primer render) ─────────────
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { SEO } from '@/components/seo/SEO';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAppMonitoring } from '@/hooks/useAppMonitoring';
import { useCartValidator } from '@/hooks/useCartValidator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { SmartRewardToast } from '@/components/loyalty/SmartRewardToast';

// ─── Componentes lazy del shell (no se necesitan en primer render) ────────────
const CartSidebar = lazy(() => import('@/components/cart/CartSidebar').then(m => ({ default: m.CartSidebar })));
const OrderNotifications = lazy(() => import('@/components/notifications/OrderNotifications').then(m => ({ default: m.OrderNotifications })));
const AdminErrorBoundary = lazy(() => import('@/components/admin/AdminErrorBoundary').then(m => ({ default: m.AdminErrorBoundary })));
const SocialProofToast = lazy(() => import('@/components/ui/SocialProofToast').then(m => ({ default: m.SocialProofToast })));

// ─── Páginas lazy (storefront) ────────────────────────────────────────────────
const Terms = lazy(() => import('@/pages/legal/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('@/pages/legal/Privacy').then(m => ({ default: m.Privacy })));
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const SearchResults = lazy(() => import('@/pages/SearchResults').then(m => ({ default: m.SearchResults })));
const SectionSlugResolver = lazy(() => import('@/pages/SectionSlugResolver').then(m => ({ default: m.SectionSlugResolver })));
const SectionPage = lazy(() => import('@/pages/SectionPage').then(m => ({ default: m.SectionPage })));
const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const SignUp = lazy(() => import('@/pages/auth/SignUp').then(m => ({ default: m.SignUp })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Addresses = lazy(() => import('@/pages/Addresses').then(m => ({ default: m.Addresses })));
const Orders = lazy(() => import('@/pages/Orders').then(m => ({ default: m.Orders })));
const OrderDetail = lazy(() => import('@/pages/OrderDetail').then(m => ({ default: m.OrderDetail })));
const Loyalty = lazy(() => import('@/pages/Loyalty').then(m => ({ default: m.Loyalty })));
const Stats = lazy(() => import('@/pages/Stats').then(m => ({ default: m.Stats })));
const Notifications = lazy(() => import('@/pages/user/Notifications').then(m => ({ default: m.Notifications })));
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure').then(m => ({ default: m.PaymentFailure })));
const PaymentPending = lazy(() => import('@/pages/PaymentPending').then(m => ({ default: m.PaymentPending })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));
const Checkout = lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })));
const TrackOrder = lazy(() => import('@/pages/TrackOrder').then(m => ({ default: m.TrackOrder })));
const Wishlist = lazy(() => import('@/pages/Wishlist').then(m => ({ default: m.Wishlist })));

// ─── Páginas lazy (admin) ─────────────────────────────────────────────────────
const AdminGuard = lazy(() => import('@/components/admin/AdminGuard').then(m => ({ default: m.AdminGuard })));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
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

// Minimal loading fallback
function PageLoader() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme border-t-vape-500" />
        </div>
    );
}



export function App() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const { user } = useAuth();

    // Inicializar monitoreo global (Presence + Errores)
    useAppMonitoring();

    // Validar carrito contra API al cargar (solo storefront)
    useCartValidator();

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

    // Admin panel: completely separate layout (no storefront header/footer/cart)
    if (isAdmin) {
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
                                    <Route path="/admin/*" element={<NotFound />} />
                                </Routes>
                            </AdminErrorBoundary>
                        </AdminLayout>
                    </AdminGuard>
                </Suspense>
            </>
        );
    }

    return (
        <>
            {/* 🍞 Notificaciones Globales (Toaster) */}
            <Toaster
                position={isAdmin ? 'bottom-right' : 'bottom-left'}
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

                            {/* Legal Pages */}
                            <Route path="/legal/terms" element={<Terms />} />
                            <Route path="/legal/privacy" element={<Privacy />} />
                            <Route path="/privacy" element={<Privacy />} />

                            <Route path="/contact" element={<Contact />} />
                            <Route path="/vape" element={<SectionPage />} />
                            <Route path="/vape/:slug" element={<SectionSlugResolver />} />
                            <Route path="/420" element={<SectionPage />} />
                            <Route path="/420/:slug" element={<SectionSlugResolver />} />
                            <Route path="/payment/success" element={<PaymentSuccess />} />
                            <Route path="/payment/failure" element={<PaymentFailure />} />
                            <Route path="/payment/pending" element={<PaymentPending />} />
                            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/rastreo" element={<TrackOrder />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
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
            <ErrorBoundary>
                {user && <SmartRewardToast />}
            </ErrorBoundary>
            <ErrorBoundary>
                <WhatsAppFloat />
            </ErrorBoundary>
        </>
    );
}
