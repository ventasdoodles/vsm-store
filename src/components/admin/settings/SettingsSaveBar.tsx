/**
 * // ─── COMPONENTE: SettingsSaveBar ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Barra de guardado premium con boton glassmorphism, spinner de carga
 *    y efecto glow. Full-width col-span-2.
 * // Regla / Notas: Props tipadas. Sin `any`. Animacion de glow en hover.
 */
import { Save, Loader2 } from 'lucide-react';

interface SettingsSaveBarProps {
    isPending: boolean;
}

export function SettingsSaveBar({ isPending }: SettingsSaveBarProps) {
    return (
        <div className="col-span-1 lg:col-span-2 flex justify-end pt-2">
            <button
                type="submit"
                disabled={isPending}
                className="
                    group relative flex items-center gap-2.5 rounded-[1rem] px-8 py-3.5
                    font-bold text-white shadow-xl
                    bg-gradient-to-r from-violet-600 to-fuchsia-600
                    transition-all duration-300
                    hover:shadow-violet-500/25 hover:-translate-y-0.5 hover:scale-[1.02]
                    disabled:opacity-50 disabled:pointer-events-none
                    active:scale-[0.98]
                "
            >
                {/* Glow behind button */}
                <div className="pointer-events-none absolute inset-0 rounded-[1rem] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />

                <span className="relative z-10 flex items-center gap-2.5">
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Save className="h-5 w-5 transition-transform group-hover:scale-110" />
                    )}
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </span>
            </button>
        </div>
    );
}
