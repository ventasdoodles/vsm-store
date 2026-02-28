/**
 * MegaHero — Slider hero de alta conversión para la portada de la tienda.
 *
 * @module MegaHero
 * @independent Componente 100% independiente. No consume hooks externos ni contextos.
 * @data Slides definidos como constante estática HERO_SLIDES. Editar aquí para cambiar contenido.
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HERO_SLIDES = [
    {
        id: 'slide-1',
        title: 'NUEVA ERA',
        subtitle: 'DEL VAPEO',
        description: 'Descubre los dispositivos más avanzados con tecnología mesh y control de flujo de aire.',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1600&q=80',
        ctaText: 'Ver Dispositivos',
        ctaLink: '/vape/pods',
        tag: 'Lanzamiento',
        gradient: 'from-blue-600/90 via-purple-900/80 to-theme-primary',
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
        gradient: 'from-green-600/90 via-emerald-900/80 to-theme-primary',
    },
    {
        id: 'slide-3',
        title: 'SABORES',
        subtitle: 'ÚNICOS',
        description: 'Explora nuestra nueva colección de líquidos con perfiles de sabor complejos y balanceados.',
        image: 'https://images.unsplash.com/photo-1572293007244-8cb2ebdbde46?w=1600&q=80',
        ctaText: 'Ver Líquidos',
        ctaLink: '/vape/liquidos',
        tag: 'Top Ventas',
        gradient: 'from-orange-600/90 via-red-900/80 to-theme-primary',
    }
];

export const MegaHero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }, []);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 7000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const slide = HERO_SLIDES[currentIndex];

    // Evita crashes pero asegura q haya slides
    if (!slide) return <div className="h-[60vh] bg-theme-secondary animate-pulse rounded-3xl"></div>;

    return (
        <section
            className="relative w-full h-[85vh] min-h-[500px] mt-4 rounded-3xl bg-theme-primary flex overflow-hidden vsm-border"
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
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-primary via-theme-primary/40 to-transparent opacity-95" />
                    
                    {/* Textura de ruido CSS (sin dependencia externa) */}
                    <div 
                        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
                    />

                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-center container-vsm px-6 lg:px-12 pointer-events-none">
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
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md vsm-border text-white font-medium text-xs md:text-sm tracking-wider uppercase mb-2"
                            >
                                <Sparkles className="w-4 h-4 text-white/70" />
                                {slide.tag}
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-lg pb-2 pt-2">
                                {slide.title}
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                                    {slide.subtitle}
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed font-medium">
                                {slide.description}
                            </p>

                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <Link to={slide.ctaLink}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-14 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)] hover:shadow-[0_0_60px_-15px_rgba(239,68,68,0.8)] transition-all relative z-20 group"
                                    >
                                        <Zap className="w-5 h-5 fill-current" />
                                        <span className="relative z-10 text-white">{slide.ctaText}</span>
                                    </motion.button>
                                </Link>

                                <Link to="/productos">
                                    <motion.button
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-14 px-8 rounded-2xl bg-white/5 backdrop-blur-md vsm-border text-white font-bold transition-all relative z-20 group"
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
            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4 pointer-events-auto">
                {/* Indicadores */}
                <div className="hidden md:flex items-center gap-2 mr-6">
                    {HERO_SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === i ? 'w-8 bg-red-500' : 'w-2 bg-white/30'}`}
                            aria-label={`Ir a slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Flechas */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-theme-primary/40 backdrop-blur-md vsm-border text-white transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-theme-primary/40 backdrop-blur-md vsm-border text-white transition-colors"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
};
