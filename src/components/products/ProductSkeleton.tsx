/**
 * ProductSkeleton — Estados de carga (skeleton) premium para el detalle de producto.
 * 
 * @module ProductSkeleton
 */
export function ProductSkeleton() {
    return (
        <div className="container-vsm py-8">
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Skeleton galería */}
                <div className="space-y-3">
                    <div className="aspect-square rounded-2xl skeleton-shimmer bg-theme-secondary/20 border border-theme" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 w-16 rounded-lg skeleton-shimmer bg-theme-secondary/20 border border-theme" />
                        ))}
                    </div>
                </div>
                {/* Skeleton info */}
                <div className="space-y-5">
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full skeleton-shimmer bg-theme-secondary/20" />
                        <div className="h-6 w-24 rounded-full skeleton-shimmer bg-theme-secondary/20" />
                    </div>
                    <div className="h-10 w-3/4 rounded-lg skeleton-shimmer bg-theme-secondary/20" />
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded-lg skeleton-shimmer bg-theme-secondary/20" />
                        <div className="h-4 w-2/3 rounded-lg skeleton-shimmer bg-theme-secondary/20" />
                    </div>
                    <div className="h-12 w-1/3 rounded-lg skeleton-shimmer bg-theme-secondary/20" />
                    <hr className="border-theme" />
                    <div className="space-y-3">
                        <div className="h-4 w-full rounded-lg skeleton-shimmer bg-theme-secondary/20" />
                        <div className="h-4 w-full rounded-lg skeleton-shimmer bg-theme-secondary/20" />
                        <div className="h-4 w-1/2 rounded-lg skeleton-shimmer bg-theme-secondary/20" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <div className="h-14 flex-1 rounded-xl skeleton-shimmer bg-theme-secondary/20" />
                        <div className="h-14 w-14 rounded-xl skeleton-shimmer bg-theme-secondary/30" />
                    </div>
                </div>
            </div>
        </div>
    );
}
