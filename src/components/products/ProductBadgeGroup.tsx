/**
 * ProductBadgeGroup — Grupo de etiquetas informativas (Nuevo, Best Seller, Premium).
 * 
 * @module ProductBadgeGroup
 * @independent Basado en las props del producto.
 */
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductBadgeGroupProps {
    product: Product;
}

export function ProductBadgeGroup({ product }: ProductBadgeGroupProps) {
    const isVape = product.section === 'vape';

    // Validar vigencia de badges
    const now = new Date();
    const isNewValid = product.is_new && (!product.is_new_until || new Date(product.is_new_until) > now);
    const isFeaturedValid = product.is_featured && (!product.is_featured_until || new Date(product.is_featured_until) > now);
    const isBestsellerValid = product.is_bestseller && (!product.is_bestseller_until || new Date(product.is_bestseller_until) > now);

    const badges: string[] = [];
    if (isNewValid) badges.push('Nuevo');
    if (isBestsellerValid) badges.push('Best Seller');
    if (isFeaturedValid) badges.push('Premium');

    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <span
                    key={badge}
                    className={cn(
                        'vsm-pill backdrop-blur-sm shadow-sm transition-transform hover:scale-105',
                        isVape
                            ? 'bg-vape-500/15 text-vape-400 border-vape-500/30'
                            : 'bg-herbal-500/15 text-herbal-400 border-herbal-500/30'
                    )}
                >
                    {badge}
                </span>
            ))}
        </div>
    );
}
