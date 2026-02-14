// Home Page - VSM Store
import { useState } from 'react';
import { Flame, Leaf, Truck, ShieldCheck, Sparkles, Users } from 'lucide-react';
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
            {/* ═══════ Hero Section ═══════ */}
            <section className="relative overflow-hidden py-24 sm:py-32">
                {/* Gradiente de fondo */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-primary-950 to-primary-950" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-vape-500/10 via-transparent to-herbal-500/10" />

                {/* Glow orbs animados */}
                <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-vape-500/5 blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-herbal-500/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

                {/* Grid pattern sutil */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

                <div className="container-vsm relative">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Badge flotante */}
                        <div className="mb-6 inline-flex animate-slide-up items-center gap-2 rounded-full border border-vape-500/20 bg-vape-500/5 px-4 py-1.5 text-xs font-medium text-vape-400 backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            Envío gratis en Xalapa
                        </div>

                        {/* Título */}
                        <h1
                            className="mb-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl animate-slide-up"
                            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                        >
                            Bienvenido a{' '}
                            <span className="relative">
                                <span className="text-gradient-brand">
                                    VSM Store
                                </span>
                                {/* Glow behind text */}
                                <span className="absolute -inset-1 -z-10 block rounded-lg bg-gradient-to-r from-vape-500/10 to-herbal-500/10 blur-xl" />
                            </span>
                        </h1>

                        <p
                            className="mb-10 text-lg text-primary-400 sm:text-xl leading-relaxed animate-slide-up"
                            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
                        >
                            Tu destino para los mejores productos de vapeo y 420.
                            <br className="hidden sm:block" />
                            Calidad premium, envío seguro.
                        </p>

                        {/* CTA Buttons */}
                        <div
                            className="flex flex-col gap-3 sm:flex-row sm:justify-center animate-slide-up"
                            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
                        >
                            <button
                                onClick={() => setActiveSection('vape')}
                                className="group relative rounded-xl bg-vape-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/25 transition-all hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Flame className="h-4 w-4" />
                                    Explorar Vape
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-vape-600 to-vape-500 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                            <button
                                onClick={() => setActiveSection('420')}
                                className="group relative rounded-xl bg-herbal-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-herbal-500/25 transition-all hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Leaf className="h-4 w-4" />
                                    Explorar 420
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-herbal-600 to-herbal-500 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div
                    className="container-vsm relative mt-16 animate-slide-up"
                    style={{ animationDelay: '400ms', animationFillMode: 'both' }}
                >
                    <div className="mx-auto max-w-2xl grid grid-cols-3 gap-4">
                        {[
                            { icon: Truck, label: 'Envío gratis', sub: 'En Xalapa' },
                            { icon: ShieldCheck, label: 'Pago seguro', sub: 'Mercado Pago' },
                            { icon: Users, label: '+500 clientes', sub: 'Nos eligen' },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center gap-1.5 rounded-xl border border-primary-800/30 bg-primary-900/20 px-3 py-4 backdrop-blur-sm"
                            >
                                <stat.icon className="h-5 w-5 text-primary-400" />
                                <span className="text-xs font-semibold text-primary-200">{stat.label}</span>
                                <span className="text-[10px] text-primary-500">{stat.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ Toggle de Sección + Grid de Productos ═══════ */}
            <section className="container-vsm py-12">
                {/* Section title */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-primary-100 sm:text-3xl">
                        {activeSection === 'todos'
                            ? 'Todos los productos'
                            : activeSection === 'vape'
                                ? '🔥 Vape Shop'
                                : '🌿 420 Shop'}
                    </h2>
                </div>

                {/* Toggle */}
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex rounded-xl bg-primary-900/60 p-1 border border-primary-800/40 backdrop-blur-sm">
                        {([
                            { key: 'todos' as SectionFilter, label: 'Todos', icon: null },
                            { key: 'vape' as SectionFilter, label: 'Vape', icon: <Flame className="mr-1.5 inline h-3.5 w-3.5" /> },
                            { key: '420' as SectionFilter, label: '420', icon: <Leaf className="mr-1.5 inline h-3.5 w-3.5" /> },
                        ]).map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveSection(item.key)}
                                className={cn(
                                    'rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300',
                                    activeSection === item.key
                                        ? item.key === 'vape'
                                            ? 'bg-vape-500/15 text-vape-400 shadow-sm shadow-vape-500/10'
                                            : item.key === '420'
                                                ? 'bg-herbal-500/15 text-herbal-400 shadow-sm shadow-herbal-500/10'
                                                : 'bg-primary-700/50 text-primary-100 shadow-sm'
                                        : 'text-primary-400 hover:text-primary-200'
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de productos */}
                <ProductGrid products={products} isLoading={isLoading} />
            </section>
        </div>
    );
}
