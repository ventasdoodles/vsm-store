/**
 * // ─── COMPONENTE: HealthPulse ───
 * // Arquitectura: Dumb Component (Visual Indicator)
 * // Proposito principal: Indicador visual "heartbeat" que muestra la salud del sistema en tiempo real.
 * // Regla / Notas: Pulsa suavemente en verde si todo OK. Cambia a rojo con animacion si hay errores recientes.
 *                    Es un widget compacto pensado para colocarse en la esquina o como accent visual.
 */

interface HealthPulseProps {
    isHealthy: boolean;
    lastCheckTime: string;
    uptimeMinutes: number;
}

export function HealthPulse({ isHealthy, lastCheckTime, uptimeMinutes }: HealthPulseProps) {
    const formatUptime = (mins: number): string => {
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const remaining = mins % 60;
        if (hours < 24) return `${hours}h ${remaining}m`;
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        return `${days}d ${remHours}h`;
    };

    return (
        <div className={`relative overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur-md transition-all duration-700 ${
            isHealthy
                ? 'border-emerald-500/15 bg-emerald-500/[0.03]'
                : 'border-rose-500/20 bg-rose-500/5'
        }`}>
            {/* Background Pulse Ring */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <div className={`h-32 w-32 rounded-full ${isHealthy ? 'bg-emerald-500/5' : 'bg-rose-500/5'} animate-ping`} style={{ animationDuration: isHealthy ? '3s' : '1.5s' }} />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <div className={`h-20 w-20 rounded-full ${isHealthy ? 'bg-emerald-500/8' : 'bg-rose-500/8'} animate-ping`} style={{ animationDuration: isHealthy ? '2.5s' : '1s', animationDelay: '0.5s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Heartbeat Dot */}
                <div className="relative mb-4">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 ${
                        isHealthy
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : 'border-rose-500/30 bg-rose-500/10'
                    }`}>
                        {/* SVG Heartbeat Line */}
                        <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className={isHealthy ? 'text-emerald-400' : 'text-rose-400'}>
                            <path
                                d={isHealthy
                                    ? 'M0 10 L8 10 L12 3 L16 17 L20 10 L28 10 L32 6 L36 14 L40 10'
                                    : 'M0 10 L10 10 L14 2 L18 18 L22 10 L30 10 L34 4 L38 16 L40 10'
                                }
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={isHealthy ? 'animate-pulse' : 'animate-bounce'}
                                style={{ animationDuration: isHealthy ? '2s' : '0.5s' }}
                            />
                        </svg>
                    </div>
                    {/* Outer ring pulse */}
                    <div className={`absolute inset-0 rounded-full border ${
                        isHealthy ? 'border-emerald-400/20' : 'border-rose-400/30'
                    } animate-ping`} style={{ animationDuration: '2s' }} />
                </div>

                {/* Status Text */}
                <p className={`text-sm font-black uppercase tracking-[0.2em] ${
                    isHealthy ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                    {isHealthy ? 'Sistema Operativo' : 'Errores Detectados'}
                </p>

                {/* Uptime */}
                <p className="text-[10px] font-bold text-theme-secondary/50 mt-2 uppercase tracking-widest">
                    Uptime: {formatUptime(uptimeMinutes)}
                </p>

                {/* Last check */}
                <p className="text-[9px] font-mono text-theme-secondary/30 mt-1">
                    Ultimo chequeo: {lastCheckTime}
                </p>
            </div>
        </div>
    );
}
