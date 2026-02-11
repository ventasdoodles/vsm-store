// Home Page - VSM Store
import { useState } from 'react';
import { Flame, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import type { Section } from '@/types/product';

// Tipo para el filtro de sección (incluye 'todos')
type SectionFilter = Section | 'todos';

export function Home() {
    const [activeSection, setActiveSection] = useState<SectionFilter>('todos');

    // Pasar undefined cuando es 'todos' para traer todos los productos
    const sectionParam = activeSection === 'todos' ? undefined : activeSection;
    const { data: products = [], isLoading } = useProducts({ section: sectionParam });

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
                            <button
                                onClick={() => setActiveSection('vape')}
                                className="rounded-xl bg-vape-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-vape-500/25 transition-all hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Flame className="mr-2 inline h-4 w-4" />
                                Explorar Vape
                            </button>
                            <button
                                onClick={() => setActiveSection('420')}
                                className="rounded-xl bg-herbal-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-herbal-500/25 transition-all hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Leaf className="mr-2 inline h-4 w-4" />
                                Explorar 420
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toggle de Sección + Grid de Productos */}
            <section className="container-vsm py-12">
                {/* Toggle */}
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex rounded-xl bg-primary-900 p-1">
                        <button
                            onClick={() => setActiveSection('todos')}
                            className={cn(
                                'rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                                activeSection === 'todos'
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

                {/* Grid de productos reales */}
                <ProductGrid products={products} isLoading={isLoading} />
            </section>
        </div>
    );
}
