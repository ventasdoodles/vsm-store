import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, User } from 'lucide-react';
import { getAllCustomers } from '@/services/admin.service';

interface CustomerSelectProps {
    value?: string | null;
    onChange: (customerId: string | null) => void;
}

export function CustomerSelect({ value, onChange }: CustomerSelectProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['admin', 'customers'],
        queryFn: getAllCustomers,
    });

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers.slice(0, 5); // Show first 5 by default
        const lower = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.full_name?.toLowerCase().includes(lower) ||
            c.phone?.includes(searchTerm)
        ).slice(0, 5);
    }, [customers, searchTerm]);

    const selectedCustomer = useMemo(() =>
        customers.find(c => c.id === value),
        [customers, value]);

    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-theme-secondary">Cliente Específico (Opcional)</label>

            {value && selectedCustomer ? (
                <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-100 truncate">{selectedCustomer.full_name}</p>
                        <p className="text-xs text-blue-300 truncate">{selectedCustomer.phone}</p>
                    </div>
                    <button
                        onClick={() => onChange(null)}
                        className="rounded-lg p-1.5 text-blue-300 hover:bg-blue-500/20 transition-colors"
                        title="Quitar cliente"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary opacity-50" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        // Delay blur to allow clicking on items
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        className="w-full rounded-xl border border-theme bg-theme-primary pl-9 pr-4 py-2 text-sm text-theme-primary focus:border-vape-500 focus:outline-none"
                    />

                    {isOpen && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-theme/60 bg-[#18181b] shadow-xl">
                            {isLoading ? (
                                <div className="p-4 text-center text-xs text-theme-secondary">Cargando clientes...</div>
                            ) : filteredCustomers.length > 0 ? (
                                <div className="p-1">
                                    {filteredCustomers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            onClick={() => {
                                                onChange(customer.id);
                                                setSearchTerm('');
                                                setIsOpen(false);
                                            }}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-theme-secondary group-hover:bg-white/10 group-hover:text-white">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-theme-primary truncate">{customer.full_name || 'Sin nombre'}</p>
                                                <p className="text-xs text-theme-secondary truncate">{customer.phone}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-xs text-theme-secondary">No se encontraron clientes</div>
                            )}
                        </div>
                    )}
                </div>
            )}
            <p className="text-[10px] text-theme-secondary/70">
                Si seleccionas un cliente, el cupón solo será válido para él.
            </p>
        </div>
    );
}
