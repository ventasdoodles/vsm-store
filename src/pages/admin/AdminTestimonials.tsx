import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

import { useAdminTestimonials } from '@/hooks/admin/useAdminMarketing';
import type { Testimonial } from '@/types/testimonial';
import type { TestimonialFormData } from '@/services/admin';
import { Pagination, paginateItems } from '@/components/admin/Pagination';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';

// ─── Subcomponents ───
import { TestimonialsHeader } from '@/components/admin/testimonials/TestimonialsHeader';
import { TestimonialsStats } from '@/components/admin/testimonials/TestimonialsStats';
import { TestimonialsFilters } from '@/components/admin/testimonials/TestimonialsFilters';
import { TestimonialsForm } from '@/components/admin/testimonials/TestimonialsForm';
import { TestimonialsGrid } from '@/components/admin/testimonials/TestimonialsGrid';

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

export function AdminTestimonials() {
    const { error, info } = useNotification();
    const { confirm } = useConfirm();

    // State
    const [search, setSearch] = useState('');
    const [filterSection, setFilterSection] = useState<string>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<TestimonialFormData>(EMPTY_FORM);
    const [page, setPage] = useState(1);

    // Unified Hook
    const { 
        testimonials, 
        isLoading, 
        createTestimonial, 
        updateTestimonial, 
        deleteTestimonial, 
        toggleFeatured, 
        toggleActive, 
        isMutating 
    } = useAdminTestimonials();

    // Filtering & Derived Data
    const filtered = useMemo(() => {
        let result = testimonials;

        if (filterSection !== 'all') {
            if (filterSection === 'general') {
                result = result.filter((t: Testimonial) => !t.section);
            } else {
                result = result.filter((t: Testimonial) => t.section === filterSection);
            }
        }

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

    // Pagination Calculation
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = paginateItems(filtered, safePage, PAGE_SIZE);
    const startItem = (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);

    // Handlers
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
            customer_name: `${t.customer_name} (Copia)`,
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
        info("Aviso", "Testimonio duplicado. ¡Recuerda guardarlo!");
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: '¿Eliminar testimonio permanentemente?',
            description: 'Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        if (isConfirmed) {
            deleteTestimonial(id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customer_name.trim() || !form.body.trim()) {
            error("Error", "El nombre y el texto de la reseña son obligatorios.");
            return;
        }
        if (editingId) {
            await updateTestimonial(editingId, form);
        } else {
            await createTestimonial(form);
        }
        resetForm();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full"></div>
                    <Loader2 className="h-10 w-10 animate-spin text-accent-primary relative z-10" />
                </div>
                <p className="text-theme-secondary font-medium tracking-wide animate-pulse">Cargando testimonios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
            <TestimonialsHeader
                onNew={() => {
                    resetForm();
                    setIsCreating(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
            />

            <TestimonialsStats stats={stats} />

            {(isCreating || editingId) && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <TestimonialsForm
                        form={form}
                        setForm={setForm}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                        editingId={editingId}
                        isPending={isMutating}
                    />
                </div>
            )}

            <div className="bg-[#181825]/50 rounded-3xl p-6 border border-white/5 space-y-6">
                <TestimonialsFilters
                    search={search}
                    onSearchChange={(val) => { setSearch(val); setPage(1); }}
                    filterSection={filterSection}
                    onFilterSectionChange={(val) => { setFilterSection(val); setPage(1); }}
                />

                <TestimonialsGrid
                    testimonials={paginated}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onToggleFeatured={(id, v) => toggleFeatured(id, v)}
                    onToggleActive={(id, v) => toggleActive(id, v)}
                />

                {filtered.length > PAGE_SIZE && (
                    <div className="pt-6 border-t border-white/5">
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={(p) => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            itemsLabel={`${startItem}–${endItem} de ${filtered.length} testimonios`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

