import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PROMOS = [
    { 
        content: <><span className="font-bold tracking-widest uppercase text-xs">🚀 ENVÍO GRATIS</span> <span className="font-light opacity-90 mx-1.5 text-xs">a partir de</span> <span className="font-semibold border-b border-white/30 pb-[1px] text-xs">$999 MXN</span></>, 
        link: '/vape' 
    },
    { 
        content: <><span className="font-bold tracking-widest text-yellow-300 text-xs">🔥 15% OFF</span> <span className="font-light opacity-90 mx-1.5 text-xs">en tu primera compra — Usa código:</span> <span className="font-bold bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm text-xs border border-white/10 shadow-sm">BIENVENIDO</span></>, 
        link: '/login' 
    },
    { 
        content: <><span className="font-light opacity-90 text-xs">💨 Nuevos vaporizadores disponibles.</span> <span className="font-bold tracking-wide ml-1.5 underline decoration-wavy decoration-white/40 underline-offset-4 text-xs">¡Corre que vuelan!</span></>, 
        link: '/vape/disposables' 
    },
];

export function TopBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    // Flag para evitar animación en el primer render
    const [hasTransitioned, setHasTransitioned] = useState(false);

    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(() => {
            setHasTransitioned(true);
            setCurrentIndex((prev) => (prev + 1) % PROMOS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="relative bg-[#0b101a] text-white overflow-hidden text-xs sm:text-sm font-medium tracking-wide z-50 flex justify-center items-center border-b border-white/5 py-1">
            {/* Glossy animated layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-md animate-pulse-slow pointer-events-none" />
            
            <div className="w-full max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 md:py-4 relative flex items-center justify-between">
                <div className="flex-1 w-full overflow-hidden flex justify-center items-center gap-2">
                    <div
                        key={currentIndex}
                        className={`absolute flex items-center gap-2 text-center drop-shadow-md w-full justify-center ${hasTransitioned ? 'animate-in slide-in-from-bottom-4 fade-in duration-500' : ''}`}
                    >
                        {PROMOS[currentIndex] && (
                            <Link to={PROMOS[currentIndex].link} className="hover:text-white/90 flex items-center gap-2 group transition-colors">
                                <span className="flex items-center flex-wrap justify-center font-normal">{PROMOS[currentIndex].content}</span>
                                <ChevronRight className="w-5 h-5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                            </Link>
                        )}
                    </div>
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
