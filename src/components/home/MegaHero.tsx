/**
 * MegaHero — Slider hero de alta conversión para la portada de la tienda.
 *
 * @module MegaHero
 * @independent Componente 100% independiente. No consume hooks externos ni contextos.
 * @data Consume datos dinámicos a través de useStoreSettings. Fallback a constante HERO_SLIDES si está vacío.
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export const PREMIUM_GRADIENTS = [
    {
        id: 'cyberpunk',
        name: 'Neon Cyberpunk (Morado/Fucsia)',
        bg: 'from-violet-900 via-fuchsia-900 to-purple-900',
        textGradient: 'from-fuchsia-400 to-purple-500',
        buttonGradient: 'from-fuchsia-600 to-purple-600',
        glowColor: 'rgba(192,38,211,0.5)'
    },
    {
        id: 'nature',
        name: 'Kush Nature (Verde/Esmeralda)',
        bg: 'from-emerald-900 via-green-900 to-teal-900',
        textGradient: 'from-green-400 to-emerald-500',
        buttonGradient: 'from-green-600 to-emerald-600',
        glowColor: 'rgba(5,150,105,0.5)'
    },
    {
        id: 'fire',
        name: 'Fire Vape (Rojo/Naranja)',
        bg: 'from-orange-900 via-red-900 to-rose-900',
        textGradient: 'from-red-400 to-orange-500',
        buttonGradient: 'from-red-600 to-orange-500',
        glowColor: 'rgba(239,68,68,0.5)'
    },
    {
        id: 'ocean',
        name: 'Deep Blue (Azul/Cian)',
        bg: 'from-blue-900 via-cyan-900 to-slate-900',
        textGradient: 'from-cyan-400 to-blue-500',
        buttonGradient: 'from-cyan-600 to-blue-600',
        glowColor: 'rgba(56,189,248,0.5)'
    },
    {
        id: 'gold',
        name: 'Luxury Gold (Dorado/Ambar)',
        bg: 'from-amber-900 via-yellow-900 to-stone-900',
        textGradient: 'from-amber-300 to-yellow-500',
        buttonGradient: 'from-amber-600 to-yellow-600',
        glowColor: 'rgba(245,158,11,0.5)'
    }
];

const FALLBACK_SLIDES = [
    {
        id: 'slide-1',
        title: 'NUEVA ERA',
        subtitle: 'DEL VAPEO',
        description: 'Descubre los dispositivos más avanzados con tecnología mesh y control de flujo de aire.',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1600&q=80',
        ctaText: 'Ver Dispositivos',
        ctaLink: '/vape/pods',
        tag: 'Lanzamiento',
        preset: PREMIUM_GRADIENTS[0], // cyberpunk
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
        preset: PREMIUM_GRADIENTS[1], // nature
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
        preset: PREMIUM_GRADIENTS[2], // fire
    }
];

export const MegaHero = () => {
    const { data: settings } = useStoreSettings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Mapear slides desde BD o usar fallback
    const activeSlides = useMemo(() => {
        if (settings?.hero_sliders && settings.hero_sliders.length > 0) {
            const dbSlides = settings.hero_sliders
                .filter(s => s.active)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(s => {
                    // Try to find the matching preset by the saved ID
                    const preset = PREMIUM_GRADIENTS.find(p => p.id === s.bgGradientLight) 
                        || PREMIUM_GRADIENTS[0]; // fallback to first (cyberpunk)
                    
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
            role="region"
            aria-roledescription="carrusel"
            aria-label="Promociones destacadas"
            className="relative w-full h-[100vh] min-h-[600px] mb-8 bg-theme-primary flex overflow-hidden group"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence exitBeforeEnter>
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={slide.image}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover select-none bg-theme-primary"
                    />

                    {/* Overlays / Gradients */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.preset.bg} opacity-80 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-primary via-theme-primary/60 to-transparent opacity-100" />
                    
                    {/* Noise texture manual para que no falle tailwind class */}
                    <div 
                        className="absolute inset-0 opacity-10 mix-blend-overlay"
                        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-center container-vsm px-6 lg:px-12 pointer-events-none mt-20" aria-live="polite">
                <div className="max-w-xl md:max-w-2xl mt-10 md:mt-0 pointer-events-auto">
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            key={`content-${currentIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-xs md:text-sm tracking-wider uppercase mb-2"
                            >
                                <Sparkles className="w-4 h-4 text-accent-primary" />
                                {slide.tag}
                            </motion.div>

                            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl pb-2 pt-2">
                                {slide.title}
                                <br />
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.preset.textGradient} drop-shadow-md`}>
                                    {slide.subtitle}
                                </span>
                            </h1>

                            <p className="text-base md:text-lg text-white/80 max-w-lg leading-relaxed font-medium line-clamp-3">
                                {slide.description}
                            </p>

                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <Link to={slide.ctaLink}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ boxShadow: `0 0 40px -10px ${slide.preset.glowColor}` }}
                                        className={`h-14 px-8 rounded-2xl bg-gradient-to-r ${slide.preset.buttonGradient} text-white font-bold flex items-center justify-center gap-2 transition-all relative z-20 group hover:brightness-110`}
                                    >
                                        <Zap className="w-5 h-5 fill-current" />
                                        <span className="relative z-10 text-white">{slide.ctaText}</span>
                                    </motion.button>
                                </Link>

                                <Link to="/vape">
                                    <motion.button
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-14 px-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold transition-all relative z-20 group"
                                    >
                                        <span className="relative z-10 text-white">Explorar Todo</span>
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Controles de Slider - Abajo en Movil, Lados en Desktop */}
            <div className="absolute bottom-12 right-6 lg:right-12 z-20 flex items-center gap-6 pointer-events-auto">
                {/* Indicadores */}
                <div className="hidden md:flex items-center gap-3 mr-6">
                    {activeSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-10 bg-accent-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'w-3 bg-white/20 hover:bg-white/40'}`}
                            aria-label={`Ir a slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Flechas */}
                <div className="flex gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all shadow-xl hover:border-white/30"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all shadow-xl hover:border-white/30"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
};
