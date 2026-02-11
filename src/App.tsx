import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { ProductDetail } from '@/pages/ProductDetail';
import { NotFound } from '@/pages/NotFound';
import { CartSidebar } from '@/components/cart/CartSidebar';

export function App() {
    return (
        <>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/vape/:slug" element={<ProductDetail />} />
                    <Route path="/420/:slug" element={<ProductDetail />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
            {/* Sidebar del carrito — disponible en todas las páginas */}
            <CartSidebar />
        </>
    );
}
