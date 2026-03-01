// Gestión de Testimonios (Admin) - VSM Store
// CRUD completo para reseñas de clientes con filtros y formulario inline
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    MessageSquareQuote,
    Plus,
    Search,
    Loader2,
    Star,
    ShieldCheck,
    Sparkles,
    Eye,
    EyeOff,
    Pencil,
    Trash2,
    X,
    Save,
    Copy,
} from 'lucide-react';
import {
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialFeatured,
    toggleTestimonialActive,
    type Testimonial,
    type TestimonialFormData,
} from '@/services/admin/admin-testimonials.service';
import { Pagination, paginateItems } from '@/components/admin/Pagination';
import { cn } from '@/lib/utils';

// ─── Empty Form ──────────────────────────────────────────────────────────────

const EMPTY_FORM: TestimonialFormData = {
    customer_name: '',
    customer_location: '',
    avatar_url: '',
    rating: 5,
    title: '',
    body: '',
    section: '',
    category_id: '',
    product_id: '',
    verified_purchase: true,
    is_featured: false,
    is_active: true,
    sort_order: 0,
    review_date: new Date().toISOString().slice(0, 10),
};

const PAGE_SIZE = 12;

// ─── Main Component ─────────────────────────────────────────────────────────

export function AdminTestimonials() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filterSection, setFilterSection] = useState<string>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<TestimonialFormData>(EMPTY_FORM);
    const [page, setPage] = useState(1);

    // ─── Query ───────────────────────────────────────────────────────────────
    const { data: testimonials = [], isLoading } = useQuery({
        queryKey: ['admin', 'testimonials'],
        queryFn: getAllTestimonials,
    });

    // ─── Mutations ───────────────────────────────────────────────────────────
    const createMut = useMutation({
        mutationFn: createTestimonial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            resetForm();
        },
        onError: (err) => {
            console.error(err);
            alert('Error al crear testimonio');
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TestimonialFormData> }) =>
            updateTestimonial(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            resetForm();
        },
        onError: (err) => {
            console.error(err);
            alert('Error al actualizar testimonio');
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteTestimonial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        },
        onError: (err) => {
            console.error(err);
            alert('Error al eliminar testimonio');
        },
    });

    const toggleFeaturedMut = useMutation({
        mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
            toggleTestimonialFeatured(id, featured),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        },
    });

    const toggleActiveMut = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            toggleTestimonialActive(id, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        },
    });

    // ─── Filtering ───────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = testimonials;

        // Section filter
        if (filterSection !== 'all') {
            if (filterSection === 'general') {
                result = result.filter((t: Testimonial) => !t.section);
            } else {
                result = result.filter((t: Testimonial) => t.section === filterSection);
            }
        }

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t: Testimonial) =>
                    t.customer_name?.toLowerCase().includes(q) ||
                    t.body?.toLowerCase().includes(q) ||
                    t.title?.toLowerCase().includes(q) ||
                    t.customer_location?.toLowerCase().includes(q),
            );
        }

        return result;
    }, [testimonials, search, filterSection]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = paginateItems(filtered, safePage, PAGE_SIZE);
    const startItem = (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);

    // ─── Form Helpers ────────────────────────────────────────────────────────
    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setIsCreating(false);
    };

    const handleEdit = (t: Testimonial) => {
        setForm({
            customer_name: t.customer_name,
            customer_location: t.customer_location ?? '',
            avatar_url: t.avatar_url ?? '',
            rating: t.rating,
            title: t.title ?? '',
            body: t.body,
            section: t.section ?? '',
            category_id: t.category_id ?? '',
            product_id: t.product_id ?? '',
            verified_purchase: t.verified_purchase,
            is_featured: t.is_featured,
            is_active: t.is_active,
            sort_order: t.sort_order,
            review_date: (t.review_date ?? new Date().toISOString()).slice(0, 10),
        });
        setEditingId(t.id);
        setIsCreating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDuplicate = (t: Testimonial) => {
        setForm({
            customer_name: t.customer_name,
            customer_location: t.customer_location ?? '',
            avatar_url: t.avatar_url ?? '',
            rating: t.rating,
            title: t.title ?? '',
            body: t.body,
            section: t.section ?? '',
            category_id: t.category_id ?? '',
            product_id: t.product_id ?? '',
            verified_purchase: t.verified_purchase,
            is_featured: false,
            is_active: true,
            sort_order: t.sort_order + 1,
            review_date: new Date().toISOString().slice(0, 10),
        });
        setEditingId(null);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customer_name.trim() || !form.body.trim()) {
            alert('Nombre y texto son obligatorios');
            return;
        }
        if (editingId) {
            updateMut.mutate({ id: editingId, data: form });
        } else {
            createMut.mutate(form);
        }
    };

    // ─── Stats ───────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = testimonials.length;
        const active = testimonials.filter((t: Testimonial) => t.is_active).length;
        const featured = testimonials.filter((t: Testimonial) => t.is_featured).length;
        const avgRating = total > 0
            ? (testimonials.reduce((s: number, t: Testimonial) => s + t.rating, 0) / total).toFixed(1)
            : '0';
        const vape = testimonials.filter((t: Testimonial) => t.section === 'vape').length;
        const herbal = testimonials.filter((t: Testimonial) => t.section === '420').length;
        return { total, active, featured, avgRating, vape, herbal };
    }, [testimonials]);

    // ─── Loading ─────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-theme-secondary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
                        <MessageSquareQuote className="h-6 w-6 text-theme-secondary" />
                        Testimonios
                    </h1>
                    <p className="text-sm text-theme-secondary mt-1">
                        Gestiona reseñas de clientes. Se muestran dinámicamente según el contexto de navegación.
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsCreating(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Testimonio
                </button>
            </div>

            {/* ─── Stats Bar ─── */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <StatBadge label="Total" value={stats.total} />
                <StatBadge label="Activos" value={stats.active} color="emerald" />
                <StatBadge label="Destacados" value={stats.featured} color="amber" />
                <StatBadge label="Rating" value={stats.avgRating} color="yellow" icon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />} />
                <StatBadge label="Vape" value={stats.vape} color="purple" />
                <StatBadge label="420" value={stats.herbal} color="green" />
            </div>

            {/* ─── Form (Create / Edit) ─── */}
            {(isCreating || editingId) && (
                <form
                    onSubmit={handleSubmit}
                    className="p-6 rounded-2xl bg-theme-secondary/40 border border-white/10 space-y-5"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-theme-primary">
                            {editingId ? 'Editar Testimonio' : 'Nuevo Testimonio'}
                        </h2>
                        <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-theme-secondary transition-colors">
                            <X className="w-5 h-5 text-theme-secondary" />
                        </button>
                    </div>

                    {/* Row 1: Name + Location + Rating */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                                Nombre del cliente *
                            </label>
                            <input
                                type="text"
                                value={form.customer_name}
                                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                className="w-full bg-theme-primary/30 border border-white/10 rounded-xl px-4 py-2.5 text-theme-primary focus:border-accent-primary outline-none"
                                placeholder="María G."
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                                Ubicación
                            </label>
                            <input
                                type="text"
                                value={form.customer_location}
                                onChange={(e) => setForm({ ...form, customer_location: e.target.value })}
                                className="w-full bg-theme-primary/30 border border-white/10 rounded-xl px-4 py-2.5 text-theme-primary focus:border-accent-primary outline-none"
                                placeholder="Xalapa, Ver."
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                                Rating
                            </label>
                            <div className="flex items-center gap-1 pt-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setForm({ ...form, rating: n })}
                                        className="p-0.5 transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={cn(
                                                'w-7 h-7 transition-colors',
                                                n <= form.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-zinc-600 hover:text-zinc-400',
                                            )}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-bold text-theme-primary tabular-nums">
                                    {form.rating}/5
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Title + Section */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                                Título (opcional)
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full bg-theme-primary/30 border border-white/10 rounded-xl px-4 py-2.5 text-theme-primary focus:border-accent-primary outline-none"
                                placeholder="Excelente producto"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                                Sección (contexto)
                            </label>
                            <select
                                value={form.section}
                                onChange={(e) => setForm({ ...form, section: e.target.value })}
                                className="w-full bg-theme-primary/30 border border-white/10 rounded-xl px-4 py-2.5 text-theme-primary focus:border-accent-primary outline-none"
                            >
                                <option value="">General (ambas secciones)</option>
                                <option value="vape">🌬️ Vape</option>
                                <option value="420">🌿 420</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Body */}
                    <div>
                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                            Texto de la reseña *
                        </label>
                        <textarea
                            value={form.body}
                            onChange={(e) => setForm({ ...form, body: e.target.value })}
                            className="w-full bg-theme-primary/30 border border-white/10 rounded-xl px-4 py-3 text-theme-primary focus:border-accent-primary outline-none resize-none"
                            rows={3}
                            placeholder="Escribe la reseña del cliente..."
                            required
                        />
                    </div>

                    {/* Row 4: Toggles + Sort + Date */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                                Fecha de reseña
                            </label>
                            <input
                                type="date"
                                value={form.review_date}
                                onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                                className="w-full bg-theme-primary/30 border border-white/10 rounded-xl px-4 py-2.5 text-theme-primary focus:border-accent-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-1.5 block">
                                Orden
                            </label>
                            <input
                                type="number"
                                value={form.sort_order}
                                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full bg-theme-primary/30 border border-white/10 rounded-xl px-4 py-2.5 text-theme-primary focus:border-accent-primary outline-none"
                                min={0}
                            />
                        </div>
                        <div className="flex items-end gap-4">
                            <ToggleSwitch
                                label="Verificada"
                                checked={form.verified_purchase}
                                onChange={(v) => setForm({ ...form, verified_purchase: v })}
                            />
                            <ToggleSwitch
                                label="Destacada"
                                checked={form.is_featured}
                                onChange={(v) => setForm({ ...form, is_featured: v })}
                            />
                        </div>
                        <div className="flex items-end">
                            <ToggleSwitch
                                label="Activa"
                                checked={form.is_active}
                                onChange={(v) => setForm({ ...form, is_active: v })}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={createMut.isPending || updateMut.isPending}
                            className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {(createMut.isPending || updateMut.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {editingId ? 'Guardar Cambios' : 'Crear Testimonio'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2.5 rounded-xl text-theme-secondary hover:bg-theme-secondary/30 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* ─── Filters Bar ─── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, texto, ubicación..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full bg-theme-primary/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-theme-primary focus:border-accent-primary outline-none"
                    />
                </div>
                <select
                    value={filterSection}
                    onChange={(e) => {
                        setFilterSection(e.target.value);
                        setPage(1);
                    }}
                    className="bg-theme-primary/20 border border-white/10 rounded-xl px-4 py-3 text-theme-primary focus:border-accent-primary outline-none"
                >
                    <option value="all">Todas las secciones</option>
                    <option value="vape">🌬️ Vape</option>
                    <option value="420">🌿 420</option>
                    <option value="general">📌 Generales</option>
                </select>
            </div>

            {/* ─── Grid de Testimonios ─── */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-theme-primary/20 rounded-2xl border border-white/10">
                    <MessageSquareQuote className="h-12 w-12 text-theme-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-theme-primary font-medium">No se encontraron testimonios</p>
                    <p className="text-sm text-theme-secondary mt-1">
                        Intenta con otra búsqueda o crea uno nuevo.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginated.map((t: Testimonial) => (
                            <TestimonialAdminCard
                                key={t.id}
                                testimonial={t}
                                onEdit={handleEdit}
                                onDuplicate={handleDuplicate}
                                onDelete={(id) => {
                                    if (confirm('¿Desactivar este testimonio?')) {
                                        deleteMut.mutate(id);
                                    }
                                }}
                                onToggleFeatured={(id, v) =>
                                    toggleFeaturedMut.mutate({ id, featured: v })
                                }
                                onToggleActive={(id, v) =>
                                    toggleActiveMut.mutate({ id, active: v })
                                }
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

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatBadge({
    label,
    value,
    color = 'default',
    icon,
}: {
    label: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
}) {
    const colorMap: Record<string, string> = {
        default: 'text-theme-primary',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        yellow: 'text-amber-400',
        purple: 'text-vape-400',
        green: 'text-herbal-400',
    };

    return (
        <div className="p-3 rounded-xl bg-theme-secondary/30 border border-white/[0.06] text-center">
            <div className={cn('text-xl font-bold tabular-nums flex items-center justify-center gap-1', colorMap[color])}>
                {icon}
                {value}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary mt-0.5">
                {label}
            </p>
        </div>
    );
}

function ToggleSwitch({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative w-10 h-5 rounded-full transition-colors duration-200',
                    checked ? 'bg-accent-primary' : 'bg-zinc-700',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow',
                        checked && 'translate-x-5',
                    )}
                />
            </button>
            <span className="text-xs font-medium text-theme-secondary">{label}</span>
        </label>
    );
}

function TestimonialAdminCard({
    testimonial: t,
    onEdit,
    onDuplicate,
    onDelete,
    onToggleFeatured,
    onToggleActive,
}: {
    testimonial: Testimonial;
    onEdit: (t: Testimonial) => void;
    onDuplicate: (t: Testimonial) => void;
    onDelete: (id: string) => void;
    onToggleFeatured: (id: string, v: boolean) => void;
    onToggleActive: (id: string, v: boolean) => void;
}) {
    return (
        <div
            className={cn(
                'p-5 rounded-2xl border transition-all',
                t.is_active
                    ? 'bg-theme-secondary/40 border-white/[0.08] hover:border-white/[0.15]'
                    : 'bg-theme-secondary/20 border-white/[0.04] opacity-60',
                t.is_featured && t.is_active && 'ring-1 ring-accent-primary/20',
            )}
        >
            {/* Top Row: Name + Badges */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                    <p className="font-semibold text-theme-primary text-sm truncate">
                        {t.customer_name}
                    </p>
                    {t.customer_location && (
                        <p className="text-xs text-theme-secondary truncate">
                            {t.customer_location}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {t.verified_purchase && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    {t.is_featured && (
                        <Sparkles className="w-4 h-4 text-amber-400" />
                    )}
                    {!t.is_active && (
                        <EyeOff className="w-4 h-4 text-red-400" />
                    )}
                </div>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                'w-3.5 h-3.5',
                                i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700',
                            )}
                        />
                    ))}
                </div>
                {t.section && (
                    <span
                        className={cn(
                            'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                            t.section === 'vape'
                                ? 'bg-vape-500/10 text-vape-400'
                                : 'bg-herbal-500/10 text-herbal-400',
                        )}
                    >
                        {t.section}
                    </span>
                )}
                <span className="text-[10px] text-theme-secondary ml-auto tabular-nums">
                    #{t.sort_order}
                </span>
            </div>

            {/* Title */}
            {t.title && (
                <p className="text-xs font-semibold text-theme-primary mb-1 truncate">
                    {t.title}
                </p>
            )}

            {/* Body */}
            <p className="text-xs text-theme-secondary line-clamp-3 mb-3 leading-relaxed">
                &ldquo;{t.body}&rdquo;
            </p>

            {/* Date */}
            <p className="text-[10px] text-theme-secondary mb-3">
                {t.review_date ? new Date(t.review_date).toLocaleDateString('es-MX') : '—'}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2 border-t border-white/[0.06]">
                <ActionBtn icon={<Pencil className="w-3.5 h-3.5" />} label="Editar" onClick={() => onEdit(t)} />
                <ActionBtn icon={<Copy className="w-3.5 h-3.5" />} label="Duplicar" onClick={() => onDuplicate(t)} />
                <ActionBtn
                    icon={t.is_featured ? <Sparkles className="w-3.5 h-3.5 text-amber-400" /> : <Sparkles className="w-3.5 h-3.5" />}
                    label={t.is_featured ? 'Quitar destacado' : 'Destacar'}
                    onClick={() => onToggleFeatured(t.id, !t.is_featured)}
                />
                <ActionBtn
                    icon={t.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    label={t.is_active ? 'Desactivar' : 'Activar'}
                    onClick={() => onToggleActive(t.id, !t.is_active)}
                />
                <ActionBtn
                    icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                    label="Eliminar"
                    onClick={() => onDelete(t.id)}
                    danger
                />
            </div>
        </div>
    );
}

function ActionBtn({
    icon,
    label,
    onClick,
    danger = false,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                'p-2 rounded-lg transition-colors',
                danger
                    ? 'hover:bg-red-500/10 text-theme-secondary hover:text-red-400'
                    : 'hover:bg-theme-secondary/50 text-theme-secondary hover:text-theme-primary',
            )}
        >
            {icon}
        </button>
    );
}
