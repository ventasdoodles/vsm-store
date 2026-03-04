/**
 * CustomerList — Tabla del Directorio de Clientes
 * 
 * Tabla responsive con columnas: nombre/ID, contacto,
 * fecha de registro y cumpleaños. Click en fila navega
 * al perfil detallado del cliente.
 * 
 * @module admin/customers
 */
import { Phone, Calendar, MessageCircle, Cake, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminCustomer } from '@/services/admin';

interface Props {
    customers: AdminCustomer[];
}

export function CustomerList({ customers }: Props) {
    const navigate = useNavigate();

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 uppercase text-[10px] tracking-widest text-theme-secondary/60">
                        <th className="px-6 py-4 font-black">Cliente / ID</th>
                        <th className="px-6 py-4 font-black hidden sm:table-cell">Contacto</th>
                        <th className="px-6 py-4 font-black hidden md:table-cell text-center">Registro</th>
                        <th className="px-6 py-4 font-black hidden lg:table-cell text-center">Cumpleaños</th>
                        <th className="px-6 py-4 font-black text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {customers.map((customer) => (
                        <tr
                            key={customer.id}
                            onClick={() => navigate(`/admin/customers/${customer.id}`)}
                            className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-theme-primary/20 to-blue-500/20 text-sm font-black text-blue-400 shrink-0 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors shadow-inner">
                                        {customer.full_name
                                            ? customer.full_name.charAt(0).toUpperCase()
                                            : '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-black text-theme-primary text-base group-hover:text-blue-400 transition-colors">
                                            {customer.full_name || 'Sin nombre registrado'}
                                        </p>
                                        <p className="text-xs text-theme-secondary/50 font-mono font-medium tracking-wide mt-0.5">
                                            {customer.id.split('-')[0]}...
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                                <div className="space-y-1.5">
                                    {customer.phone && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-theme-secondary">
                                            <Phone className="h-3 w-3 text-blue-400" />
                                            {customer.phone}
                                        </div>
                                    )}
                                    {customer.whatsapp && customer.whatsapp !== customer.phone && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-theme-secondary">
                                            <MessageCircle className="h-3 w-3 text-fuchsia-400" />
                                            {customer.whatsapp}
                                        </div>
                                    )}
                                    {!customer.phone && !customer.whatsapp && (
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                            Sin contacto
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell text-center">
                                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-theme-secondary bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
                                    <Calendar className="h-3 w-3 text-emerald-400" />
                                    {formatDate(customer.created_at)}
                                </div>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell text-center">
                                {customer.birthdate ? (
                                    <div className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-theme-secondary">
                                        <Cake className="h-3 w-3 text-fuchsia-400" />
                                        {new Date(customer.birthdate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                    </div>
                                ) : (
                                    <span className="text-theme-secondary/30 font-bold">—</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end">
                                    <div className="p-2 rounded-xl bg-theme-primary/10 text-theme-secondary group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all border border-transparent group-hover:border-blue-500/30">
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
