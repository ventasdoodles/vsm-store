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
        <div className="rounded-2xl border border-theme bg-theme-primary/60 p-5">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-vape-400" />
                    <h2 className="text-sm font-semibold text-theme-primary">
                        Ventas
                        <span className="ml-2 text-xs font-normal text-theme-secondary">
                            ({new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()})
                        </span>
                    </h2>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-theme-primary">{formatPrice(totalWeekSales)}</p>
                    <p className="text-[11px] text-theme-secondary">{totalWeekOrders} pedidos</p>
                </div>
            </div>
            <div className="flex items-end gap-2 h-40">
                {chartData.map((day) => {
                    const height = maxSales > 0 ? Math.max((day.total / maxSales) * 100, 4) : 4;
                    const isToday = day.date === new Date().toISOString().slice(0, 10);
                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-theme-secondary text-theme-primary text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                {day.count} pedidos
                            </div>
                            <span className="text-xs text-theme-secondary font-medium">
                                {day.total > 0 ? formatPrice(day.total) : ''}
                            </span>
                            <div className="w-full flex items-end" style={{ height: '120px' }}>
                                <div
                                    className={`w-full rounded-t-lg transition-all ${isToday
                                        ? 'bg-gradient-to-t from-vape-500 to-vape-400 shadow-lg shadow-vape-500/20'
                                        : 'bg-gradient-to-t from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500'
                                        }`}
                                    style={{ height: `${height}%`, minHeight: '4px' }}
                                />
                            </div>
                            <span
                                className={`text-xs font-medium ${isToday ? 'text-vape-400' : 'text-accent-primary'
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
