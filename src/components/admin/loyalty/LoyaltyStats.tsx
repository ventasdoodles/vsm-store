import { useLoyaltyStats } from '@/hooks/useLoyaltyStats';
import { Loader2, TrendingUp, History, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoyaltyStats() {
    const { data, isLoading } = useLoyaltyStats();

    if (isLoading) {
        return (
            <div className="bg-[#13141f]/50 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500/50" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta 1: Puntos Emitidos Hoy */}
            <div className="bg-gradient-to-br from-[#181825] to-[#181825]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all opacity-50" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-widest">Emitidos Hoy</h3>
                </div>
                <div className="relative z-10 mt-2">
                    <div className="text-4xl font-black text-theme-primary tracking-tighter">
                        +{data.puntos_hoy.toLocaleString('es-MX')}
                    </div>
                    <p className="text-xs font-medium text-emerald-400 mt-1">V-Coins otorgados en compras</p>
                </div>
            </div>

            {/* Tarjeta 2: Último Canje */}
            <div className="bg-gradient-to-br from-[#181825] to-[#181825]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all opacity-50" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <History className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-widest">Último Canje</h3>
                </div>
                <div className="relative z-10 mt-2">
                    {data.ultimo_canje?.created_at ? (
                        <>
                            <div className="text-2xl font-black text-theme-primary truncate">
                                -{data.ultimo_canje.points} V-Coins
                            </div>
                            <p className="text-xs font-medium text-theme-secondary mt-1 flex items-center gap-1.5 truncate">
                                <User className="w-3 h-3" />
                                {data.ultimo_canje.full_name || 'Desconocido'}
                            </p>
                            <p className="text-[10px] text-theme-secondary/50 font-bold uppercase mt-2 tracking-wider">
                                {new Date(data.ultimo_canje.created_at).toLocaleDateString('es-MX', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-theme-secondary/50 font-medium italic mt-4">Nadie ha canjeado puntos aún</p>
                    )}
                </div>
            </div>

            {/* Tarjeta 3: Top 3 Usuarios */}
            <div className="bg-gradient-to-br from-[#181825] to-[#181825]/80 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(251,191,36,0.05)] relative overflow-hidden flex flex-col">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
                        <Trophy className="w-5 h-5 drop-shadow-sm" />
                    </div>
                    <h3 className="text-sm font-bold text-amber-500/80 uppercase tracking-widest">Top 3 Holders</h3>
                </div>

                <div className="flex-1 relative z-10 space-y-3 mt-1">
                    {data.top_usuarios.length > 0 ? (
                        data.top_usuarios.map((user, idx) => (
                            <div key={user.id} className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2 border border-white/[0.02]">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className={cn(
                                        "text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                        idx === 0 ? "bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.4)]" :
                                        idx === 1 ? "bg-zinc-300 text-black" :
                                        "bg-amber-700/50 text-white"
                                    )}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-theme-primary truncate">
                                        {user.full_name || 'Usuario'}
                                    </span>
                                </div>
                                <span className="text-xs font-black text-amber-400 ml-2 shrink-0">
                                    {user.balance.toLocaleString('es-MX')} pt
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-xs text-theme-secondary/50 font-medium italic mb-4">No hay clientes con saldo</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
