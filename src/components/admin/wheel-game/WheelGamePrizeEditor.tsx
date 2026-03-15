/**
 * // ─── COMPONENTE: WheelGamePrizeEditor ───
 * // Arquitectura: Smart Component (Form Dialog)
 * // Proposito principal: Slide-over para crear y editar segmentos de la ruleta.
 *    Campos: nombre, tipo, valor (amount/discount), color picker, probabilidad (slider).
 *    Preview inline del segmento con el color seleccionado.
 * // Regla / Notas: Props tipadas. Sin `any`. Usa FloatingInput pattern. Valida prob total.
 */
import { useState, useEffect } from 'react';
import { X, Loader2, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WheelPrizeAdmin, WheelPrizeFormData } from '@/services/admin';

/* ─── Constantes ─── */
const PRIZE_TYPES: { value: WheelPrizeAdmin['type']; label: string; desc: string }[] = [
    { value: 'points',  label: 'V-Coins',    desc: 'Suma puntos al saldo del usuario' },
    { value: 'coupon',  label: 'Cupón %',    desc: 'Genera un cupón de descuento' },
    { value: 'empty',   label: 'Sin premio', desc: 'Sigue jugando — sin recompensa' },
];

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#10b981', '#06b6d4',
    '#3b82f6', '#64748b',
];

const EMPTY_FORM: WheelPrizeFormData = {
    label: '',
    type: 'points',
    value: { amount: 100 },
    probability: 0.25,
    color: '#6366f1',
    is_active: true,
};

/* ─── Props ─── */
interface WheelGamePrizeEditorProps {
    prize: WheelPrizeAdmin | null;
    isOpen: boolean;
    isSaving: boolean;
    totalOtherProbability: number; // suma de probabilidades de los demás premios activos
    onClose: () => void;
    onSave: (data: WheelPrizeFormData) => void;
}

