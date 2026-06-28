/**
 * CustomerList — Tabla del Directorio de Clientes
 * 
 * Tabla responsive con columnas: nombre/ID, contacto,
 * fecha de registro y cumpleaños. Click en fila navega
 * al perfil detallado del cliente.
 * 
 * @module admin/customers
 */
import { useMemo } from 'react';
import { Phone, Calendar, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import type { AdminCustomer } from '@/services/admin';

interface Props {
    customers: AdminCustomer[];
}

const columnHelper = createColumnHelper<AdminCustomer>();

export function CustomerList({ customers }: Props) {
    const navigate = useNavigate();

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    const columns = useMemo(() => [
        columnHelper.accessor('full_name', {
            header: 'Cliente / ID',
            cell: ({ row }) => {
                const customer = row.original;
                return (
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
                );
            }
        }),
        columnHelper.display({
            id: 'contact',
            header: 'Contacto',
            cell: ({ row }) => {
                const customer = row.original;
                return (
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
                );
            }
        }),
        columnHelper.accessor('created_at', {
            header: 'Registro',
            cell: ({ getValue }) => (
                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-theme-secondary bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
                    <Calendar className="h-3 w-3 text-emerald-400" />
                    {formatDate(getValue())}
                </div>
            )
        }),
        columnHelper.accessor('intelligence.segment', {
            id: 'segment',
            header: 'Segmento',
            cell: ({ row }) => {
                const customer = row.original;
                if (!customer.intelligence) {
                    return <span className="text-theme-secondary/20 font-bold">—</span>;
                }
                return (
                    <div className="flex flex-col items-center gap-1.5">
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm transition-all group-hover:shadow-md",
                            customer.intelligence.segment === 'Campeón' && "bg-amber-400/10 text-amber-400 border-amber-400/20",
                            customer.intelligence.segment === 'Leal' && "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
                            customer.intelligence.segment === 'Nuevo' && "bg-blue-400/10 text-blue-400 border-blue-400/20",
                            customer.intelligence.segment === 'En Riesgo' && "bg-rose-400/10 text-rose-400 border-rose-400/20",
                            customer.intelligence.segment === 'Prospecto' && "bg-slate-400/10 text-slate-400 border-slate-400/20",
                            !['Campeón', 'Leal', 'Nuevo', 'En Riesgo', 'Prospecto'].includes(customer.intelligence.segment || '') && "bg-white/5 text-white/40 border-white/10"
                        )}>
                            {customer.intelligence.segment}
                        </span>
                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                customer.intelligence.health_status === 'Saludable' && "bg-emerald-400",
                                customer.intelligence.health_status === 'Estable' && "bg-blue-400",
                                customer.intelligence.health_status === 'Requiere Atención' && "bg-amber-400",
                                "bg-slate-400"
                            )} />
                            <span className="text-[8px] font-bold uppercase tracking-tighter text-theme-secondary">
                                {customer.intelligence.health_status}
                            </span>
                        </div>
                    </div>
                );
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: () => (
                <div className="flex justify-end">
                    <div className="p-2 rounded-xl bg-theme-primary/10 text-theme-secondary group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all border border-transparent group-hover:border-blue-500/30">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            )
        })
    ], []);

    const table = useReactTable({
        data: customers,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="border-b border-white/5 uppercase text-[10px] tracking-widest text-theme-secondary/60">
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id} 
                                    className={cn(
                                        "px-6 py-4 font-black",
                                        header.column.id === 'contact' && "hidden sm:table-cell",
                                        header.column.id === 'created_at' && "hidden md:table-cell text-center",
                                        header.column.id === 'segment' && "hidden lg:table-cell text-center",
                                        header.column.id === 'actions' && "text-right"
                                    )}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-white/5">
                    {table.getRowModel().rows.map(row => (
                        <tr
                            key={row.id}
                            onClick={() => navigate(`/admin/customers/${row.original.id}`)}
                            className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                            {row.getVisibleCells().map(cell => (
                                <td 
                                    key={cell.id} 
                                    className={cn(
                                        "px-6 py-4",
                                        cell.column.id === 'contact' && "hidden sm:table-cell",
                                        cell.column.id === 'created_at' && "hidden md:table-cell text-center",
                                        cell.column.id === 'segment' && "hidden lg:table-cell text-center",
                                        cell.column.id === 'actions' && "text-right"
                                    )}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
