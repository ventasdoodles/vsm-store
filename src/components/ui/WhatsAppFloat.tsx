import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { SITE_CONFIG } from '@/config/site';

export const WhatsAppFloat = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        window.open(
            `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                SITE_CONFIG.whatsapp.defaultMessage
            )}`,
            '_blank'
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
            {/* Expanded State */}
            {isExpanded && (
                <div className="mb-3 bg-theme-primary border border-theme rounded-xl shadow-2xl p-4 w-64 animate-scaleIn">
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center hover:bg-theme-secondary rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-theme-secondary" />
                    </button>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold text-theme-primary">
                                ¡Estamos en línea!
                            </span>
                        </div>
                        <p className="text-sm text-theme-secondary">
                            ¿Necesitas ayuda? Chatea con nosotros por WhatsApp.
                        </p>
                        <button
                            onClick={handleClick}
                            className="w-full h-10 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Abrir Chat
                        </button>
                    </div>
                </div>
            )}

            {/* Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
                aria-label="WhatsApp"
            >
                <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
};
