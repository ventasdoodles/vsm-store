/**
 * ProfileHero — Tarjeta hero del usuario con avatar, nombre, email y tier badge.
 *
 * @module ProfileHero
 * @independent Componente 100% independiente. Lee auth internamente via useAuth().
 * @removable Quitar de Profile.tsx sin consecuencias para el resto de la página.
 */
import { Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTierProgress } from '@/hooks/useLoyalty';
import { formatPrice } from '@/lib/utils';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const TIER_CONFIG = {
    bronze: {
        label: 'Bronze',
        gradient: 'from-amber-700 to-amber-500',
        glow: 'shadow-amber-500/30',
        ring: 'ring-amber-500/40',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
    silver: {
        label: 'Silver',
        gradient: 'from-gray-400 to-gray-300',
        glow: 'shadow-gray-400/30',
        ring: 'ring-gray-400/40',
        text: 'text-theme-secondary',
        bg: 'bg-gray-300/10',
        border: 'border-theme/30',
    },
    gold: {
        label: 'Gold',
        gradient: 'from-yellow-500 to-amber-400',
        glow: 'shadow-yellow-400/40',
        ring: 'ring-yellow-400/40',
        text: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/30',
    },
    platinum: {
        label: 'Platinum',
        gradient: 'from-violet-500 to-indigo-400',
        glow: 'shadow-violet-500/40',
        ring: 'ring-violet-400/40',
        text: 'text-violet-400',
        bg: 'bg-violet-400/10',
        border: 'border-theme/30',
    },
} as const;

export type CustomerTier = keyof typeof TIER_CONFIG;
export { TIER_CONFIG };

export function ProfileHero() {
    const { user, profile } = useAuth();
    const { data: settings } = useStoreSettings();
    const { data: tierProgress } = useTierProgress(user?.id);

    const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? '...';
    const initial = displayName[0]?.toUpperCase() ?? '?';
    const tierKey: CustomerTier = (profile?.customer_tier as CustomerTier) || 'bronze';
    
    // Configuración visual estática mapeada al ID del nivel, con fallback seguro
    const visualConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.bronze;

    // Label dinámico desde el admin si existe
    const dynamicTierInfo = settings?.loyalty_tiers_config?.find(t => t.id === tierKey);
    const tierLabel = dynamicTierInfo?.name || visualConfig.label;

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
        : null;

    return (
        <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10 glass-premium spotlight-container">
            {/* Background gradient accent - More refined */}
            <div className={cn(
                'absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[100px] opacity-20 animate-pulse-slow',
                `bg-gradient-to-br ${visualConfig.gradient}`
            )} />
            <div className={cn(
                'absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-[80px] opacity-10 animate-pulse-slow',
                `bg-gradient-to-br ${visualConfig.gradient}`
            )} style={{ animationDelay: '2s' }} />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar with premium tier glow */}
                <div className="relative group/avatar">
                    <div className={cn(
                        'absolute inset-0 blur-2xl opacity-40 transition-opacity group-hover/avatar:opacity-70',
                        visualConfig.bg
                    )} />
                    <div className={cn(
                        'relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl overflow-hidden',
                        'bg-gradient-to-br shadow-2xl transition-all duration-700 hover:scale-105',
                        visualConfig.gradient, visualConfig.glow
                    )}>
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={displayName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl font-black text-white">{initial}</span>
                        )}
                    </div>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-theme-primary truncate tracking-tighter uppercase italic">
                            {displayName}
                        </h1>
                        <p className="text-sm font-medium text-theme-tertiary truncate opacity-60">
                            {user?.email}
                        </p>
                    </div>

                    {/* Tier Progress - NEW */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            {/* Tier badge */}
                            <div className={cn(
                                'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest',
                                'backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-xl',
                                visualConfig.text, 'bg-white/5', visualConfig.border
                            )}>
                                <Crown className="h-4 w-4" />
                                {tierLabel}
                                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                            </div>

                            {memberSince && (
                                <div className="px-3 py-1.5 rounded-lg bg-white/5 vsm-border-subtle text-xs uppercase tracking-widest font-bold text-theme-tertiary opacity-40">
                                    Miembro desde {memberSince}
                                </div>
                            )}
                        </div>

                        {/* Progress Bar Container */}
                        {tierProgress && tierProgress.nextTier && (
                            <div className="space-y-1.5 max-w-sm mx-auto sm:mx-0">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-theme-tertiary">
                                    <span>Progreso al nivel {settings?.loyalty_tiers_config?.find(t => t.id === tierProgress.nextTier)?.name || tierProgress.nextTier}</span>
                                    <span className={visualConfig.text}>{tierProgress.progress}%</span>
                                </div>
                                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5 vsm-border-subtle">
                                    <div
                                        className={cn("absolute inset-y-0 left-0 transition-all duration-1000 ease-out bg-gradient-to-r", visualConfig.gradient)}
                                        style={{ width: `${tierProgress.progress}%` }}
                                    />
                                    {/* Pulse effect for progress */}
                                    <div
                                        className="absolute inset-y-0 right-0 w-8 bg-white/20 blur-md animate-shimmer"
                                        style={{ left: `${tierProgress.progress - 10}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-medium text-theme-tertiary opacity-60">
                                    Te faltan <span className="text-theme-primary font-bold">{formatPrice(tierProgress.remaining)}</span> para subir de nivel
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
