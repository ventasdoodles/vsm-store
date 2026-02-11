import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { SearchResults } from '@/pages/SearchResults';
import { SectionSlugResolver } from '@/pages/SectionSlugResolver';
import { NotFound } from '@/pages/NotFound';
import { CartSidebar } from '@/components/cart/CartSidebar';

export function App() {
    return (
        <>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/buscar" element={<SearchResults />} />
                    <Route path="/vape/:slug" element={<SectionSlugResolver />} />
                    <Route path="/420/:slug" element={<SectionSlugResolver />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
            <CartSidebar />
        </>
    );
}
