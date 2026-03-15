import { useState } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { useAdminFlashDeals } from '@/hooks/admin';
import { getAllProducts } from '@/services/admin';
import { useQuery } from '@tanstack/react-query';

// Legos
import { FlashDealsHeader } from '@/components/admin/flash-deals/FlashDealsHeader';
import { FlashDealsConfig } from '@/components/admin/flash-deals/FlashDealsConfig';
import { FlashDealsTable } from '@/components/admin/flash-deals/FlashDealsTable';
import { FlashDealEditor } from '@/components/admin/flash-deals/FlashDealEditor';
import type { FlashDeal, FlashDealFormData } from '@/services/admin';

export function AdminFlashDeals() {
    const { confirm } = useConfirm();

    // Editor state
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<FlashDeal | null>(null);

    // ── Unified Data & Mutations ──
    const { 
        deals, 
        isLoading, 
        saveDeal, 
        deleteDeal, 
        toggleActive, 
        isMutating,
        togglingId,
        deletingId 
    } = useAdminFlashDeals();

    // Products for selection (still using direct service if hook not unified)
    const { data: products = [] } = useQuery({
        queryKey: ['admin', 'products'],
        queryFn: getAllProducts,
        staleTime: 60_000,
    });

    // ── Handlers ──
    const handleToggle = (id: string, currentActive: boolean) => {
        toggleActive(id, !currentActive);
    };

    const handleDelete = async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: `¿Eliminar la oferta flash de "${name}"?`,
            description: 'Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        if (!isConfirmed) return;
        deleteDeal(id);
    };

    const handleSave = async (data: FlashDealFormData) => {
        await saveDeal({ ...data, id: editingDeal?.id });
        setIsEditorOpen(false);
        setEditingDeal(null);
    };

    // ── Render ──
    return (
        <div className="space-y-6">
            <FlashDealsHeader
                deals={deals}
                onAdd={() => {
                    setEditingDeal(null);
                    setIsEditorOpen(true);
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <FlashDealsConfig deals={deals} />
                </div>

                <div className="lg:col-span-2">
                    <FlashDealsTable
                        deals={deals}
                        isLoading={isLoading}
                        onEdit={(deal) => {
                            setEditingDeal(deal);
                            setIsEditorOpen(true);
                        }}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        togglingId={togglingId}
                        deletingId={deletingId}
                    />
                </div>
            </div>

            <FlashDealEditor
                deal={editingDeal}
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingDeal(null);
                }}
                onSave={handleSave}
                isSaving={isMutating}
                products={products}
            />
        </div>
    );
}
