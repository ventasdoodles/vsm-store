// Banner Principal (Hero) - VSM Store
// Carrusel deslizable con snap-scroll para móviles
import { useState, useRef } from 'react';
import { ChevronRight, Sparkles, Zap, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDES = [
    {
        id: 1,
        title: 'Vape Collection',
        subtitle: 'Los mejores dispositivos y líquidos',
        bg: 'from-vape-950 via-vape-900 to-theme-primary',
        accent: 'text-vape-400',
        icon: Zap,
        link: '/vape',
        cta: 'Ver Vape Shop',
    },
    {
        id: 2,
        title: '420 Zone',
        subtitle: 'Parafernalia y accesorios premium',
        bg: 'from-herbal-950 via-herbal-900 to-theme-primary',
        accent: 'text-herbal-400',
        icon: Leaf,
        link: '/420',
        cta: 'Ver 420 Shop',
    },
    {
        id: 3,
        title: 'Envíos Gratis',
        subtitle: 'En todo Xalapa y alrededores',
        bg: 'from-blue-950 via-theme-secondary to-theme-primary',
        accent: 'text-blue-400',
        icon: Sparkles,
        link: '/buscar',
        cta: 'Explorar todo',
    },
];

export function HeroBanner() {
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveSlide(index);
    };

    return (
        <section className="relative">
            {/* Carrusel */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto gap-4 py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ scrollBehavior: 'smooth' }}
            >
                {SLIDES.map((slide) => (
                    <div
                        key={slide.id}
                        className={`relative flex-shrink-0 w-full snap-center overflow-hidden rounded-3xl bg-gradient-to-br ${slide.bg} p-6 sm:p-10 shadow-lg`}
                    >
                        {/* Background blobs */}
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

                        <div className="relative z-10 flex flex-col items-start gap-4">
                            <div className={`rounded-xl bg-white/10 p-3 backdrop-blur-sm ${slide.accent}`}>
                                <slide.icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-white sm:text-3xl tracking-tight">
                                    {slide.title}
                                </h2>
                                <p className="text-sm font-medium text-theme-secondary sm:text-base">
                                    {slide.subtitle}
                                </p>
                            </div>
                            <Link
                                to={slide.link}
                                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
                            >
                                {slide.cta}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2">
                {SLIDES.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-6 bg-accent-primary' : 'w-1.5 bg-theme-tertiary'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
