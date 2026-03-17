/**
 * // ─── COMPONENTE: PRODUCT INFO ───
 * // Propósito: Renderizado de metadatos principales del producto (Nombre, Badges, Etiquetas).
 * // Arquitectura: Presentational component puro.
 * // Estética: §2.1 Premium (Tipografía pesada, espaciado generoso, badges dinámicos).
 */
import { cn } from '@/lib/utils';
import { UrgencyIndicators } from '@/components/products/UrgencyIndicators';
import { ProductBadgeGroup } from './ProductBadgeGroup';
import { ProductPriceSection } from './ProductPriceSection';
import { ProductActions } from './ProductActions';
import type { Product } from '@/types/product';
import { useInventoryOracle } from '@/hooks/useInventoryOracle';
import { StockOracleBadge } from './StockOracleBadge';
import { motion } from 'framer-motion';

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const { prediction, isLoading: isOracleLoading } = useInventoryOracle(product.id, product.stock);

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

            {/* 5. URGENCY INDICATORS & ORACLE (Wave 24) */}
            <motion.div variants={itemVariants} className="space-y-4">
                <StockOracleBadge prediction={prediction} isLoading={isOracleLoading} />
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

            {/* 8. TECHNICAL SPECS (Bridge Phase 2C) */}
            {product.specs && Object.keys(product.specs).length > 0 && (
                <motion.div variants={itemVariants} className="vsm-divider">
                    <h2 className="vsm-label text-theme-primary mb-4">
                        Especificaciones Técnicas
                    </h2>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 vsm-surface-inset p-4 rounded-2xl bg-theme-secondary/5">
                        {Object.entries(product.specs).map(([key, value]) => {
                            const labels: Record<string, string> = {
                                potencia: 'Potencia',
                                nicotina: 'Nicotina',
                                ratio_vg_pg: 'Relación VG/PG',
                                dosis_por_porcion: 'Dosis',
                                conector: 'Conexión',
                                resistencia: 'Resistencia',
                                puffs: 'Puffs',
                                capacidad_bateria: 'Batería'
                            };
                            return (
                                <div key={key} className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary">
                                        {labels[key] || key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-sm font-bold text-theme-primary">
                                        {value as string}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* 9. TAGS (Legacy Coexistence) */}
            {(product.tags ?? []).length > 0 && (
                <motion.div variants={itemVariants} className="vsm-divider">
                    <h2 className="vsm-label text-theme-primary mb-4">
                        Etiquetas de Búsqueda
                    </h2>
                    <div className="flex flex-wrap gap-1.5 opacity-60">
                        {(product.tags ?? []).map((tag) => (
                            <span
                                key={tag}
                                className={cn(
                                    'vsm-tag border-theme bg-theme-secondary/5 text-theme-secondary text-[10px]',
                                    product.section === 'vape' ? 'hover:text-vape-400 hover:border-vape-400/50' : 'hover:text-herbal-400 hover:border-herbal-400/50'
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
