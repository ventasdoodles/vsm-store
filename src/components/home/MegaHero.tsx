import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    bgGradient: string;
    bgGradientLight: string; // Para light theme
    image?: string;
    badges?: { icon: JSX.Element; text: string; variant: 'success' | 'warning' }[];
}

const SLIDES: Slide[] = [
    {
        id: '1',
        title: 'Los Mejores Vapes',
        subtitle: '20% OFF en tu primera compra + envío gratis en Xalapa',
        ctaText: 'Compra Ahora',
        ctaLink: '/vape',
        bgGradient: 'from-violet-900 via-fuchsia-900 to-purple-900',
        bgGradientLight: 'from-violet-500 via-fuchsia-500 to-purple-600',
        badges: [
            { icon: <Package className="w-4 h-4" />, text: 'Envío Gratis', variant: 'success' },
            { icon: <Zap className="w-4 h-4" />, text: '20% OFF', variant: 'warning' },
        ],
    },
    {
        id: '2',
        title: 'Productos Premium 420',
        subtitle: 'La mejor selección de productos importados directamente para ti',
        ctaText: 'Explorar 420',
        ctaLink: '/420',
        bgGradient: 'from-emerald-900 via-green-900 to-teal-900',
        bgGradientLight: 'from-emerald-500 via-green-500 to-teal-600',
        badges: [
            { icon: <Package className="w-4 h-4" />, text: 'Importados', variant: 'success' },
        ],
    },
    {
        id: '3',
        title: 'Más de 50 Sabores',
        subtitle: 'Encuentra tu favorito entre nuestra amplia variedad de líquidos',
        ctaText: 'Ver Líquidos',
        ctaLink: '/vape/liquidos',
        bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
        bgGradientLight: 'from-blue-500 via-indigo-500 to-slate-600',
    },
];

export const MegaHero = () => {
    const { isDark } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        }, 5000); // Cambiar cada 5 segundos

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false); // Pausar auto-play al interactuar
    };

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
        setIsAutoPlaying(false);
    };

    const slide = SLIDES[currentSlide];

    if (!slide) return null;

    const gradientClass = isDark ? slide.bgGradient : slide.bgGradientLight;

    return (
        <div className="relative h-[450px] md:h-[550px] rounded-[2.5rem] overflow-hidden group spotlight-container border border-white/5 shadow-2xl">
            {/* Background gradient con animación */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} animate-gradient bg-[length:200%_200%] opacity-80`} />

            {/* Aurora Overlay */}
            <div className="absolute inset-0 bg-aurora mix-blend-overlay opacity-60" />
            <div className="absolute inset-0 bg-noise opacity-30" />

            {/* Particles effect (sutil) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-[80px] animate-pulse-glow" />
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-white/10 rounded-full blur-[90px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full container-vsm flex items-center">
                <div className="max-w-2xl px-8 md:px-16">
                    {/* Badge Container */}
                    {slide.badges && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {slide.badges.map((badge, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider backdrop-blur-md border animate-scale-in shadow-lg ${badge.variant === 'success'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        }`}
                                    style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                                >
                                    {badge.icon}
                                    {badge.text}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 mb-6 animate-slide-up drop-shadow-2xl leading-[0.9]">
                        {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-2xl text-gray-200 font-medium mb-10 animate-slide-up max-w-xl leading-relaxed" style={{ animationDelay: '0.1s' }}>
                        {slide.subtitle}
                    </p>

                    {/* CTA Button */}
                    <Link
                        to={slide.ctaLink}
                        className="btn-shine inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-scale-in"
                        style={{ animationDelay: '0.2s' }}
                    >
                        {slide.ctaText}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Slide anterior"
            >
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Siguiente slide"
            >
                <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Dots navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide
                            ? 'w-8 bg-white'
                            : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Ir a slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
