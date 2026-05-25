import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';
import { Pagination, paginateItems } from '@/components/admin/Pagination';
import { useAdminBrands } from '@/hooks/admin/useAdminCatalog';
import { uploadBrandLogo, type Brand } from '@/services/admin';
import {
    buildBrandCreateForm,
    buildBrandDuplicateForm,
    buildBrandEditForm,
    buildBrandSubmitPayload,
    buildEmptyBrandForm,
    type BrandFormData,
} from '@/lib/domain/adminBrands';

// ─── Subcomponents ───
import { BrandsHeader } from '@/components/admin/brands/BrandsHeader';
import { BrandsStats } from '@/components/admin/brands/BrandsStats';
import { BrandsFilters } from '@/components/admin/brands/BrandsFilters';
import { BrandsFormModal } from '@/components/admin/brands/BrandsFormModal';
import { BrandsGrid } from '@/components/admin/brands/BrandsGrid';

const PAGE_SIZE = 15;

export function AdminBrands() {
    const { 
        brands, 
        isLoading, 
        createBrand, 
        updateBrand, 
        deleteBrand, 
        isMutating 
    } = useAdminBrands();

    const { error, info } = useNotification();
    const { confirm } = useConfirm();

    // State
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BrandFormData>(buildEmptyBrandForm());

    // Filtering & Derived Data
    const filtered = useMemo(() => {
        let result = brands;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (b) => b.name.toLowerCase().includes(q)
            );
        }

        return result;
    }, [brands, search]);

    const stats = useMemo(() => {
        const total = brands.length;
        const active = brands.filter(b => b.is_active).length;
        const inactive = total - active;
        return { total, active, inactive };
    }, [brands]);

    // Pagination Calculation
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = paginateItems(filtered, safePage, PAGE_SIZE);
    const startItem = (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);

    // Handlers
    const handleOpenModal = (brand?: Brand) => {
        if (brand) {
            setEditingId(brand.id);
            setForm(buildBrandEditForm(brand));
        } else {
            setEditingId(null);
            setForm(buildBrandCreateForm(brands));
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(buildEmptyBrandForm());
    };

    const handleDuplicate = (b: Brand) => {
        setForm(buildBrandDuplicateForm(b));
        setEditingId(null);
        setIsModalOpen(true);
        info('Aviso', 'Marca duplicada. Modifica los detalles y guarda.');
    };

    const handleDelete = async (b: Brand) => {
        const isConfirmed = await confirm({
            title: `¿Eliminar "${b.name}"?`,
            description: 'Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        if (isConfirmed) {
            deleteBrand(b.id);
        }
    };

    const handleToggleActive = (id: string, active: boolean) => {
        updateBrand(id, { is_active: active });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            error('Validación', 'El nombre de la marca es obligatorio.');
            return;
        }

        const payload = buildBrandSubmitPayload(form);
        if (editingId) {
            await updateBrand(editingId, payload);
        } else {
            await createBrand(payload);
        }
        handleCloseModal();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500 relative z-10" />
                </div>
                <p className="text-theme-secondary font-medium tracking-wide animate-pulse">Cargando marcas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
            <BrandsHeader onNew={() => handleOpenModal()} />

            <BrandsStats stats={stats} />

            <div className="bg-[#181825]/50 rounded-3xl p-6 border border-white/5 space-y-6">
                <BrandsFilters
                    search={search}
                    onSearchChange={(val) => { setSearch(val); setPage(1); }}
                />

                <BrandsGrid
                    brands={paginated}
                    onEdit={handleOpenModal}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                />

                {filtered.length > PAGE_SIZE && (
                    <div className="pt-6 border-t border-white/5 flex justify-center">
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={(p) => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            itemsLabel={`${startItem}–${endItem} de ${filtered.length} marcas`}
                        />
                    </div>
                )}
            </div>

            <BrandsFormModal
                isOpen={isModalOpen}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                editingId={editingId}
                isPending={isMutating}
                onUploadLogo={uploadBrandLogo}
            />
        </div>
    );
}

