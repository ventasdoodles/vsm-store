import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Skeleton Premium for Product Cards inside Grids
 */
export const ProductCardSkeleton = memo(({ className, style }: ProductCardSkeletonProps) => {
    return (
        <div
            className={cn("overflow-hidden rounded-2xl border border-theme bg-theme-secondary/30", className)}
            style={style}
        >
            <div className="h-52 skeleton-shimmer" />
            <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded-lg skeleton-shimmer" />
                <div className="h-3 w-full rounded-lg skeleton-shimmer" />
                <div className="h-5 w-1/3 rounded-lg skeleton-shimmer" />
            </div>
        </div>
    );
});
