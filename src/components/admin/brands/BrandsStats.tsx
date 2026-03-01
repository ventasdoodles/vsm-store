import { cn } from '@/lib/utils';
import { Award, ShieldCheck, EyeOff } from 'lucide-react';

interface StatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
}

export function BrandsStats({ stats }: StatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <StatBadge 
                label="Total de Marcas" 
                value={stats.total} 
                icon={<Award className="w-5 h-5 text-theme-primary drop-shadow-sm" />} 
                color="default" 
            />
            <StatBadge 
                label="Marcas Activas" 
                value={stats.active} 
                icon={<ShieldCheck className="w-5 h-5 text-emerald-400 drop-shadow-sm" />} 
                color="emerald" 
                gradient="from-emerald-500/10 to-transparent" 
            />
            <StatBadge 
                label="Marcas Ocultas" 
                value={stats.inactive} 
                icon={<EyeOff className="w-5 h-5 text-red-400 drop-shadow-sm" />} 
                color="red" 
                gradient="from-red-500/10 to-transparent" 
            />
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
        red: 'text-red-400',
    };

    const borderMap: Record<string, string> = {
        default: 'border-white/10 focus-within:border-white/20',
        emerald: 'border-emerald-500/20 shadow-emerald-500/5',
        red: 'border-red-500/20 shadow-red-500/5',
    };

    return (
        <div className={cn(
            'relative overflow-hidden p-6 rounded-2xl bg-theme-secondary/20 backdrop-blur-md border shadow-lg transition-all hover:scale-[1.02]',
            borderMap[color] || borderMap.default
        )}>
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', gradient)} />
            
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
                <div className={cn('text-4xl font-black tabular-nums tracking-tight flex items-center gap-2', colorMap[color])}>
                    {icon}
                    {value}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-theme-secondary/80">
                    {label}
                </p>
            </div>
        </div>
    );
}
