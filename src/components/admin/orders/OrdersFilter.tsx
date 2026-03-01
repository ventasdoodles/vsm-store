// ─── COMPONENTE: FILTRO DE ESTADOS ───────────────────────────────────────────────────
// Botonera de navegación rápida para filtrar pedidos en la vista de lista.
// Mapea los estados de /src/lib/domain/orders.ts y les inyecta un estilo activo
// basado en el color propio de estado definido en el diccionario.
// ───────────────────────────────────────────────────────────────────────────────────

import { cn } from '@/lib/utils';
import { ORDER_STATUSES, type OrderStatus } from '@/services/admin';

interface OrdersFilterProps {
    statusFilter: OrderStatus | '';
    setStatusFilter: (status: OrderStatus | '') => void;
}

export function OrdersFilter({ statusFilter, setStatusFilter }: OrdersFilterProps) {
    return (
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-black/40 p-1.5 hide-scrollbar">
            <button
                onClick={() => setStatusFilter('')}
                className={cn(
                    'whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all',
                    !statusFilter ? 'bg-white text-black shadow-md shadow-white/10' : 'text-theme-secondary/70 hover:text-white hover:bg-white/5'
                )}
            >
                Todos
            </button>
            {ORDER_STATUSES.map((s) => (
                <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={cn(
                        'whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all',
                        statusFilter === s.value ? 'shadow-md' : 'text-theme-secondary/70 hover:text-white hover:bg-white/5'
                    )}
                    style={statusFilter === s.value ? { backgroundColor: `${s.color}25`, color: s.color } : undefined}
                >
                    {s.label}
                </button>
            ))}
        </div>
    );
}
