import { cn } from '@/lib/utils';
import { ORDER_STATUSES, type OrderStatus } from '@/services/admin';

interface OrdersFilterProps {
    statusFilter: OrderStatus | '';
    setStatusFilter: (status: OrderStatus | '') => void;
}

export function OrdersFilter({ statusFilter, setStatusFilter }: OrdersFilterProps) {
    return (
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-theme bg-theme-primary/60 p-1">
            <button
                onClick={() => setStatusFilter('')}
                className={cn(
                    'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    !statusFilter ? 'bg-theme-secondary text-theme-primary' : 'text-theme-primary0 hover:text-theme-secondary'
                )}
            >
                Todos
            </button>
            {ORDER_STATUSES.map((s) => (
                <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={cn(
                        'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        statusFilter === s.value ? 'text-white' : 'text-theme-primary0 hover:text-theme-secondary'
                    )}
                    style={statusFilter === s.value ? { backgroundColor: `${s.color}25`, color: s.color } : undefined}
                >
                    {s.label}
                </button>
            ))}
        </div>
    );
}
