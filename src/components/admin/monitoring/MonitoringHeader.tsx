/**
 * // ─── COMPONENTE: MonitoringHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Cabecera premium del modulo de monitoreo con stats en vivo y orbes de luz.
 * // Regla / Notas: Glassmorphism puro. Recibe el conteo online y el conteo de errores recientes.
 */
import { Activity, Wifi, AlertTriangle } from 'lucide-react';

interface MonitoringHeaderProps {
    onlineCount: number;
    errorCount: number;
    warnCount: number;
}

export function MonitoringHeader({ onlineCount, errorCount, warnCount }: MonitoringHeaderProps) {
    const systemHealthy = errorCount === 0;

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute right-1/4 top-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-accent-primary/5 blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: Title + Badge */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-[1rem] border border-emerald-500/20 shadow-inner">
                            <Activity className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                            Tiempo Real
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                        Centro de Monitoreo
                    </h1>
                    <p className="mt-1 text-sm font-medium text-theme-secondary/80">
                        Visibilidad total del sistema, usuarios activos y errores en vivo.
                    </p>
                </div>

                {/* Right: Live Mini Stats */}
                <div className="flex items-center gap-4">
                    {/* Online Indicator */}
                    <div className="flex items-center gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 backdrop-blur-md">
                        <div className="relative">
                            <Wifi className="h-5 w-5 text-emerald-400" />
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-400 leading-none">{onlineCount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mt-0.5">Online</p>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className={`flex items-center gap-3 rounded-[1.5rem] border px-5 py-3 backdrop-blur-md ${
                        systemHealthy
                            ? 'border-emerald-500/10 bg-emerald-500/5'
                            : 'border-rose-500/20 bg-rose-500/5'
                    }`}>
                        <AlertTriangle className={`h-5 w-5 ${systemHealthy ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`} />
                        <div>
                            <p className={`text-2xl font-black leading-none ${systemHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {errorCount}
                            </p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${systemHealthy ? 'text-emerald-400/60' : 'text-rose-400/60'}`}>
                                Errores
                            </p>
                        </div>
                    </div>

                    {/* Warnings */}
                    {warnCount > 0 && (
                        <div className="flex items-center gap-3 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/5 px-5 py-3 backdrop-blur-md">
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                            <div>
                                <p className="text-2xl font-black text-amber-400 leading-none">{warnCount}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mt-0.5">Warns</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
