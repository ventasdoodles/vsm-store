import { AlertTriangle, Check, PackageX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * UrgencyIndicators - truthful stock availability cues.
 *
 * Uses only the stock prop for customer-visible availability messaging.
 * viewCount remains in the public API for caller compatibility, but is not
 * rendered unless backed by a future truthful data source.
 */
interface UrgencyIndicatorsProps {
    stock: number;
    viewCount?: number;
    className?: string;
}

export const UrgencyIndicators = ({ stock, className }: UrgencyIndicatorsProps) => {
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= 10;

    if (isOutOfStock) {
        return (
            <div className={cn("vsm-status text-red-500 bg-red-500/10 border-red-500/20", className)}>
                <PackageX className="w-4 h-4" />
                <span>Agotado</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("vsm-surface vsm-stack bg-gradient-to-br from-theme-secondary/10 to-transparent", className)}
        >
            {isLowStock ? (
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="vsm-status bg-orange-500/10 text-orange-500 border-orange-500/20"
                >
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold tracking-wide">
                        {stock <= 3
                            ? `Stock limitado: ${stock} unidades`
                            : `Disponibilidad limitada: ${stock} unidades`}
                    </span>
                </motion.div>
            ) : (
                <div className="vsm-status bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <Check className="w-5 h-5" />
                    <span className="font-bold tracking-wide">Disponible para envío</span>
                </div>
            )}
        </motion.div>
    );
};
