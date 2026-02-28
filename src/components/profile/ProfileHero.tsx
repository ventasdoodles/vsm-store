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

    const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? '...';
    const initial = displayName[0]?.toUpperCase() ?? '?';
    const tier: CustomerTier = (profile?.customer_tier as CustomerTier) ?? 'bronze';
    const config = TIER_CONFIG[tier];

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
        : null;

    return (
        <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10 glass-premium spotlight-container">
            {/* Background gradient accent - More refined */}
            <div className={cn(
                'absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[100px] opacity-20 animate-pulse-slow',
                `bg-gradient-to-br ${config.gradient}`
            )} />
            <div className={cn(
                'absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-[80px] opacity-10 animate-pulse-slow',
                `bg-gradient-to-br ${config.gradient}`
            )} style={{ animationDelay: '2s' }} />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar with premium tier glow */}
                <div className="relative group/avatar">
                    <div className={cn(
                        'absolute inset-0 blur-2xl opacity-40 transition-opacity group-hover/avatar:opacity-70',
                        config.bg
                    )} />
                    <div className={cn(
                        'relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl',
                        'bg-gradient-to-br text-3xl font-black text-white shadow-2xl transition-all duration-700 hover:scale-105',
                        config.gradient, config.glow
                    )}>
                        {initial}
                    </div>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-theme-primary truncate tracking-tighter uppercase italic">
                            {displayName}
                        </h1>
                        <p className="text-sm font-medium text-theme-tertiary truncate opacity-60">
                            {user?.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        {/* Tier badge */}
                        <div className={cn(
                            'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest',
                            'backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-xl',
                            config.text, 'bg-white/5', config.border
                        )}>
                            <Crown className="h-4 w-4" />
                            {config.label}
                            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                        </div>

                        {memberSince && (
                              <div className="px-3 py-1.5 rounded-lg bg-white/5 vsm-border-subtle text-xs uppercase tracking-widest font-bold text-theme-tertiary opacity-40">
                                Miembro desde {memberSince}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
