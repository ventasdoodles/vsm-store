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
        bg: 'from-blue-950 via-slate-900 to-bg-primary',
        accent: 'text-blue-400',
        icon: Zap,
        link: '/vape',
        cta: 'Ver Vape Shop',
    },
    {
        id: 2,
        title: '420 Zone',
        subtitle: 'Parafernalia y accesorios premium',
        bg: 'from-emerald-950 via-zinc-900 to-bg-primary',
        accent: 'text-emerald-400',
        icon: Leaf,
        link: '/420',
        cta: 'Ver 420 Shop',
    },
    {
        id: 3,
        title: 'Envíos Gratis',
        subtitle: 'En todo Xalapa y alrededores',
        bg: 'from-violet-950 via-zinc-900 to-bg-primary',
        accent: 'text-violet-400',
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
        <section className="relative py-4">
            {/* Carrusel */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto gap-4 px-4 pb-4"
                style={{ scrollBehavior: 'smooth' }}
            >
                {SLIDES.map((slide) => (
                    <div
                        key={slide.id}
                        className={`relative flex-shrink-0 w-full snap-center overflow-hidden rounded-[2rem] bg-gradient-to-br ${slide.bg} p-8 shadow-xl border border-white/5 group`}
                    >
                        {/* Background blobs */}
                        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
                        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors duration-500" />

                        <div className="relative z-10 flex flex-col items-start gap-4">
                            <div className={`rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 ${slide.accent} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                                <slide.icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-2 mt-2">
                                <h2 className="text-3xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">
                                    {slide.title}
                                </h2>
                                <p className="text-sm font-medium text-text-secondary/80">
                                    {slide.subtitle}
                                </p>
                            </div>
                            <Link
                                to={slide.link}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md border border-white/10 transition-all hover:bg-white hover:text-bg-primary active:scale-95 shadow-lg"
                            >
                                {slide.cta}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-2">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (scrollRef.current) {
                                scrollRef.current.scrollTo({
                                    left: scrollRef.current.offsetWidth * i,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-8 bg-accent-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-theme-tertiary hover:bg-theme-secondary/80'
                            }`}
                        aria-label={`Ir a slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
