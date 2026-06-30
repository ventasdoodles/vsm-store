import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SafetyProvider } from '@/contexts/SafetyContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from '@/lib/react-query';

import { lazy } from 'react';
import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { App } from './App';
import { AdminApp } from './AdminApp';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// ─── Páginas lazy (storefront) ────────────────────────────────────────────────
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const NewArrivals = lazy(() => import('@/pages/NewArrivals').then(m => ({ default: m.NewArrivals })));
const BestsellersPage = lazy(() => import('@/pages/BestsellersPage').then(m => ({ default: m.BestsellersPage })));
const OffersPage = lazy(() => import('@/pages/OffersPage').then(m => ({ default: m.OffersPage })));
const SearchResults = lazy(() => import('@/pages/SearchResults').then(m => ({ default: m.SearchResults })));
const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const SignUp = lazy(() => import('@/pages/auth/SignUp').then(m => ({ default: m.SignUp })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Addresses = lazy(() => import('@/pages/Addresses').then(m => ({ default: m.Addresses })));
const Orders = lazy(() => import('@/pages/Orders').then(m => ({ default: m.Orders })));
const OrderDetail = lazy(() => import('@/pages/OrderDetail').then(m => ({ default: m.OrderDetail })));
const Loyalty = lazy(() => import('@/pages/Loyalty').then(m => ({ default: m.Loyalty })));
const Stats = lazy(() => import('@/pages/Stats').then(m => ({ default: m.Stats })));
const Terms = lazy(() => import('@/pages/legal/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('@/pages/legal/Privacy').then(m => ({ default: m.Privacy })));
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure').then(m => ({ default: m.PaymentFailure })));
const PaymentPending = lazy(() => import('@/pages/PaymentPending').then(m => ({ default: m.PaymentPending })));
const Notifications = lazy(() => import('@/pages/user/Notifications').then(m => ({ default: m.Notifications })));
const Checkout = lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })));
const TrackOrder = lazy(() => import('@/pages/TrackOrder').then(m => ({ default: m.TrackOrder })));
const Wishlist = lazy(() => import('@/pages/Wishlist').then(m => ({ default: m.Wishlist })));
const SectionSlugResolver = lazy(() => import('@/pages/SectionSlugResolver').then(m => ({ default: m.SectionSlugResolver })));
const CategoryPage = lazy(() => import('@/pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));

// ─── Admin lazy pages ─────────────────────────────────────────────────────────
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

// Root Route
export const rootRoute = createRootRoute({
    component: () => (
        <ThemeProvider>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <HelmetProvider>
                        <SafetyProvider>
                            <Outlet />
                        </SafetyProvider>
                    </HelmetProvider>
                </QueryClientProvider>
            </AuthProvider>
        </ThemeProvider>
    ),
});

// App Layout (Storefront)
export const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'storefront',
    component: App,
});

// Admin Layout
export const adminAppRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminApp,
});

