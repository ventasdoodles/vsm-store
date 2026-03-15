/**
 * // ─── COMPONENTE: MEGA HERO ───
 * // Propósito: Slider principal de alto impacto para la Home.
 * // Arquitectura: Presentational Wrapper con lógica de Parallax y Auto-play.
 * // Características: Soporta banners dinámicos desde la base de datos o fallbacks locales.
 * // Estética: §2.1 Premium (Glassmorphism, Parallax, Gradientes dinámicos).
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useNeuralHero } from '@/hooks/useNeuralHero';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { PREMIUM_GRADIENTS } from '@/constants/slider';
import type { PresetGradient } from '@/constants/slider';

/** Preset por defecto cuando no hay selección en BD */
const DEFAULT_PRESET: PresetGradient = PREMIUM_GRADIENTS[0]!;

/** Estructura interna de cada slide activo */
interface ActiveSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    tag: string;
    preset: PresetGradient;
}

const FALLBACK_SLIDES: ActiveSlide[] = [
    {
        id: 'slide-1',
        title: 'NUEVA ERA',
        subtitle: 'DEL VAPEO',
        description: 'Descubre los dispositivos más avanzados con tecnología mesh y control de flujo de aire.',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1600&q=80',
        ctaText: 'Ver Dispositivos',
        ctaLink: '/vape/pods',
        tag: 'Lanzamiento',
        preset: PREMIUM_GRADIENTS[0] ?? DEFAULT_PRESET,
    },
    {
        id: 'slide-2',
        title: 'EXTRACTOS',
        subtitle: 'PREMIUM',
        description: 'La máxima pureza y potencia en cada gota. Calidad certificada de laboratorio.',
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=1600&q=80',
        ctaText: 'Ver Extractos',
        ctaLink: '/420/extractos',
        tag: 'Exclusivo',
        preset: PREMIUM_GRADIENTS[1] ?? DEFAULT_PRESET,
    },
];

export const MegaHero = () => {
    const { data: settings } = useStoreSettings();
    const { personalizedSlide } = useNeuralHero();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax values
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

    const bgX = useTransform(smoothMouseX, [0, 1], [-15, 15]);
    const bgY = useTransform(smoothMouseY, [0, 1], [-15, 15]);
    const contentX = useTransform(smoothMouseX, [0, 1], [-25, 25]);
    const contentY = useTransform(smoothMouseY, [0, 1], [-20, 20]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    /** Mapeo de slides desde settings o fallback local */
    const activeSlides = useMemo(() => {
        const slides = settings?.hero_sliders && settings.hero_sliders.length > 0
            ? settings.hero_sliders
                .filter(s => s.active)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(s => {
                    const preset = PREMIUM_GRADIENTS.find(p => p.id === s.bgGradientLight) ?? DEFAULT_PRESET;
                    return {
                        id: s.id,
                        title: s.title,
                        subtitle: s.subtitle,
                        description: s.description || '',
                        image: s.image || 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1600&q=80',
                        ctaText: s.ctaText,
                        ctaLink: s.ctaLink,
                        tag: s.tag || 'Destacado',
                        preset
                    };
                })
            : FALLBACK_SLIDES;

        if (personalizedSlide) {
            return [personalizedSlide, ...slides];
        }
        return slides;
    }, [settings?.hero_sliders, personalizedSlide]);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, [activeSlides.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    }, [activeSlides.length]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 7000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const slide = activeSlides[currentIndex];

    if (!slide) return <div className="h-[60vh] bg-theme-secondary animate-pulse rounded-[3rem]" />;

    return (
        <section
            ref={containerRef}
            role="region"
            aria-roledescription="carrusel"
            aria-label="Promociones destacadas"
            className="relative w-full h-[80vh] md:h-[90vh] min-h-[500px] max-h-[900px] mb-8 bg-theme-primary flex overflow-hidden group cursor-crosshair"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => {
                setIsAutoPlaying(true);
                mouseX.set(0.5);
                mouseY.set(0.5);
            }}
            onMouseMove={handleMouseMove}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.15, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, scale: 1.05, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 w-full h-full"
                    style={{ x: bgX, y: bgY }}
                >
                    <OptimizedImage
                        src={slide.image}
                        alt={slide.title}
                        priority
                        width={1600}
                        containerClassName="w-full h-full scale-110"
                        className="w-full h-full object-cover select-none"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.preset.bg} opacity-80 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-primary via-theme-primary/60 to-transparent opacity-100" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-end container-vsm pointer-events-none pb-28 md:pb-24">
                <motion.div
                    className="max-w-xl md:max-w-4xl pointer-events-auto"
                    style={{ x: contentX, y: contentY }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${currentIndex}`}
                            initial={{ opacity: 0, x: -60, filter: 'blur(15px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-8"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black text-xs md:text-sm tracking-[0.2em] uppercase mb-2 shadow-2xl"
                            >
                                <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
                                {slide.tag}
                            </motion.div>

                            <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black text-white leading-[0.85] tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                {slide.title}
                                <br />
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.preset.textGradient}`}
                                >
                                    {slide.subtitle}
                                </motion.span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed font-bold line-clamp-3 opacity-90 drop-shadow-md">
                                {slide.description}
                            </p>

                            <div className="pt-6 flex flex-wrap items-center gap-6">
                                <Link to={slide.ctaLink}>
                                    <MagneticButton strength={0.25}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{ boxShadow: `0 20px 40px -10px ${slide.preset.glowColor}` }}
                                            className={`h-16 px-10 rounded-2xl bg-gradient-to-r ${slide.preset.buttonGradient} text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative z-20 group overflow-hidden`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                            <Zap className="w-6 h-6 fill-current" />
                                            <span className="relative z-10">{slide.ctaText}</span>
                                        </motion.button>
                                    </MagneticButton>
                                </Link>

                                <Link to="/vape">
                                    <MagneticButton strength={0.15}>
                                        <motion.button
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                                            whileTap={{ scale: 0.95 }}
                                            className="h-16 px-10 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 text-white font-black uppercase tracking-widest transition-all relative z-20"
                                        >
                                            Explorar
                                        </motion.button>
                                    </MagneticButton>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Pagination & Controls */}
            <div className="absolute bottom-12 right-6 lg:right-12 z-20 flex items-center gap-8 pointer-events-auto">
                <div className="hidden md:flex items-center gap-4">
                    {activeSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className="group relative px-2 py-4"
                            aria-label={`Slide ${i + 1}`}
                        >
                            <div className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-12 bg-white shadow-[0_0_20px_white]' : 'w-4 bg-white/20 group-hover:bg-white/40'}`} />
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white shadow-2xl transition-all"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white shadow-2xl transition-all"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
};
