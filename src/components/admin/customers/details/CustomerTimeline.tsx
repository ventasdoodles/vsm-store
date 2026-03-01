import { useQuery } from '@tanstack/react-query';
import { Clock, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';
import { getCustomerOrders } from '@/services/admin';
import { formatTimeAgo } from '@/lib/utils';

interface Props {
    customerId: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

export function CustomerTimeline({ customerId }: Props) {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['admin', 'customer', customerId, 'orders'],
        queryFn: () => getCustomerOrders(customerId),
        enabled: !!customerId,
    });

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-theme-primary/20 rounded-2xl border border-theme"></div>;
    }

    return (
        <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
            <h3 className="text-sm font-semibold text-theme-primary mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-vape-400" /> Línea de Tiempo (Pedidos)
            </h3>
            
            {orders.length === 0 ? (
                <p className="text-sm text-theme-secondary italic">Este cliente aún no tiene pedidos.</p>
            ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-theme before:to-transparent">
                    {orders.map((order: any) => (
                        <div key={order.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-theme bg-theme-primary/80 text-theme-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                {order.status === 'entregado' ? <CheckCircle className="h-4 w-4 text-green-400" /> :
                                 order.status === 'cancelado' ? <XCircle className="h-4 w-4 text-red-400" /> :
                                 <ShoppingBag className="h-4 w-4 text-vape-400" />}
                            </div>
                            
                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-theme bg-theme-primary/40 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-theme-primary text-sm">Pedido #{order.id.slice(0, 8)}</span>
                                    <span className="text-xs font-mono text-theme-secondary">{formatTimeAgo(order.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`px-2 py-0.5 rounded-full border ${
                                        order.status === 'entregado' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                        order.status === 'cancelado' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                    <span className="font-bold text-herbal-400">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
