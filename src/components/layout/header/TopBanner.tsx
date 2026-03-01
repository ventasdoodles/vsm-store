import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PROMOS = [
    { text: '🚀 ENVÍO GRATIS a partir de $999 MXN', link: '/vape' },
    { text: '🔥 15% OFF en tu primera compra — Usa código: BIENVENIDO', link: '/login' },
    { text: '💨 Nuevos vaporizadores disponibles. ¡Corre que vuelan!', link: '/vape/disposables' },
];

export function TopBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % PROMOS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="relative bg-gradient-to-r from-accent-primary via-blue-600 to-vape-500 text-white overflow-hidden text-sm sm:text-base font-bold tracking-wide z-50 shadow-[0_4px_20px_rgba(59,130,246,0.25)] flex justify-center items-center">
            {/* Glossy animated layer */}
            <div className="absolute inset-0 bg-white/10 blur-md animate-pulse-slow pointer-events-none" />
            
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 md:py-4 relative flex items-center justify-between">
                <div className="flex-1 w-full overflow-hidden flex justify-center items-center gap-2">
                    <AnimatePresence>
                        <motion.div
                            key={currentIndex}
                            initial={{ y: 20, opacity: 0, rotateX: -90 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            exit={{ y: -20, opacity: 0, rotateX: 90 }}
                            transition={{ duration: 0.6, ease: "backOut" }}
                            className="absolute flex items-center gap-2 text-center drop-shadow-md w-full justify-center"
                        >
                            {PROMOS[currentIndex] && (
                                <Link to={PROMOS[currentIndex].link} className="hover:text-white/90 flex items-center gap-2 group transition-colors">
                                    {PROMOS[currentIndex].text}
                                    <ChevronRight className="w-5 h-5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                </Link>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute right-3 sm:right-6 z-10 p-1.5 rounded-full hover:bg-white/20 transition-colors bg-black/10"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
