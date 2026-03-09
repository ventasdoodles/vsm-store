
import { PremiumSkeleton } from './PremiumSkeleton';

interface CategorySkeletonProps {
    variant?: 'chips' | 'cards';
    count?: number;
}

export function CategorySkeleton({ variant = 'chips', count = 4 }: CategorySkeletonProps) {
    if (variant === 'chips') {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[...Array(count)].map((_, i) => (
                    <PremiumSkeleton
                        key={i}
                        variant="pill"
                        className="h-8 w-24 flex-shrink-0"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(count)].map((_, i) => (
                <PremiumSkeleton
                    key={i}
                    className="aspect-[16/9]"
                />
            ))}
        </div>
    );
}
