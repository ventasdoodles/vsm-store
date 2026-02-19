import { useEffect, useRef } from 'react';

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

export const BrandsCarousel = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll infinito
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let scrollPosition = 0;
        const scrollSpeed = 0.5; // pixels por frame
        let animationFrame: number;

        const animate = () => {
            scrollPosition += scrollSpeed;

            // Reset cuando llega al final (loop infinito)
            if (scrollPosition >= container.scrollWidth / 2) {
                scrollPosition = 0;
            }

            container.scrollLeft = scrollPosition;
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    // Duplicar brands para efecto infinito
    const allBrands = [...BRANDS, ...BRANDS];

    return (
        <section className="py-8 border-y border-theme">
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
                    className="flex gap-12 overflow-x-hidden max-w-full"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {allBrands.map((brand, idx) => (
                        <div
                            key={`${brand.id}-${idx}`}
                            className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
                        >
                            {/* Placeholder para logos (reemplazar con logos reales) */}
                            <div className="text-center">
                                <div className="text-2xl font-bold text-theme-secondary mb-1">
                                    {brand.name[0]}
                                </div>
                                <div className="text-xs text-theme-secondary">
                                    {brand.name}
                                </div>
                            </div>
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
