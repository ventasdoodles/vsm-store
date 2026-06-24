/**
 * // ─── COMPONENTE: MEGA HERO ───
 * // Propósito: Slider principal de alto impacto para la Home.
 * // Arquitectura: Presentational Wrapper con lógica de Parallax y Auto-play.
 * // Características: Soporta banners dinámicos desde la base de datos o fallbacks locales.
 * // Estética: §2.1 Premium (Glassmorphism, Parallax, Gradientes dinámicos).
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { m, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useNeuralHero } from '@/hooks/useNeuralHero';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import {
    getHomeHeroFallbackImageUrl,
    getHomeHeroSliderFallbacks,
    normalizeHomeHeroSlide,
} from '@/constants/homeHero';
import { PREMIUM_GRADIENTS } from '@/constants/slider';
import { activeVerticalPackConfig } from '@/config/productization/active';
import type { HeroSlider } from '@/services';
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

const HERO_GENERIC_FALLBACK_IMAGE = getHomeHeroFallbackImageUrl('/images/storefront-fallbacks/hero-generic.svg');

const mapHeroSliderToActiveSlide = (slider: HeroSlider): ActiveSlide => {
    const preset = PREMIUM_GRADIENTS.find((p) => p.id === slider.bgGradientLight) ?? DEFAULT_PRESET;

    return {
        id: slider.id,
        title: slider.title,
        subtitle: slider.subtitle,
        description: slider.description || '',
        image: slider.image ? getHomeHeroFallbackImageUrl(slider.image) : HERO_GENERIC_FALLBACK_IMAGE,
        ctaText: slider.ctaText,
        ctaLink: slider.ctaLink,
        tag: slider.tag || 'Destacado',
        preset,
    };
};

export const MegaHero = () => {
    const { data: settings } = useStoreSettings();
    const { personalizedSlide } = useNeuralHero();
    const { config } = useActiveVerticalPack();
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
        const safeConfig = config || activeVerticalPackConfig;
        
        const FALLBACK_SLIDES: ActiveSlide[] = getHomeHeroSliderFallbacks(safeConfig)
            .map(mapHeroSliderToActiveSlide)
            .map(slide => normalizeHomeHeroSlide(slide, safeConfig));

        const slides = settings?.hero_sliders && settings.hero_sliders.length > 0
            ? settings.hero_sliders
                .filter(s => s.active)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(mapHeroSliderToActiveSlide)
                .map(slide => normalizeHomeHeroSlide(slide, safeConfig))
            : FALLBACK_SLIDES;

        if (personalizedSlide) {
            return [normalizeHomeHeroSlide(personalizedSlide, safeConfig), ...slides];
        }
        return slides;
    }, [settings?.hero_sliders, personalizedSlide, config]);

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
            className="relative w-full h-[calc(100svh-8rem)] min-h-[560px] max-h-[860px] md:h-[calc(100vh-7rem)] md:min-h-[620px] mb-8 bg-theme-primary flex overflow-hidden group cursor-crosshair"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => {
                setIsAutoPlaying(true);
                mouseX.set(0.5);
                mouseY.set(0.5);
            }}
            onMouseMove={handleMouseMove}
        >
            <AnimatePresence mode="wait">
                <m.div
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
                </m.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-center sm:justify-end container-vsm pointer-events-none pt-24 pb-28 sm:pb-40 md:pt-32 md:pb-32 lg:pb-40">
                <m.div
                    className="max-w-xl md:max-w-3xl lg:max-w-4xl pointer-events-auto"
                    style={{ x: contentX, y: contentY }}
                >
                    <AnimatePresence mode="wait">
                        <m.div
                            key={`content-${currentIndex}`}
                            initial={{ opacity: 0, x: -60, filter: 'blur(15px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-4 md:space-y-6"
                        >
                            <m.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black text-xs md:text-sm tracking-[0.2em] uppercase mb-2 shadow-2xl"
                            >
                                <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
                                {slide.tag}
                            </m.div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] md:leading-[1.05] tracking-tight drop-shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
                                {slide.title}
                                <br />
                                <m.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.preset.textGradient}`}
                                >
                                    {slide.subtitle}
                                </m.span>
                            </h1>

                            <p className="text-base md:text-xl text-white/90 max-w-xl leading-relaxed md:leading-relaxed font-bold drop-shadow-[0_6px_18px_rgba(0,0,0,0.8)]">
                                {slide.description}
                            </p>

                            <div className="pt-2 md:pt-4 flex flex-wrap items-center gap-4 md:gap-6">
                                <Link to={slide.ctaLink}>
                                    <MagneticButton strength={0.25}>
                                        <m.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{ boxShadow: `0 20px 40px -10px ${slide.preset.glowColor}` }}
                                            className={`h-14 md:h-16 px-6 md:px-10 rounded-2xl bg-gradient-to-r ${slide.preset.buttonGradient} text-white font-black uppercase tracking-wide flex items-center justify-center gap-3 transition-all relative z-20 group overflow-hidden`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                            <Zap className="w-6 h-6 fill-current" />
                                            <span className="relative z-10">{slide.ctaText}</span>
                                        </m.button>
                                    </MagneticButton>
                                </Link>

                                <Link to="/vape">
                                    <MagneticButton strength={0.15}>
                                        <m.button
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                                            whileTap={{ scale: 0.95 }}
                                            className="h-14 md:h-16 px-6 md:px-10 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 text-white font-black uppercase tracking-wide transition-all relative z-20"
                                        >
                                            Explorar
                                        </m.button>
                                    </MagneticButton>
                                </Link>
                            </div>
                        </m.div>
                    </AnimatePresence>
                </m.div>
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
                    <m.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white shadow-2xl transition-all"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </m.button>
                    <m.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white shadow-2xl transition-all"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </m.button>
                </div>
            </div>
        </section>
    );
};
