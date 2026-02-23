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
        text: 'text-gray-300',
        bg: 'bg-gray-300/10',
        border: 'border-gray-300/30',
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
        border: 'border-violet-400/30',
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
        <section className="relative overflow-hidden rounded-2xl border border-theme bg-theme-secondary/30 backdrop-blur-xl p-6 sm:p-8">
            {/* Background gradient accent */}
            <div className={cn(
                'absolute -top-24 -right-24 h-48 w-48 rounded-full blur-[80px] opacity-30',
                `bg-gradient-to-br ${config.gradient}`
            )} />
            <div className={cn(
                'absolute -bottom-16 -left-16 h-32 w-32 rounded-full blur-[60px] opacity-20',
                `bg-gradient-to-br ${config.gradient}`
            )} />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar with tier glow */}
                <div className={cn(
                    'flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl',
                    'bg-gradient-to-br text-white text-2xl font-black',
                    'ring-2 shadow-xl transition-all duration-500 hover:scale-105',
                    config.gradient, config.ring, config.glow
                )}>
                    {initial}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h1 className="text-2xl font-bold text-theme-primary truncate">
                        {displayName}
                    </h1>
                    <p className="text-sm text-theme-secondary truncate mt-0.5">
                        {user?.email}
                    </p>

                    {/* Tier badge */}
                    <div className={cn(
                        'mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider',
                        'backdrop-blur-sm transition-all duration-300 hover:scale-105',
                        config.text, config.bg, config.border
                    )}>
                        <Crown className="h-3.5 w-3.5" />
                        {config.label}
                        <Sparkles className="h-3 w-3 animate-pulse" />
                    </div>

                    {memberSince && (
                        <p className="text-xs text-theme-tertiary mt-2">
                            Miembro desde {memberSince}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
