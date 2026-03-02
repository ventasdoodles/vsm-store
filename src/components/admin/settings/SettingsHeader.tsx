/**
 * // ─── COMPONENTE: SettingsHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Cabecera premium del modulo de configuracion con orbes de luz
 *    violeta/fucsia, icono con glow, y descripcion contextual.
 * // Regla / Notas: Glassmorphism puro. Sin estado propio. Sin `any`.
 */
import { Settings2 } from 'lucide-react';

export function SettingsHeader() {
    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute right-1/4 top-0 h-56 w-56 rounded-full bg-fuchsia-500/8 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-accent-primary/5 blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 rounded-[1rem] border border-violet-500/20 shadow-inner">
                            <Settings2 className="h-7 w-7 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-violet-400 ring-1 ring-inset ring-violet-500/30">
                            Panel Admin
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                        Configuración de la Tienda
                    </h1>
                    <p className="mt-1 text-sm font-medium text-theme-secondary/80">
                        Personaliza cada aspecto de tu tienda — contacto, pagos, ubicación y más.
                    </p>
                </div>

                {/* Decorative animated ring */}
                <div className="hidden md:flex items-center justify-center">
                    <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/20 animate-[spin_12s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full border border-fuchsia-500/15 animate-[spin_8s_linear_infinite_reverse]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Settings2 className="h-8 w-8 text-violet-400/40 animate-[spin_20s_linear_infinite]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
