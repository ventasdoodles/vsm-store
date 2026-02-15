// Gestión de Cupones (Admin) - VSM Store
// CRUD de cupones con validación inline
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Ticket,
    Plus,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Search,
    Save,
    Loader2,
    Percent,
    DollarSign,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    type AdminCoupon,
    type CouponFormData,
} from '@/services/admin.service';
import { Pagination, paginateItems } from '@/components/admin/Pagination';

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
};

const PAGE_SIZE = 10;

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
        setIsCreating(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleEdit = (coupon: AdminCoupon) => {
        setForm({
            code: coupon.code,
            description: coupon.description ?? '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_purchase: coupon.min_purchase,
            max_uses: coupon.max_uses,
            is_active: coupon.is_active,
            valid_from: coupon.valid_from,
            valid_until: coupon.valid_until,
        });
        setEditingId(coupon.id);
        setIsCreating(false);
    };

    const handleSave = () => {
        if (!form.code.trim()) return alert('El código es obligatorio');
        if (form.discount_value <= 0) return alert('El descuento debe ser mayor a 0');

        if (isCreating) {
            createMutation.mutate({ ...form, code: form.code.toUpperCase().trim() });
        } else if (editingId) {
            updateMutation.mutate({
                id: editingId,
                data: { ...form, code: form.code.toUpperCase().trim() },
            });
        }
    };

    const handleDelete = (id: string, code: string) => {
        if (confirm(`¿Desactivar cupón "${code}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const formatDate = (d: string | null) =>
        d
            ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';

    // ─── Form UI ─────────────────────────────────
    const renderForm = () => {
        if (!isCreating && !editingId) return null;

        return (
            <div className="mb-5 rounded-2xl border border-vape-500/30 bg-vape-500/5 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-vape-300">
                    {isCreating ? 'Nuevo Cupón' : 'Editar Cupón'}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Code */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">Código *</label>
                        <input
                            autoFocus
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            className="w-full rounded-xl border border-primary-700 bg-primary-900 px-3 py-2 text-sm font-mono text-primary-200 focus:border-vape-500 focus:outline-none"
                            placeholder="VERANO20"
                        />
                    </div>
                    {/* Discount Type */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">Tipo</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, discount_type: 'percentage' })}
                                className={cn(
                                    'flex-1 rounded-xl border py-2 text-sm font-medium transition-colors',
                                    form.discount_type === 'percentage'
                                        ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                        : 'border-primary-800/50 bg-primary-950/60 text-primary-500'
                                )}
                            >
                                <Percent className="inline h-3.5 w-3.5 mr-1" />
                                Porcentaje
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, discount_type: 'fixed' })}
                                className={cn(
                                    'flex-1 rounded-xl border py-2 text-sm font-medium transition-colors',
                                    form.discount_type === 'fixed'
                                        ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                        : 'border-primary-800/50 bg-primary-950/60 text-primary-500'
                                )}
                            >
                                <DollarSign className="inline h-3.5 w-3.5 mr-1" />
                                Fijo
                            </button>
                        </div>
                    </div>
                    {/* Discount Value */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">
                            Valor {form.discount_type === 'percentage' ? '(%)' : '($)'}
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={form.discount_type === 'percentage' ? 1 : 0.01}
                            value={form.discount_value}
                            onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-xl border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                    {/* Min Purchase */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">Compra mínima ($)</label>
                        <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={form.min_purchase}
                            onChange={(e) => setForm({ ...form, min_purchase: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-xl border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                    {/* Max Uses */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">Usos máximos</label>
                        <input
                            type="number"
                            min={0}
                            value={form.max_uses ?? ''}
                            onChange={(e) => setForm({ ...form, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full rounded-xl border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                            placeholder="Ilimitado"
                        />
                    </div>
                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">Descripción</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-xl border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                            placeholder="Descuento de verano"
                        />
                    </div>
                    {/* Valid From */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">Válido desde</label>
                        <input
                            type="date"
                            value={form.valid_from?.split('T')[0] ?? ''}
                            onChange={(e) => setForm({ ...form, valid_from: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            className="w-full rounded-xl border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                    {/* Valid Until */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-primary-400">Válido hasta</label>
                        <input
                            type="date"
                            value={form.valid_until?.split('T')[0] ?? ''}
                            onChange={(e) => setForm({ ...form, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            className="w-full rounded-xl border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-primary-200 focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                        onClick={resetForm}
                        className="rounded-xl border border-primary-800/50 px-4 py-2 text-sm font-medium text-primary-400 hover:bg-primary-800/50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 disabled:opacity-50 transition-all"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isCreating ? 'Crear' : 'Guardar'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">Cupones</h1>
                    <p className="text-sm text-primary-500">
                        {filtered.length} cupón{filtered.length !== 1 ? 'es' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 sm:w-56">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
                        <input
                            type="text"
                            placeholder="Buscar cupón..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full rounded-xl border border-primary-800/50 bg-primary-900/60 py-2.5 pl-10 pr-4 text-sm text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none"
                        />
                    </div>
                    {!isCreating && !editingId && (
                        <button
                            onClick={() => {
                                setForm(EMPTY_FORM);
                                setIsCreating(true);
                                setEditingId(null);
                            }}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 hover:shadow-vape-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo
                        </button>
                    )}
                </div>
            </div>

            {/* Form */}
            {renderForm()}

            {/* Table */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-primary-800/30" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary-800/40 bg-primary-900/60 py-16">
                    <Ticket className="h-12 w-12 text-primary-700 mb-3" />
                    <p className="text-sm text-primary-500">
                        {search ? 'No se encontraron cupones' : 'No hay cupones aún'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-900/60">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-primary-800/30">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider">
                                            Descuento
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider hidden sm:table-cell">
                                            Compra mín.
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider hidden md:table-cell">
                                            Usos
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider hidden lg:table-cell">
                                            Vigencia
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider">
                                            Activo
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary-800/20">
                                    {paginated.map((coupon) => (
                                        <tr
                                            key={coupon.id}
                                            className={cn(
                                                'hover:bg-primary-800/20 transition-colors',
                                                !coupon.is_active && 'opacity-50'
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-mono font-semibold text-primary-200">
                                                        {coupon.code}
                                                    </p>
                                                    {coupon.description && (
                                                        <p className="text-xs text-primary-500 truncate max-w-[200px]">
                                                            {coupon.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                                        coupon.discount_type === 'percentage'
                                                            ? 'bg-vape-500/10 text-vape-400'
                                                            : 'bg-emerald-500/10 text-emerald-400'
                                                    )}
                                                >
                                                    {coupon.discount_type === 'percentage' ? (
                                                        <>{coupon.discount_value}%</>
                                                    ) : (
                                                        <>{formatPrice(coupon.discount_value)}</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-primary-400 hidden sm:table-cell">
                                                {coupon.min_purchase > 0 ? formatPrice(coupon.min_purchase) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center hidden md:table-cell">
                                                <span className="text-xs text-primary-400">
                                                    {coupon.current_uses}
                                                    {coupon.max_uses !== null ? ` / ${coupon.max_uses}` : ' / ∞'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center hidden lg:table-cell">
                                                <div className="text-[11px] text-primary-500 space-y-0.5">
                                                    <div>Desde: {formatDate(coupon.valid_from)}</div>
                                                    <div>Hasta: {formatDate(coupon.valid_until)}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {coupon.is_active ? (
                                                    <ToggleRight className="inline h-5 w-5 text-emerald-400" />
                                                ) : (
                                                    <ToggleLeft className="inline h-5 w-5 text-primary-600" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-800 hover:text-primary-300 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id, coupon.code)}
                                                        disabled={deleteMutation.isPending}
                                                        className="rounded-lg p-1.5 text-primary-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                                                        title="Desactivar"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
