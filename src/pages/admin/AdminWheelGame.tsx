/**
 * // ─── COMPONENTE: AdminWheelGame ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar el módulo admin de la Ruleta de Premios.
 *    Gestiona queries, mutations, editor state. Delega TODO el render a Legos
 *    en components/admin/wheel-game/.
 * // Regla / Notas: Cero UI propio excepto layout wrapper. Sin `any`. Sin cadenas mágicas.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';
import {
    getAllWheelPrizes,
    createWheelPrize,
    updateWheelPrize,
    deleteWheelPrize,
    toggleWheelPrize,
    getWheelStats,
    type WheelPrizeAdmin,
    type WheelPrizeFormData,
} from '@/services/admin/admin-wheel.service';

// Legos
import { WheelGameHeader }      from '@/components/admin/wheel-game/WheelGameHeader';
import { WheelGameStatsPanel }  from '@/components/admin/wheel-game/WheelGameStatsPanel';
import { WheelGamePrizeList }   from '@/components/admin/wheel-game/WheelGamePrizeList';
import { WheelGamePrizeEditor } from '@/components/admin/wheel-game/WheelGamePrizeEditor';

/** Query keys */
const PRIZES_KEY = ['admin', 'wheel', 'prizes'] as const;
const STATS_KEY  = ['admin', 'wheel', 'stats']  as const;

export function AdminWheelGame() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const { confirm } = useConfirm();

    // ── Editor state ──
    const [isEditorOpen, setIsEditorOpen]     = useState(false);
    const [editingPrize, setEditingPrize]     = useState<WheelPrizeAdmin | null>(null);

    // ── Data ──
    const { data: prizes = [], isLoading: prizesLoading } = useQuery({
        queryKey: [...PRIZES_KEY],
        queryFn:  getAllWheelPrizes,
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: [...STATS_KEY],
        queryFn:  getWheelStats,
        staleTime: 30_000,
    });

    const invalidatePrizes = () => queryClient.invalidateQueries({ queryKey: [...PRIZES_KEY] });
    const invalidateStats  = () => queryClient.invalidateQueries({ queryKey: [...STATS_KEY] });
    const invalidateAll    = () => { invalidatePrizes(); invalidateStats(); };

    // ── Mutations ──
    const saveMutation = useMutation({
        mutationFn: async (data: WheelPrizeFormData) =>
            editingPrize
                ? updateWheelPrize(editingPrize.id, data)
                : createWheelPrize(data),
        onSuccess: () => {
            invalidatePrizes();
            success(
                editingPrize ? 'Premio actualizado' : 'Premio creado',
                `El segmento de la ruleta se ${editingPrize ? 'actualizó' : 'creó'} exitosamente.`,
            );
            setIsEditorOpen(false);
            setEditingPrize(null);
        },
        onError: () => notifyError('Error', 'No se pudo guardar el premio'),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            toggleWheelPrize(id, active),
        onSuccess: () => { invalidatePrizes(); },
        onError: () => notifyError('Error', 'No se pudo cambiar el estado'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteWheelPrize(id),
        onSuccess: () => { invalidateAll(); success('Eliminado', 'Premio eliminado de la ruleta'); },
        onError: () => notifyError('Error', 'No se pudo eliminar el premio'),
    });

    // ── Handlers ──
    const handleToggle = (id: string, current: boolean) => {
        toggleMutation.mutate({ id, active: !current });
    };

    const handleDelete = async (id: string, label: string) => {
        const ok = await confirm({
            title: `¿Eliminar el premio "${label}"?`,
            description: 'Se eliminará el segmento de la ruleta. Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger',
        });
        if (!ok) return;
        deleteMutation.mutate(id);
    };

    // Probabilidad total de los demás premios activos (para el editor)
    const totalOtherProbability = prizes
        .filter(p => p.is_active && p.id !== editingPrize?.id)
        .reduce((sum, p) => sum + p.probability, 0);

    // Derived mutation state
    const togglingId = toggleMutation.isPending ? toggleMutation.variables?.id  : undefined;
    const deletingId = deleteMutation.isPending ? deleteMutation.variables       : undefined;

    // ── Render ──
    return (
        <div className="space-y-6">
            {/* Header + quick stats */}
            <WheelGameHeader
                prizes={prizes}
                stats={stats}
                onAdd={() => {
                    setEditingPrize(null);
                    setIsEditorOpen(true);
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats panel — 1 col */}
                <div className="lg:col-span-1">
                    <WheelGameStatsPanel stats={stats} isLoading={statsLoading} />
                </div>

                {/* Prize table — 2 cols */}
                <div className="lg:col-span-2">
                    <WheelGamePrizeList
                        prizes={prizes}
                        isLoading={prizesLoading}
                        togglingId={togglingId}
                        deletingId={deletingId}
                        onEdit={(prize) => {
                            setEditingPrize(prize);
                            setIsEditorOpen(true);
                        }}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {/* Editor slide-over */}
            <WheelGamePrizeEditor
                prize={editingPrize}
                isOpen={isEditorOpen}
                isSaving={saveMutation.isPending}
                totalOtherProbability={totalOtherProbability}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingPrize(null);
                }}
                onSave={(data) => saveMutation.mutate(data)}
            />
        </div>
    );
}
