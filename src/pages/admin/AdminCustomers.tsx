// Gestión de Clientes (Admin) - VSM Store
// Orquestador Premium de Directorio
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Loader2 } from 'lucide-react';
import { getAllCustomers, type AdminCustomer } from '@/services/admin';
import { Pagination, paginateItems } from '@/components/admin/Pagination';
import { CustomerFormModal } from '@/components/admin/customers/CustomerFormModal';

// Legos
import { CustomerDirectoryHeader } from '@/components/admin/customers/CustomerDirectoryHeader';
import { CustomerDirectoryStats } from '@/components/admin/customers/CustomerDirectoryStats';
import { CustomerList } from '@/components/admin/customers/CustomerList';

const PAGE_SIZE = 15;

export function AdminCustomers() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // Query: All Customers
    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['admin', 'customers'],
        queryFn: getAllCustomers,
    });

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
        setIsModalOpen(false);
    };

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

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = paginateItems(filtered, safePage, PAGE_SIZE);
    const startItem = (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-theme-secondary font-medium tracking-wide">Cargando directorio de clientes...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header del Módulo */}
            <CustomerDirectoryHeader onNewCustomer={() => setIsModalOpen(true)} />

            {/* Estadísticas Globales */}
            <CustomerDirectoryStats customers={customers} />

            {/* Buscador y Directorio */}
            <div className="bg-[#13141f] rounded-[2.5rem] p-4 sm:p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-6 mb-8 px-2 sm:px-0">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-4 w-1.5 rounded-full bg-blue-500" />
                            <h2 className="text-xl font-black text-theme-primary tracking-tight">Directorio Completo</h2>
                        </div>
                        <p className="text-sm font-medium text-theme-secondary/70">
                            Explora y encuentra a cualquier miembro registrado en la plataforma.
                        </p>
                    </div>
                    <div className="w-full sm:w-96 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-secondary/50" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o ID..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-theme-primary focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:font-normal placeholder:text-theme-secondary/40"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-16 bg-black/20 rounded-3xl border border-white/5 border-dashed mx-2 sm:mx-0">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Users className="h-8 w-8 text-theme-secondary/40" />
                        </div>
                        <p className="text-lg font-black text-theme-primary mb-1">No se encontraron clientes</p>
                        <p className="text-sm text-theme-secondary font-medium">Intenta con otra búsqueda o registra uno nuevo.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tabla de Resultados (Lego) */}
                        <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
                            <CustomerList customers={paginated} />
                        </div>

                        {/* Paginación */}
                        {filtered.length > PAGE_SIZE && (
                            <div className="px-2 sm:px-0 flex justify-end">
                                <Pagination
                                    currentPage={safePage}
                                    totalPages={totalPages}
                                    onPageChange={(p) => setPage(p)}
                                    itemsLabel={`${startItem}-${endItem} de ${filtered.length}`}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal para Crear Cliente */}
            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

export default AdminCustomers;
