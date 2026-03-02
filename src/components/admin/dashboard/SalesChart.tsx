/**
 * // ─── COMPONENTE: SalesChart ───
 * // Arquitectura: Dumb Component (Visual Graphic)
 * // Propósito principal: Mostrar gráfica de barras de ventas con Tooltips interactivos y base glassmorphism.
 * // Regla / Notas: Mantiene simplicidad usando barras puras en vez de librerías pesadas si son datos simples.
 */
import { BarChart3 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { DashboardStats } from '@/services/admin';

interface SalesChartProps {
    chartData: DashboardStats['salesLast7Days'];
    dateRange: { start: string; end: string };
}

export function SalesChart({ chartData = [], dateRange }: SalesChartProps) {
    const maxSales = Math.max(...chartData.map((d) => d.total), 1);
    const totalWeekSales = chartData.reduce((s, d) => s + d.total, 0);
    const totalWeekOrders = chartData.reduce((s, d) => s + d.count, 0);

    const dayLabels = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const formatDay = (dateStr: string) => {
        const d = new Date(dateStr + 'T12:00:00');
        return dayLabels[d.getDay()];
    };

    return (
        <div className="rounded-[1.5rem] border border-white/5 bg-[#13141f]/70 backdrop-blur-md p-6 shadow-xl transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-accent-primary/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[0.75rem] bg-accent-primary/10">
                        <BarChart3 className="h-5 w-5 text-accent-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">
                            Ingresos de Ventas
                        </h2>
                        <p className="text-[11px] font-medium text-theme-secondary mt-0.5">
                            {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-white tracking-tight">{formatPrice(totalWeekSales)}</p>
                    <p className="text-[11px] font-medium text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">
                        {totalWeekOrders} pedidos
                    </p>
                </div>
            </div>
            
            <div className="flex items-end gap-2 sm:gap-3 flex-1 min-h-[160px] pb-2">
                {chartData.map((day) => {
                    const height = maxSales > 0 ? Math.max((day.total / maxSales) * 100, 4) : 4;
                    const isToday = day.date === new Date().toISOString().slice(0, 10);
                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                            {/* Tooltip on hover */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 bg-white/10 backdrop-blur-lg border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-[0.5rem] pointer-events-none whitespace-nowrap z-20 shadow-xl">
                                {day.count} pedidos
                            </div>
                            <span className="text-[10px] text-theme-secondary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                {day.total > 0 ? formatPrice(day.total) : ''}
                            </span>
                            <div className="w-full flex items-end relative h-[120px]">
                                <div
                                    className={`w-full rounded-[0.5rem] transition-all duration-500 relative overflow-hidden ${isToday
                                            ? 'bg-gradient-to-t from-accent-primary/80 to-accent-primary shadow-lg shadow-accent-primary/20'
                                            : 'bg-gradient-to-t from-white/5 to-white/10 hover:from-white/10 hover:to-white/20'
                                        }`}
                                    style={{ height: `${height}%`, minHeight: '8px' }}
                                >
                                    {isToday && <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay" />}
                                </div>
                            </div>
                            <span
                                className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? 'text-accent-primary' : 'text-theme-secondary/70'
                                    }`}
                            >
                                {formatDay(day.date)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
