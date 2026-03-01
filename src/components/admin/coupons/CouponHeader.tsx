import { Ticket, Plus } from 'lucide-react';

interface CouponHeaderProps {
    onNewCoupon: () => void;
}

export function CouponHeader({ onNewCoupon }: CouponHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-primary/10 p-6 sm:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Soft Ambient Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full md:w-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-fuchsia-600/10 rounded-2xl border border-purple-500/20 shadow-inner">
                        <Ticket className="h-7 w-7 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
                    </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-theme-primary drop-shadow-sm tracking-tight mb-2">
                    Centro de Promociones
                </h1>
                <p className="text-sm font-medium text-theme-secondary max-w-2xl leading-relaxed">
                    Orquesta campañas de descuentos. Crea, pausa y analiza los cupones activos de toda la tienda con límites dinámicos de redención.
                </p>
            </div>
            
            <div className="relative z-10 w-full md:w-auto mt-4 md:mt-0 flex">
                 <button
                    type="button"
                    onClick={onNewCoupon}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 text-white px-6 py-3.5 rounded-xl font-black tracking-wide transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                 >
                     <Plus className="w-5 h-5" />
                     NUEVO CUPÓN
                 </button>
            </div>
        </div>
    );
}
