import { Boxes, PackageCheck, Tags } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import {
    buildLocalVerticalPackPreviewViewModel,
    resolveLocalVerticalPackPreviewByKey,
    resolveLocalVerticalPackPreviewByRoutePrefix,
} from '@/config/productization';

export function SecondVerticalProofFixture() {
    const { pathname, search } = useLocation();
    const surfacePreview = resolveLocalVerticalPackPreviewByRoutePrefix(pathname);

    if (!surfacePreview) {
        return null;
    }

    const previewKey = new URLSearchParams(search).get('preview');
    const preview = resolveLocalVerticalPackPreviewByKey(previewKey) ?? surfacePreview;
    const previewViewModel = buildLocalVerticalPackPreviewViewModel(preview);

    const previewSwitcherPath = pathname;

    const {
        previewLabel,
        proves,
        doesNotProve,
        pack,
        products,
        routeManifest,
        categoryTaxonomyHints,
        productAttributeHints,
        demoProductFamilies,
        sections,
        hasLocalProducts,
        productsBySectionSlug,
    } = previewViewModel;
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

                <section className="space-y-4" aria-label="Preview switcher">
                    <div className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-lg font-black text-white">Preview Switcher</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
                            to={`${previewSwitcherPath}?preview=second-vertical-proof`}
                        >
                            Second vertical proof
                        </Link>
                        <Link
                            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
                            to={`${previewSwitcherPath}?preview=vape-420-preview`}
                        >
                            Vape/420 preview
                        </Link>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                        Selected preview: {previewLabel}
                    </p>
                </section>

                <section className="space-y-4" aria-label="Preview diagnostics">
                    <div className="flex items-center gap-2">
                        <Boxes className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-lg font-black text-white">Preview Diagnostics</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                                What this proves
                            </p>
                            <ul className="mt-3 grid gap-2 text-sm text-white">
                                {proves.map((line) => (
                                    <li key={line} className="rounded-xl bg-white/[0.03] px-3 py-2">
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </article>
                        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                                What this does not prove
                            </p>
                            <ul className="mt-3 grid gap-2 text-sm text-white">
                                {doesNotProve.map((line) => (
                                    <li key={line} className="rounded-xl bg-white/[0.03] px-3 py-2">
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </div>
                </section>

                <section className="space-y-4" aria-label="Pack identity">
                    <div className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-lg font-black text-white">Pack Identity</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                                Pack
                            </p>
                            <p className="mt-2 text-base font-black text-white">{pack.label}</p>
                            <p className="mt-1 text-sm text-theme-secondary">{pack.id}</p>
                        </article>
                        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                                Demo Families
                            </p>
                            <div className="mt-2 grid gap-2">
                                {demoProductFamilies.map((family) => (
                                    <p key={family} className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-white">
                                        {family}
                                    </p>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>

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
                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                        {section.hasLocalProducts ? 'Local products available' : 'No local products available'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-theme-secondary">{section.description}</p>
                            <p className="mt-3 text-xs text-theme-tertiary">{section.routePrefix}</p>
                            <p className="mt-1 text-xs text-theme-tertiary">{section.slugRoutePattern}</p>
                            <p className="mt-3 text-xs text-theme-tertiary">
                                Selected pack products in this section: {productsBySectionSlug[section.slug]?.length ?? 0}
                            </p>
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

                <section className="space-y-4" aria-label="Pack taxonomy">
                    <div className="flex items-center gap-2">
                        <Boxes className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-lg font-black text-white">Pack Taxonomy</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                                Category Hints
                            </p>
                            <div className="mt-3 grid gap-2">
                                {categoryTaxonomyHints.map((hint) => (
                                    <div key={hint.slug} className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                                        Category hint: {hint.label} / {hint.sectionSlug} / {hint.slug}
                                    </div>
                                ))}
                            </div>
                        </article>
                        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                                Attribute Hints
                            </p>
                            <div className="mt-3 grid gap-2">
                                {productAttributeHints.map((hint) => (
                                    <div
                                        key={`${hint.sectionSlug}:${hint.categorySlug}`}
                                        className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm"
                                    >
                                        Attribute hint: {hint.sectionSlug} / {hint.categorySlug}: {hint.attributes.join(', ')}
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>

                <section className="space-y-4" aria-label="Pack route manifest">
                    <div className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-lg font-black text-white">Pack Route Manifest</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {routeManifest.map((route) => (
                            <article key={route.sectionSlug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="text-sm font-black text-white">{route.sectionSlug}</p>
                                <p className="mt-1 text-xs text-theme-tertiary">Root: {route.rootRoute}</p>
                                <p className="mt-1 text-xs text-theme-tertiary">Pattern: {route.slugRoutePattern}</p>
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
                        {products.length === 0 ? (
                            <article className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5">
                                <p className="text-sm font-black text-white">No local product list available for this preview.</p>
                                <p className="mt-1 text-sm text-theme-secondary">
                                    This preview only demonstrates selected pack state, route manifest, and taxonomy hints.
                                </p>
                            </article>
                        ) : null}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-tertiary">
                        Preview selection is local/dev-only and currently {hasLocalProducts ? 'includes' : 'omits'} local products.
                    </p>
                </section>
            </section>
        </main>
    );
}
