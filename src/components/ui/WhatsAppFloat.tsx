import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

export const WhatsAppFloat = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Entrance animation after 1s
        const showTimer = setTimeout(() => setIsVisible(true), 1000);
        // Show tooltip after 4s, hide after 8s
        const tooltipShow = setTimeout(() => setShowTooltip(true), 4000);
        const tooltipHide = setTimeout(() => setShowTooltip(false), 8000);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(tooltipShow);
            clearTimeout(tooltipHide);
        };
    }, []);

    const handleClick = () => {
        setShowTooltip(false);
        window.open(
            `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                SITE_CONFIG.whatsapp.defaultMessage
            )}`,
            '_blank'
        );
    };

    return (
        <div
            className={`fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
        >
            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute -left-40 top-1/2 -translate-y-1/2 animate-fade-in">
                    <div className="relative whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-xl">
                        ¿Necesitas ayuda? 💬
                        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-white" />
                    </div>
                </div>
            )}

            {/* Button */}
            <button
                onClick={handleClick}
                className="group relative w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl shadow-green-500/30 flex items-center justify-center transition-all hover:scale-110 hover:shadow-green-500/50"
                aria-label="Contactar por WhatsApp"
            >
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
                <MessageCircle className="w-7 h-7 relative z-10" />
            </button>
        </div>
    );
};
