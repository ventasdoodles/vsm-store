/**
 * ProductInfo â€” Composition of the product detail information section.
 * 
 * @module ProductInfo
 * @independent Self-contained composition.
 */
import { cn } from '@/lib/utils';
import { UrgencyIndicators } from '@/components/products/UrgencyIndicators';
import { ProductBadgeGroup } from './ProductBadgeGroup';
import { ProductPriceSection } from './ProductPriceSection';
import { ProductActions } from './ProductActions';
import type { Product } from '@/types/product';
import { motion } from 'framer-motion';

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="vsm-stack-lg lg:pl-6"
        >
            {/* 1. BADGES */}
            <motion.div variants={itemVariants}>
                <ProductBadgeGroup product={product} />
            </motion.div>

            {/* 2. HEADER: Name + SKU */}
            <motion.div variants={itemVariants} className="space-y-2">
                <h1 className="vsm-heading text-theme-primary">
                    {product.name}
                </h1>
                {product.sku && (
                    <p className="vsm-label text-theme-tertiary">
                        SKU: {product.sku}
                    </p>
                )}
            </motion.div>

            {/* 3. SHORT DESCRIPTION */}
            {product.short_description && (
                <motion.p variants={itemVariants} className="vsm-surface-inset text-base text-theme-secondary leading-relaxed bg-theme-secondary/5 shadow-inner">
                    {product.short_description}
                </motion.p>
            )}

            {/* 4. PRICE & SHIPPING */}
            <motion.div variants={itemVariants}>
                <ProductPriceSection
                    price={product.price}
                    compareAtPrice={product.compare_at_price}
                    section={product.section}
                />
            </motion.div>

            {/* 5. URGENCY INDICATORS */}
            <motion.div variants={itemVariants}>
                <UrgencyIndicators stock={product.stock} />
            </motion.div>

            {/* 6. ACTIONS (QTY + ADD TO CART + SHARE) */}
            <motion.div variants={itemVariants}>
                <ProductActions product={product} />
            </motion.div>

            {/* 7. DESCRIPTION */}
            {product.description && (
                <motion.div variants={itemVariants} className="vsm-divider">
                    <h2 className="vsm-label text-theme-primary mb-4">
                        Descripción Detallada
                    </h2>
                    <p className="text-sm text-theme-secondary leading-loose whitespace-pre-line opacity-90">
                        {product.description}
                    </p>
                </motion.div>
            )}

            {/* 8. TAGS */}
            {(product.tags ?? []).length > 0 && (
                <motion.div variants={itemVariants} className="vsm-divider">
                    <h2 className="vsm-label text-theme-primary mb-4">
                        Características
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                        {(product.tags ?? []).map((tag) => (
                            <span
                                key={tag}
                                className={cn(
                                    'vsm-tag border-theme bg-theme-secondary/10 text-theme-secondary transition-colors',
                                    product.section === 'vape' ? 'hover:text-vape-400 hover:border-vape-400/50 hover:bg-vape-500/10' : 'hover:text-herbal-400 hover:border-herbal-400/50 hover:bg-herbal-500/10'
                                )}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            
        </motion.div>
    );
}
