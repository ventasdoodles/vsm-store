// Página de programa de lealtad - VSM Store
import { useEffect } from 'react';
import { Award, Loader2, Gift, Star } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePointsBalance, usePointsHistory, useTierProgress, useRedeemPoints } from '@/hooks/useLoyalty';
import { TierBadge } from '@/components/loyalty/TierBadge';
import { PointsDisplay } from '@/components/loyalty/PointsDisplay';
import { ProgressBar } from '@/components/loyalty/ProgressBar';
import { TIERS, pointsToPesos } from '@/services/loyalty.service';
import type { Tier } from '@/services/loyalty.service';

export function Loyalty() {
    const { user } = useAuth();
    const { data: points = 0, isLoading: loadingPoints } = usePointsBalance(user?.id);
    const { data: history = [], isLoading: loadingHistory } = usePointsHistory(user?.id);
    const { data: tierData, isLoading: loadingTier } = useTierProgress(user?.id);
    const redeemMutation = useRedeemPoints();

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
    const canRedeem = points >= 1000;

    const handleRedeem = async () => {
        if (!user || !canRedeem) return;
        try {
            const { discount } = await redeemMutation.mutateAsync({ customerId: user.id, points: 1000 });
            alert(`¡Has canjeado 1,000 puntos por un descuento de $${discount}! Se aplicará en tu próxima compra.`);
        } catch {
            alert('Error al canjear puntos');
        }
    };

    return (
        <div className="container-vsm py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
                    <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <h1 className="text-xl font-bold text-primary-100">Programa de Lealtad</h1>
            </div>

            {/* ─── SECCIÓN 1: Tier actual ─── */}
            <div className="rounded-xl border border-primary-800 bg-primary-900/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-primary-500 mb-1">Tu nivel actual</p>
                        <TierBadge tier={currentTier} size="lg" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-primary-500">Total gastado</p>
                        <p className="text-lg font-bold text-primary-200">{formatPrice(tierData?.totalSpent ?? 0)}</p>
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
                        <p className="text-xs text-primary-500">
                            Gasta <strong className="text-primary-300">{formatPrice(tierData.remaining)}</strong> más para alcanzar{' '}
                            <TierBadge tier={tierData.nextTier as Tier} size="sm" />
                        </p>
                    </div>
                )}

                {tierData?.tierInfo && (
                    <div className="pt-2 border-t border-primary-800/50">
                        <p className="text-xs font-medium text-primary-400 mb-2">Tus beneficios:</p>
                        <ul className="space-y-1">
                            {tierData.tierInfo.benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-primary-500">
                                    <span className="text-herbal-400 mt-0.5">✓</span> {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* ─── SECCIÓN 2: Puntos ─── */}
            <div className="rounded-xl border border-primary-800 bg-primary-900/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-primary-500 mb-1">Tus puntos</p>
                        <PointsDisplay points={points} size="lg" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-primary-500">Equivalente</p>
                        <p className="text-lg font-bold text-herbal-400">{formatPrice(pointsToPesos(points))}</p>
                    </div>
                </div>

                <button
                    onClick={handleRedeem}
                    disabled={!canRedeem || redeemMutation.isPending}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
                        canRedeem
                            ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                            : 'bg-primary-800 text-primary-600 cursor-not-allowed'
                    )}
                >
                    <Gift className="h-4 w-4" />
                    {canRedeem ? 'Canjear 1,000 puntos por $100' : 'Necesitas al menos 1,000 puntos'}
                </button>

                {/* Historial */}
                <div className="pt-3 border-t border-primary-800/50">
                    <p className="text-xs font-medium text-primary-400 mb-3">Historial de puntos</p>
                    {loadingHistory ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary-600 mx-auto" />
                    ) : history.length === 0 ? (
                        <p className="text-xs text-primary-600 text-center py-4">Aún no has acumulado puntos</p>
                    ) : (
                        <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                            {history.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-primary-800/30">
                                    <div>
                                        <p className="text-xs text-primary-300">{tx.description}</p>
                                        <p className="text-[10px] text-primary-600">
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
                <h2 className="text-sm font-semibold text-primary-300">Niveles del programa</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {(Object.entries(TIERS) as [Tier, typeof TIERS[Tier]][]).map(([tier, info]) => (
                        <div
                            key={tier}
                            className={cn(
                                'rounded-xl border p-4 space-y-2 transition-all',
                                tier === currentTier
                                    ? 'border-vape-500/30 bg-vape-500/5 ring-1 ring-vape-500/10'
                                    : 'border-primary-800 bg-primary-900/30'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <TierBadge tier={tier} size="md" />
                                {tier === currentTier && (
                                    <span className="text-[10px] font-medium text-vape-400">Tu nivel</span>
                                )}
                            </div>
                            {info.minSpent > 0 && (
                                <p className="text-[10px] text-primary-600">
                                    Desde {formatPrice(info.minSpent)} gastados
                                </p>
                            )}
                            <ul className="space-y-0.5">
                                {info.benefits.map((b, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-primary-500">
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
