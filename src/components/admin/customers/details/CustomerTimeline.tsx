/**
 * CustomerTimeline — Línea de Tiempo Transaccional
 * 
 * Historial visual tipo timeline de todos los pedidos del cliente.
 * Cada nodo muestra estado con código de color, monto, fecha
 * relativa ("Hace 3 días") y enlace directo al detalle del pedido.
 * Los datos se obtienen dinámicamente vía React Query.
 * 
 * @module admin/customers/details
 */
import { useQuery } from '@tanstack/react-query';
import { Route, ShoppingBag, CheckCircle, XCircle, Clock, Package, Loader2, AlertTriangle } from 'lucide-react';
import { getCustomerOrders } from '@/services/admin';
import type { AdminCustomerDetail } from '@/services/admin';
import { formatTimeAgo, formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CustomerOrder {
    id: string;
    created_at: string;
    status: string;
    total: number;
    display_id?: string;
    items?: { quantity: number }[];
}

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerTimeline({ customer }: Props) {
    const navigate = useNavigate();
    const { data: orders = [], isLoading } = useQuery<CustomerOrder[]>({
        queryKey: ['admin', 'customer', customer.id, 'orders'],
        queryFn: () => getCustomerOrders(customer.id),
        enabled: !!customer.id,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#13141f]/50 border border-white/5 rounded-3xl min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                <p className="text-sm text-theme-secondary">Analizando historial de pedidos...</p>
            </div>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'entregado':
            case 'completado':
                return { icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', line: 'bg-green-500' };
            case 'cancelado':
            case 'reembolsado':
                return { icon: <XCircle className="h-5 w-5" />, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', line: 'bg-red-500/50' };
            case 'en_camino':
            case 'enviado':
                return { icon: <Route className="h-5 w-5" />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', line: 'bg-blue-500' };
            case 'procesando':
            case 'pagado':
                return { icon: <Package className="h-5 w-5" />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', line: 'bg-purple-500' };
            case 'error_pago':
                return { icon: <AlertTriangle className="h-5 w-5" />, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', line: 'bg-orange-500' };
            default:
                return { icon: <Clock className="h-5 w-5" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', line: 'bg-yellow-500' };
        }
    };

    return (
        <div className="rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="relative mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 border border-blue-500/20 shadow-inner">
                        <Route className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Línea de Tiempo</h3>
                        <p className="text-xs text-theme-secondary/70">Historial transaccional inteligente</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-theme-secondary">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{orders.length}</span>
                    </div>
                </div>
            </div>
            
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-[#1a1c29]/50 border border-white/5 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-theme-secondary/50" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Sin movimientos</p>
                    <p className="text-xs text-theme-secondary text-center max-w-[250px]">El cliente aún no ha registrado transacciones en la plataforma.</p>
                </div>
            ) : (
                <div className="relative pl-6 sm:pl-8 py-4 z-10 before:absolute before:inset-0 before:left-[17px] sm:before:left-[25px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/20 before:via-white/5 before:to-transparent before:rounded-full">
                    <div className="space-y-8">
                        {orders.map((order) => {
                            const config = getStatusConfig(order.status);
                            
                            return (
                                <div key={order.id} className="relative group perspective">
                                    {/* Line Connection to Dot */}
                                    <div className={`absolute top-6 left-[-23px] sm:left-[-31px] w-6 sm:w-8 h-px ${config.line} opacity-20`} />

                                    {/* Dot Indicator */}
                                    <div className={`absolute left-[-35px] sm:left-[-43px] top-4 w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 z-10 
                                                  ${config.bg} ${config.border} ${config.color} backdrop-blur-md`}>
                                        {config.icon}
                                    </div>
                                    
                                    {/* Content Card */}
                                    <div className="relative bg-[#1a1c29]/80 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl group-hover:-translate-y-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                    className="font-black text-white text-sm sm:text-base cursor-pointer hover:text-blue-400 transition-colors uppercase tracking-wider flex items-center gap-2"
                                                >
                                                    {order.display_id || order.id.slice(0, 8)}
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.border} ${config.color}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto">
                                                <span className="font-black text-green-400">{formatPrice(order.total)}</span>
                                                <span className="text-xs font-medium text-theme-secondary/70 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimeAgo(order.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Optional context (Items preview) */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-theme-secondary/70">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="w-4 h-4" />
                                                    {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                                >
                                                    Ver detalles &rarr;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
