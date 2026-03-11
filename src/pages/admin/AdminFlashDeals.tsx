/**
 * // ─── COMPONENTE: AdminFlashDeals ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar el modulo de Ofertas Flash. Gestiona queries,
 *    mutations, editor state, y el countdown global (via store_settings).
 *    Delega TODO el render a los Legos en components/admin/flash-deals/.
 * // Regla / Notas: Cero UI propio excepto layout wrapper. Sin `any`, sin cadenas magicas.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';
import {
    getAllFlashDeals,
    createFlashDeal,
    updateFlashDeal,
    deleteFlashDeal,
    toggleFlashDealActive,
    type FlashDeal,
    type FlashDealFormData,
} from '@/services/admin/admin-flash-deals.service';
import { getAllProducts } from '@/services/admin';

// Legos
import { FlashDealsHeader } from '@/components/admin/flash-deals/FlashDealsHeader';
import { FlashDealsConfig } from '@/components/admin/flash-deals/FlashDealsConfig';
import { FlashDealsTable } from '@/components/admin/flash-deals/FlashDealsTable';
import { FlashDealEditor } from '@/components/admin/flash-deals/FlashDealEditor';

/** Query keys */
const DEALS_KEY = ['admin', 'flash-deals'] as const;
const PRODUCTS_KEY = ['admin', 'products'] as const;

export function AdminFlashDeals() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const { confirm } = useConfirm();

    // Editor state
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<FlashDeal | null>(null);

    // ── Data ──
    const { data: deals = [], isLoading } = useQuery({
        queryKey: [...DEALS_KEY],
        queryFn: getAllFlashDeals,
    });

    const { data: products = [] } = useQuery({
        queryKey: [...PRODUCTS_KEY],
        queryFn: getAllProducts,
        staleTime: 60_000,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [...DEALS_KEY] });
    };

    // ── Mutations ──
    const saveMutation = useMutation({
        mutationFn: async (data: FlashDealFormData) => {
            if (editingDeal) {
                return updateFlashDeal(editingDeal.id, data);
            }
            return createFlashDeal(data);
        },
        onSuccess: () => {
            invalidate();
            success(editingDeal ? 'Actualizada' : 'Creada', `Oferta flash ${editingDeal ? 'actualizada' : 'creada'} exitosamente`);
            setIsEditorOpen(false);
            setEditingDeal(null);
        },
        onError: () => notifyError('Error', 'No se pudo guardar la oferta flash'),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            toggleFlashDealActive(id, active),
        onSuccess: () => { invalidate(); success('Actualizada', 'Estado de la oferta actualizado'); },
        onError: () => notifyError('Error', 'No se pudo cambiar el estado'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteFlashDeal(id),
        onSuccess: () => { invalidate(); success('Eliminada', 'Oferta flash eliminada'); },
        onError: () => notifyError('Error', 'No se pudo eliminar la oferta'),
    });

    // ── Handlers ──
    const handleToggle = (id: string, currentActive: boolean) => {
        toggleMutation.mutate({ id, active: !currentActive });
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
        deleteMutation.mutate(id);
    };

    // Derived mutation state
    const togglingId = toggleMutation.isPending ? toggleMutation.variables?.id : undefined;
    const deletingId = deleteMutation.isPending ? deleteMutation.variables : undefined;

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
                {/* Config card — takes 1 col on lg */}
                <div className="lg:col-span-1">
                <FlashDealsConfig deals={deals} />
                </div>

                {/* Table — takes 2 cols on lg */}
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
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
                products={products}
            />
        </div>
    );
}
