import { Copy, Truck } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

interface OrderShippingCardProps {
    trackingTrustView: {
        showPanel: boolean;
        title: string;
        subtitle: string;
        headline: string;
        detail: string;
        showTrackingNumber: boolean;
        trackingNumber: string | null;
        canCopyTrackingNumber: boolean;
        showTrackingNotes: boolean;
        trackingNotes: string | null;
    };
}

export function OrderShippingCard({ trackingTrustView }: OrderShippingCardProps) {
    const notify = useNotification();

    if (!trackingTrustView.showPanel) return null;

    return (
        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 space-y-6 group/tracking overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-accent-primary/5 rounded-full blur-2xl transition-all duration-700 group-hover/tracking:scale-150" />
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shadow-xl">
                    <Truck size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{trackingTrustView.title}</h3>
                    <p className="text-[10px] text-theme-tertiary font-bold uppercase opacity-60">{trackingTrustView.subtitle}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    {trackingTrustView.headline}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-theme-secondary/80 leading-relaxed">
                    {trackingTrustView.detail}
                </p>
            </div>
            
            <div className="space-y-4">
                {trackingTrustView.showTrackingNumber && trackingTrustView.trackingNumber && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest px-1">Número de Guía</p>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5 group/copy transition-all hover:border-accent-primary/30">
                            <p className="text-sm font-black text-accent-primary font-mono tracking-tighter uppercase italic">{trackingTrustView.trackingNumber}</p>
                            {trackingTrustView.canCopyTrackingNumber && (
                                <button
                                    onClick={() => {
                                        void navigator.clipboard.writeText(trackingTrustView.trackingNumber!);
                                        notify.success('Copiado', 'Número de guía listo.');
                                    }}
                                    className="text-theme-tertiary hover:text-white transition-colors"
                                >
                                    <Copy size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {trackingTrustView.showTrackingNotes && trackingTrustView.trackingNotes && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest px-1">Notas de Envío</p>
                        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                            <p className="text-xs text-theme-secondary leading-relaxed">
                                {trackingTrustView.trackingNotes}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
