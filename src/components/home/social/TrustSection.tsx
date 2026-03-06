/**
 * TrustSection — Bloque de indicadores de confianza (satisfacción, reseñas, seguridad).
 * 
 * @component
 */
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Users } from 'lucide-react';

interface TrustSectionProps {
    avgRating: number;
    totalCount: number;
}

export function TrustSection({ avgRating, totalCount }: TrustSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center justify-center gap-6 text-xs text-theme-secondary"
        >
            <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Compras verificadas
            </span>
            <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                {avgRating >= 4.5 ? '98' : avgRating >= 4 ? '95' : '90'}% satisfacción
            </span>
            <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent-primary" />
                +{totalCount} reseñas
            </span>
        </motion.div>
    );
}
