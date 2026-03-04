// Página de programa de lealtad - VSM Store
import { useEffect } from 'react';
import { Award, Loader2, Gift, Star } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePointsBalance, usePointsHistory, useTierProgress, useRedeemPoints } from '@/hooks/useLoyalty';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useNotification } from '@/hooks/useNotification';
import { TierBadge } from '@/components/loyalty/TierBadge';
import { PointsDisplay } from '@/components/loyalty/PointsDisplay';
import { ProgressBar } from '@/components/loyalty/ProgressBar';
import { TIERS, pointsToPesos } from '@/services/loyalty.service';
import type { Tier } from '@/services/loyalty.service';

export function Loyalty() {
    const { user } = useAuth();
    const { data: settings } = useStoreSettings();
    const { data: points = 0, isLoading: loadingPoints } = usePointsBalance(user?.id);
    const { data: history = [], isLoading: loadingHistory } = usePointsHistory(user?.id);
    const { data: tierData, isLoading: loadingTier } = useTierProgress(user?.id);
    const redeemMutation = useRedeemPoints();
    const notify = useNotification();

    useEffect(() => {
        document.title = 'Programa de Lealtad | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    const isLoading = loadingPoints || loadingTier;

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-vape-500" />
            </div>
        );
    }

    const currentTier = tierData?.currentTier ?? 'bronze';
    
    const loyaltyConfig = settings?.loyalty_config || {
        points_per_currency: 0.1,
        currency_per_point: 0.1,
        min_points_to_redeem: 100,
        max_points_per_order: 1000,
        points_expiry_days: 365,
        enable_loyalty: true
    };

    const canRedeem = points >= loyaltyConfig.min_points_to_redeem;

    const handleRedeem = async () => {
        if (!user || !canRedeem) return;
        try {
            const { discount } = await redeemMutation.mutateAsync({ customerId: user.id, points: loyaltyConfig.min_points_to_redeem });
            notify.success('¡Puntos canjeados!', `Has canjeado ${loyaltyConfig.min_points_to_redeem} puntos por un descuento de $${discount}. Se aplicará en tu próxima compra.`);
        } catch {
            notify.error('Error', 'No se pudieron canjear los puntos. Intenta de nuevo.');
        }
    };

    return (
        <div className="container-vsm py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
                    <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <h1 className="text-xl font-bold text-theme-primary">Programa de Lealtad</h1>
            </div>

            {/* ─── SECCIÓN 1: Tier actual ─── */}
            <div className="rounded-xl border border-theme bg-theme-primary/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-theme-secondary mb-1">Tu nivel actual</p>
                        <TierBadge tier={currentTier} size="lg" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-theme-secondary">Total gastado</p>
                        <p className="text-lg font-bold text-theme-primary">{formatPrice(tierData?.totalSpent ?? 0)}</p>
                    </div>
                </div>

                {tierData?.nextTier && (
                    <div className="space-y-2">
                        <ProgressBar
                            value={tierData.progress}
                            tier={currentTier}
                            height="md"
                            showPercentage
                        />
                        <p className="text-xs text-theme-secondary">
                            Gasta <strong className="text-theme-secondary">{formatPrice(tierData.remaining)}</strong> más para alcanzar{' '}
                            <TierBadge tier={tierData.nextTier as Tier} size="sm" />
                        </p>
                    </div>
                )}

                {tierData?.tierInfo && (
                    <div className="pt-2 border-t border-theme-strong">
                        <p className="text-xs font-medium text-theme-secondary mb-2">Tus beneficios:</p>
                        <ul className="space-y-1">
                            {tierData.tierInfo.benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-theme-secondary">
                                    <span className="text-herbal-400 mt-0.5">✓</span> {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* ─── SECCIÓN 2: Puntos ─── */}
            <div className="rounded-xl border border-theme bg-theme-primary/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-theme-secondary mb-1">Tus puntos</p>
                        <PointsDisplay points={points} size="lg" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-theme-secondary">Equivalente</p>
                        <p className="text-lg font-bold text-herbal-400">{formatPrice(pointsToPesos(points, loyaltyConfig.currency_per_point))}</p>
                    </div>
                </div>

                <button
                    onClick={handleRedeem}
                    disabled={!canRedeem || redeemMutation.isPending}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
                        canRedeem
                            ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                            : 'bg-theme-secondary text-accent-primary cursor-not-allowed'
                    )}
                >
                    <Gift className="h-4 w-4" />
                    {canRedeem ? `Canjear ${loyaltyConfig.min_points_to_redeem} puntos por ${formatPrice(pointsToPesos(loyaltyConfig.min_points_to_redeem, loyaltyConfig.currency_per_point))}` : `Necesitas al menos ${loyaltyConfig.min_points_to_redeem} puntos`}
                </button>

                {/* Historial */}
                <div className="pt-3 border-t border-theme-strong">
                    <p className="text-xs font-medium text-theme-secondary mb-3">Historial de puntos</p>
                    {loadingHistory ? (
                        <Loader2 className="h-4 w-4 animate-spin text-accent-primary mx-auto" />
                    ) : history.length === 0 ? (
                        <p className="text-xs text-accent-primary text-center py-4">Aún no has acumulado puntos</p>
                    ) : (
                        <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                            {history.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-theme-secondary/30">
                                    <div>
                                        <p className="text-xs text-theme-secondary">{tx.description}</p>
                                        <p className="text-xs text-accent-primary">
                                            {new Date(tx.created_at).toLocaleDateString('es-MX', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        'text-sm font-bold',
                                        tx.points > 0 ? 'text-herbal-400' : 'text-red-400'
                                    )}>
                                        {tx.points > 0 ? '+' : ''}{tx.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── SECCIÓN 3: Beneficios por tier ─── */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-theme-secondary">Niveles del programa</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {(Object.entries(TIERS) as [Tier, typeof TIERS[Tier]][]).map(([tier, info]) => (
                        <div
                            key={tier}
                            className={cn(
                                'rounded-xl border p-4 space-y-2 transition-all',
                                tier === currentTier
                                    ? 'border-vape-500/30 bg-vape-500/5 ring-1 ring-vape-500/10'
                                    : 'border-theme bg-theme-primary/30'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <TierBadge tier={tier} size="md" />
                                {tier === currentTier && (
                                    <span className="text-xs font-medium text-vape-400">Tu nivel</span>
                                )}
                            </div>
                            {info.minSpent > 0 && (
                                <p className="text-xs text-accent-primary">
                                    Desde {formatPrice(info.minSpent)} gastados
                                </p>
                            )}
                            <ul className="space-y-0.5">
                                {info.benefits.map((b, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-theme-secondary">
                                        <Star className="h-2.5 w-2.5 text-yellow-500 mt-0.5 flex-shrink-0" /> {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
