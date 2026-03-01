/**
 * BrandsCarousel — Carrusel infinito premium de logos de marcas.
 *
 * @module BrandsCarousel
 * @independent Componente 100% independiente. Consume datos de Supabase (brands).
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Award } from 'lucide-react';
import { getPublicBrands, type PublicBrand } from '@/services/brands.service';

// ── Constantes ───────────────────────────────────────────────
const MIN_ITEMS_FOR_INFINITE = 16;
const SCROLL_SPEED = 0.4;

// ── Componentes Internos ─────────────────────────────────────

/** Tarjeta individual de marca con efecto glassmorphism + hover glow */
function BrandCard({ brand }: { brand: PublicBrand }) {
    const [failed, setFailed] = useState(false);
    const handleError = useCallback(() => setFailed(true), []);

    return (
        <div className="flex-shrink-0 group cursor-pointer">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm flex items-center justify-center p-5 transition-all duration-500 hover:bg-white/[0.07] hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(255,255,255,0.04)] hover:-translate-y-1">
                {/* Glow sutil al hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/5 transition-all duration-500 pointer-events-none" />

                {(!brand.logo_url || failed) ? (
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 select-none w-full h-full">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.12] group-hover:border-white/[0.15] transition-all">
                            <span className="text-2xl font-black text-white/60 group-hover:text-white/90 transition-colors">
                                {brand.name[0]?.toUpperCase()}
                            </span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-white/40 group-hover:text-white/80 font-bold uppercase tracking-[0.1em] text-center w-full px-2 truncate transition-colors">
                            {brand.name}
                        </span>
                    </div>
                ) : (
                    <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="relative z-10 w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={handleError}
                    />
                )}
            </div>
        </div>
    );
}

// ── Componente Principal ─────────────────────────────────────

export const BrandsCarousel = () => {
    const [brands, setBrands] = useState<PublicBrand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useRef(false);
    const isPaused = useRef(false);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const data = await getPublicBrands();
                setBrands(data);
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBrands();
    }, []);

    // Auto-scroll infinito (solo cuando es visible + no pausado por hover)
    useEffect(() => {
        const container = scrollRef.current;
        const section = sectionRef.current;
        if (!container || !section || brands.length === 0) return;

        let scrollPosition = 0;
        let animationFrame: number;

        const animate = () => {
            if (isVisible.current && !isPaused.current) {
                scrollPosition += SCROLL_SPEED;
                if (scrollPosition >= container.scrollWidth / 2) {
                    scrollPosition = 0;
                }
                container.scrollLeft = scrollPosition;
            }
            animationFrame = requestAnimationFrame(animate);
        };

        const observer = new IntersectionObserver(
            (entries) => { isVisible.current = entries[0]?.isIntersecting ?? false; },
            { threshold: 0.1 },
        );
        observer.observe(section);

        animationFrame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
            observer.disconnect();
        };
    }, [brands]);

    if (isLoading || brands.length === 0) return null;

    const repeatCount = Math.max(2, Math.ceil(MIN_ITEMS_FOR_INFINITE / brands.length));
    const allBrands = Array.from({ length: repeatCount }, () => brands).flat();

    return (
        <section
            ref={sectionRef}
            className="relative py-16 sm:py-20 overflow-hidden"
            onMouseEnter={() => { isPaused.current = true; }}
            onMouseLeave={() => { isPaused.current = false; }}
        >
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />

            {/* Header Premium */}
            <div className="container-vsm relative z-10 text-center mb-12 sm:mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
                    <Award className="w-3.5 h-3.5 text-accent-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
                        Marcas Oficiales
                    </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                    Trabajamos con las{' '}
                    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative inline-block">
                        Mejores Marcas
                        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full" />
                    </span>
                </h2>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/30 max-w-lg mx-auto">
                    Productos 100% auténticos de marcas reconocidas mundialmente
                </p>
            </div>

            {/* Carousel Track */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-5 overflow-x-hidden max-w-full scrollbar-hide px-4"
                >
                    {allBrands.map((brand, idx) => (
                        <BrandCard key={`${brand.id}-${idx}`} brand={brand} />
                    ))}
                </div>

                {/* Gradient fade overlays */}
                <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-[rgb(var(--bg-primary))] to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-[rgb(var(--bg-primary))] to-transparent pointer-events-none z-10" />
            </div>

            {/* Brand count badge */}
            <div className="text-center mt-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                    {brands.length} marcas verificadas
                </span>
            </div>
        </section>
    );
};
