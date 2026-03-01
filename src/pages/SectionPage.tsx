/**
 * SectionPage — Muestra todos los productos de una sección (vape o 420).
 */
import { useLocation } from 'react-router-dom';
import { Flame, Leaf } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SEO } from '@/components/seo/SEO';
import { SECTIONS } from '@/types/constants';
import type { Section } from '@/types/constants';

function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? SECTIONS.CANNABIS : SECTIONS.VAPE;
}

export function SectionPage() {
    const section = useSectionFromPath();
    const isVape = section === 'vape';

    const { data: products = [], isLoading } = useProducts({ section });

    const title = isVape ? 'Vape Collection' : '420 Zone';
    const description = isVape
        ? 'Explora toda nuestra colección de vapeo: pods, líquidos, accesorios y más.'
        : 'Descubre nuestra selección completa de productos 420: herbal, accesorios y más.';

    return (
        <div className="min-h-screen pb-20 pt-6 bg-theme-primary">
            <SEO title={title} description={description} />
            <div className="container-vsm space-y-8">
                {/* Header de sección */}
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isVape ? 'bg-vape-500/20 text-vape-500' : 'bg-herbal-500/20 text-herbal-500'}`}>
                        {isVape ? <Flame className="h-8 w-8" /> : <Leaf className="h-8 w-8" />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-theme-primary">{title}</h1>
                        <p className="text-sm text-theme-secondary">{products.length} productos</p>
                    </div>
                </div>

                {/* Grid de productos */}
                <ProductGrid products={products} isLoading={isLoading} />
            </div>
        </div>
    );
}