// Storefront Routes
const indexRoute = createRoute({ getParentRoute: () => appRoute, path: '/', component: Home });
const newArrivalsRoute = createRoute({ getParentRoute: () => appRoute, path: '/nuevo', component: NewArrivals });
const bestsellersRoute = createRoute({ getParentRoute: () => appRoute, path: '/mas-vendidos', component: BestsellersPage });
const offersRoute = createRoute({ getParentRoute: () => appRoute, path: '/ofertas', component: OffersPage });
const searchRoute = createRoute({ getParentRoute: () => appRoute, path: '/buscar', component: SearchResults });
const loginRoute = createRoute({ getParentRoute: () => appRoute, path: '/login', component: Login });
const signUpRoute = createRoute({ getParentRoute: () => appRoute, path: '/signup', component: SignUp });
const profileRoute = createRoute({ getParentRoute: () => appRoute, path: '/profile', component: () => <ProtectedRoute><Profile /></ProtectedRoute> });
const addressesRoute = createRoute({ getParentRoute: () => appRoute, path: '/addresses', component: () => <ProtectedRoute><Addresses /></ProtectedRoute> });
const ordersRoute = createRoute({ getParentRoute: () => appRoute, path: '/orders', component: () => <ProtectedRoute><Orders /></ProtectedRoute> });
const orderDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/orders/$orderId', component: () => <ProtectedRoute><OrderDetail /></ProtectedRoute> });
const loyaltyRoute = createRoute({ getParentRoute: () => appRoute, path: '/loyalty', component: () => <ProtectedRoute><Loyalty /></ProtectedRoute> });
const statsRoute = createRoute({ getParentRoute: () => appRoute, path: '/stats', component: () => <ProtectedRoute><Stats /></ProtectedRoute> });
const termsRoute = createRoute({ getParentRoute: () => appRoute, path: '/legal/terms', component: Terms });
const privacyLegalRoute = createRoute({ getParentRoute: () => appRoute, path: '/legal/privacy', component: Privacy });
const privacyRoute = createRoute({ getParentRoute: () => appRoute, path: '/privacy', component: Privacy });
const contactRoute = createRoute({ getParentRoute: () => appRoute, path: '/contact', component: Contact });
const paySuccessRoute = createRoute({ getParentRoute: () => appRoute, path: '/payment/success', component: PaymentSuccess });
const payFailRoute = createRoute({ getParentRoute: () => appRoute, path: '/payment/failure', component: PaymentFailure });
const payPendingRoute = createRoute({ getParentRoute: () => appRoute, path: '/payment/pending', component: PaymentPending });
const notifRoute = createRoute({ getParentRoute: () => appRoute, path: '/notifications', component: () => <ProtectedRoute><Notifications /></ProtectedRoute> });
const checkoutRoute = createRoute({ getParentRoute: () => appRoute, path: '/checkout', component: Checkout });
const trackRoute = createRoute({ getParentRoute: () => appRoute, path: '/rastreo', component: TrackOrder });
const wishlistRoute = createRoute({ getParentRoute: () => appRoute, path: '/wishlist', component: Wishlist });
const categoryRoute = createRoute({ getParentRoute: () => appRoute, path: '/$section', component: CategoryPage });
const sectionSlugRoute = createRoute({ getParentRoute: () => appRoute, path: '/$section/$slug', component: SectionSlugResolver });

// Admin Routes
const adminIndexRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/', component: AdminDashboard });
const adminCatalogRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/products', component: AdminProducts });
const adminProductNewRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/products/new', component: AdminProductForm });
const adminProductEditRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/products/$id', component: AdminProductForm });
const adminOrdersRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/orders', component: AdminOrders });
const adminCategoriesRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/categories', component: AdminCategories });
const adminBrandsRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/brands', component: AdminBrands });
const adminTagsRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/tags', component: AdminTags });
const adminCustomersRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/customers', component: AdminCustomers });
const adminCustomerDetailRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/customers/$id', component: AdminCustomerDetails });
const adminCouponsRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/coupons', component: AdminCoupons });
const adminSettingsRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/settings', component: AdminSettings });
const adminSlidersRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/sliders', component: AdminHomeSliders });
const adminMonitoringRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/monitoring', component: AdminMonitoring });
const adminTestimonialsRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/testimonials', component: AdminTestimonials });
const adminHomeEditorRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/home-editor', component: AdminHomeEditor });
const adminLoyaltyRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/loyalty', component: AdminLoyalty });
const adminFlashDealsRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/flash-deals', component: AdminFlashDeals });
const adminAttributesRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/attributes', component: AdminAttributes });
const adminWheelGameRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/wheel-game', component: AdminWheelGame });
const adminBatchRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/batch-manager', component: AdminBatchManager });
const adminCesarinRoute = createRoute({ getParentRoute: () => adminAppRoute, path: '/cesarin', component: AdminCesarinOS });

// Dynamic splat fallback
const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '$', component: NotFound });

const routeTree = rootRoute.addChildren([
    appRoute.addChildren([
        indexRoute, newArrivalsRoute, bestsellersRoute, offersRoute,
        searchRoute, loginRoute, signUpRoute, profileRoute, addressesRoute,
        ordersRoute, orderDetailRoute, loyaltyRoute, statsRoute, termsRoute,
        privacyLegalRoute, privacyRoute, contactRoute, paySuccessRoute,
        payFailRoute, payPendingRoute, notifRoute, checkoutRoute, trackRoute, wishlistRoute,
        categoryRoute, sectionSlugRoute
    ]),
    adminAppRoute.addChildren([
        adminIndexRoute, adminCatalogRoute, adminProductNewRoute, adminProductEditRoute,
        adminOrdersRoute, adminCategoriesRoute, adminBrandsRoute, adminTagsRoute,
        adminCustomersRoute, adminCustomerDetailRoute, adminCouponsRoute, adminSettingsRoute,
        adminSlidersRoute, adminMonitoringRoute, adminTestimonialsRoute, adminHomeEditorRoute,
        adminLoyaltyRoute, adminFlashDealsRoute, adminAttributesRoute, adminWheelGameRoute,
        adminBatchRoute, adminCesarinRoute
    ]),
    notFoundRoute
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
