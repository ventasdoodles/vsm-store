/**
 * BrandsCarousel — Carrusel infinito de logos de marcas con auto-scroll.
 *
 * @module BrandsCarousel
 * @independent Componente 100% independiente. No depende de otros módulos.
 * @data Marcas estáticas definidas internamente (BRANDS array).
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

interface Brand {
    id: string;
    name: string;
    logo: string; // SVG or image URL
}

// Marcas comunes de vape/420
const BRANDS: Brand[] = [
    { id: '1', name: 'Elfbar', logo: 'https://logo.clearbit.com/elfbar.com' },
    { id: '2', name: 'Vaporesso', logo: 'https://logo.clearbit.com/vaporesso.com' },
    { id: '3', name: 'Geek Vape', logo: 'https://logo.clearbit.com/geekvape.com' },
    { id: '4', name: 'Smok', logo: 'https://logo.clearbit.com/smoktech.com' },
    { id: '5', name: 'Voopoo', logo: 'https://logo.clearbit.com/voopoo.com' },
    { id: '6', name: 'Lost Vape', logo: 'https://logo.clearbit.com/lostvape.com' },
    { id: '7', name: 'Aspire', logo: 'https://logo.clearbit.com/aspirecig.com' },
    { id: '8', name: 'Uwell', logo: 'https://logo.clearbit.com/uwell.com' },
];

/** Simple fallback: show brand initial when logo fails to load */
function BrandLogo({ brand }: { brand: Brand }) {
    const [failed, setFailed] = useState(false);
    const handleError = useCallback(() => setFailed(true), []);

    if (failed) {
        return (
            <div className="text-center select-none">
                <div className="text-2xl font-bold text-theme-secondary mb-1">
                    {brand.name[0]}
                </div>
                <div className="text-xs text-theme-secondary">
                    {brand.name}
                </div>
            </div>
        );
    }

    return (
        <img
            src={brand.logo}
            alt={brand.name}
            className="max-h-10 max-w-[100px] object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
            loading="lazy"
            onError={handleError}
        />
    );
}

export const BrandsCarousel = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useRef(false);
    const isPaused = useRef(false);

    // Auto-scroll infinito (solo cuando es visible + no pausado por hover)
    useEffect(() => {
        const container = scrollRef.current;
        const section = sectionRef.current;
        if (!container || !section) return;

        let scrollPosition = 0;
        const scrollSpeed = 0.5;
        let animationFrame: number;

        const animate = () => {
            if (isVisible.current && !isPaused.current) {
                scrollPosition += scrollSpeed;
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
    }, []);

    // Duplicar brands para efecto infinito
    const allBrands = [...BRANDS, ...BRANDS];

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
                            className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer group"
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
