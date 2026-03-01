import { Settings, ExternalLink, Calculator } from 'lucide-react';
import type { LoyaltyConfig } from '@/services/settings.service';

export function LoyaltySimulator({ config }: { config: LoyaltyConfig }) {
    const examplePurchase = 1000;
    const pointsGained = examplePurchase * config.points_per_currency;
    const discountValue = pointsGained * config.currency_per_point;

    return (
        <div className="bg-gradient-to-br from-theme-primary/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row gap-8 items-center lg:items-start group transition-all hover:bg-theme-primary/20">
            {/* Background elements */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calculator className="w-40 h-40 text-amber-500" />
            </div>
            
            <div className="flex-1 relative z-10 space-y-4 w-full">
                <h3 className="text-xl font-black text-theme-primary flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-400" />
                    Simulador V-Coins
                </h3>
                <p className="text-sm text-theme-secondary leading-relaxed">
                    Así funcionará el sistema para un cliente que realiza una compra promedio de <strong>${examplePurchase.toLocaleString('es-MX')} MXN</strong> hoy:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black uppercase text-theme-secondary/60 tracking-widest block mb-2">1. Gana Puntos</span>
                        <div className="text-2xl font-black text-theme-primary tabular-nums tracking-tighter">
                            +{pointsGained.toLocaleString('es-MX')} <span className="text-sm font-bold text-emerald-400 tracking-normal">V-Coins</span>
                        </div>
                    </div>
                    
                    <div className="bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black uppercase text-theme-secondary/60 tracking-widest block mb-2">2. Futuro Descuento</span>
                        <div className="text-2xl font-black text-theme-primary tabular-nums tracking-tighter">
                            -${discountValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-amber-400 tracking-normal">MXN</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-theme-secondary/50 font-medium">
                    <p>El retorno de inversión (ROI) otorgado es del <span className="text-amber-400 font-bold">{(config.points_per_currency * config.currency_per_point * 100).toFixed(1)}%</span></p>
                    <a href="/loyalty" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                        Ver frontend <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
