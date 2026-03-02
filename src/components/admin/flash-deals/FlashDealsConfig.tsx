/**
 * // ─── COMPONENTE: FlashDealsConfig ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Card glassmorphism para configurar el countdown global de ofertas flash.
 *    Permite setear fecha/hora inicio y fin, toggle de la seccion completa en el storefront.
 * // Regla / Notas: Props tipadas. Sin `any`. Tema naranja/rojo (urgencia).
 */
import { useState, useEffect } from 'react';
import { Timer, Power, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashDealsConfigProps {
    /** ISO string de flash_deals_end desde store_settings */
    flashDealsEnd: string;
    /** Guarda la hora de fin en store_settings */
    onSave: (isoDate: string) => void;
    isSaving: boolean;
}

const INPUT_CLS = 'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-orange-500/40 focus:outline-none focus:ring-1 focus:ring-orange-500/20';

export function FlashDealsConfig({ flashDealsEnd, onSave, isSaving }: FlashDealsConfigProps) {
    const [endDate, setEndDate] = useState(flashDealsEnd);
    const hasEnd = Boolean(endDate);

    useEffect(() => {
        setEndDate(flashDealsEnd);
    }, [flashDealsEnd]);

    const handleSave = () => {
        onSave(endDate ? new Date(endDate).toISOString() : '');
    };

    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-orange-500/10">
            {/* Orbe */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/8 blur-[70px]" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/20">
                        <Timer className="h-5 w-5 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white">Countdown Global</h2>
                        <p className="text-xs text-white/35">Timer visible en el storefront</p>
                    </div>
                </div>

                {/* Status indicator */}
                <div className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                    hasEnd ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/10',
                )}>
                    <Power className="h-3 w-3" />
                    {hasEnd ? 'Configurado' : 'Auto (6h)'}
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-4">
                <p className="text-[11px] text-white/40 leading-relaxed">
                    Configura la hora de finalización del countdown. Si está vacío, se mostrará un timer automático de 6 horas que se reinicia.
                </p>

                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400/70">
                        <Timer className="h-3 w-3" />
                        Fin de ofertas (fecha y hora)
                    </label>
                    <input
                        type="datetime-local"
                        value={endDate ? endDate.slice(0, 16) : ''}
                        onChange={(e) =>
                            setEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')
                        }
                        className={INPUT_CLS}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/10 transition-all hover:shadow-orange-500/25 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Guardar Timer
                    </button>

                    {hasEnd && (
                        <button
                            type="button"
                            onClick={() => { setEndDate(''); onSave(''); }}
                            className="inline-flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/10"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
