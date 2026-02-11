// Skeleton loader reutilizable - VSM Store
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
    className?: string;
}

/**
 * Skeleton para tarjeta de producto (placeholder de carga)
 */
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse overflow-hidden rounded-2xl border border-primary-800 bg-primary-900/50',
                className
            )}
        >
            {/* Imagen placeholder */}
            <div className="h-48 bg-primary-800/60" />

            {/* Contenido placeholder */}
            <div className="p-4 space-y-3">
                {/* Nombre */}
                <div className="h-4 w-3/4 rounded-lg bg-primary-700/50" />
                {/* Descripción */}
                <div className="h-3 w-full rounded-lg bg-primary-700/30" />
                <div className="h-3 w-2/3 rounded-lg bg-primary-700/30" />
                {/* Precio */}
                <div className="h-5 w-1/3 rounded-lg bg-primary-700/50" />
            </div>
        </div>
    );
}
