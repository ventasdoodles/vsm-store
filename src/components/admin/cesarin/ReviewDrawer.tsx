import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Star, AlertTriangle, 
    MessageSquare, Save, 
    ArrowRightCircle, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { saveEvaluation, getEvaluation, EvaluationData } from '@/services/admin/admin-eval.service';
import { getSignalStatesByIds, SignalStateRow, SignalStatusDB } from '@/services/admin/admin-signal-states.service';
import type { AdminDecisionTraceView } from '@/services/admin/admin-decision-trace.service';
import {
    createImprovementItem as createImprovementItemFn,
    getImprovementItemsByAnalyticsIds,
    laneFromPrimaryTag,
} from '@/services/admin/admin-improvement.service';
import {
    createCaseDraft,
    deriveCaseDraftReadiness,
    getCaseDraftsByInteractionIds,
} from '@/services/admin/admin-case-drafts.service';
import { buildAdminImprovementWorkflowViewForInteraction } from '@/services/admin/admin-improvement-workflow.service';
import { CesarinDecisionTracePanel } from './CesarinDecisionTracePanel';
import { CesarinImprovementWorkflowPanel } from './CesarinImprovementWorkflowPanel';

interface ReviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    interaction: {
        id: string;
        query: string;
        response: string;
        created_at: string;
        // Optional route/capsule context — populated from PilotQueryRow for live interactions
        capsule?: string | null;
        detected_intent?: string | null;
        fallback_used?: boolean;
        product_card_count?: number;
        semantic_match_success?: boolean;
        raw_analyst_intent?: string | null;
        offered_products?: Array<{ id: string; name: string; slug: string }> | null;
        decision_trace?: AdminDecisionTraceView | null;
    } | null;
    onMarkSignal?: (id: string, state: any) => void;
}

