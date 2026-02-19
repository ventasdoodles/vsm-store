import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

export const WhatsAppFloat = () => {
    const handleClick = () => {
        window.open(
            `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                SITE_CONFIG.whatsapp.defaultMessage
            )}`,
            '_blank'
        );
    };

    return (
        <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
            <button
                onClick={handleClick}
                className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
                aria-label="WhatsApp"
            >
                <MessageCircle className="w-7 h-7" />
            </button>
        </div>
    );
};
