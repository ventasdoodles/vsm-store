import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { Pagination, paginateItems } from '@/components/admin/Pagination';
import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    uploadBrandLogo,
    type Brand
} from '@/services/admin/admin-brands.service';

// ─── Subcomponents ───
import { BrandsHeader } from '@/components/admin/brands/BrandsHeader';
import { BrandsStats } from '@/components/admin/brands/BrandsStats';
import { BrandsFilters } from '@/components/admin/brands/BrandsFilters';
import { BrandsFormModal, type BrandFormData } from '@/components/admin/brands/BrandsFormModal';
import { BrandsGrid } from '@/components/admin/brands/BrandsGrid';

const EMPTY_FORM: BrandFormData = {
    name: '',
    logo_url: '',
    is_active: true,
    sort_order: 0,
};

const PAGE_SIZE = 15;

export function AdminBrands() {
    const queryClient = useQueryClient();
    const { success, error, info } = useNotification();
    
    // State
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    
    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BrandFormData>(EMPTY_FORM);

    // Queries
    const { data: brands = [], isLoading } = useQuery({
        queryKey: ['admin', 'brands'],
        queryFn: getBrands,
    });

    // Mutations
    const refreshData = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
        queryClient.invalidateQueries({ queryKey: ['brands'] }); // Client side cache if any
    };

    const createMut = useMutation({
        mutationFn: createBrand,
        onSuccess: () => {
            refreshData();
            handleCloseModal();
            success('Éxito', 'Marca creada exitosamente');
        },
        onError: (err: Error) => {
            console.error(err);
            error('Error', 'No se pudo crear la marca: ' + err.message);
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) =>
            updateBrand(id, data),
        onSuccess: () => {
            refreshData();
            handleCloseModal();
            success('Éxito', 'Marca actualizada exitosamente');
        },
        onError: (err: Error) => {
            console.error(err);
            error('Error', 'No se pudo actualizar la marca: ' + err.message);
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteBrand,
        onSuccess: () => {
            refreshData();
            success('Éxito', 'Marca eliminada permanentemente');
        },
        onError: (err: Error) => {
            console.error(err);
            error('Error', 'No se pudo eliminar la marca');
        },
    });

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
            setForm({
                name: brand.name,
                logo_url: brand.logo_url || '',
                is_active: brand.is_active,
                sort_order: brand.sort_order,
            });
        } else {
            setEditingId(null);
            setForm({
                ...EMPTY_FORM,
                sort_order: brands.length > 0 ? Math.max(...brands.map(b => b.sort_order || 0)) + 10 : 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleDuplicate = (b: Brand) => {
        setForm({
            name: `${b.name} (Copia)`,
            logo_url: b.logo_url || '',
            is_active: false,
            sort_order: b.sort_order + 1,
        });
        setEditingId(null);
        setIsModalOpen(true);
        info('Aviso', 'Marca duplicada. Modifica los detalles y guarda.');
    };

    const handleDelete = (b: Brand) => {
        if (confirm(`¿Estás seguro de eliminar la marca "${b.name}"? Esta acción no se puede deshacer.`)) {
            deleteMut.mutate(b.id);
        }
    };

    const handleToggleActive = (id: string, active: boolean) => {
        updateMut.mutate({ id, data: { is_active: active } });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            error('Validación', 'El nombre de la marca es obligatorio.');
            return;
        }

        if (editingId) {
            updateMut.mutate({ id: editingId, data: form });
        } else {
            createMut.mutate(form);
        }
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
                isPending={createMut.isPending || updateMut.isPending}
                onUploadLogo={uploadBrandLogo}
            />
        </div>
    );
}

export default AdminBrands;
