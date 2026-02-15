// Gestión de Clientes (Admin) - VSM Store
// Lista con búsqueda y resumen de actividad
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Phone, Calendar, Mail } from 'lucide-react';
import { getAllCustomers, type AdminCustomer } from '@/services/admin.service';

export function AdminCustomers() {
    const [search, setSearch] = useState('');

    // Query: All Customers
    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['admin', 'customers'],
        queryFn: getAllCustomers,
    });

    const filtered = useMemo(() => {
        if (!search.trim()) return customers;
        const q = search.toLowerCase();
        return customers.filter((c: AdminCustomer) =>
            c.full_name?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.whatsapp?.toLowerCase().includes(q) ||
            c.id?.toLowerCase().includes(q)
        );
    }, [customers, search]);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">Clientes</h1>
                    <p className="text-sm text-primary-500">
                        {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} registrado{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-primary-800/50 bg-primary-900/60 py-2.5 pl-10 pr-4 text-sm text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-primary-800/30" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary-800/40 bg-primary-900/60 py-16">
                    <Users className="h-12 w-12 text-primary-700 mb-3" />
                    <p className="text-sm text-primary-500">
                        {search ? 'No se encontraron clientes' : 'No hay clientes registrados aún'}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-900/60">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-primary-800/30">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider hidden sm:table-cell">
                                        Contacto
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider hidden md:table-cell">
                                        Registro
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider hidden lg:table-cell">
                                        Cumpleaños
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-800/20">
                                {filtered.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-primary-800/20 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-vape-400 to-vape-600 text-xs font-bold text-white shrink-0">
                                                    {customer.full_name
                                                        ? customer.full_name.charAt(0).toUpperCase()
                                                        : '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-primary-200 max-w-[200px]">
                                                        {customer.full_name || 'Sin nombre'}
                                                    </p>
                                                    <p className="text-xs text-primary-500 font-mono">
                                                        {customer.id?.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <div className="space-y-1">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-primary-400">
                                                        <Phone className="h-3 w-3 text-primary-600" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {customer.whatsapp && customer.whatsapp !== customer.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-primary-400">
                                                        <Mail className="h-3 w-3 text-primary-600" />
                                                        {customer.whatsapp}
                                                    </div>
                                                )}
                                                {!customer.phone && !customer.whatsapp && (
                                                    <span className="text-xs text-primary-600">Sin contacto</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center hidden md:table-cell">
                                            <div className="flex items-center justify-center gap-1.5 text-xs text-primary-400">
                                                <Calendar className="h-3 w-3 text-primary-600" />
                                                {formatDate(customer.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                                            <span className="text-xs text-primary-500">
                                                {customer.birthdate
                                                    ? new Date(customer.birthdate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                                                    : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
