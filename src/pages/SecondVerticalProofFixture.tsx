import { Boxes, PackageCheck, Tags } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import {
    resolveLocalVerticalPackPreviewByRoutePrefix,
} from '@/config/productization';

export function SecondVerticalProofFixture() {
    const { pathname } = useLocation();
    const preview = resolveLocalVerticalPackPreviewByRoutePrefix(pathname);

    if (!preview) {
        return null;
    }

    const { pack, products } = preview;
    const sections = pack.sections;
    const categories = pack.marketing.categoryShowcase.fallbackCategories;

    return (
        <main className="min-h-screen bg-theme-primary px-4 py-10 text-white sm:px-6 lg:px-10">
            <section className="mx-auto flex max-w-6xl flex-col gap-8">
                <header className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Local QA fixture
                    </p>
                    <div className="max-w-3xl space-y-2">
                        <h1 className="text-3xl font-black leading-tight md:text-4xl">
                            {pack.marketing.homeHero.primaryCopy.title}
                        </h1>
                        <p className="text-sm text-theme-secondary">
                            {pack.marketing.homeHero.primaryCopy.description}
                        </p>
                    </div>
                </header>

                <div className="grid gap-4 md:grid-cols-2">
                    {sections.map((section) => (
                        <article
                            key={section.slug}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                                    <PackageCheck className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-lg font-black text-white">{section.label}</h2>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                                        {section.slug}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-theme-secondary">{section.description}</p>
                            <p className="mt-3 text-xs text-theme-tertiary">{section.routePrefix}</p>
                        </article>
                    ))}
                </div>

                <section className="space-y-4" aria-label="Proof categories">
                    <div className="flex items-center gap-2">
                        <Boxes className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-lg font-black text-white">Proof Categories</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {categories.map((category) => (
                            <article
                                key={category.id}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <p className="text-base font-black text-white">{category.name}</p>
                                <p className="mt-1 text-xs text-theme-tertiary">
                                    {category.sectionSlug} / {category.slug}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-4" aria-label="Proof products">
                    <div className="flex items-center gap-2">
                        <Tags className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-lg font-black text-white">Proof Products</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {products.map((product) => (
                            <article
                                key={product.id}
                                className="rounded-2xl border border-white/10 bg-theme-secondary/20 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-black text-white">{product.name}</h3>
                                        <p className="mt-1 text-sm text-theme-secondary">
                                            {product.shortDescription}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-black text-cyan-300">
                                        {product.priceLabel}
                                    </p>
                                </div>
                                <dl className="mt-4 grid gap-2 text-xs text-theme-secondary">
                                    {product.attributeSummary.map((attribute) => (
                                        <div key={attribute} className="rounded-xl bg-white/[0.03] px-3 py-2">
                                            {attribute}
                                        </div>
                                    ))}
                                </dl>
                            </article>
                        ))}
                    </div>
                </section>
            </section>
        </main>
    );
}
