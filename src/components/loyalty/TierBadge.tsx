// Badge visual de tier - VSM Store
import { Award, Shield, Crown, Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tier } from '@/services/loyalty.service';

interface TierBadgeProps {
    tier: Tier;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const TIER_STYLES: Record<Tier, { bg: string; text: string; border: string; icon: typeof Award }> = {
    bronze: { bg: 'bg-orange-900/30', text: 'text-orange-300', border: 'border-orange-700/40', icon: Award },
    silver: { bg: 'bg-theme-secondary0/20', text: 'text-gray-300', border: 'border-gray-500/30', icon: Shield },
    gold: { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: Crown },
    platinum: { bg: 'bg-accent-primary/15', text: 'text-accent-primary', border: 'border-purple-500/30', icon: Diamond },
};

const TIER_LABELS: Record<Tier, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
};

const SIZES = {
    sm: { wrapper: 'gap-1 px-2 py-0.5 text-[10px]', icon: 'h-3 w-3' },
    md: { wrapper: 'gap-1.5 px-3 py-1 text-xs', icon: 'h-3.5 w-3.5' },
    lg: { wrapper: 'gap-2 px-4 py-2 text-sm', icon: 'h-5 w-5' },
};

export function TierBadge({ tier, size = 'md', showLabel = true }: TierBadgeProps) {
    const style = TIER_STYLES[tier];
    const sizeStyle = SIZES[size];
    const Icon = style.icon;

    return (
        <span className={cn(
            'inline-flex items-center rounded-full border font-semibold',
            style.bg, style.text, style.border,
            sizeStyle.wrapper
        )}>
            <Icon className={sizeStyle.icon} />
            {showLabel && TIER_LABELS[tier]}
        </span>
    );
}
