/**
 * CustomerDirectoryHeader — Barra de Acción del Directorio
 * 
 * Encabezado del módulo con botón de exportación (próximamente)
 * y acceso rápido a la creación de nuevos clientes.
 * 
 * @module admin/customers
 */
import { Users, UserPlus, FileDown } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

interface Props {
    onNewCustomer: () => void;
}

export function CustomerDirectoryHeader({ onNewCustomer }: Props) {
    const notify = useNotification();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight">Directorio de Clientes</h1>
                </div>
                <p className="text-sm text-theme-secondary font-medium ml-14">
                    Visualiza, contacta y administra a los usuarios registrados.
                </p>
            </div>
            
            <div className="flex items-center gap-3 ml-14 sm:ml-0">
                <button
                    onClick={() => notify.info('En Desarrollo', 'La exportación CSV/Excel estará disponible próximamente.')}
                    className="flex items-center gap-2 rounded-xl bg-[#13141f] border border-white/10 px-4 py-2.5 text-sm font-bold text-theme-secondary hover:text-white hover:border-white/20 hover:bg-white/5 transition-all active:scale-95"
                >
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                </button>
                <button
                    onClick={onNewCustomer}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-black text-white hover:from-blue-400 hover:to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 whitespace-nowrap"
                >
                    <UserPlus className="h-4 w-4" />
                    Nuevo Cliente
                </button>
            </div>
        </div>
    );
}
