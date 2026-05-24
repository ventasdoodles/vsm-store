import { useMemo, type ReactNode } from 'react';

import { ProductGrid } from '@/components/products/ProductGrid';
import { makeProductGridStateFixtures } from '@/components/products/productGridStatesFixture';
import { TacticalProvider } from '@/contexts/TacticalContext';

function FixtureSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4" aria-label={title}>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-white">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}

export function ProductGridStatesFixture() {
    const products = useMemo(() => makeProductGridStateFixtures(), []);

    return (
        <TacticalProvider>
            <main className="min-h-screen bg-theme-primary px-4 py-10 text-white sm:px-6 lg:px-10">
                <div className="mx-auto flex max-w-6xl flex-col gap-10">
                    <header className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-vape-300">
                            Local QA fixture
                        </p>
                        <h1 className="text-3xl font-black leading-tight md:text-4xl">
                            ProductGrid states fixture
                        </h1>
                    </header>

                    <FixtureSection title="Loading state">
                        <div data-testid="product-grid-loading-state">
                            <ProductGrid products={[]} isLoading />
                        </div>
                    </FixtureSection>

                    <FixtureSection title="Empty state">
                        <ProductGrid
                            products={[]}
                            emptyStateTitle="Catalogo en rotacion"
                            emptyStateSubtext="Fixture local para validar el panel sin productos."
                        />
                    </FixtureSection>

                    <FixtureSection title="Populated state">
                        <ProductGrid products={products} />
                    </FixtureSection>
                </div>
            </main>
        </TacticalProvider>
    );
}
