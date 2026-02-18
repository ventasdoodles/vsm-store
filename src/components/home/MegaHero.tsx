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
        bgGradient: 'from-purple-600 via-pink-600 to-purple-700',
        bgGradientLight: 'from-purple-400 via-pink-400 to-purple-500',
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
        bgGradient: 'from-green-600 via-emerald-600 to-teal-700',
        bgGradientLight: 'from-green-400 via-emerald-400 to-teal-500',
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
        bgGradient: 'from-blue-600 via-indigo-600 to-purple-700',
        bgGradientLight: 'from-blue-400 via-indigo-400 to-purple-500',
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
        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
            {/* Background gradient con animación */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} animate-gradient bg-[length:200%_200%]`} />

            {/* Particles effect (sutil) */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full container-vsm flex items-center">
                <div className="max-w-2xl px-6 md:px-12">
                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-scale-in">
                        {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/90 mb-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                        {slide.subtitle}
                    </p>

                    {/* CTA Button */}
                    <Link
                        to={slide.ctaLink}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:bg-opacity-90 transition-all hover:scale-105 hover:shadow-2xl animate-scale-in"
                        style={{ animationDelay: '0.2s' }}
                    >
                        {slide.ctaText}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Badges flotantes (top-right) */}
            {slide.badges && (
                <div className="absolute top-6 right-6 space-y-2 z-20">
                    {slide.badges.map((badge, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm backdrop-blur-sm animate-scale-in ${badge.variant === 'success'
                                ? 'bg-green-500/90 text-white'
                                : 'bg-yellow-500/90 text-gray-900'
                                }`}
                            style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                        >
                            {badge.icon}
                            {badge.text}
                        </div>
                    ))}
                </div>
            )}

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
