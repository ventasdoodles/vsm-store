import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { SearchResults } from '@/pages/SearchResults';
import { SectionSlugResolver } from '@/pages/SectionSlugResolver';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/pages/auth/Login';
import { SignUp } from '@/pages/auth/SignUp';
import { Profile } from '@/pages/Profile';
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
                    <Route path="/vape/:slug" element={<SectionSlugResolver />} />
                    <Route path="/420/:slug" element={<SectionSlugResolver />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
            <CartSidebar />
        </>
    );
}
