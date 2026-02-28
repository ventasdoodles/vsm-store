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
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-theme-primary">Dashboard</h1>
                <p className="text-sm text-theme-primary0">Resumen de tu tienda</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Presets */}
                <div className="flex items-center gap-1 bg-theme-primary/40 p-1 rounded-xl border border-theme">
                    <button onClick={() => setPreset(0)} className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-theme-secondary/20 text-theme-primary transition-colors">Hoy</button>
                    <button onClick={() => setPreset(7)} className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-theme-secondary/20 text-theme-primary transition-colors">7D</button>
                    <button onClick={() => setPreset(30)} className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-theme-secondary/20 text-theme-primary transition-colors">30D</button>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2 rounded-xl border border-theme bg-theme-primary/60 p-1">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <Calendar className="h-4 w-4 text-theme-primary0" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-transparent text-xs font-medium text-theme-primary focus:outline-none [color-scheme:dark]"
                        />
                        <span className="text-accent-primary">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-transparent text-xs font-medium text-theme-primary focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Export Superpower */}
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-theme-secondary hover:bg-theme-secondary/90 text-theme-primary px-4 py-2 rounded-xl font-bold transition-colors text-sm"
                    title="Exportar reporte a CSV"
                >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                </button>
            </div>
        </div>
    );
}
