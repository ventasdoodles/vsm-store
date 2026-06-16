/**
 * TabCaseDrafts — B2 Pass 2: Private Case Draft Maturation Loop
 * Upgrades the passive draft queue into a minimal operator-usable maturation
 * surface. Operators can open any draft, review captured source data,
 * edit preparation fields (expected_outcome, failure_reason, evaluation_summary),
 * and save updates. readiness_status is live-computed and becomes a real signal.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookmarkPlus, RefreshCw, Trash2, MessageSquare, ShieldCheck,
    X, Save, User, Bot, Activity, FileEdit, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { PrivateCaseDraft, CaseDraftReadinessStatus } from '@/types/cesarin';
import {
    getCaseDrafts, deleteCaseDraft, updateCaseDraft, deriveCaseDraftReadiness
} from '@/services/admin/admin-case-drafts.service';

const READINESS_CONFIG: Record<CaseDraftReadinessStatus, { label: string; color: string }> = {
    draft:                  { label: 'Borrador',          color: 'bg-white/5 text-white/30 border-white/10' },
    needs_expected_outcome: { label: 'Falta resultado',   color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    ready:                  { label: 'Listo',             color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const SOURCE_CONFIG: Record<PrivateCaseDraft['source_type'], { label: string; icon: React.ReactNode }> = {
    review_drawer: {
        label: 'Revisión',
        icon: <MessageSquare className="h-3.5 w-3.5 text-vape-400" />,
    },
    qa_simulation: {
        label: 'Simulación QA',
        icon: <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />,
    },
};

interface DraftEditForm {
    expected_outcome: string;
    failure_reason: string;
    evaluation_summary: string;
}

export function TabCaseDrafts() {
    const [drafts, setDrafts] = useState<PrivateCaseDraft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedDraft, setSelectedDraft] = useState<PrivateCaseDraft | null>(null);
    const [editForm, setEditForm] = useState<DraftEditForm>({
        expected_outcome: '',
        failure_reason: '',
        evaluation_summary: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchDrafts();
    }, []);

    // Sync form when drawer opens with a different draft
    useEffect(() => {
        if (selectedDraft) {
            setEditForm({
                expected_outcome:   selectedDraft.expected_outcome   ?? '',
                failure_reason:     selectedDraft.failure_reason     ?? '',
                evaluation_summary: selectedDraft.evaluation_summary ?? '',
            });
        }
    }, [selectedDraft]);

    // Live-computed readiness from current form state
    const liveReadiness = selectedDraft
        ? deriveCaseDraftReadiness(
            editForm.expected_outcome.trim() || null,
            editForm.failure_reason.trim()   || null,
        )
        : null;

    const fetchDrafts = async () => {
        setIsLoading(true);
        try {
            const data = await getCaseDrafts();
            setDrafts(data);
        } catch (_err) {
            toast.error('Error al cargar casos de prueba');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteCaseDraft(id);
            setDrafts(prev => prev.filter(d => d.id !== id));
            if (selectedDraft?.id === id) setSelectedDraft(null);
            toast.success('Caso eliminado');
        } catch (_err) {
            toast.error('Error al eliminar el caso');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSave = async () => {
        if (!selectedDraft || !liveReadiness) return;
        setIsSaving(true);
        try {
            const updates = {
                expected_outcome:   editForm.expected_outcome.trim()   || null,
                failure_reason:     editForm.failure_reason.trim()     || null,
                evaluation_summary: editForm.evaluation_summary.trim() || null,
                readiness_status:   liveReadiness,
            };
            await updateCaseDraft(selectedDraft.id, updates);
            // Optimistic local state update
            const updated: PrivateCaseDraft = { ...selectedDraft, ...updates };
            setDrafts(prev => prev.map(d => d.id === selectedDraft.id ? updated : d));
            setSelectedDraft(updated);
            toast.success('Caso actualizado');
        } catch (_err) {
            toast.error('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const hasUnsavedChanges = selectedDraft
        ? (editForm.expected_outcome.trim()   || null) !== selectedDraft.expected_outcome
       || (editForm.failure_reason.trim()     || null) !== selectedDraft.failure_reason
       || (editForm.evaluation_summary.trim() || null) !== selectedDraft.evaluation_summary
        : false;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <BookmarkPlus className="h-4 w-4 text-amber-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Cola de Casos de Prueba
                        </h3>
                    </div>
                    <p className="text-[10px] text-white/20 pl-6">
                        {drafts.length} caso{drafts.length !== 1 ? 's' : ''} guardado{drafts.length !== 1 ? 's' : ''}
                        {drafts.filter(d => d.readiness_status === 'ready').length > 0 && (
                            <span className="ml-2 text-emerald-400/60">
                                · {drafts.filter(d => d.readiness_status === 'ready').length} listo{drafts.filter(d => d.readiness_status === 'ready').length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={fetchDrafts}
                    disabled={isLoading}
                    className="text-white/30 hover:text-amber-400 transition-colors"
                >
                    <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Table */}
            {drafts.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-20 space-y-3">
                    <BookmarkPlus className="h-16 w-16 text-amber-400" />
                    <p className="text-sm font-black uppercase tracking-widest text-white">Sin casos guardados</p>
                    <p className="text-xs text-white/40 max-w-xs">
                        Crea casos desde el drawer de revisión o desde los resultados de calidad.
                    </p>
                </div>
            ) : (
                <div className="rounded-[2rem] bg-[#0a0a0f] border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Origen</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Input</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 hidden lg:table-cell">Respuesta Observada</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 hidden xl:table-cell">Evaluación</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 hidden xl:table-cell">Resultado Esperado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Estado</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {drafts.map((draft) => {
                                const src = SOURCE_CONFIG[draft.source_type];
                                const rdx = READINESS_CONFIG[draft.readiness_status];
                                const isSelected = selectedDraft?.id === draft.id;
                                return (
                                    <tr
                                        key={draft.id}
                                        onClick={() => setSelectedDraft(draft)}
                                        className={cn(
                                            "group cursor-pointer transition-all",
                                            isSelected
                                                ? "bg-amber-500/5 border-l-2 border-l-amber-500/30"
                                                : "hover:bg-white/[0.015]"
                                        )}
                                    >
                                        {/* Origen */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {src.icon}
                                                <span className="text-[10px] font-black uppercase tracking-wide text-white/40">
                                                    {src.label}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-white/20 mt-0.5 pl-5 font-mono">
                                                {new Date(draft.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </td>
                                        {/* Input */}
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <p className="text-xs text-white/70 font-medium leading-relaxed truncate" title={draft.input}>
                                                "{draft.input}"
                                            </p>
                                            {draft.detected_intent && (
                                                <span className="text-[9px] font-bold uppercase text-white/25 mt-0.5 block">
                                                    {draft.detected_intent}
                                                </span>
                                            )}
                                        </td>
                                        {/* Respuesta Observada */}
                                        <td className="px-6 py-4 max-w-[220px] hidden lg:table-cell">
                                            {draft.observed_response ? (
                                                <p className="text-[11px] text-white/40 italic leading-relaxed line-clamp-2" title={draft.observed_response}>
                                                    {draft.observed_response}
                                                </p>
                                            ) : (
                                                <span className="text-[10px] text-white/15">—</span>
                                            )}
                                        </td>
                                        {/* Evaluación */}
                                        <td className="px-6 py-4 hidden xl:table-cell">
                                            <div className="space-y-1">
                                                {draft.evaluation_score !== null && (
                                                    <span className={cn(
                                                        "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                                                        draft.evaluation_score >= 4 ? "bg-emerald-500/10 text-emerald-400" :
                                                        draft.evaluation_score >= 3 ? "bg-amber-500/10 text-amber-400" :
                                                        "bg-red-500/10 text-red-400"
                                                    )}>
                                                        ★{draft.evaluation_score}
                                                    </span>
                                                )}
                                                {draft.failure_reason && (
                                                    <p className="text-[9px] text-white/30 truncate max-w-[120px]" title={draft.failure_reason}>
                                                        {draft.failure_reason}
                                                    </p>
                                                )}
                                                {!draft.evaluation_score && !draft.failure_reason && (
                                                    <span className="text-[10px] text-white/15">—</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Resultado Esperado */}
                                        <td className="px-6 py-4 max-w-[200px] hidden xl:table-cell">
                                            {draft.expected_outcome ? (
                                                <p className="text-[11px] text-emerald-400/70 leading-relaxed line-clamp-2" title={draft.expected_outcome}>
                                                    {draft.expected_outcome}
                                                </p>
                                            ) : (
                                                <span className="text-[10px] text-amber-400/40 italic">Sin definir</span>
                                            )}
                                        </td>
                                        {/* Estado */}
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-1 rounded-full border",
                                                rdx.color
                                            )}>
                                                {rdx.label}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedDraft(draft); }}
                                                    className="p-1.5 rounded-lg text-white/15 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                                                    title="Editar caso"
                                                >
                                                    <FileEdit className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(draft.id); }}
                                                    disabled={deletingId === draft.id}
                                                    className="p-1.5 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                                    title="Eliminar caso"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                                <ChevronRight className="h-3.5 w-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Maturation Drawer */}
            <AnimatePresence>
                {selectedDraft && liveReadiness && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDraft(null)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#0a0a0f] border-l border-white/5 shadow-2xl z-[101] overflow-y-auto"
                        >
                            <div className="p-8 space-y-8">

                                {/* Drawer Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                                {SOURCE_CONFIG[selectedDraft.source_type].icon}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                                                    {SOURCE_CONFIG[selectedDraft.source_type].label}
                                                </span>
                                            </div>
                                            {/* Live readiness badge */}
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2.5 py-1 rounded-full border transition-all",
                                                READINESS_CONFIG[liveReadiness].color
                                            )}>
                                                {READINESS_CONFIG[liveReadiness].label}
                                            </span>
                                            {hasUnsavedChanges && (
                                                <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-vape-500/10 text-vape-400 border border-vape-500/20">
                                                    Sin guardar
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                            Madurar Caso
                                        </h2>
                                        <p className="text-[9px] font-mono text-white/20">
                                            {new Date(selectedDraft.created_at).toLocaleString('es-MX')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDraft(null)}
                                        className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Captured Source Data (read-only) */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                                        Datos capturados
                                    </h4>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Input */}
                                        <div className="col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                <User className="h-3 w-3" />
                                                Input
                                            </div>
                                            <p className="text-sm text-white/80 font-medium leading-relaxed">
                                                "{selectedDraft.input}"
                                            </p>
                                            {selectedDraft.detected_intent && (
                                                <span className="text-[9px] font-bold uppercase text-white/20 block">
                                                    intent: {selectedDraft.detected_intent}
                                                </span>
                                            )}
                                        </div>

                                        {/* Observed Response */}
                                        {selectedDraft.observed_response && (
                                            <div className="col-span-2 p-4 rounded-2xl bg-vape-500/5 border border-vape-500/10 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-vape-400">
                                                    <Bot className="h-3 w-3" />
                                                    Respuesta Observada
                                                </div>
                                                <p className="text-[11px] text-vape-100/70 italic leading-relaxed">
                                                    "{selectedDraft.observed_response}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        {(selectedDraft.route_or_capsule || selectedDraft.evaluation_score !== null) && (
                                            <div className="col-span-2 flex items-center gap-3 flex-wrap">
                                                {selectedDraft.route_or_capsule && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                                                        <Activity className="h-3 w-3 text-white/30" />
                                                        <span className="text-[9px] font-black text-white/30 uppercase">{selectedDraft.route_or_capsule}</span>
                                                    </div>
                                                )}
                                                {selectedDraft.evaluation_score !== null && (
                                                    <span className={cn(
                                                        "text-[10px] font-black px-2 py-1 rounded-lg",
                                                        selectedDraft.evaluation_score >= 4 ? "bg-emerald-500/10 text-emerald-400" :
                                                        selectedDraft.evaluation_score >= 3 ? "bg-amber-500/10 text-amber-400" :
                                                        "bg-red-500/10 text-red-400"
                                                    )}>
                                                        ★{selectedDraft.evaluation_score}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Maturation Fields (editable) */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                                        Maduración
                                    </h4>

                                    {/* Expected Outcome */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 flex items-center gap-1.5">
                                            Resultado Esperado
                                            <span className="text-[8px] text-white/20 normal-case tracking-normal font-normal">
                                                — requerido para estado &quot;Listo&quot;
                                            </span>
                                        </label>
                                        <textarea
                                            value={editForm.expected_outcome}
                                            onChange={e => setEditForm(f => ({ ...f, expected_outcome: e.target.value }))}
                                            placeholder="Describe qué respuesta correcta debería dar Cesarin para este input..."
                                            rows={3}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-emerald-500/40 resize-none transition-colors"
                                        />
                                    </div>

                                    {/* Failure Reason */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">
                                            Razón de Fallo
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.failure_reason}
                                            onChange={e => setEditForm(f => ({ ...f, failure_reason: e.target.value }))}
                                            placeholder="¿Por qué falló o es problemático este caso?"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-amber-500/40 transition-colors"
                                        />
                                    </div>

                                    {/* Evaluation Summary */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                            Resumen de Evaluación
                                        </label>
                                        <textarea
                                            value={editForm.evaluation_summary}
                                            onChange={e => setEditForm(f => ({ ...f, evaluation_summary: e.target.value }))}
                                            placeholder="Notas adicionales sobre la calidad de la respuesta..."
                                            rows={2}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-white/20 resize-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Readiness Signal */}
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                            Estado de preparación
                                        </p>
                                        <p className="text-[9px] text-white/20">
                                            {liveReadiness === 'ready'
                                                ? 'Este caso está listo para uso.'
                                                : liveReadiness === 'needs_expected_outcome'
                                                ? 'Define el resultado esperado para completar la preparación.'
                                                : 'Agrega razón de fallo o resultado esperado para avanzar.'}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all",
                                        READINESS_CONFIG[liveReadiness].color
                                    )}>
                                        {READINESS_CONFIG[liveReadiness].label}
                                    </span>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !hasUnsavedChanges}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-black uppercase tracking-widest hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaving ? 'Guardando...' : 'Guardar'}
                                    </button>
                                    <button
                                        onClick={() => setSelectedDraft(null)}
                                        className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-sm font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
