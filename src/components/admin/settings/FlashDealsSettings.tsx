/**
 * // ─── COMPONENTE: FlashDealsSettings ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Card glassmorphism para configurar el countdown de ofertas flash.
 *    Extraido del orchestrator para cumplir la regla Lego.
 * // Regla / Notas: Props tipadas. Sin `any`. Tema naranja/rojo (urgencia). Incluye boton de reset.
 */
import { Zap, Timer, Trash2 } from 'lucide-react';

interface FlashDealsSettingsProps {
    flashDealsEnd: string;
    onChangeDate: (isoDate: string) => void;
}

export function FlashDealsSettings({ flashDealsEnd, onChangeDate }: FlashDealsSettingsProps) {
    const hasDate = Boolean(flashDealsEnd);

    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-orange-500/15 hover:shadow-orange-500/5">
            {/* Orbe ambiental */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-[80px] transition-all group-hover:bg-orange-500/14" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-red-500/6 blur-[60px]" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/20">
                    <Zap className="h-5 w-5 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">Ofertas Flash</h2>
                    <p className="text-xs text-theme-secondary/70">Countdown para promociones urgentes</p>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-4">
                <p className="text-[11px] text-theme-secondary/60 leading-relaxed">
                    Configura la hora de fin del countdown. Si está vacío, se usa un timer automático de 6 horas.
                </p>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-orange-400/80">
                        <Timer className="h-3 w-3" />
                        Fin de ofertas (fecha y hora)
                    </label>
                    <input
                        type="datetime-local"
                        value={flashDealsEnd ? flashDealsEnd.slice(0, 16) : ''}
                        onChange={(e) =>
                            onChangeDate(e.target.value ? new Date(e.target.value).toISOString() : '')
                        }
                        className="w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition-colors focus:border-orange-500/50 focus:bg-white/[0.07]"
                    />
                </div>

                {hasDate && (
                    <button
                        type="button"
                        onClick={() => onChangeDate('')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/30"
                    >
                        <Trash2 className="h-3 w-3" />
                        Limpiar (usar timer automático)
                    </button>
                )}
            </div>
        </div>
    );
}
