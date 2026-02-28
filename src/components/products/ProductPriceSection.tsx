/**
 * ProductPriceSection — Visualización de precio, descuento y envío gratis.
 * 
 * @module ProductPriceSection
 * @independent Componente puro basado en props de precio.
 */
import { Truck } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Section } from '@/types/product';

interface ProductPriceSectionProps {
    price: number;
    compareAtPrice?: number | null;
    section: Section;
}

export function ProductPriceSection({ price, compareAtPrice, section }: ProductPriceSectionProps) {
    const isVape = section === 'vape';
    const hasDiscount = compareAtPrice && compareAtPrice > price;

    return (
        <div className="vsm-stack">
            {/* Contenedor de Precios */}
            <div className="flex items-baseline gap-3 flex-wrap">
                <span
                    className={cn(
                        'vsm-price',
                        isVape ? 'text-vape-400' : 'text-herbal-400'
                    )}
                >
                    {formatPrice(price)}
                </span>

                {hasDiscount && (
                    <div className="flex items-center gap-2">
                        <span className="text-base text-theme-secondary line-through decoration-theme-secondary/50">
                            {formatPrice(compareAtPrice)}
                        </span>
                        <span className="vsm-pill bg-red-500/10 text-red-500 border-red-500/20">
                            -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Badge de Envío Premium */}
            <div className="vsm-status w-fit bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    <Truck className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Envío Premium</span>
                    <span className="text-xs text-emerald-400/70">Gratis en Xalapa, Ver.</span>
                </div>
            </div>
        </div>
    );
}
