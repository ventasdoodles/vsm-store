/**
 * TAB IMPROVEMENTS — Governed Evaluation-to-Queue Surface
 * Operator-facing queue of improvement items sourced from reviewed interactions.
 * Supports: lane/status filtering, inline editing, owner claim/release, artifact ref.
 * NO auto-execution. NO autonomous learning. Explicit operator action only.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ListChecks, ChevronDown, ChevronUp, RefreshCw,
    Save, User, UserMinus, Link, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getEvaluationsByIds } from '@/services/admin/admin-eval.service';
import { getCaseDraftsByInteractionIds } from '@/services/admin/admin-case-drafts.service';
import {
    getImprovementItems, updateImprovementItem,
    type ImprovementItem, type ImprovementLane, type ImprovementStatus,
} from '@/services/admin/admin-improvement.service';
import {
    buildAdminImprovementWorkflowViewFromImprovementItem,
    buildLatestDraftMap,
} from '@/services/admin/admin-improvement-workflow.service';
import { CesarinImprovementWorkflowPanel } from './CesarinImprovementWorkflowPanel';

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_TABS: { value: ImprovementStatus | 'all'; label: string }[] = [
    { value: 'all',         label: 'Todos' },
    { value: 'open',        label: 'Abiertos' },
    { value: 'in_progress', label: 'En curso' },
    { value: 'resolved',    label: 'Resueltos' },
    { value: 'wont_fix',    label: 'Descartados' },
];

const LANE_LABELS: Record<ImprovementLane, string> = {
    rule:          'Regla',
    knowledge:     'Conocimiento',
    compatibility: 'Compatibilidad',
    commerce:      'Comercio',
    other:         'Otro',
};

const LANE_COLORS: Record<ImprovementLane, string> = {
    rule:          'bg-violet-500/10 text-violet-400',
    knowledge:     'bg-blue-500/10 text-blue-400',
    compatibility: 'bg-teal-500/10 text-teal-400',
    commerce:      'bg-green-500/10 text-green-400',
    other:         'bg-white/5 text-white/30',
};

const SEVERITY_COLORS: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-400',
    high:     'bg-orange-500/10 text-orange-400',
    medium:   'bg-amber-500/10 text-amber-400',
    low:      'bg-emerald-500/10 text-emerald-400',
};

const STATUS_COLORS: Record<ImprovementStatus, string> = {
    open:        'bg-amber-500/10 text-amber-400',
    in_progress: 'bg-blue-500/10 text-blue-400',
    resolved:    'bg-emerald-500/10 text-emerald-400',
    wont_fix:    'bg-white/5 text-white/25',
};

const STATUS_LABELS: Record<ImprovementStatus, string> = {
    open:        'Abierto',
    in_progress: 'En curso',
    resolved:    'Resuelto',
    wont_fix:    'Descartado',
};

// ─── Edit Panel ─────────────────────────────────────────────────────────────

interface EditPanelProps {
    item: ImprovementItem;
    currentUserId: string | null;
    onSaved: (updated: Partial<ImprovementItem>) => void;
}

function EditPanel({ item, currentUserId, onSaved }: EditPanelProps) {
    const [title,         setTitle]         = useState(item.title);
    const [lane,          setLane]          = useState<ImprovementLane>(item.lane);
    const [status,        setStatus]        = useState<ImprovementStatus>(item.status);
    const [execNote,      setExecNote]      = useState(item.execution_note ?? '');
    const [artifactRef,   setArtifactRef]   = useState(item.artifact_ref ?? '');
    const [isSaving,      setIsSaving]      = useState(false);

    const handleSave = async () => {
        // Closure discipline: resolved/wont_fix require at least execution_note or artifact_ref.
        if ((status === 'resolved' || status === 'wont_fix') && !execNote.trim() && !artifactRef.trim()) {
            toast.error(
                status === 'resolved'
                    ? 'Para marcar como resuelto se requiere una nota de ejecución o ref. de artefacto'
                    : 'Para descartar se requiere una nota que explique la decisión'
            );
            return;
        }

        setIsSaving(true);
        try {
            const updates = {
                title:          title.trim(),
                lane,
                status,
                execution_note: execNote.trim() || null,
                artifact_ref:   artifactRef.trim() || null,
            };
            await updateImprovementItem(item.id, updates);
            onSaved(updates);
            toast.success('Ítem actualizado');
        } catch {
            toast.error('Error al guardar el ítem');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClaim = async () => {
        if (!currentUserId) return;
        try {
            await updateImprovementItem(item.id, { owner_id: currentUserId });
            onSaved({ owner_id: currentUserId });
            toast.success('Te asignaste este ítem');
        } catch {
            toast.error('Error al asignar');
        }
    };

    const handleUnclaim = async () => {
        try {
            await updateImprovementItem(item.id, { owner_id: null });
            onSaved({ owner_id: null });
            toast.success('Asignación removida');
        } catch {
            toast.error('Error al desasignar');
        }
    };

    return (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4 bg-white/[0.01]">
            {/* Row 1: title + lane + status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1 space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/25">Título</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-vape-500/40"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/25">Lane</label>
                    <select
                        value={lane}
                        onChange={e => setLane(e.target.value as ImprovementLane)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-vape-500/40"
                    >
                        {(Object.keys(LANE_LABELS) as ImprovementLane[]).map(l => (
                            <option key={l} value={l}>{LANE_LABELS[l]}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/25">Estado</label>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as ImprovementStatus)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-vape-500/40"
                    >
                        {(Object.keys(STATUS_LABELS) as ImprovementStatus[]).map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: execution note + artifact ref */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/25">
                        <FileText className="h-2.5 w-2.5" /> Nota de Ejecución
                    </label>
                    <textarea
                        value={execNote}
                        onChange={e => setExecNote(e.target.value)}
                        placeholder="Describe qué se hizo, por qué se descartó, o qué falta..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-vape-500/40 resize-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/25">
                        <Link className="h-2.5 w-2.5" /> Ref. de Artefacto
                    </label>
                    <input
                        value={artifactRef}
                        onChange={e => setArtifactRef(e.target.value)}
                        placeholder="URL, ID de regla, nombre de doc., etc."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-vape-500/40"
                    />
                </div>
            </div>

            {/* Row 3: ownership + save */}
            <div className="flex items-center gap-3 flex-wrap">
                {item.owner_id ? (
                    <button
                        onClick={handleUnclaim}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/40 hover:text-white/60 transition-all"
                    >
                        <UserMinus className="h-3 w-3" /> Desasignar
                    </button>
                ) : (
                    <button
                        onClick={handleClaim}
                        disabled={!currentUserId}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/40 hover:text-white/60 transition-all disabled:opacity-30"
                    >
                        <User className="h-3 w-3" /> Asignarme
                    </button>
                )}
                <div className="flex-1" />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-vape-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-vape-400 transition-all disabled:opacity-50"
                >
                    {isSaving
                        ? <RefreshCw className="h-3 w-3 animate-spin" />
                        : <Save className="h-3 w-3" />
                    }
                    Guardar
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function TabImprovements() {
    const [items,         setItems]         = useState<ImprovementItem[]>([]);
    const [isLoading,     setIsLoading]     = useState(true);
    const [schemaError,   setSchemaError]   = useState<string | null>(null);
    const [statusFilter,  setStatusFilter]  = useState<ImprovementStatus | 'all'>('open');
    const [laneFilter,    setLaneFilter]    = useState<ImprovementLane | 'all'>('all');
    const [expandedId,    setExpandedId]    = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [evaluationMap, setEvaluationMap] = useState<Record<string, any>>({});
    const [caseDraftMap, setCaseDraftMap] = useState<Record<string, any>>({});

    // Resolve current auth user once
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id ?? null);
        });
    }, []);

    const load = useCallback(async () => {
        setIsLoading(true);
        setSchemaError(null);
        try {
            const data = await getImprovementItems({
                status: statusFilter === 'all' ? undefined : statusFilter,
                lane:   laneFilter   === 'all' ? undefined : laneFilter,
            });
            setItems(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            // Detect missing table — migration not yet applied to live DB
            if (msg.includes('cesarin_improvement_items') || msg.includes('does not exist') || msg.includes('relation "')) {
                setSchemaError('20260320_cesarin_improvement_items.sql');
            } else {
                toast.error('Error cargando la cola de mejoras');
            }
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, laneFilter]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        async function loadWorkflowContext() {
            if (items.length === 0) {
                setEvaluationMap({});
                setCaseDraftMap({});
                return;
            }

            const analyticsIds = items.map((item) => item.analytics_id);
            try {
                const [evaluations, drafts] = await Promise.all([
                    getEvaluationsByIds(analyticsIds),
                    getCaseDraftsByInteractionIds(analyticsIds),
                ]);
                setEvaluationMap(evaluations);
                setCaseDraftMap(buildLatestDraftMap(drafts, (draft) => draft.source_interaction_id));
            } catch (error) {
                console.error('Error loading improvement workflow context:', error);
                setEvaluationMap({});
                setCaseDraftMap({});
            }
        }

        loadWorkflowContext();
    }, [items]);

    const handleUpdated = (id: string, patch: Partial<ImprovementItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...patch } : item
        ));
    };

    const visibleItems = items; // filtering is server-side; this list is already filtered

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-vape-400" />
                        Cola de Mejoras
                    </h3>
                    <p className="text-[11px] text-white/30 font-medium">
                        Tu cola de trabajo. Cada mejora requiere ejecución manual y cierre documentado. Diferente de las recomendaciones del sistema (que requieren aprobación pero ejecución fuera de banda).
                    </p>
                </div>
                <button
                    onClick={load}
                    className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
                    title="Refrescar"
                >
                    <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                </button>
            </div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 flex-wrap">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value as any); setExpandedId(null); }}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                            statusFilter === tab.value
                                ? 'bg-vape-500 text-white shadow-lg shadow-vape-500/20'
                                : 'text-white/40 hover:text-white/60'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Lane filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', ...Object.keys(LANE_LABELS)] as (ImprovementLane | 'all')[]).map(l => (
                    <button
                        key={l}
                        onClick={() => { setLaneFilter(l); setExpandedId(null); }}
                        className={cn(
                            'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border',
                            laneFilter === l
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'border-transparent text-white/25 hover:text-white/40'
                        )}
                    >
                        {l === 'all' ? 'Todas las lanes' : LANE_LABELS[l]}
                    </button>
                ))}
            </div>

            {/* Migration-pending banner — replaces entire list when table absent */}
            {schemaError && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                        Migración pendiente en DB
                    </p>
                    <p className="text-xs text-white/40">
                        La tabla <code className="font-mono text-white/60">cesarin_improvement_items</code> no existe en la base de datos activa. Aplica la migración y recarga.
                    </p>
                    <p className="text-[10px] font-mono text-white/25 pt-1">{schemaError}</p>
                </div>
            )}

            {/* Items list */}
            <div className={cn('rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]', schemaError && 'hidden')}>
                {isLoading ? (
                    <div className="py-12 text-center text-white/20 text-xs">
                        <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                        Cargando cola...
                    </div>
                ) : visibleItems.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                        <ListChecks className="h-8 w-8 text-white/10 mx-auto" />
                        <p className="text-white/20 text-xs">
                            Sin ítems para este filtro. Los ítems se crean desde el drawer de evaluación.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {visibleItems.map(item => (
                            (() => {
                                const workflow = buildAdminImprovementWorkflowViewFromImprovementItem({
                                    item,
                                    evaluation: evaluationMap[item.analytics_id] ?? null,
                                    caseDraft: caseDraftMap[item.analytics_id] ?? null,
                                });
                                return (
                            <div key={item.id}>
                                {/* Row */}
                                <button
                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Badges column */}
                                        <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                                            <span className={cn('text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full', SEVERITY_COLORS[item.severity])}>
                                                {item.severity}
                                            </span>
                                            <span className={cn('text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full', LANE_COLORS[item.lane])}>
                                                {LANE_LABELS[item.lane]}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white/80 truncate">{item.title}</span>
                                                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0', STATUS_COLORS[item.status])}>
                                                    {STATUS_LABELS[item.status]}
                                                </span>
                                                <span className={cn(
                                                    'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 border',
                                                    workflow.evidenceKind === 'authoritative'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                )}>
                                                    {workflow.currentStatusLabel}
                                                </span>
                                            </div>
                                            {item.source_query && (
                                                <p className="text-[10px] text-white/30 truncate">
                                                    "{item.source_query.length > 80
                                                        ? item.source_query.slice(0, 77) + '...'
                                                        : item.source_query}"
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 text-[9px] text-white/20">
                                                <span>ID: {item.analytics_id.slice(0, 8)}</span>
                                                {item.owner_id && <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> asignado</span>}
                                                {item.artifact_ref && <span className="flex items-center gap-1"><Link className="h-2.5 w-2.5" /> artefacto</span>}
                                                <span>{new Date(item.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        {/* Chevron */}
                                        <div className="text-white/20 shrink-0 pt-1">
                                            {expandedId === item.id
                                                ? <ChevronUp className="h-3.5 w-3.5" />
                                                : <ChevronDown className="h-3.5 w-3.5" />
                                            }
                                        </div>
                                    </div>
                                </button>

                                {/* Inline edit panel */}
                                <AnimatePresence>
                                    {expandedId === item.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pt-4">
                                                <CesarinImprovementWorkflowPanel
                                                    workflow={workflow}
                                                    title="Workflow de mejora y cierre"
                                                />
                                            </div>
                                            <EditPanel
                                                item={item}
                                                currentUserId={currentUserId}
                                                onSaved={(patch) => handleUpdated(item.id, patch)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                                );
                            })()
                        ))}
                    </div>
                )}
            </div>

            {/* Count footer */}
            {!isLoading && !schemaError && visibleItems.length > 0 && (
                <p className="text-[10px] text-white/15 text-right">
                    {visibleItems.length} {visibleItems.length === 1 ? 'ítem' : 'ítems'}
                </p>
            )}
        </div>
    );
}
