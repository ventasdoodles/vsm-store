import { useState, useEffect } from 'react';
import { ChevronRight, X, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PROMOS = [
    { 
        content: <><span className="font-bold tracking-widest uppercase text-xs">🚀 ENVÍO GRATIS</span> <span className="font-light opacity-90 mx-1.5 text-xs">a partir de</span> <span className="font-semibold border-b border-white/30 pb-[1px] text-xs">$999 MXN</span></>, 
        link: '/vape',
        urgency: false
    },
    { 
        content: <><span className="font-bold tracking-widest text-yellow-300 text-xs">🔥 15% OFF</span> <span className="font-light opacity-90 mx-1.5 text-xs">en tu primera compra — Usa código:</span> <span className="font-bold bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm text-xs border border-white/10 shadow-sm">BIENVENIDO</span></>, 
        link: '/login',
        urgency: true
    },
    { 
        content: <><span className="font-light opacity-90 text-xs">💨 Nuevos vaporizadores disponibles.</span> <span className="font-bold tracking-wide ml-1.5 underline decoration-wavy decoration-white/40 underline-offset-4 text-xs">¡Corre que vuelan!</span></>, 
        link: '/vape/disposables',
        urgency: false
    },
];

export function TopBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % PROMOS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [isVisible]);

    if (!isVisible) return null;

    const currentPromo = PROMOS[currentIndex] || PROMOS[0];

    return (
        <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`relative text-white overflow-hidden text-xs sm:text-sm font-medium tracking-wide z-50 flex justify-center items-center border-b transition-colors duration-1000 ${currentPromo?.urgency ? 'bg-gradient-to-r from-red-950 via-[#0b101a] to-red-950 border-white/10' : 'bg-[#0b101a] border-white/5'}`}
        >
            {/* Glossy animated layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-md animate-pulse-slow pointer-events-none" />
            
            <div className="w-full max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-2.5 relative flex items-center justify-between">
                <div className="flex-1 w-full relative h-6 overflow-hidden flex justify-center items-center">
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            key={currentIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute flex items-center gap-2 text-center drop-shadow-md w-full justify-center"
                        >
                            {currentPromo && (
                                <Link to={currentPromo.link} className="hover:text-white/90 flex items-center gap-2 group transition-colors">
                                    <span className="flex items-center flex-wrap justify-center font-normal">
                                        {currentPromo.urgency && <Flame className="w-3 h-3 text-red-500 mr-2 animate-pulse" />}
                                        {currentPromo.content}
                                    </span>
                                    <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                </Link>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute right-3 sm:right-6 z-10 p-1 rounded-full hover:bg-white/20 transition-colors bg-black/10"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}
