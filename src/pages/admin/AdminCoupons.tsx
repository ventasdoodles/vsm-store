// Gestión de Cupones (Admin) - VSM Store
// CRUD de cupones con validación inline y arquitectura de Legos
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';  
import { Ticket, Search, Loader2 } from 'lucide-react';
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    type AdminCoupon,
    type CouponFormData,
} from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import { Pagination, paginateItems } from '@/components/admin/Pagination';      

// Importar Legos
import { CouponHeader } from '@/components/admin/coupons/CouponHeader';
import { CouponStats } from '@/components/admin/coupons/CouponStats';
import { CouponCard } from '@/components/admin/coupons/CouponCard';
import { CouponForm } from '@/components/admin/coupons/CouponForm';

const EMPTY_FORM: CouponFormData = {
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 0,
    max_uses: null,
    is_active: true,
    valid_from: null,
    valid_until: null,
    customer_id: null,
};

const PAGE_SIZE = 12;

export function AdminCoupons() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<CouponFormData>(EMPTY_FORM);
    const [page, setPage] = useState(1);
    const { success: notifySuccess, error: notifyError } = useNotification();

    // Query
    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['admin', 'coupons'],
        queryFn: getAllCoupons,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });  
            resetForm();
            notifySuccess('Cupón creado', 'El nuevo cupón ya está disponible.');
        },
        onError: (err) => {
            console.error(err);
            notifyError('Error al crear cupón', 'No se pudo crear el cupón. Inténtalo de nuevo.');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CouponFormData> }) => updateCoupon(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });  
            resetForm();
            notifySuccess('Cupón actualizado', 'Los cambios se guardaron correctamente.');
        },
        onError: (err) => {
            console.error(err);
            notifyError('Error al actualizar', 'No se pudieron guardar los cambios.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
            notifySuccess('Cupón desactivado', 'El cupón ha sido desactivado exitosamente.');
        },
        onError: (err) => {
            console.error(err);
            notifyError('Error al desactivar', 'No se pudo desactivar el cupón.');
        },
    });

    const filtered = useMemo(() => {
        if (!search.trim()) return coupons;
        const q = search.toLowerCase();
        return coupons.filter(
            (c: AdminCoupon) =>
                c.code?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q)
        );
    }, [coupons, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));     
    const safePage = Math.min(page, totalPages);
    const paginated = paginateItems(filtered, safePage, PAGE_SIZE);
    const startItem = (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setIsCreating(false);
    };

    const handleEdit = (coupon: AdminCoupon) => {
        setForm({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_purchase: coupon.min_purchase,
            max_uses: coupon.max_uses,
            is_active: coupon.is_active,
            valid_from: coupon.valid_from,
            valid_until: coupon.valid_until,
            customer_id: coupon.customer_id,
        });
        setEditingId(coupon.id);
        setIsCreating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDuplicate = (coupon: AdminCoupon) => {
        setForm({
            code: `${coupon.code}_COPIA`,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_purchase: coupon.min_purchase,
            max_uses: coupon.max_uses,
            is_active: true,
            valid_from: null,
            valid_until: null,
            customer_id: coupon.customer_id,
        });
        setEditingId(null);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (data: CouponFormData) => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" />
                <p className="text-theme-secondary font-medium tracking-wide">Cargando orquestador de cupones...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Módulo */}
            <CouponHeader onNewCoupon={() => {
                resetForm();
                setIsCreating(true);
            }} />

            {/* Lego: Estadísticas Globales */}
            <CouponStats coupons={coupons} />

            {/* Lego: Formulario (Crear/Editar) */}
            {(isCreating || editingId) && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <CouponForm
                        initialData={form}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                        isSubmitting={createMutation.isPending || updateMutation.isPending}                                                                                         
                    />
                </div>
            )}

            {/* Buscador de Cupones */}
            <div className="bg-[#13141f] rounded-[2.5rem] p-6 sm:p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-4 w-1.5 rounded-full bg-fuchsia-500" />
                            <h2 className="text-xl font-black text-theme-primary tracking-tight">Directorio de Cupones</h2>
                        </div>
                        <p className="text-sm font-medium text-theme-secondary/70">
                            Administra aquí todos tus códigos promocionales vigentes y pasados.
                        </p>
                    </div>
                    <div className="w-full sm:w-96 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-secondary/50" />                                                                    
                        <input
                            type="text"
                            placeholder="Buscar por código o descripción..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all placeholder:font-normal placeholder:text-theme-secondary/40"                 
                        />
                    </div>
                </div>

                {/* Lego: Grid de Cupones */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 bg-black/20 rounded-3xl border border-white/5 border-dashed">                                                                             
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Ticket className="h-8 w-8 text-theme-secondary/40" />                                                                                   
                        </div>
                        <p className="text-lg font-black text-theme-primary mb-1">No se encontraron cupones</p>                                                                                   
                        <p className="text-sm text-theme-secondary font-medium">Intenta con otra búsqueda o crea uno nuevo utilizando el botón superior.</p>                                                            
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">  
                            {paginated.map((coupon) => (
                                <CouponCard
                                    key={coupon.id}
                                    coupon={coupon}
                                    onEdit={handleEdit}
                                    onDelete={(id) => {
                                        if (confirm('¿Estás seguro de desactivar este cupón?')) {                                                                                                           
                                            deleteMutation.mutate(id);
                                        }
                                    }}
                                    onDuplicate={handleDuplicate}
                                />
                            ))}
                        </div>

                        {filtered.length > PAGE_SIZE && (
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={(p) => setPage(p)}
                                itemsLabel={`${startItem}-${endItem} de ${filtered.length}`}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
