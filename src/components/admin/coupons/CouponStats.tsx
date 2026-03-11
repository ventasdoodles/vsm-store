import { Ticket, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { AdminCoupon } from '@/services/admin';

interface Props {
    coupons: AdminCoupon[];
}

export function CouponStats({ coupons }: Props) {
    const now = new Date();

    const active = coupons.filter(c =>                                                                                                                                                               
        c.is_active &&                                                                                                                                                                              
        (!c.valid_until || new Date(c.valid_until) > now) &&                                                                                                                                        
        (!c.max_uses || c.used_count < c.max_uses)                                                                                                                                                  
    ).length;                                                                                                                                                                                       
                                                                                                                                                                                                    
    const depleted = coupons.filter(c =>                                                                                                                                                            
        c.max_uses && c.used_count >= c.max_uses                                                                                                                                                    
    ).length;                                                                                                                                                                                       
                                                                                                                                                                                                    
    const expired = coupons.filter(c =>                                                                                                                                                             
        c.valid_until && new Date(c.valid_until) < now                                                                                                                                              
    ).length;                                                                                                                                                                                       
                                                                                                                                                                                                    
    const totalUses = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Activos */}
            <div className="bg-gradient-to-br from-[#181825] to-[#181825]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all opacity-50" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-widest hidden sm:block">Cupones Activos</h3>
                    <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-widest sm:hidden">Activos</h3>
                </div>
                <div className="relative z-10 mt-2">
                    <div className="text-3xl md:text-4xl font-black text-theme-primary tracking-tighter">
                        {active}
                    </div>
                </div>
            </div>

            {/* Agotados */}
            <div className="bg-gradient-to-br from-[#181825] to-[#181825]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all opacity-50" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-widest hidden sm:block">Límite Alcanzado</h3>
                    <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-widest sm:hidden">Agotados</h3>
                </div>
                <div className="relative z-10 mt-2">
                    <div className="text-3xl md:text-4xl font-black text-theme-primary tracking-tighter">
                        {depleted}
                    </div>
                </div>
            </div>

            {/* Expirados */}
            <div className="bg-gradient-to-br from-[#181825] to-[#181825]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all opacity-50" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-widest">Expirados</h3>
                </div>
                <div className="relative z-10 mt-2">
                    <div className="text-3xl md:text-4xl font-black text-theme-primary tracking-tighter">
                        {expired}
                    </div>
                </div>
            </div>

            {/* Usos Totales */}
            <div className="bg-gradient-to-br from-[#181825] to-[#181825]/80 backdrop-blur-md border border-purple-500/20 rounded-3xl p-5 md:p-6 shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all opacity-70" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-inner">
                        <Ticket className="w-5 h-5 drop-shadow-sm" />
                    </div>
                    <h3 className="text-xs font-bold text-purple-500/80 uppercase tracking-widest">Usos Totales</h3>
                </div>
                <div className="relative z-10 mt-2">
                    <div className="text-3xl md:text-4xl font-black text-theme-primary tracking-tighter">
                        {totalUses.toLocaleString('es-MX')}
                    </div>
                </div>
            </div>

        </div>
    );
}
