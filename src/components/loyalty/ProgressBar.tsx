// Barra de progreso reutilizable - VSM Store
import { cn } from '@/lib/utils';
import type { Tier } from '@/services/loyalty.service';

interface ProgressBarProps {
    value: number;     // 0–100
    max?: number;
    tier?: Tier;
    label?: string;
    showPercentage?: boolean;
    height?: 'sm' | 'md' | 'lg';
}

const TIER_COLORS: Record<Tier, string> = {
    bronze: 'bg-orange-500',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-accent-primary',
};

const HEIGHTS = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
};

export function ProgressBar({ value, max = 100, tier = 'bronze', label, showPercentage, height = 'md' }: ProgressBarProps) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="space-y-1">
            {(label || showPercentage) && (
                <div className="flex items-center justify-between text-xs text-theme-primary0">
                    {label && <span>{label}</span>}
                    {showPercentage && <span>{Math.round(pct)}%</span>}
                </div>
            )}
            <div className={cn('w-full rounded-full bg-theme-secondary/60 overflow-hidden', HEIGHTS[height])}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', TIER_COLORS[tier])}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
