/**
 * // ─── COMPONENTE: AdminWheelGame ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar el módulo admin de la Ruleta de Premios.
 *    Gestiona queries, mutations, editor state. Delega TODO el render a Legos
 *    en components/admin/wheel-game/.
 * // Regla / Notas: Cero UI propio excepto layout wrapper. Sin `any`. Sin cadenas mágicas.
 */
import { useState } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { useAdminWheel, useAdminWheelStats } from '@/hooks/admin/useAdminWheel';
import type { WheelPrizeAdmin } from '@/services/admin';

// Legos
import { WheelGameHeader }      from '@/components/admin/wheel-game/WheelGameHeader';
import { WheelGameStatsPanel }  from '@/components/admin/wheel-game/WheelGameStatsPanel';
import { WheelGamePrizeList }   from '@/components/admin/wheel-game/WheelGamePrizeList';
import { WheelGamePrizeEditor } from '@/components/admin/wheel-game/WheelGamePrizeEditor';

export function AdminWheelGame() {
    const { confirm } = useConfirm();

    // ── Editor state ──
    const [isEditorOpen, setIsEditorOpen]     = useState(false);
    const [editingPrize, setEditingPrize]     = useState<WheelPrizeAdmin | null>(null);

    // ── Unified Data & Mutations ──
    const { 
        prizes, 
        isLoading: prizesLoading, 
        savePrize, 
        deletePrize, 
        togglePrize, 
        isMutating,
        togglingId,
        deletingId 
    } = useAdminWheel();

    const { data: stats, isLoading: statsLoading } = useAdminWheelStats();

    // ── Handlers ──
    const handleToggle = (id: string, current: boolean) => {
        togglePrize(id, !current);
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
        deletePrize(id);
    };

    // Probabilidad total de los demás premios activos (para el editor)
    const totalOtherProbability = prizes
        .filter(p => p.is_active && p.id !== editingPrize?.id)
        .reduce((sum, p) => sum + p.probability, 0);

    // ── Render ──
    return (
        <div className="space-y-6">
            <WheelGameHeader
                prizes={prizes}
                stats={stats}
                onAdd={() => {
                    setEditingPrize(null);
                    setIsEditorOpen(true);
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <WheelGameStatsPanel stats={stats} isLoading={statsLoading} />
                </div>

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

            <WheelGamePrizeEditor
                prize={editingPrize}
                isOpen={isEditorOpen}
                isSaving={isMutating}
                totalOtherProbability={totalOtherProbability}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingPrize(null);
                }}
                onSave={async (data) => {
                    await savePrize({ ...data, id: editingPrize?.id });
                    setIsEditorOpen(false);
                    setEditingPrize(null);
                }}
            />
        </div>
    );
}