export function WheelGamePrizeEditor({
    prize,
    isOpen,
    isSaving,
    totalOtherProbability,
    onClose,
    onSave,
}: WheelGamePrizeEditorProps) {
    const [form, setForm] = useState<WheelPrizeFormData>(EMPTY_FORM);

    // Sincronizar form con el premio a editar
    useEffect(() => {
        if (prize) {
            setForm({
                label:       prize.label,
                type:        prize.type,
                value:       prize.value,
                probability: prize.probability,
                color:       prize.color,
                is_active:   prize.is_active,
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [prize, isOpen]);

    if (!isOpen) return null;

    const maxProb = Math.max(0, 1 - totalOtherProbability);
    const probPct = Math.round(form.probability * 100);
    const remainingPct = Math.round(maxProb * 100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    const setField = <K extends keyof WheelPrizeFormData>(key: K, value: WheelPrizeFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#0d0e1a] border-l border-white/8 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-500/15 border border-indigo-500/25">
                            <Dices className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white">
                                {prize ? 'Editar Premio' : 'Nuevo Premio'}
                            </h2>
                            <p className="text-[11px] text-white/35">Segmento de la Ruleta de VSM</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Prize preview */}
                    <div
                        className="flex items-center gap-4 p-4 rounded-2xl border border-white/8"
                        style={{ background: `${form.color}15` }}
                    >
                        <div
                            className="w-12 h-12 rounded-2xl flex-shrink-0 border-2 border-white/20 shadow-lg"
                            style={{
                                backgroundColor: form.color,
                                boxShadow: `0 0 20px ${form.color}60`,
                            }}
                        />
                        <div>
                            <p className="font-black text-white text-sm">{form.label || 'Nombre del premio'}</p>
                            <p className="text-xs text-white/40 mt-0.5">
                                {PRIZE_TYPES.find(t => t.value === form.type)?.label} · {probPct}% probabilidad
                            </p>
                        </div>
                    </div>

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">
                            Nombre del Premio *
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej: 200 V-Coins, Cupón 15%, Sigue jugando..."
                            value={form.label}
                            onChange={e => setField('label', e.target.value)}
                            maxLength={30}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                        />
                        <p className="text-[10px] text-white/25 text-right">{form.label.length}/30 chars</p>
                    </div>

                    {/* Tipo */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">
                            Tipo de Premio *
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {PRIZE_TYPES.map(({ value, label, desc }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setField('type', value);
                                        // Reset value on type change
                                        if (value === 'points') setField('value', { amount: 100 });
                                        else if (value === 'coupon') setField('value', { discount: 10 });
                                        else setField('value', {});
                                    }}
                                    className={cn(
                                        'flex items-start gap-3 p-3 rounded-2xl border transition-all text-left',
                                        form.type === value
                                            ? 'border-indigo-500/50 bg-indigo-500/10'
                                            : 'border-white/8 bg-white/[0.02] hover:bg-white/5',
                                    )}
                                >
                                    <div className={cn(
                                        'mt-0.5 h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 transition-all',
                                        form.type === value ? 'border-indigo-400 bg-indigo-400' : 'border-white/20',
                                    )} />
                                    <div>
                                        <p className="text-sm font-black text-white">{label}</p>
                                        <p className="text-[11px] text-white/35">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Valor (condicional) */}
                    {form.type === 'points' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-white/40">
                                Cantidad de V-Coins
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={10000}
                                value={form.value.amount ?? 100}
                                onChange={e => setField('value', { amount: Number(e.target.value) })}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                            />
                        </div>
                    )}
                    {form.type === 'coupon' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-white/40">
                                % de Descuento
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={form.value.discount ?? 10}
                                onChange={e => setField('value', { discount: Number(e.target.value) })}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                            />
                        </div>
                    )}

                    {/* Color picker */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">
                            Color del Segmento
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setField('color', c)}
                                    className={cn(
                                        'w-8 h-8 rounded-xl transition-all border-2',
                                        form.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105',
                                    )}
                                    style={{ backgroundColor: c, boxShadow: form.color === c ? `0 0 12px ${c}80` : undefined }}
                                />
                            ))}
                            {/* Custom color */}
                            <label className="relative w-8 h-8 rounded-xl overflow-hidden border-2 border-white/20 cursor-pointer hover:scale-105 transition-all">
                                <input
                                    type="color"
                                    value={form.color}
                                    onChange={e => setField('color', e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="w-full h-full" style={{ backgroundColor: form.color }} />
                            </label>
                        </div>
                    </div>

                    {/* Probabilidad */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-widest text-white/40">
                                Probabilidad
                            </label>
                            <span className="text-sm font-black text-white">{probPct}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={maxProb}
                            step={0.01}
                            value={form.probability}
                            onChange={e => setField('probability', Number(e.target.value))}
                            className="w-full accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-white/25">
                            <span>0%</span>
                            <span className={cn(remainingPct < 10 ? 'text-amber-400' : '')}>
                                Disponible: {remainingPct}%
                            </span>
                            <span>{Math.round(maxProb * 100)}%</span>
                        </div>
                    </div>

                    {/* Activo */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/8 bg-white/[0.02]">
                        <div>
                            <p className="text-sm font-black text-white">Premio activo</p>
                            <p className="text-[11px] text-white/35">Disponible para aparecer en la ruleta</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setField('is_active', !form.is_active)}
                            className="relative flex-shrink-0"
                        >
                            <div className={cn(
                                'w-11 h-6 rounded-full transition-all duration-300',
                                form.is_active ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10',
                            )}>
                                <div className={cn(
                                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300',
                                    form.is_active ? 'left-6' : 'left-1',
                                )} />
                            </div>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/8 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl border border-white/10 text-sm font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="wheel-prize-form"
                        disabled={isSaving || !form.label}
                        onClick={handleSubmit}
                        className={cn(
                            'flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all',
                            isSaving || !form.label
                                ? 'bg-white/10 cursor-not-allowed text-white/40'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25',
                        )}
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Guardando...
                            </span>
                        ) : (
                            prize ? 'Actualizar Premio' : 'Crear Premio'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
