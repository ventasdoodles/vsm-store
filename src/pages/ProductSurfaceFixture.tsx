import { useMemo, useState } from 'react';

import { ProductPriceSection } from '@/components/products/ProductPriceSection';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { makeProductSurfaceFixture } from '@/components/products/productSurfaceFixture';

export function ProductSurfaceFixture() {
    const product = useMemo(() => makeProductSurfaceFixture(), []);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    return (
        <main className="min-h-screen bg-theme-primary px-4 py-10 text-white sm:px-6 lg:px-10">
            <section className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-vape-300">
                        Local QA fixture
                    </p>
                    <h1 className="text-3xl font-black leading-tight md:text-4xl">
                        Product surface fixture
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                    <div
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                        data-testid="product-price-fixture"
                    >
                        <ProductPriceSection
                            price={product.price}
                            compareAtPrice={product.compare_at_price}
                            section={product.section}
                        />
                    </div>

                    <button
                        type="button"
                        className="h-14 rounded-2xl bg-white px-6 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-white/90"
                        onClick={() => setIsQuickViewOpen(true)}
                    >
                        Open quick view
                    </button>
                </div>
            </section>

            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </main>
    );
}
