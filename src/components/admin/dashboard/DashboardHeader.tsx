/**
 * // ─── COMPONENTE: DashboardHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Propósito principal: Botonera superior para filtrar el dashboard y exportar reportes.
 * // Regla / Notas: Mantener estética Premium (Glassmorphism), botones sutiles y acciones claras.
 */
import { Calendar, Download } from 'lucide-react';

interface DashboardHeaderProps {
    dateRange: { start: string; end: string };
    setDateRange: (range: { start: string; end: string }) => void;
    onExport: () => void;
}

export function DashboardHeader({ dateRange, setDateRange, onExport }: DashboardHeaderProps) {
    const setPreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setDateRange({
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10),
        });
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between relative z-10 w-full mb-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                    Dashboard
                </h1>
                <p className="text-sm font-medium text-theme-secondary/80">
                    Resumen general de rendimiento de tu tienda
                </p>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Presets */}
                <div className="flex items-center gap-1 bg-[#13141f]/70 backdrop-blur-md p-1.5 rounded-[1rem] border border-white/5 shadow-xl">
                    <button onClick={() => setPreset(0)} className="px-4 py-1.5 text-xs font-semibold rounded-[0.75rem] hover:bg-white/10 text-theme-secondary hover:text-white transition-all">Hoy</button>
                    <button onClick={() => setPreset(7)} className="px-4 py-1.5 text-xs font-semibold rounded-[0.75rem] hover:bg-white/10 text-theme-secondary hover:text-white transition-all">7D</button>
                    <button onClick={() => setPreset(30)} className="px-4 py-1.5 text-xs font-semibold rounded-[0.75rem] hover:bg-white/10 text-theme-secondary hover:text-white transition-all">30D</button>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2 rounded-[1rem] border border-white/5 bg-[#13141f]/70 backdrop-blur-md p-1.5 shadow-xl">
                    <div className="flex items-center gap-3 px-3 py-1.5">
                        <Calendar className="h-4 w-4 text-theme-secondary/70" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-transparent text-xs font-semibold text-white focus:outline-none [color-scheme:dark] cursor-pointer"
                        />
                        <span className="text-accent-primary/50 text-xs">A</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-transparent text-xs font-semibold text-white focus:outline-none [color-scheme:dark] cursor-pointer"
                        />
                    </div>
                </div>

                {/* Export Superpower */}
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-accent-primary/10 hover:bg-accent-primary/20 hover:shadow-lg hover:shadow-accent-primary/10 text-accent-primary border border-accent-primary/20 px-5 py-2.5 rounded-[1rem] font-bold transition-all duration-300 text-sm ml-0 sm:ml-2 group"
                    title="Exportar reporte a CSV"
                >
                    <Download className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="hidden sm:inline tracking-wide">Exportar</span>
                </button>
            </div>
        </div>
    );
}
