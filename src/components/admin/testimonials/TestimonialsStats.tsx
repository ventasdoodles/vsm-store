import { buildAdminSectionCatalog } from '@/config/productization';
import type { Section } from '@/types/constants';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StatsProps {
    stats: {
        total: number;
        active: number;
        featured: number;
        avgRating: string;
    };
    sectionCounts: Record<Section, number>;
}

export function TestimonialsStats({ stats, sectionCounts }: StatsProps) {
    const adminSectionCatalog = buildAdminSectionCatalog();

    return (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 py-4">
            <StatBadge label="Total" value={stats.total} />
            <StatBadge
                label="Activos"
                value={stats.active}
                textClassName="text-emerald-400"
                borderClassName="border-emerald-500/20 shadow-emerald-500/5"
                gradient="bg-gradient-to-br from-emerald-500/10 to-transparent"
            />
            <StatBadge
                label="Destacados"
                value={stats.featured}
                textClassName="text-amber-400"
                borderClassName="border-amber-500/20 shadow-amber-500/5"
                gradient="bg-gradient-to-br from-amber-500/10 to-transparent"
            />
            <StatBadge 
                label="Rating Promedio" 
                value={stats.avgRating} 
                textClassName="text-amber-400"
                borderClassName="border-yellow-500/20 shadow-amber-500/5"
                icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />} 
                gradient="bg-gradient-to-br from-yellow-500/10 to-transparent"
            />
            {adminSectionCatalog.sections.map((section) => (
                <StatBadge
                    key={section.slug}
                    label={section.displayLabel}
                    value={sectionCounts[section.slug] ?? 0}
                    textClassName={section.badgeClassName}
                    borderClassName={section.ringClassName}
                    gradient={`bg-gradient-to-br ${section.guideClassName}`}
                />
            ))}
        </div>
    );
}

function StatBadge({
    label,
    value,
    textClassName = 'text-theme-primary',
    borderClassName = 'border-white/10 focus-within:border-white/20',
    icon,
    gradient = 'bg-gradient-to-br from-white/5 to-transparent'
}: {
    label: string;
    value: string | number;
    textClassName?: string;
    borderClassName?: string;
    icon?: React.ReactNode;
    gradient?: string;
}) {
    return (
        <div className={cn(
            'relative overflow-hidden p-5 rounded-2xl bg-theme-secondary/20 backdrop-blur-md border shadow-lg transition-all hover:scale-[1.02]',
            borderClassName
        )}>
            <div className={cn('absolute inset-0 opacity-50', gradient)} />
            
            <div className="relative z-10 text-center space-y-2">
                <div className={cn('text-3xl font-black tabular-nums tracking-tight flex items-center justify-center gap-1.5', textClassName)}>
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
