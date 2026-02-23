/**
 * ProductInfo — Composition of the product detail information section.
 * 
 * @module ProductInfo
 * @independent Self-contained composition.
 */
import { cn } from '@/lib/utils';
import { TrustBadges } from '@/components/products/TrustBadges';
import { UrgencyIndicators } from '@/components/products/UrgencyIndicators';
import { ProductBadgeGroup } from './ProductBadgeGroup';
import { ProductPriceSection } from './ProductPriceSection';
import { ProductActions } from './ProductActions';
import type { Product } from '@/types/product';

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="space-y-6 lg:pl-4">
            {/* 1. BADGES */}
            <ProductBadgeGroup product={product} />

            {/* 2. HEADER: Name + SKU */}
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-theme-primary sm:text-4xl tracking-tight leading-tight">
                    {product.name}
                </h1>
                {product.sku && (
                    <p className="text-[10px] font-bold text-theme-tertiary uppercase tracking-[0.2em]">
                        SKU: {product.sku}
                    </p>
                )}
            </div>

            {/* 3. SHORT DESCRIPTION */}
            {product.short_description && (
                <p className="text-base text-theme-secondary leading-relaxed bg-theme-secondary/5 rounded-xl border border-theme/10 p-4">
                    {product.short_description}
                </p>
            )}

            {/* 4. PRICE & SHIPPING */}
            <ProductPriceSection
                price={product.price}
                compareAtPrice={product.compare_at_price}
                section={product.section}
            />

            {/* 5. URGENCY INDICATORS */}
            <UrgencyIndicators stock={product.stock} />

            {/* 6. ACTIONS (QTY + ADD TO CART + SHARE) */}
            <ProductActions product={product} />

            {/* 7. DESCRIPTION */}
            {product.description && (
                <div className="pt-4 border-t border-theme/40">
                    <h2 className="mb-3 text-[11px] font-black text-theme-primary uppercase tracking-[0.2em]">
                        Descripción Detallada
                    </h2>
                    <p className="text-sm text-theme-secondary leading-loose whitespace-pre-line opacity-90">
                        {product.description}
                    </p>
                </div>
            )}

            {/* 8. TAGS */}
            {product.tags.length > 0 && (
                <div className="pt-4 border-t border-theme/40">
                    <h2 className="mb-3 text-[11px] font-black text-theme-primary uppercase tracking-[0.2em]">
                        Características
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                        {product.tags.map((tag) => (
                            <span
                                key={tag}
                                className={cn(
                                    'rounded-lg px-2.5 py-1 text-[10px] font-medium border border-theme/40 bg-theme-secondary/10 text-theme-secondary uppercase tracking-wider',
                                    product.section === 'vape' ? 'hover:text-vape-400' : 'hover:text-herbal-400'
                                )}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 9. TRUST BADGES */}
            <div className="pt-4">
                <TrustBadges />
            </div>
        </div>
    );
}
