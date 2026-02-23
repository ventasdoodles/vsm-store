import { Search, Calendar, List, KanbanSquare, Download } from 'lucide-react';
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
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-theme-primary">Pedidos</h1>
                    <p className="text-sm text-theme-primary0">{totalOrders} pedido{totalOrders !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-primary0" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-theme/50 bg-theme-primary/60 py-2.5 pl-10 pr-4 text-sm text-theme-primary placeholder-primary-600 focus:border-vape-500/50 focus:outline-none"
                        />
                    </div>
                    {/* Superpoder: Exportar */}
                    <button
                        onClick={onExport}
                        className="flex items-center justify-center gap-2 bg-theme-secondary hover:bg-theme-secondary/90 text-theme-primary px-3 py-2.5 rounded-xl font-bold transition-colors"
                        title="Exportar pedidos filtrados a CSV"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Filters & Toggle Tool bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Visual View Toggle */}
                <div className="flex items-center gap-1 rounded-xl border border-theme/50 bg-theme-primary/60 p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            'rounded-lg p-2 transition-colors',
                            viewMode === 'list' ? 'bg-theme-secondary text-white shadow-sm' : 'text-theme-primary0 hover:text-theme-secondary'
                        )}
                        title="Vista de Lista"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={cn(
                            'rounded-lg p-2 transition-colors',
                            viewMode === 'board' ? 'bg-theme-secondary text-white shadow-sm' : 'text-theme-primary0 hover:text-theme-secondary'
                        )}
                        title="Vista de Tablero (Kanban)"
                    >
                        <KanbanSquare className="h-4 w-4" />
                    </button>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2 rounded-xl border border-theme/50 bg-theme-primary/60 p-1">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <Calendar className="h-3.5 w-3.5 text-theme-primary0" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-transparent text-xs font-medium text-theme-primary focus:outline-none [color-scheme:dark]"
                        />
                        <span className="text-primary-600">-</span>
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
