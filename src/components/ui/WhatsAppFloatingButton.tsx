import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { SITE_CONFIG } from '@/config/site';
import { useLocation } from 'react-router-dom';

export const WhatsAppFloatingButton: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    // No mostrar en admin panel
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(SITE_CONFIG.whatsapp.defaultMessage);
        const url = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${message}`;
        window.open(url, '_blank');
    };

    return (
        <>
            {/* Solo visible en desktop (hidden en mobile, ya está en Header) */}
            <div className="hidden md:block fixed bottom-6 right-6 z-50">
                {/* Botón principal */}
                <button
                    onClick={isExpanded ? () => setIsExpanded(false) : handleWhatsAppClick}
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                    className="group relative flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    aria-label="WhatsApp"
                >
                    {/* Contenido del botón */}
                    <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'px-6 py-4' : 'p-4'
                        }`}>
                        {/* Icono */}
                        <MessageCircle className="w-6 h-6" />

                        {/* Texto expandido */}
                        <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
                            }`}>
                            ¿Necesitas ayuda?
                        </span>
                    </div>

                    {/* Badge de "online" */}
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </button>

                {/* Tooltip hover (alternativo al expand) */}
                {!isExpanded && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-primary-800 text-primary-100 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chatea con nosotros
                        <div className="absolute top-full right-4 w-2 h-2 bg-primary-800 transform rotate-45 -mt-1" />
                    </div>
                )}
            </div>
        </>
    );
};
