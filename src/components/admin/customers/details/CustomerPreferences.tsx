import { useQuery } from '@tanstack/react-query';
import { getCustomerPreferences } from '@/services/admin';
import { PieChart, ShoppingBag } from 'lucide-react';

interface Props {
    customerId: string;
}

export function CustomerPreferences({ customerId }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'customer', customerId, 'preferences'],
        queryFn: () => getCustomerPreferences(customerId),
        enabled: !!customerId,
    });

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5 animate-pulse">
                <div className="h-4 w-1/3 bg-theme-secondary/50 rounded mb-4"></div>
                <div className="space-y-2">
                    <div className="h-10 bg-theme-secondary/30 rounded"></div>
                    <div className="h-10 bg-theme-secondary/30 rounded"></div>
                </div>
            </div>
        );
    }

    if (!data || (data.topProducts.length === 0 && data.topCategories.length === 0)) {
        return null; // No mostrar si no hay datos
    }

    return (
        <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
            <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Preferencias de Consumo
            </h3>

            <div className="space-y-6">
                {/* Top Categorías */}
                {data.topCategories.length > 0 && (
                    <div>
                        <h4 className="text-xs text-theme-secondary mb-3 uppercase tracking-wider font-semibold">Categorías Favoritas</h4>
                        <div className="space-y-2">
                            {data.topCategories.map((cat: { name: string; count: number }, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-theme-primary/30 p-2 rounded-lg border border-theme">
                                    <span className="text-sm text-theme-primary">{cat.name}</span>
                                    <span className="text-xs font-bold text-purple-400 bg-accent-primary/10 px-2 py-1 rounded-full">
                                        {cat.count} {cat.count === 1 ? 'vez' : 'veces'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Productos */}
                {data.topProducts.length > 0 && (
                    <div>
                        <h4 className="text-xs text-theme-secondary mb-3 uppercase tracking-wider font-semibold flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3" /> Productos Más Comprados
                        </h4>
                        <div className="space-y-2">
                            {data.topProducts.map((prod: { name: string; count: number }, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-theme-primary/30 p-2 rounded-lg border border-theme">
                                    <span className="text-sm text-theme-primary truncate pr-2">{prod.name}</span>
                                    <span className="text-xs font-bold text-theme-secondary bg-theme-secondary/10 px-2 py-1 rounded-full whitespace-nowrap">
                                        {prod.count} {prod.count === 1 ? 'ud' : 'uds'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
