import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { SearchResults } from '@/pages/SearchResults';
import { SectionSlugResolver } from '@/pages/SectionSlugResolver';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/pages/auth/Login';
import { SignUp } from '@/pages/auth/SignUp';
import { Profile } from '@/pages/Profile';
import { Addresses } from '@/pages/Addresses';
import { Orders } from '@/pages/Orders';
import { OrderDetail } from '@/pages/OrderDetail';
import { Loyalty } from '@/pages/Loyalty';
import { Stats } from '@/pages/Stats';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function App() {
    return (
        <>
            <Layout>
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
                    <Route path="/vape/:slug" element={<SectionSlugResolver />} />
                    <Route path="/420/:slug" element={<SectionSlugResolver />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
            <CartSidebar />
        </>
    );
}
