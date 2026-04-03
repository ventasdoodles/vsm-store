import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StorefrontCheckoutTransitionView } from '@/lib/domain/cart';

interface CheckoutTransitionStatusProps {
    view: StorefrontCheckoutTransitionView;
    compact?: boolean;
    onDependencyAction?: ((missingProduct: NonNullable<StorefrontCheckoutTransitionView['dependencyGuidance']>['missingProduct']) => void) | null;
}

export function CheckoutTransitionStatus({
    view,
    compact = false,
    onDependencyAction = null,
}: CheckoutTransitionStatusProps) {
    const isReady = view.status === 'ready';
    const isBlocked = view.status === 'blocked';
    const Icon = isReady ? CheckCircle2 : isBlocked ? AlertCircle : RefreshCw;

    return (
        <div
            className={cn(
                'rounded-2xl border p-4',
                isReady && 'border-herbal-500/20 bg-herbal-500/5',
                view.status === 'review' && 'border-amber-500/20 bg-amber-500/5',
                isBlocked && 'border-red-500/20 bg-red-500/5',
                compact && 'p-3',
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'mt-0.5 rounded-full p-2',
                        isReady && 'bg-herbal-500/15 text-herbal-400',
                        view.status === 'review' && 'bg-amber-500/15 text-amber-400',
                        isBlocked && 'bg-red-500/15 text-red-400',
                    )}
                >
                    <Icon className={cn('h-4 w-4', view.status === 'review' && 'animate-pulse')} />
                </div>
                <div className="min-w-0 flex-1">
                    <p
                        className={cn(
                            'text-xs font-black uppercase tracking-widest',
                            isReady && 'text-herbal-400',
                            view.status === 'review' && 'text-amber-400',
                            isBlocked && 'text-red-400',
                        )}
                    >
                        {view.headline}
                    </p>
                    <p className={cn('mt-2 text-sm text-theme-secondary', compact && 'text-xs')}>
                        {view.detail}
                    </p>
                    {(view.blockingIssueCount > 0 || view.warningIssueCount > 0) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {view.blockingIssueCount > 0 && (
                                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300">
                                    {view.blockingIssueCount} cambio{view.blockingIssueCount === 1 ? '' : 's'} critico{view.blockingIssueCount === 1 ? '' : 's'}
                                </span>
                            )}
                            {view.warningIssueCount > 0 && (
                                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                                    {view.warningIssueCount} ajuste{view.warningIssueCount === 1 ? '' : 's'} aplicado{view.warningIssueCount === 1 ? '' : 's'}
                                </span>
                            )}
                        </div>
                    )}
                    {view.dependencyGuidance && (
                        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-black/20 p-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                                {view.dependencyGuidance.headline}
                            </p>
                            <p className={cn('mt-2 text-sm text-theme-secondary', compact && 'text-xs')}>
                                {view.dependencyGuidance.detail}
                            </p>
                            {onDependencyAction && (
                                <button
                                    type="button"
                                    onClick={() => onDependencyAction(view.dependencyGuidance!.missingProduct)}
                                    className={cn(
                                        'mt-3 inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300 transition-colors hover:bg-amber-500/20',
                                        compact && 'px-2.5 py-1 text-[9px]',
                                    )}
                                >
                                    {view.dependencyGuidance.actionLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
