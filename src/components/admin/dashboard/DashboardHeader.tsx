/**
 * // ─── COMPONENTE: DashboardHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Propósito principal: Botonera superior para filtrar el dashboard y exportar reportes.
 * // Regla / Notas: Mantener estética Premium (Glassmorphism), botones sutiles y acciones claras.
 */
import { useState } from 'react';
import { Calendar, Download, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
    dateRange: { start: string; end: string };
    setDateRange: (range: { start: string; end: string }) => void;
    onExport: () => void;
}

const PRESETS = [
    { label: 'Hoy', days: 0 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
] as const;

export function DashboardHeader({ dateRange, setDateRange, onExport }: DashboardHeaderProps) {
    const [activePreset, setActivePreset] = useState<number | null>(null);

    const handlePreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setDateRange({
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10),
        });
        setActivePreset(days);
    };

    return (
        <div className="relative overflow-hidden mb-8 rounded-[2rem] border border-white/5 bg-theme-primary/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Ambient Glow */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-accent-primary/20 to-blue-500/10 rounded-2xl border border-accent-primary/20 shadow-inner">
                            <LayoutDashboard className="h-7 w-7 text-accent-primary drop-shadow-[0_0_8px_rgba(var(--color-accent-primary),0.3)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary/20 to-blue-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-accent-primary ring-1 ring-inset ring-accent-primary/30">
                            Analítica
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm flex items-center gap-3">
                        Dashboard Global
                    </h1>
                    <p className="mt-1 text-sm font-medium text-theme-secondary">
                        Resumen general de rendimiento de tu tienda
                    </p>

                    {/* Smart Insights (Urgencies) - Movido al lado izquierdo */}
                    <div className="mt-4 flex items-center gap-2 w-fit px-4 py-2 rounded-2xl bg-amber-500/5 border border-amber-500/10 animate-pulse-slow">
                        <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Insights:</span>
                        <span className="text-xs font-bold text-amber-200/90 whitespace-nowrap">3 productos con bajo stock hoy</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Presets */}
                    <div className="flex items-center gap-1 rounded-[1.5rem] border border-white/5 bg-black/40 p-1.5 backdrop-blur-sm">
                        {PRESETS.map(({ label, days }) => (
                            <button
                                key={days}
                                onClick={() => handlePreset(days)}
                                className={cn(
                                    'px-4 py-1.5 text-xs font-bold rounded-xl transition-all',
                                    activePreset === days
                                        ? 'bg-accent-primary/20 text-accent-primary ring-1 ring-inset ring-accent-primary/30'
                                        : 'text-theme-secondary hover:bg-white/10 hover:text-white'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Date Picker */}
                    <div className="flex items-center gap-2 rounded-[1.5rem] border border-white/5 bg-black/40 p-1.5 backdrop-blur-sm">
                        <div className="flex items-center gap-3 px-3 py-1.5">
                            <Calendar className="h-4 w-4 text-theme-secondary" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => { setDateRange({ ...dateRange, start: e.target.value }); setActivePreset(null); }}
                                className="bg-transparent text-xs font-bold text-white focus:outline-none [color-scheme:dark] cursor-pointer"
                            />
                            <span className="text-accent-primary/50 text-xs">-</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => { setDateRange({ ...dateRange, end: e.target.value }); setActivePreset(null); }}
                                className="bg-transparent text-xs font-bold text-white focus:outline-none [color-scheme:dark] cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Export Superpower */}
                    <button
                        onClick={onExport}
                        className="group flex items-center justify-center gap-2 rounded-2xl bg-theme-secondary px-5 py-3 text-sm font-black text-black transition-all hover:bg-white hover:shadow-lg hover:shadow-white/10 sm:ml-2"
                        aria-label="Exportar reporte a CSV"
                        title="Exportar reporte a CSV"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
