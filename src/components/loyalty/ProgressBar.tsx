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
    bronze: 'bg-gradient-to-r from-orange-400 to-orange-600',
    silver: 'bg-gradient-to-r from-slate-300 to-slate-500',
    gold: 'bg-gradient-to-r from-yellow-400 to-amber-600',
    platinum: 'bg-gradient-to-r from-blue-400 to-violet-600',
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
                <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
                    {label && <span>{label}</span>}
                    {showPercentage && <span>{Math.round(pct)}%</span>}
                </div>
            )}
            <div className={cn('w-full rounded-full bg-theme-tertiary/40 backdrop-blur-sm border border-white/5 overflow-hidden', HEIGHTS[height])}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]', TIER_COLORS[tier])}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
