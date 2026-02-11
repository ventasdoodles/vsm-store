// Home Page - VSM Store
import { useState } from 'react';
import { Flame, Leaf, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Section } from '@/types/product';

// Productos placeholder para demostración
const PLACEHOLDER_PRODUCTS = [
    {
        id: '1',
        name: 'Aegis Legend 2',
        price: 1299,
        section: 'vape' as Section,
        image: null,
        tag: 'Popular',
    },
    {
        id: '2',
        name: 'Profile RDA',
        price: 899,
        section: 'vape' as Section,
        image: null,
        tag: 'Nuevo',
    },
    {
        id: '3',
        name: 'Pax Plus',
        price: 4500,
        section: '420' as Section,
        image: null,
        tag: 'Premium',
    },
    {
        id: '4',
        name: 'CBD Gummies',
        price: 350,
        section: '420' as Section,
        image: null,
        tag: 'Best Seller',
    },
];

export function Home() {
    const [activeSection, setActiveSection] = useState<Section | 'all'>('all');

    // Filtrar productos según sección seleccionada
    const filteredProducts = activeSection === 'all'
        ? PLACEHOLDER_PRODUCTS
        : PLACEHOLDER_PRODUCTS.filter((p) => p.section === activeSection);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 sm:py-28">
                {/* Gradiente de fondo */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-primary-950 to-primary-950" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-vape-500/10 via-transparent to-herbal-500/10" />

                <div className="container-vsm relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Bienvenido a{' '}
                            <span className="bg-gradient-to-r from-vape-400 to-herbal-400 bg-clip-text text-transparent">
                                VSM Store
                            </span>
                        </h1>
                        <p className="mb-8 text-lg text-primary-400 sm:text-xl">
                            Tu destino para los mejores productos de vapeo y 420.
                            Calidad premium, envío seguro.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button className="rounded-xl bg-vape-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-vape-500/25 transition-all hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5 active:translate-y-0">
                                <Flame className="mr-2 inline h-4 w-4" />
                                Explorar Vape
                            </button>
                            <button className="rounded-xl bg-herbal-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-herbal-500/25 transition-all hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5 active:translate-y-0">
                                <Leaf className="mr-2 inline h-4 w-4" />
                                Explorar 420
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toggle de Sección */}
            <section className="container-vsm py-12">
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex rounded-xl bg-primary-900 p-1">
                        <button
                            onClick={() => setActiveSection('all')}
                            className={cn(
                                'rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                                activeSection === 'all'
                                    ? 'bg-primary-700 text-primary-100 shadow-sm'
                                    : 'text-primary-400 hover:text-primary-200'
                            )}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveSection('vape')}
                            className={cn(
                                'rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                                activeSection === 'vape'
                                    ? 'bg-vape-500/20 text-vape-400 shadow-sm'
                                    : 'text-primary-400 hover:text-primary-200'
                            )}
                        >
                            <Flame className="mr-1.5 inline h-4 w-4" />
                            Vape
                        </button>
                        <button
                            onClick={() => setActiveSection('420')}
                            className={cn(
                                'rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                                activeSection === '420'
                                    ? 'bg-herbal-500/20 text-herbal-400 shadow-sm'
                                    : 'text-primary-400 hover:text-primary-200'
                            )}
                        >
                            <Leaf className="mr-1.5 inline h-4 w-4" />
                            420
                        </button>
                    </div>
                </div>

                {/* Grid de Productos */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <article
                            key={product.id}
                            className="group relative overflow-hidden rounded-2xl border border-primary-800 bg-primary-900/50 transition-all hover:border-primary-700 hover:shadow-xl hover:shadow-primary-950/50 hover:-translate-y-1"
                        >
                            {/* Imagen placeholder */}
                            <div className={cn(
                                'flex h-48 items-center justify-center',
                                product.section === 'vape'
                                    ? 'bg-gradient-to-br from-vape-500/10 to-vape-600/5'
                                    : 'bg-gradient-to-br from-herbal-500/10 to-herbal-600/5'
                            )}>
                                {product.section === 'vape' ? (
                                    <Zap className="h-12 w-12 text-vape-500/30" />
                                ) : (
                                    <Leaf className="h-12 w-12 text-herbal-500/30" />
                                )}
                            </div>

                            {/* Tag */}
                            <span className={cn(
                                'absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                                product.section === 'vape'
                                    ? 'bg-vape-500/20 text-vape-300'
                                    : 'bg-herbal-500/20 text-herbal-300'
                            )}>
                                {product.tag}
                            </span>

                            {/* Info del producto */}
                            <div className="p-4">
                                <h3 className="mb-1 text-sm font-semibold text-primary-100 group-hover:text-white transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary-200">
                                        ${product.price.toLocaleString('es-MX')}
                                    </span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                                <button className={cn(
                                    'mt-3 w-full rounded-xl py-2 text-xs font-semibold transition-all',
                                    product.section === 'vape'
                                        ? 'bg-vape-500/10 text-vape-400 hover:bg-vape-500/20'
                                        : 'bg-herbal-500/10 text-herbal-400 hover:bg-herbal-500/20'
                                )}>
                                    Agregar al carrito
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
