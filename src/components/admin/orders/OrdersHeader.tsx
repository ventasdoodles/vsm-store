// ─── COMPONENTE: ENCABEZADO DE PEDIDOS ───────────────────────────────────────────────
// Renderiza el título, las estadísticas base y la barra de herramientas principal.
// Incluye: Buscador de texto, Modalidad de vista (Lista/Kanban), Rango de Fechas
// y el botón de exportación CSV con estilo Glassmorphism Premium.
// ───────────────────────────────────────────────────────────────────────────────────

import { Search, Calendar, List, KanbanSquare, Download, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersHeaderProps {
    totalOrders: number;
    search: string;
    setSearch: (val: string) => void;
    dateRange: { start: string; end: string };
    setDateRange: (range: { start: string; end: string }) => void;
    viewMode: 'list' | 'board';
    setViewMode: (mode: 'list' | 'board') => void;
    onExport: () => void;
}

export function OrdersHeader({
    totalOrders,
    search,
    setSearch,
    dateRange,
    setDateRange,
    viewMode,
    setViewMode,
    onExport
}: OrdersHeaderProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-primary/10 p-6 sm:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden backdrop-blur-md shadow-2xl">
                {/* Soft Ambient Glow - Match Loyalty style */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 w-full md:w-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-accent-primary/20 to-blue-500/10 rounded-2xl border border-accent-primary/20 shadow-inner">
                            <ClipboardList className="h-7 w-7 text-accent-primary drop-shadow-[0_0_8px_rgba(var(--color-accent-primary),0.3)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary/20 to-blue-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-accent-primary ring-1 ring-inset ring-accent-primary/30">
                            Gestión Logística
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-theme-primary flex items-center gap-3 drop-shadow-sm tracking-tight">
                        Centro de Pedidos
                    </h1>
                    <p className="text-sm text-theme-secondary font-medium mt-1">
                        {totalOrders} pedido{totalOrders !== 1 ? 's' : ''} registrados en el sistema
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-white/5 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-theme-primary placeholder-theme-secondary/50 focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 focus:outline-none transition-all"
                        />
                    </div>
                    {/* Superpoder: Exportar */}
                    <button
                        onClick={onExport}
                        className="flex items-center justify-center gap-2 bg-theme-secondary hover:bg-white text-black px-4 py-2.5 rounded-2xl font-black transition-all hover:shadow-lg hover:shadow-white/10"
                        title="Exportar pedidos filtrados a CSV"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                    </button>
                </div>
            </div>

            {/* Filters & Toggle Tool bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between relative z-10 w-full pt-4 border-t border-white/5 mt-4">
                {/* Visual View Toggle */}
                <div className="flex items-center gap-1 rounded-2xl border border-white/5 bg-black/40 p-1.5 backdrop-blur-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            'rounded-xl px-4 py-2 transition-all font-bold text-sm flex items-center gap-2',
                            viewMode === 'list' ? 'bg-white text-black shadow-md shadow-white/10' : 'text-theme-secondary/70 hover:text-white hover:bg-white/5'
                        )}
                        title="Vista de Lista"
                    >
                        <List className="h-4 w-4" />
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={cn(
                            'rounded-xl px-4 py-2 transition-all font-bold text-sm flex items-center gap-2',
                            viewMode === 'board' ? 'bg-white text-black shadow-md shadow-white/10' : 'text-theme-secondary/70 hover:text-white hover:bg-white/5'
                        )}
                        title="Vista de Tablero (Kanban)"
                    >
                        <KanbanSquare className="h-4 w-4" />
                        Kanban
                    </button>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-black/40 p-1 backdrop-blur-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                        <Calendar className="h-4 w-4 text-theme-secondary/50" />
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
            </div>
        </div>
    );
}
