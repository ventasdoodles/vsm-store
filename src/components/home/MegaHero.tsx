/**
 * MegaHero — Awesome, High-Conversion Carousel Hero Component.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HERO_SLIDES = [
    {
        id: 'slide-1',
        title: 'NUEVA ERA',
        subtitle: 'DEL VAPEO',
        description: 'Descubre los dispositivos más avanzados con tecnología mesh y control de flujo de aire.',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1600',
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
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=1600',
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
        image: 'https://images.unsplash.com/photo-1572293007244-8cb2ebdbde46?w=1600',
        ctaText: 'Ver Líquidos',
        ctaLink: '/vape/liquidos',
        tag: 'Top Ventas',
        gradient: 'from-orange-600/90 via-red-900/80 to-theme-primary',
    }
];

export const MegaHero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    };

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const slide = HERO_SLIDES[currentIndex];

    if (!slide) return null;

    return (
        <section 
            className="relative h-[85vh] min-h-[600px] w-full mt-4 rounded-b-[3rem] lg:rounded-[3rem] overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence exitBeforeEnter>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-primary via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-center container mx-auto px-6 h-full">
                <div className="max-w-2xl">
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            key={`content-${currentIndex}`}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold tracking-widest text-xs uppercase shadow-xl">
                                <Sparkles className="w-4 h-4 text-vape-400" />
                                {slide.tag}
                            </div>
                            
                            <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl">
                                {slide.title}
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vape-300 to-vape-600">
                                    {slide.subtitle}
                                </span>
                            </h1>

                            <p className="text-lg text-white/80 max-w-lg font-medium leading-relaxed drop-shadow-md">
                                {slide.description}
                            </p>

                            <div className="pt-4 flex items-center gap-4">
                                <Link 
                                    to={slide.ctaLink}
                                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-theme-primary font-black rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-vape-500 to-vape-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                                    <span className="relative z-10 tracking-widest uppercase text-sm">
                                        {slide.ctaText}
                                    </span>
                                    <Zap className="w-5 h-5 relative z-10 group-hover:text-vape-500 transition-colors" />
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
                <button 
                    onClick={prevSlide}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 shadow-xl"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                    onClick={nextSlide}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 shadow-xl"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {HERO_SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 transition-all duration-500 rounded-full ${
                            index === currentIndex 
                                ? 'w-10 bg-vape-400 shadow-[0_0_10px_rgba(234,88,12,0.8)]' 
                                : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};
