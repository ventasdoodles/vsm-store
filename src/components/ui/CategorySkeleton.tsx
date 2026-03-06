

interface CategorySkeletonProps {
    variant?: 'chips' | 'cards';
    count?: number;
}

export function CategorySkeleton({ variant = 'chips', count = 4 }: CategorySkeletonProps) {
    if (variant === 'chips') {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[...Array(count)].map((_, i) => (
                    <div
                        key={i}
                        className="h-8 w-24 flex-shrink-0 animate-pulse rounded-xl bg-theme-secondary/20 border border-theme/50"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="aspect-[16/9] animate-pulse rounded-2xl bg-theme-secondary/10 border border-theme/30 p-4 flex flex-col justify-end"
                >
                    <div className="h-6 w-2/3 rounded-lg bg-theme-secondary/20" />
                </div>
            ))}
        </div>
    );
}
