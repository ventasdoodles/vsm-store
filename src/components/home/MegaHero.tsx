import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '@/hooks/useStoreSettings';
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
        preset: PREMIUM_GRADIENTS[0] ?? DEFAULT_PRESET, // cyberpunk
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
        preset: PREMIUM_GRADIENTS[1] ?? DEFAULT_PRESET, // nature
    },
    {
        id: 'slide-3',
        title: 'SABORES',
        subtitle: 'ÚNICOS',
        description: 'Explora nuestra nueva colección de líquidos con perfiles de sabor complejos y balanceados.',
        image: 'https://images.unsplash.com/photo-1549411993-851bfd722de8?w=1600&q=80',
        ctaText: 'Ver Líquidos',
        ctaLink: '/vape/liquidos',
        tag: 'Top Ventas',
        preset: PREMIUM_GRADIENTS[2] ?? DEFAULT_PRESET, // fire
    },
    {
        id: 'slide-4',
        title: 'DEEP',
        subtitle: 'CHILL',
        description: 'Relajación total con nuestra línea de accesorios premium. Diseñados para durar.',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&q=80',
        ctaText: 'Explorar Más',
        ctaLink: '/420/accesorios',
        tag: 'Premium',
        preset: PREMIUM_GRADIENTS[3] ?? DEFAULT_PRESET, // ocean
    },
    {
        id: 'slide-5',
        title: 'EDICIÓN',
        subtitle: 'LIMITADA',
        description: 'Piezas de colección para los conocedores más exigentes. Disponibilidad restringida.',
        image: 'https://images.unsplash.com/photo-1516937648113-acc421c60195?w=1600&q=80',
        ctaText: 'Ver Colección',
        ctaLink: '/vape/dispositivos-high-end',
        tag: 'Exclusivo',
        preset: PREMIUM_GRADIENTS[4] ?? DEFAULT_PRESET, // gold
    }
];


export const MegaHero = () => {
    const { data: settings } = useStoreSettings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

    // Background move (subtle)
    const bgX = useTransform(smoothMouseX, [0, 1], [-10, 10]);
    const bgY = useTransform(smoothMouseY, [0, 1], [-10, 10]);

    // Content move (pronounced)
    const contentX = useTransform(smoothMouseX, [0, 1], [-30, 30]);
    const contentY = useTransform(smoothMouseY, [0, 1], [-20, 20]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    // Mapear slides desde BD o usar fallback
    const activeSlides = useMemo(() => {
        if (settings?.hero_sliders && settings.hero_sliders.length > 0) {
            const dbSlides = settings.hero_sliders
                .filter(s => s.active)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(s => {
                    // Try to find the matching preset by the saved ID
                    const preset = PREMIUM_GRADIENTS.find(p => p.id === s.bgGradientLight)
                        ?? DEFAULT_PRESET;

                    return {
                        id: s.id,
                        title: s.title,
                        subtitle: s.subtitle,
                        description: s.description || '',
                        image: s.image || 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1600&q=80',
                        ctaText: s.ctaText,
                        ctaLink: s.ctaLink,
                        tag: s.tag || 'Destacado',
                        preset // Pass the full preset object
                    };
                });
            if (dbSlides.length > 0) return dbSlides;
        }
        return FALLBACK_SLIDES;
    }, [settings?.hero_sliders]);

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

    // Evita crashes pero asegura q haya slides
    if (!slide) return <div className="h-[60vh] bg-theme-secondary animate-pulse rounded-[3rem]"></div>;

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
            <AnimatePresence exitBeforeEnter>
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 w-full h-full"
                    style={{ x: bgX, y: bgY }}
                >
                    <img
                        src={slide.image}
                        alt=""
                        aria-hidden="true"
                        loading="eager"
                        fetchPriority="high"
                        className="w-full h-full object-cover select-none bg-theme-primary scale-110"
                    />

                    {/* Overlays / Gradients */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.preset.bg} opacity-80 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-primary via-theme-primary/60 to-transparent opacity-100" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-end container-vsm px-6 lg:px-12 pointer-events-none pb-28 md:pb-24">
                <motion.div
                    className="max-w-xl md:max-w-4xl pointer-events-auto"
                    style={{ x: contentX, y: contentY }}
                >
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            key={`content-${currentIndex}`}
                            initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: 20, filter: 'blur(5px)' }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-8"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
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
                                    transition={{ delay: 0.5 }}
                                    className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.preset.textGradient} drop-shadow-md`}
                                >
                                    {slide.subtitle}
                                </motion.span>
                            </h1>

                            <p className={`text-lg md:text-xl ${slide.preset.textColor || 'text-white/80'} max-w-xl leading-relaxed font-bold line-clamp-3 opacity-90`}>
                                {slide.description}
                            </p>

                            <div className="pt-6 flex flex-wrap items-center gap-6">
                                <Link to={slide.ctaLink}>
                                    <motion.button
                                        whileHover={{ scale: 1.1, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ boxShadow: `0 20px 40px -10px ${slide.preset.glowColor}` }}
                                        className={`h-16 px-10 rounded-2xl bg-gradient-to-r ${slide.preset.buttonGradient} text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative z-20 group overflow-hidden`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                        <Zap className="w-6 h-6 fill-current" />
                                        <span className="relative z-10">{slide.ctaText}</span>
                                    </motion.button>
                                </Link>

                                <Link to="/vape">
                                    <motion.button
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-16 px-10 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 text-white font-black uppercase tracking-widest transition-all relative z-20"
                                    >
                                        Explorar
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Pagination Controls */}
            <div className="absolute bottom-12 right-6 lg:right-12 z-20 flex items-center gap-8 pointer-events-auto">
                <div className="hidden md:flex items-center gap-4">
                    {activeSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className="group relative px-2 py-4"
                            aria-label={`Slide ${i + 1}`}
                        >
                            <div className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-12 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'w-4 bg-white/20 group-hover:bg-white/40'}`} />
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white shadow-2xl transition-colors hover:border-white/30"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white shadow-2xl transition-colors hover:border-white/30"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
};
