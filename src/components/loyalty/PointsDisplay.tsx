// Display de puntos - VSM Store
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsDisplayProps {
    points: number;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

const SIZES = {
    sm: { wrapper: 'gap-1', icon: 'h-3.5 w-3.5', number: 'text-sm', label: 'text-[10px]' },
    md: { wrapper: 'gap-1.5', icon: 'h-4 w-4', number: 'text-lg', label: 'text-xs' },
    lg: { wrapper: 'gap-2', icon: 'h-6 w-6', number: 'text-3xl', label: 'text-sm' },
};

export function PointsDisplay({ points, size = 'md', label = 'puntos' }: PointsDisplayProps) {
    const s = SIZES[size];

    return (
        <div className={cn('inline-flex items-center', s.wrapper)}>
            <Star className={cn(s.icon, 'text-yellow-400 fill-yellow-400')} />
            <span className={cn('font-bold text-primary-100', s.number)}>
                {points.toLocaleString('es-MX')}
            </span>
            {label && (
                <span className={cn('text-primary-500 font-medium', s.label)}>{label}</span>
            )}
        </div>
    );
}
