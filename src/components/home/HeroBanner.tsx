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
        <section className="relative py-6">
            {/* Carrusel */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto gap-4 px-4 pb-8"
                style={{ scrollBehavior: 'smooth' }}
            >
                {SLIDES.map((slide) => (
                    <div
                        key={slide.id}
                        className={`relative flex-shrink-0 w-full snap-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${slide.bg} p-8 md:p-12 shadow-2xl border border-white/5 group`}
                    >
                        {/* Aurora Background Effect */}
                        <div className="absolute inset-0 bg-aurora opacity-40 mix-blend-overlay group-hover:opacity-60 transition-opacity duration-1000" />

                        {/* Background blobs/Noise */}
                        <div className="absolute inset-0 bg-noise opacity-20" />
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-[100px] group-hover:bg-white/20 transition-colors duration-700 animate-pulse-glow" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-[80px] group-hover:bg-white/10 transition-colors duration-700" />

                        <div className="relative z-10 flex flex-col items-start gap-6">
                            {/* Icon with spotlight effect */}
                            <div className={`spotlight-container rounded-3xl bg-white/5 p-5 backdrop-blur-xl border border-white/10 ${slide.accent} shadow-xl shadow-black/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                                <slide.icon className="h-8 w-8 drop-shadow-lg" />
                            </div>

                            <div className="space-y-3 mt-2 max-w-lg">
                                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight leading-[0.9] group-hover:translate-x-1 transition-transform duration-500">
                                    {slide.title}
                                </h2>
                                <p className="text-lg font-medium text-gray-300/90 leading-relaxed">
                                    {slide.subtitle}
                                </p>
                            </div>

                            <Link
                                to={slide.link}
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md border border-white/10 transition-all hover:bg-white hover:text-black active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group/btn"
                            >
                                {slide.cta}
                                <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-3 mt-4">
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
                        className={`h-1.5 rounded-full transition-all duration-500 ${activeSlide === i
                            ? 'w-12 bg-gradient-to-r from-blue-500 to-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                            : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                        aria-label={`Ir a slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
