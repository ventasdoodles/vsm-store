// Gestión de Cupones (Admin) - VSM Store
// CRUD de cupones con validación inline y arquitectura de Legos
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Search, Loader2 } from 'lucide-react';
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    type AdminCoupon,
    type CouponFormData,
} from '@/services/admin';
import { Pagination, paginateItems } from '@/components/admin/Pagination';

// Importar Legos
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
        },
        onError: (err) => {
            console.error(err);
            alert('Error al crear cupón');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CouponFormData> }) =>
            updateCoupon(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
            resetForm();
        },
        onError: (err) => {
            console.error(err);
            alert('Error al actualizar cupón');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCoupon,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
        onError: (err) => {
            console.error(err);
            alert('Error al desactivar cupón');
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-theme-secondary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
                        <Ticket className="h-6 w-6 text-theme-secondary" />
                        Cupones y Promociones
                    </h1>
                    <p className="text-sm text-theme-secondary mt-1">
                        Gestiona códigos de descuento, reglas y límites de uso.
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsCreating(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-theme-secondary hover:bg-theme-secondary/90 text-theme-primary px-4 py-2.5 rounded-xl font-bold transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Cupón
                </button>
            </div>

            {/* Lego: Estadísticas Globales */}
            <CouponStats coupons={coupons} />

            {/* Lego: Formulario (Crear/Editar) */}
            {(isCreating || editingId) && (
                <CouponForm 
                    initialData={form}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
            )}

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-secondary" />
                <input
                    type="text"
                    placeholder="Buscar por código o descripción..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full bg-theme-primary/20 border border-theme rounded-xl pl-12 pr-4 py-3 text-theme-primary focus:border-vape-500 outline-none"
                />
            </div>

            {/* Lego: Grid de Cupones */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-theme-primary/20 rounded-2xl border border-theme">
                    <Ticket className="h-12 w-12 text-theme-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-theme-secondary font-medium">No se encontraron cupones</p>
                    <p className="text-sm text-theme-secondary mt-1">Intenta con otra búsqueda o crea uno nuevo.</p>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            itemsLabel={`${startItem}–${endItem} de ${filtered.length}`}
                        />
                    )}
                </>
            )}
        </div>
    );
}
