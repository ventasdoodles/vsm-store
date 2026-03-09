/**
 * // ─── COMPONENTE: PremiumSkeleton ───
 * // Arquitectura: UI Lego (Lego Master)
 * // Proposito principal: Skeletons con efecto "Liquid Shimmer" para una carga inmersiva.
 * // Regla / Notas: Inspirado en el reflejo de la luna sobre el agua. Usa animaciones de GPU.
 */
import { cn } from '@/lib/utils';

interface PremiumSkeletonProps {
    className?: string;
    variant?: 'circle' | 'rect' | 'pill';
}

export function PremiumSkeleton({ className, variant = 'rect' }: PremiumSkeletonProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden bg-[#1e293b]/50 backdrop-blur-sm border border-white/5",
                variant === 'circle' && "rounded-full",
                variant === 'pill' && "rounded-full",
                variant === 'rect' && "rounded-2xl",
                className
            )}
        >
            {/* 🌊 Liquid Shimmer Layer */}
            <div className="absolute inset-0 z-10">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-vape-400/10 to-transparent" />
            </div>
            
            {/* 💎 Depth Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        </div>
    );
}

// Add shimmer animation to tailwind if not present, but for now we can use a CSS block in the component or assume global
