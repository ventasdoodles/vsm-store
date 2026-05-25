/**
 * ProductBadgeGroup — Grupo de etiquetas informativas (Nuevo, Best Seller, Premium).
 * 
 * @module ProductBadgeGroup
 * @independent Basado en las props del producto.
 */
import { cn } from '@/lib/utils';
import { getVape420ProductSurfacePresentationConfig } from '@/config/productization';
import type { Product } from '@/types/product';

interface ProductBadgeGroupProps {
    product: Product;
}

export function ProductBadgeGroup({ product }: ProductBadgeGroupProps) {
    const productSurfaceConfig = getVape420ProductSurfacePresentationConfig(product.section);

    // 1. Validar vigencia de flags legados
    const now = new Date();
    const isNewValid = product.is_new && (!product.is_new_until || new Date(product.is_new_until) > now);
    const isFeaturedValid = product.is_featured && (!product.is_featured_until || new Date(product.is_featured_until) > now);
    const isBestsellerValid = product.is_bestseller && (!product.is_bestseller_until || new Date(product.is_bestseller_until) > now);

    // 2. Coleccionar labels normalizados (sin duplicados)
    const badgeSet = new Set<string>();

    // Procesar flags legados
    if (isNewValid) badgeSet.add('NUEVO');
    if (isBestsellerValid) badgeSet.add('HOT');
    if (isFeaturedValid) badgeSet.add('PREMIUM');

    // Procesar array de badges de la nueva ontología
    (product.badges || []).forEach(b => {
        const normalized = b.toUpperCase();
        // Mapear llaves técnicas a labels legibles si es necesario
        if (normalized === 'BESTSELLER') badgeSet.add('HOT');
        else badgeSet.add(normalized);
    });

    const activeBadges = Array.from(badgeSet);

    if (activeBadges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {activeBadges.map((badge) => (
                <span
                    key={badge}
                    className={cn(
                        'vsm-pill backdrop-blur-sm shadow-sm transition-transform hover:scale-105',
                        productSurfaceConfig.badgeSurfaceClassName,
                        // Estilos específicos para badges críticos
                        badge === 'NUEVO' && 'bg-vape-500 text-white border-none font-black',
                        badge === 'HOT' && 'bg-herbal-500 text-white border-none font-black'
                    )}
                >
                    {badge}
                </span>
            ))}
        </div>
    );
}
