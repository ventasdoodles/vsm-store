/**
 * // ─── COMPONENTE: LiveUsersPanel ───
 * // Arquitectura: Dumb Component (Visual Card List)
 * // Proposito principal: Mostrar usuarios activos en tiempo real con tarjetas tipo "radar".
 * // Regla / Notas: Cada usuario se muestra como un card con email, ruta, tiempo de sesion y pulso.
 *                    Usa flex list, NO <table>. Recibe array ya procesado del Orchestrator.
 */
import { User, MapPin, Clock, Wifi } from 'lucide-react';

export interface ActiveUser {
    id: string;
    email: string;
    path: string;
    joined_at: string;
    session_start: number;
    last_active: number;
}

interface LiveUsersPanelProps {
    users: ActiveUser[];
}

export function LiveUsersPanel({ users }: LiveUsersPanelProps) {
    return (
        <div className="space-y-4">
            {/* Section Title */}
            <div className="flex items-center gap-3 px-1">
                <div className="h-5 w-1.5 rounded-full bg-emerald-400" />
                <h2 className="text-lg font-black text-white tracking-tight">
                    Usuarios en Vivo
                </h2>
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-emerald-400/60 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {users.length} conectados
                </span>
            </div>

            {/* Users List */}
            {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-[1.5rem] border border-white/5 bg-[#13141f]/40 backdrop-blur-md">
                    <div className="relative mb-4">
                        <Wifi className="h-12 w-12 text-theme-secondary/20" />
                        <div className="absolute inset-0 animate-ping">
                            <Wifi className="h-12 w-12 text-theme-secondary/10" />
                        </div>
                    </div>
                    <p className="text-sm font-black text-theme-secondary/50 uppercase tracking-widest">
                        Sin usuarios activos
                    </p>
                    <p className="text-xs text-theme-secondary/30 mt-1">
                        Esperando conexiones en tiempo real...
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => {
                        const sessionMinutes = Math.floor((Date.now() - user.session_start) / 1000 / 60);
                        const isAnonymous = !user.email || user.email === 'Anonimo';

                        return (
                            <div
                                key={user.id}
                                className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-[#13141f]/40 hover:bg-[#13141f]/70 backdrop-blur-md p-5 transition-all duration-500 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5"
                            >
                                {/* Ambient Glow */}
                                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/5 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="relative z-10 flex items-center gap-4">
                                    {/* Avatar + Pulse */}
                                    <div className="relative shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center">
                                            <User className={`h-5 w-5 ${isAnonymous ? 'text-theme-secondary/50' : 'text-emerald-400'}`} />
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#13141f]" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-white truncate group-hover:text-emerald-400 transition-colors">
                                            {isAnonymous ? 'Visitante Anonimo' : user.email}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-[11px] text-theme-secondary/60">
                                                <MapPin className="h-3 w-3" />
                                                <span className="font-mono truncate max-w-[180px]">{user.path}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Session Time */}
                                    <div className="shrink-0 text-right">
                                        <div className="flex items-center gap-1.5 text-theme-secondary/70">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-xs font-black">
                                                {sessionMinutes < 1 ? '<1' : sessionMinutes} min
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-mono text-theme-secondary/40 mt-0.5 truncate max-w-[100px]">
                                            {user.id.substring(0, 12)}...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
