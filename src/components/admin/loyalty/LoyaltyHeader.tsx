import { Gift } from 'lucide-react';
import type { LoyaltyConfig } from '@/services';

interface LoyaltyHeaderProps {
    loyaltyConfig: LoyaltyConfig;
    onToggleEnable: (val: boolean) => void;
}

export function LoyaltyHeader({ loyaltyConfig, onToggleEnable }: LoyaltyHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-primary/10 p-6 sm:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Soft Ambient Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full md:w-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl border border-amber-500/20 shadow-inner">
                        <Gift className="h-7 w-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                    </div>
                     <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 ring-1 ring-inset ring-amber-500/30">
                        Pro
                    </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-theme-primary drop-shadow-sm tracking-tight mb-2">
                    Programa V-Coins
                </h1>
                <p className="text-sm font-medium text-theme-secondary max-w-2xl leading-relaxed">
                    Gestiona las reglas de tu programa de lealtad. Configura cuÃ¡ntos puntos ganan tus clientes por compra y equivale su valor en pesos para canjes automÃ¡ticos en el checkout.
                </p>
            </div>
            
            <div className="relative z-10 w-full md:w-auto bg-[#13141f]/80 p-1.5 rounded-2xl border border-white/5 flex items-center shadow-inner">
                 <button
                    type="button"
                    onClick={() => onToggleEnable(true)}
                    className={`flex-1 md:w-32 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loyaltyConfig.enable_loyalty ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-theme-secondary hover:text-theme-primary'}`}
                 >
                     Activo
                 </button>
                 <button
                    type="button"
                    onClick={() => onToggleEnable(false)}
                    className={`flex-1 md:w-32 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!loyaltyConfig.enable_loyalty ? 'bg-red-500/20 text-red-400 border border-red-500/20 shadow-inner' : 'text-theme-secondary hover:text-theme-primary'}`}
                 >
                     Apagado
                 </button>
            </div>
        </div>
    );
}

