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
        <div className="space-y-4">
            {/* Contenedor de Precios */}
            <div className="flex items-baseline gap-3">
                <span
                    className={cn(
                        'text-4xl font-black tracking-tight',
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
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-black text-red-500 border border-red-500/20">
                            -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Badge de Envío Premium */}
            <div className="flex items-center gap-2.5 rounded-xl bg-herbal-500/10 border border-herbal-500/20 px-4 py-2.5 w-fit">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-herbal-500 text-white shadow-lg shadow-herbal-500/20">
                    <Truck className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-herbal-400 uppercase tracking-wide">Envío Premium</span>
                    <span className="text-[10px] text-herbal-400/80">Gratis en Xalapa, Ver.</span>
                </div>
            </div>
        </div>
    );
}
