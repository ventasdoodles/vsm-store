import { useEffect, useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';

interface Purchase {
    name: string;
    location: string;
    product: string;
    time: string;
}

const MOCK_PURCHASES: Purchase[] = [
    { name: 'Carlos', location: 'Banderilla', product: 'Mod Pen Style 22mm', time: 'hace 1 hora' },
    { name: 'María', location: 'Xalapa', product: 'Pod System Starter Kit', time: 'hace 2 horas' },
    { name: 'Juan', location: 'Coatepec', product: 'E-Liquid Berry Mix', time: 'hace 3 horas' },
];

export const SocialProofToast = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentPurchase, setCurrentPurchase] = useState(0);

    useEffect(() => {
        // Mostrar primer notification después de 3 segundos
        const initialTimer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        // Rotar notifications cada 10 segundos
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentPurchase((prev) => (prev + 1) % MOCK_PURCHASES.length);
                setIsVisible(true);
            }, 500);
        }, 10000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    const purchase = MOCK_PURCHASES[currentPurchase];

    if (!isVisible || !purchase) return null;

    return (
        <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
            <div className="bg-theme-primary border border-theme rounded-xl shadow-2xl p-4 max-w-sm animate-slideInLeft">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-green-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-theme-primary">
                            <span className="font-bold">{purchase.name}</span> de {purchase.location} compró
                        </p>
                        <p className="text-sm text-theme-secondary truncate">
                            {purchase.product}
                        </p>
                        <p className="text-xs text-theme-secondary mt-1">
                            {purchase.time}
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-theme-secondary rounded-full transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4 text-theme-secondary" />
                    </button>
                </div>

                {/* Verification Badge */}
                <div className="mt-2 pt-2 border-t border-theme">
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="font-medium">Compra Verificada</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
