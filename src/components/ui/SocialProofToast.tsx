import { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

import type { Product } from '@/types/product';

const MOCK_NAMES = [
    'Juan', 'María', 'Pedro', 'Sofía', 'Carlos', 'Ana', 'Luis', 'Elena', 'Miguel', 'Lucía',
    'Roberto', 'Patricia', 'Fernando', 'Carmen', 'David', 'Laura', 'Alejandro', 'Isabel'
];

const MOCK_CITIES = [
    'Xalapa', 'Coatepec', 'Banderilla', 'Veracruz', 'Boca del Río', 'Córdoba', 'Orizaba', 'Xalapa'
];

const MOCK_TIMES = [
    'hace 2 min', 'hace 5 min', 'hace 12 min', 'hace 25 min', 'hace 1 hora', 'hace 45 min'
];

export function SocialProofToast() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentSale, setCurrentSale] = useState<{
        customer: string;
        city: string;
        product: Product;
        time: string;
    } | null>(null);

    // Fetch popular products to use as "sold items"
    const { data: products = [] } = useProducts({ limit: 12 });

    useEffect(() => {
        if (products.length === 0) return;

        const showNewNotification = () => {
            // Pick random product
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            if (!randomProduct) return;

            // Pick random customer info
            const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)] ?? 'Cliente';
            const city = MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)] ?? 'México';
            const time = MOCK_TIMES[Math.floor(Math.random() * MOCK_TIMES.length)] ?? 'hace un momento';

            setCurrentSale({
                customer: name,
                city,
                product: randomProduct,
                time
            });
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // Initial delay
        const initialTimeout = setTimeout(() => {
            showNewNotification();
        }, 5000);

        // Loop
        const interval = setInterval(() => {
            showNewNotification();
        }, 30000 + Math.random() * 20000); // Every 30-50 seconds

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [products]);

    if (!currentSale || !currentSale.product) return null;

    return (
        <div
            className={cn(
                'fixed bottom-4 left-4 z-50 flex max-w-[320px] items-center gap-3 rounded-xl border border-theme bg-theme-primary/90 p-3 shadow-2xl backdrop-blur-md transition-all duration-700 ease-in-out sm:bottom-6 sm:left-6',
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0 pointer-events-none'
            )}
        >
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-1 top-1 rounded-full p-1 text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-colors"
                aria-label="Cerrar notificación"
            >
                <X className="h-3 w-3" />
            </button>

            {/* Product Image */}
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-theme-tertiary">
                {currentSale.product.images?.[0] ? (
                    <img
                        src={currentSale.product.images[0]}
                        alt={currentSale.product.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-theme-secondary" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col text-sm">
                <p className="font-medium text-theme-secondary leading-tight">
                    <span className="font-bold text-vape-400">{currentSale.customer}</span> de {currentSale.city} compró
                </p>
                <Link
                    to={`/${currentSale.product.section}/${currentSale.product.slug}`}
                    className="truncate font-semibold text-theme-primary hover:text-vape-400 hover:underline transition-colors mt-0.5"
                    title={currentSale.product.name}
                >
                    {currentSale.product.name}
                </Link>
                <p className="text-[10px] text-theme-secondary mt-0.5 flex items-center gap-1">
                    <span>{currentSale.time}</span>
                    <span className="h-1 w-1 rounded-full bg-theme-tertiary" />
                    <span className="text-green-500 font-medium">Verificado</span>
                </p>
            </div>
        </div>
    );
}
