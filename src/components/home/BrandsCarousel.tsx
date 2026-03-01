/**
 * BrandsCarousel — Carrusel infinito de logos de marcas con auto-scroll.
 *
 * @module BrandsCarousel
 * @independent Componente 100% independiente. Consume datos de Supabase (brands).
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { getPublicBrands, type PublicBrand } from '@/services/brands.service';

// ── Constantes ───────────────────────────────────────────────
/** Mínimo de items visibles para que el efecto infinito funcione bien */
const MIN_ITEMS_FOR_INFINITE = 12;
const SCROLL_SPEED = 0.5;

// ── Componentes Internos ─────────────────────────────────────

/** Logo de marca con fallback a inicial del nombre cuando falla la carga */
function BrandLogo({ brand }: { brand: PublicBrand }) {
    const [failed, setFailed] = useState(false);
    const handleError = useCallback(() => setFailed(true), []);

    if (failed || !brand.logo_url) {
        return (
            <div className="text-center select-none flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-1">
                    <span className="text-xl font-black text-white/70">
                        {brand.name[0]?.toUpperCase()}
                    </span>
                </div>
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider truncate max-w-[100px]">
                    {brand.name}
                </span>
            </div>
        );
    }

    return (
        <img
            src={brand.logo_url}
            alt={brand.name}
            className="max-h-12 max-w-[120px] object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
            onError={handleError}
        />
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
    // Se re-ejecuta cuando brands cambia para recalcular scrollWidth
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

        // Solo animar cuando la sección es visible en viewport
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

    // Repetir marcas suficientes veces para que el scroll infinito se vea fluido
    const repeatCount = Math.max(2, Math.ceil(MIN_ITEMS_FOR_INFINITE / brands.length));
    const allBrands = Array.from({ length: repeatCount }, () => brands).flat();

    return (
        <section
            ref={sectionRef}
            className="py-8 border-y border-theme"
            onMouseEnter={() => { isPaused.current = true; }}
            onMouseLeave={() => { isPaused.current = false; }}
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-theme-primary mb-2">
                    Trabajamos con las Mejores Marcas
                </h2>
                <p className="text-sm text-theme-secondary">
                    Productos auténticos de marcas reconocidas mundialmente
                </p>
            </div>

            {/* Carousel */}
            <div className="relative overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex gap-12 overflow-x-hidden max-w-full scrollbar-hide"
                >
                    {allBrands.map((brand, idx) => (
                        <div
                            key={`${brand.id}-${idx}`}
                            className="flex-shrink-0 w-36 h-20 flex items-center justify-center hover:opacity-100 transition-all duration-300 cursor-pointer group"
                        >
                            <BrandLogo brand={brand} />
                        </div>
                    ))}
                </div>

                {/* Gradient overlays (fade effect en los bordes) */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-theme-primary to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-theme-primary to-transparent pointer-events-none" />
            </div>
        </section>
    );
};
