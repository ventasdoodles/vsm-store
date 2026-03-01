import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StatsProps {
    stats: {
        total: number;
        active: number;
        featured: number;
        avgRating: string;
        vape: number;
        herbal: number;
    };
}

export function TestimonialsStats({ stats }: StatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 py-4">
            <StatBadge label="Total" value={stats.total} color="default" />
            <StatBadge label="Activos" value={stats.active} color="emerald" gradient="from-emerald-500/10 to-transparent" />
            <StatBadge label="Destacados" value={stats.featured} color="amber" gradient="from-amber-500/10 to-transparent" />
            <StatBadge 
                label="Rating Promedio" 
                value={stats.avgRating} 
                color="yellow" 
                icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />} 
                gradient="from-yellow-500/10 to-transparent"
            />
            <StatBadge label="Vape" value={stats.vape} color="vape" gradient="from-vape-500/10 to-transparent" />
            <StatBadge label="420" value={stats.herbal} color="herbal" gradient="from-herbal-500/10 to-transparent" />
        </div>
    );
}

function StatBadge({
    label,
    value,
    color = 'default',
    icon,
    gradient = 'from-white/5 to-transparent'
}: {
    label: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
    gradient?: string;
}) {
    const colorMap: Record<string, string> = {
        default: 'text-theme-primary',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        yellow: 'text-amber-400',
        vape: 'text-vape-400',
        herbal: 'text-herbal-400',
    };

    const borderMap: Record<string, string> = {
        default: 'border-white/10 focus-within:border-white/20',
        emerald: 'border-emerald-500/20 shadow-emerald-500/5',
        amber: 'border-amber-500/20 shadow-amber-500/5',
        yellow: 'border-yellow-500/20 shadow-amber-500/5',
        vape: 'border-vape-500/20 shadow-vape-500/5',
        herbal: 'border-herbal-500/20 shadow-herbal-500/5',
    };

    return (
        <div className={cn(
            'relative overflow-hidden p-5 rounded-2xl bg-theme-secondary/20 backdrop-blur-md border shadow-lg transition-all hover:scale-[1.02]',
            borderMap[color] || borderMap.default
        )}>
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', gradient)} />
            
            <div className="relative z-10 text-center space-y-2">
                <div className={cn('text-3xl font-black tabular-nums tracking-tight flex items-center justify-center gap-1.5', colorMap[color])}>
                    {icon}
                    {value}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-theme-secondary/80">
                    {label}
                </p>
            </div>
        </div>
    );
}