const SIGNAL_STATUS_CONFIG: Record<SignalStatusDB, { label: string; color: string }> = {
    revisada:          { label: 'Revisada',       color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    descartada:        { label: 'Descartada',      color: 'bg-white/5 text-white/30 border-white/10' },
    convertida_regla:  { label: '→ Regla',         color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    convertida_mejora: { label: '→ Mejora',        color: 'bg-vape-500/10 text-vape-400 border-vape-500/20' },
    resuelta:          { label: 'Resuelta',        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

function SignalStatePanel({ state }: { state: SignalStateRow }) {
    const cfg = SIGNAL_STATUS_CONFIG[state.status];
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest shrink-0">Aprendizaje</span>
                <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border", cfg.color)}>
                    {cfg.label}
                </span>
                {state.ref_label && (
                    <span className="text-[10px] text-white/30 truncate">{state.ref_label}</span>
                )}
            </div>
            <span className="text-[10px] text-white/20 shrink-0">
                {new Date(state.handled_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
            </span>
        </div>
    );
}

const CANONICAL_TAGS = [
    { value: 'correct_response', label: 'Respuesta Correcta', color: 'bg-emerald-500/10 text-emerald-400' },
    { value: 'intent_miss', label: 'Error de Intención', color: 'bg-amber-500/10 text-amber-400' },
    { value: 'hallucination', label: 'Alucinación', color: 'bg-red-500/10 text-red-400' },
    { value: 'bad_recommendation_fit', label: 'Recomendación Inadecuada', color: 'bg-purple-500/10 text-purple-400' },
    { value: 'compatibility_gap', label: 'Falla de Compatibilidad', color: 'bg-orange-500/10 text-orange-400' },
    { value: 'knowledge_gap', label: 'Falta de Conocimiento', color: 'bg-blue-500/10 text-blue-400' },
    { value: 'false_certainty', label: 'Falsa Certeza', color: 'bg-rose-500/10 text-rose-400' },
    { value: 'missing_followup', label: 'Falta de Seguimiento', color: 'bg-indigo-500/10 text-indigo-400' },
    { value: 'tone_or_clarity_issue', label: 'Tono o Claridad', color: 'bg-slate-500/10 text-slate-400' },
];

const SEVERITIES = [
    { value: 'low', label: 'Baja', color: 'text-emerald-400 border-emerald-500/20' },
    { value: 'medium', label: 'Media', color: 'text-amber-400 border-amber-500/20' },
    { value: 'high', label: 'Alta', color: 'text-orange-400 border-orange-500/20' },
    { value: 'critical', label: 'Crítica', color: 'text-red-400 border-red-500/20' },
];

export function ReviewDrawer({ isOpen, onClose, interaction, onMarkSignal }: ReviewDrawerProps) {
    const [isLoading,      setIsLoading]      = useState(false);
    const [promoteToQueue, setPromoteToQueue] = useState(false);
    const [signalState,    setSignalState]    = useState<SignalStateRow | null>(null);
    const [savedEvaluation, setSavedEvaluation] = useState<EvaluationData | null>(null);
    const [improvementItem, setImprovementItem] = useState<any | null>(null);
    const [caseDraft, setCaseDraft] = useState<any | null>(null);
    const [savingAsDraft,  setSavingAsDraft]  = useState(false);
    const [formData, setFormData] = useState<Partial<EvaluationData>>({
        score: 5,
        primary_tag: 'correct_response',
        severity: 'low',
        expected_outcome: '',
        comment: '',
        secondary_tags: []
    });

    useEffect(() => {
        async function loadDrawerData() {
            if (!interaction) return;
            setIsLoading(true);
            setSignalState(null);
            setSavedEvaluation(null);
            setImprovementItem(null);
            setCaseDraft(null);
            try {
                const [existing, signalMap, improvementMap, drafts] = await Promise.all([
                    getEvaluation(interaction.id),
                    getSignalStatesByIds([interaction.id]),
                    getImprovementItemsByAnalyticsIds([interaction.id]),
                    getCaseDraftsByInteractionIds([interaction.id]),
                ]);
                if (existing) {
                    setFormData({
                        score: existing.score,
                        primary_tag: existing.primary_tag,
                        severity: existing.severity,
                        expected_outcome: existing.expected_outcome || '',
                        comment: existing.comment || '',
                        secondary_tags: existing.secondary_tags || []
                    });
                    setSavedEvaluation(existing);
                } else {
                    setFormData({
                        score: 5,
                        primary_tag: 'correct_response',
                        severity: 'low',
                        expected_outcome: '',
                        comment: '',
                        secondary_tags: []
                    });
                }
                setSignalState(signalMap[interaction.id] ?? null);
                setImprovementItem(improvementMap[interaction.id] ?? null);
                setCaseDraft(drafts[0] ?? null);
            } catch (error) {
                console.error('Error loading drawer data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (isOpen && interaction) {
            loadDrawerData();
        }
    }, [isOpen, interaction]);

    const handleSaveAsCaseDraft = async () => {
        if (!interaction) return;
        setSavingAsDraft(true);
        try {
            const failureReason = formData.primary_tag && formData.primary_tag !== 'correct_response'
                ? formData.primary_tag
                : null;
            const expectedOutcome = formData.expected_outcome?.trim() || null;
            await createCaseDraft({
                source_type:           'review_drawer',
                source_ref_id:         interaction.id,
                source_session_id:     null,
                source_interaction_id: interaction.id,
                input:                 interaction.query,
                observed_response:     interaction.response ?? null,
                evaluation_summary:    formData.comment?.trim() || null,
                expected_outcome:      expectedOutcome,
                route_or_capsule:      interaction.capsule ?? null,
                detected_intent:       interaction.detected_intent ?? null,
                evaluation_score:      formData.score ?? null,
                failure_reason:        failureReason,
                readiness_status:      deriveCaseDraftReadiness(expectedOutcome, failureReason),
            });
            setCaseDraft({
                source_type: 'review_drawer',
                source_ref_id: interaction.id,
                source_session_id: null,
                source_interaction_id: interaction.id,
                input: interaction.query,
                observed_response: interaction.response ?? null,
                evaluation_summary: formData.comment?.trim() || null,
                expected_outcome: expectedOutcome,
                route_or_capsule: interaction.capsule ?? null,
                detected_intent: interaction.detected_intent ?? null,
                evaluation_score: formData.score ?? null,
                failure_reason: failureReason,
                readiness_status: deriveCaseDraftReadiness(expectedOutcome, failureReason),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            toast.success('Guardado como caso de prueba');
        } catch (_err) {
            toast.error('Error al guardar el caso');
        } finally {
            setSavingAsDraft(false);
        }
    };

    const handleSave = async () => {
        if (!interaction) return;
        setIsLoading(true);
        try {
            const saved = await saveEvaluation({
                analytics_id: interaction.id,
                score: formData.score || 5,
                primary_tag: formData.primary_tag || 'correct_response',
                severity: (formData.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
                expected_outcome: formData.expected_outcome,
                comment: formData.comment,
                secondary_tags: formData.secondary_tags
            });
            setSavedEvaluation(saved);
            toast.success('Evaluación guardada');

            if (promoteToQueue) {
                const tagLabel = CANONICAL_TAGS.find(t => t.value === formData.primary_tag)?.label
                    ?? formData.primary_tag ?? 'Issue';
                const created = await createImprovementItemFn({
                    analytics_id:  interaction.id,
                    evaluation_id: saved?.id ?? null,
                    lane:          laneFromPrimaryTag(formData.primary_tag ?? ''),
                    title:         `${tagLabel} — ${interaction.id.slice(0, 8)}`,
                    summary:       formData.comment || formData.expected_outcome || null,
                    severity:      (formData.severity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
                });
                if (created === null) {
                    toast('Ya existe un ítem de mejora para esta interacción', { icon: 'ℹ️' });
                } else {
                    setImprovementItem(created);
                    toast.success('Ítem de mejora añadido a la cola');
                }
                if (onMarkSignal) {
                    onMarkSignal(interaction.id, {
                        status: 'convertida_mejora',
                        handled_at: new Date().toISOString(),
                        ref_label: (created as { ref_label?: string })?.ref_label || formData.primary_tag,
                    });
                }
            } else {
                if (onMarkSignal) {
                    onMarkSignal(interaction.id, {
                        status: 'revisada',
                        handled_at: new Date().toISOString(),
                    });
                }
            }

            onClose();
        } catch (error) {
            console.error('Error saving evaluation:', error);
            toast.error('Error al guardar la evaluación');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0a0a0f]/95 backdrop-blur-3xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[101] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md p-6 border-b border-white/10 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-vape-500/20 flex items-center justify-center">
                                    <Star className="h-5 w-5 text-vape-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Evaluar Interacción</h2>
                                    <p className="text-[10px] text-theme-secondary font-bold uppercase tracking-widest opacity-60">
                                        ID: {interaction?.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="h-6 w-6 text-white/40" />
                            </button>
                        </div>

                        <div className="p-8 space-y-10 pb-32">
                            {/* Interaction Context */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-vape-400 tracking-widest">
                                    <MessageSquare className="h-3 w-3" /> Turno Seleccionado
                                </div>
                                <div className="space-y-4 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-inner">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-white/30">Usuario</p>
                                        <p className="text-sm text-white/90 font-medium italic">"{interaction?.query}"</p>
                                    </div>
                                    <div className="h-px bg-white/5 w-full" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-vape-400/50">Cesarin</p>
                                        {interaction?.response
                                            ? <p className="text-sm text-theme-secondary leading-relaxed">{interaction.response}</p>
                                            : <p className="text-sm text-white/20 italic">Respuesta no capturada en telemetría</p>
                                        }
                                    </div>
                                    {/* Route / Capsule Context */}
                                    {(interaction?.capsule != null || interaction?.detected_intent != null || interaction?.product_card_count !== undefined) && (
                                        <>
                                            <div className="h-px bg-white/5 w-full" />
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Ruta · Cápsula</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {interaction?.detected_intent && (
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                                                            {interaction.detected_intent}
                                                        </span>
                                                    )}
                                                    {interaction?.capsule && (
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                                            interaction.capsule === 'product_search_integrity' ? "bg-vape-500/10 text-vape-400" :
                                                            interaction.capsule === 'knowledge_rag_foundation' ? "bg-blue-500/10 text-blue-400" :
                                                            "bg-white/5 text-white/30"
                                                        )}>
                                                            {interaction.capsule === 'product_search_integrity' ? 'Producto' :
                                                             interaction.capsule === 'knowledge_rag_foundation' ? 'RAG' :
                                                             interaction.capsule}
                                                        </span>
                                                    )}
                                                    {interaction?.raw_analyst_intent === 'UNKNOWN' && interaction?.capsule && (
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                                                            Rescue
                                                        </span>
                                                    )}
                                                    {interaction?.semantic_match_success && (
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                                                            Sem. ✓
                                                        </span>
                                                    )}
                                                    {interaction?.fallback_used && (
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                                                            Fallback
                                                        </span>
                                                    )}
                                                    {interaction?.product_card_count !== undefined && (
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                                            interaction.product_card_count > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                                        )}>
                                                            {interaction.product_card_count} card{interaction.product_card_count !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {/* Offered Products — operator grading evidence */}
                                    {interaction?.offered_products && interaction.offered_products.length > 0 && (
                                        <>
                                            <div className="h-px bg-white/5 w-full" />
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Productos Ofrecidos</p>
                                                <ul className="space-y-1">
                                                    {interaction.offered_products.map((p) => (
                                                        <li key={p.id} className="text-[11px] text-white/50 leading-tight">
                                                            {p.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>

                            {interaction?.decision_trace && (
                                <section>
                                    <CesarinDecisionTracePanel trace={interaction.decision_trace} />
                                </section>
                            )}

                            {interaction && (
                                <CesarinImprovementWorkflowPanel
                                    workflow={buildAdminImprovementWorkflowViewForInteraction({
                                        analyticsId: interaction.id,
                                        evaluation: savedEvaluation,
                                        signalState,
                                        improvementItem,
                                        caseDraft,
                                    })}
                                    title="Workflow de hallazgo a mejora"
                                />
                            )}

                            {/* Cross-surface: Signal State from TabLearning */}
                            {signalState && (
                                <section>
                                    <SignalStatePanel state={signalState} />
                                </section>
                            )}

                            {/* Scoring */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Puntaje General (1-5)</h3>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setFormData(prev => ({ ...prev, score: s }))}
                                                className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                                    formData.score && formData.score >= s 
                                                        ? "bg-vape-500 text-white shadow-lg" 
                                                        : "bg-white/5 text-white/20 hover:bg-white/10"
                                                )}
                                            >
                                                <Star className={cn("h-5 w-5", formData.score && formData.score >= s ? "fill-current" : "")} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.div layout className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-white/60">Categoría de Falla (Primary Tag)</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {CANONICAL_TAGS.map((tag) => (
                                                <button
                                                    key={tag.value}
                                                    onClick={() => setFormData(prev => ({ ...prev, primary_tag: tag.value }))}
                                                    className={cn(
                                                        "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider text-left transition-all border",
                                                        formData.primary_tag === tag.value 
                                                            ? "bg-vape-500 border-vape-400 text-white shadow-lg" 
                                                            : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                                                    )}
                                                >
                                                    {tag.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-white/60">Severidad</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SEVERITIES.map((sev) => (
                                                <button
                                                    key={sev.value}
                                                    onClick={() => setFormData(prev => ({ ...prev, severity: sev.value as 'low' | 'medium' | 'high' | 'critical' }))}
                                                    className={cn(
                                                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        formData.severity === sev.value 
                                                            ? "bg-white/10 border-white/20 " + sev.color
                                                            : "bg-white/5 border-transparent text-white/30 hover:bg-white/10"
                                                    )}
                                                >
                                                    {sev.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </section>

                            {/* Structured Feedback */}
                            <section className="space-y-6">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60">
                                        <ArrowRightCircle className="h-4 w-4 text-emerald-500" /> Resultado Esperado (Ground Truth)
                                    </label>
                                    <textarea
                                        value={formData.expected_outcome}
                                        onChange={(e) => setFormData(prev => ({ ...prev, expected_outcome: e.target.value }))}
                                        placeholder="Describe cómo debería haber respondido Cesarin..."
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-theme-secondary focus:outline-none focus:border-vape-500/50 min-h-[120px] transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Comentarios Adicionales
                                    </label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                        placeholder="Contexto adicional sobre la falla o el acierto..."
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-theme-secondary focus:outline-none focus:border-vape-500/50 min-h-[100px] transition-all"
                                    />
                                </div>
                            </section>

                            {/* Promote to Improvement Queue */}
                            <section>
                                <button
                                    onClick={() => setPromoteToQueue(!promoteToQueue)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                        promoteToQueue
                                            ? "bg-vape-500/5 border-vape-500/20"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-all",
                                        promoteToQueue
                                            ? "bg-vape-500 border-vape-400"
                                            : "bg-white/5 border-white/20"
                                    )}>
                                        {promoteToQueue && (
                                            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className={cn(
                                            "text-[11px] font-black uppercase tracking-widest",
                                            promoteToQueue ? "text-vape-400" : "text-white/40"
                                        )}>
                                            Crear ítem de mejora
                                        </p>
                                        <p className="text-[10px] text-white/25">
                                            Añade este fallo a la cola de mejoras con la lane sugerida por el tag seleccionado
                                        </p>
                                    </div>
                                </button>
                            </section>
                        </div>

                        {/* Footer Actions */}
                        <div className="absolute bottom-0 inset-x-0 bg-[#0a0a0f]/90 backdrop-blur-xl p-8 border-t border-white/10 space-y-3 z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex-[2] py-4 rounded-2xl bg-vape-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-vape-400 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(168,85,247,0.3)]"
                                >
                                    {isLoading ? (
                                        <History className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" /> Finalizar Evaluación
                                        </>
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={handleSaveAsCaseDraft}
                                disabled={savingAsDraft || !interaction}
                                className="w-full py-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                {savingAsDraft ? (
                                    <History className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <ArrowRightCircle className="h-3.5 w-3.5" />
                                )}
                                Guardar como Caso de Prueba
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
