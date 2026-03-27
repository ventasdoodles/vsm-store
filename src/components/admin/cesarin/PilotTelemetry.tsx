import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Target, ShieldAlert, ShoppingCart,
    AlertTriangle, RefreshCw, Search,
    BookOpen, Filter, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePilotOps, type TimeRange } from '@/hooks/admin/useAdminPilotOps';
import type { PilotBucket, PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';
import { getEvaluationsByIds, EvaluationData } from '@/services/admin/admin-eval.service';
import { getImprovementItemsByAnalyticsIds } from '@/services/admin/admin-improvement.service';
import { buildAdminImprovementWorkflowViewForInteraction } from '@/services/admin/admin-improvement-workflow.service';
import { SignalState } from '@/hooks/useCesarinSignalStates';

// ─── KPI Card ──────────────────────────────────────

interface KPICardProps {
    label: string;
    value: string;
    sublabel?: string;
    icon: React.ReactNode;
    accent: string;
}

function KPICard({ label, value, sublabel, icon, accent }: KPICardProps) {
    return (
        <div className={cn(
            "p-5 rounded-2xl border backdrop-blur-sm transition-all",
            `bg-${accent}/5 border-${accent}/10`
        )}
        style={{
            backgroundColor: `var(--kpi-bg-${accent}, rgba(255,255,255,0.02))`,
            borderColor: `var(--kpi-border-${accent}, rgba(255,255,255,0.05))`,
        }}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
                    <div className="text-2xl font-black text-white tracking-tight">{value}</div>
                    {sublabel && <span className="text-[10px] text-white/30">{sublabel}</span>}
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ─── Time Range Selector ───────────────────────────

const TIME_RANGES: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
];

// ─── Bucket Tabs ───────────────────────────────────

const BUCKET_TABS: { value: PilotBucket; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'Todos', icon: <Filter className="h-3 w-3" /> },
    { value: 'zero_product_cards', label: 'Sin cards', icon: <AlertTriangle className="h-3 w-3" /> },
    { value: 'guardrail_rescue', label: 'Rescate', icon: <ShieldAlert className="h-3 w-3" /> },
    { value: 'successful_semantic_match', label: 'Match ✓', icon: <Target className="h-3 w-3" /> },
    { value: 'policy_query', label: 'Política', icon: <BookOpen className="h-3 w-3" /> },
    { value: 'cart_intent_signal', label: 'Carrito', icon: <ShoppingCart className="h-3 w-3" /> },
    { value: 'frustration', label: 'Frustración', icon: <AlertTriangle className="h-3 w-3" /> },
];

// ─── Miss Taxonomy Panel ───────────────────────────

interface MissCategory {
    label: string;
    count: number;
    bucket: PilotBucket | null;
    color: string;
    description: string;
    // 'primary' = causal/operational miss category; 'signal' = symptom or weak heuristic.
    // Signals are rendered below a divider at reduced visual weight.
    tier: 'primary' | 'signal';
}

function buildMissTaxonomy(fullQueryLog: PilotQueryRow[]): MissCategory[] {
    /**
     * MICRO-PASS: Semantic Narrowing per Codex Acceptance Audit
     *
     * Precedence order (first match wins):
     * 1. Ruta degradada / error — API or tool failures (gemini_api_error OR tool_error_count > 0)
     * 2. Producto buscado sin cards — hard commercial miss (product_card_count=0 AND product_search_integrity)
     * 3. UNKNOWN rescatado — recovery class (raw_analyst_intent='UNKNOWN') — MOVED UP
     * 4. Fallback sin cápsula clara — fallback WITHOUT documented reason (fallback_used AND sommelier_fallback_reason IS NULL) — NARROWED
     * 5. Dominio documental / RAG — knowledge/policy routing (knowledge_rag_foundation OR policy_match_count>0) — NARROWED (removed out_of_domain)
     * 6. Otro / sin atribución clara — semantic misses without explicit categorization (semantic_match_success=false AND no above match) — NARROWED
     *
     * Each row is categorized exactly once.
     * Frustration is a secondary signal, not a competing primary category.
     */

    // Initialize categories with narrowed semantics
    const cats = {
        ruta_error: { label: 'Ruta degradada / error', count: 0, bucket: null as PilotBucket | null, color: 'red', description: 'error en API o herramientas', tier: 'primary' as const },
        producto_sin_cards: { label: 'Producto buscado sin cards', count: 0, bucket: 'zero_product_cards' as PilotBucket, color: 'orange', description: 'búsqueda de producto → 0 resultados', tier: 'primary' as const },
        unknown_rescatado: { label: 'UNKNOWN rescatado', count: 0, bucket: 'guardrail_rescue' as PilotBucket, color: 'teal', description: 'Analyst sin clasificación → recovery', tier: 'primary' as const },
        fallback_sin_capsula: { label: 'Fallback sin cápsula clara', count: 0, bucket: null as PilotBucket | null, color: 'amber', description: 'respaldo sin razón documentada', tier: 'primary' as const },
        dominio_rag: { label: 'Dominio documental / RAG', count: 0, bucket: 'policy_query' as PilotBucket, color: 'blue', description: 'consulta de conocimiento o política', tier: 'primary' as const },
        otro: { label: 'Otro / misses sin categoría', count: 0, bucket: null as PilotBucket | null, color: 'white', description: 'misses semánticas sin atribución clara', tier: 'primary' as const },
        frustration_signal: { label: 'Señal de frustración', count: 0, bucket: 'frustration' as PilotBucket, color: 'pink', description: 'síntoma de escalación — puede coexistir con cualquier miss', tier: 'signal' as const },
    };

    // Apply categorization with refined precedence and narrowed semantics
    for (const row of fullQueryLog) {
        let categorized = false;

        // 1. Ruta degradada / error — API or tool failures
        if (!categorized && (row.gemini_api_error !== null || row.tool_error_count > 0)) {
            cats.ruta_error.count++;
            categorized = true;
        }

        // 2. Producto buscado sin cards — hard commercial miss
        if (!categorized && row.product_card_count === 0 && row.capsule === 'product_search_integrity') {
            cats.producto_sin_cards.count++;
            categorized = true;
        }

        // 3. UNKNOWN rescatado — recovery class (MOVED UP per Codex)
        if (!categorized && row.raw_analyst_intent === 'UNKNOWN') {
            cats.unknown_rescatado.count++;
            categorized = true;
        }

        // 4. Fallback sin cápsula clara — fallback WITHOUT documented reason (NARROWED per Codex)
        if (!categorized && row.fallback_used && row.sommelier_fallback_reason === null) {
            cats.fallback_sin_capsula.count++;
            categorized = true;
        }

        // 5. Dominio documental / RAG — knowledge/policy routing (NARROWED per Codex: removed out_of_domain)
        if (!categorized && (row.capsule === 'knowledge_rag_foundation' || row.policy_match_count > 0)) {
            cats.dominio_rag.count++;
            categorized = true;
        }

        // 6. Otro / misses sin categoría — semantic misses without explicit categorization (RESIDUAL PURITY)
        // Only count rows that are genuinely miss-like: in-domain semantic failures without explicit categorization.
        // Exclude out-of-domain rows — those are not misses, just not applicable to this system.
        if (!categorized && row.semantic_match_success === false && !row.out_of_domain) {
            cats.otro.count++;
            categorized = true;
        }

        // Secondary: Frustration (independent, may co-occur)
        if (row.frustration_detected) {
            cats.frustration_signal.count++;
        }
    }

    // Return in defined order: primaries first (ordered by count), then signals
    const primary = Object.values(cats).filter(c => c.tier === 'primary').sort((a, b) => b.count - a.count);
    const signal = Object.values(cats).filter(c => c.tier === 'signal').sort((a, b) => b.count - a.count);

    return [...primary, ...signal];
}

interface MissTaxonomyPanelProps {
    fullQueryLog: PilotQueryRow[];
    onBucketSelect: (bucket: PilotBucket) => void;
}

function MissTaxonomyPanel({ fullQueryLog, onBucketSelect }: MissTaxonomyPanelProps) {
    const categories = buildMissTaxonomy(fullQueryLog);
    const primaryCats = categories.filter(c => c.tier === 'primary');
    const signalCats = categories.filter(c => c.tier === 'signal');
    const maxCount = Math.max(...categories.map(c => c.count), 1);

    const renderRow = (cat: MissCategory) => {
        const barPct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
        const isClickable = cat.bucket !== null;
        return (
            <div
                key={cat.label}
                className={cn(
                    "flex items-center gap-3 group",
                    isClickable && "cursor-pointer",
                    cat.tier === 'signal' && "opacity-60"
                )}
                onClick={() => isClickable && onBucketSelect(cat.bucket!)}
                title={isClickable ? `Filtrar: ${cat.label}` : undefined}
            >
                <div className="w-36 shrink-0">
                    <span className="text-[10px] font-bold text-white/50 group-hover:text-white/70 transition-colors leading-tight block truncate">
                        {cat.label}
                    </span>
                    <span className="text-[9px] text-white/20 leading-tight block truncate">
                        {cat.description}
                    </span>
                </div>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            cat.color === 'red'   ? "bg-red-500/60"   :
                            cat.color === 'amber' ? "bg-amber-500/60" :
                            cat.color === 'teal'  ? "bg-teal-500/60"  :
                            cat.color === 'blue'  ? "bg-blue-500/60"  :
                            cat.color === 'pink'  ? "bg-pink-500/60"  :
                            "bg-white/20"
                        )}
                        style={{ width: `${barPct}%` }}
                    />
                </div>
                <div className="w-8 text-right shrink-0">
                    <span className={cn(
                        "text-xs font-black tabular-nums",
                        cat.count > 0 ? "text-white/60" : "text-white/15"
                    )}>
                        {cat.count}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    Taxonomía de Misses
                </span>
                <span className="text-[10px] text-white/20">
                    {fullQueryLog.length} del rango activo
                </span>
            </div>
            <div className="space-y-2">
                {primaryCats.map(renderRow)}
                {signalCats.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1 h-px bg-white/[0.05]" />
                            <span className="text-[9px] text-white/15 uppercase tracking-widest font-bold">señales</span>
                            <div className="flex-1 h-px bg-white/[0.05]" />
                        </div>
                        {signalCats.map(renderRow)}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Query Row ─────────────────────────────────────

function QueryRow({ row, onReview, evalMap, signalMap, improvementMap }: {
    row: PilotQueryRow;
    onReview: (row: PilotQueryRow) => void;
    evalMap: Record<string, EvaluationData>;
    signalMap: Record<string, SignalState>;
    improvementMap: Record<string, any>;
}) {
    const isRescue  = row.raw_analyst_intent === 'UNKNOWN' && row.capsule !== null;
    const evalEntry = evalMap[row.id] ?? null;
    const sigEntry  = signalMap[row.id] ?? null;
    const improvementEntry = improvementMap[row.id] ?? null;
    const workflow = buildAdminImprovementWorkflowViewForInteraction({
        analyticsId: row.id,
        evaluation: evalEntry,
        signalState: sigEntry ?? null,
        improvementItem: improvementEntry,
    });
    const truncatedQuery = row.query
        ? row.query.length > 80 ? row.query.slice(0, 77) + '...' : row.query
        : '—';

    const responsePreview = row.response_text
        ? row.response_text.length > 55 ? row.response_text.slice(0, 52) + '...' : row.response_text
        : null;

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors text-xs">
            <td className="py-3 px-3 text-white/70 max-w-[220px] truncate" title={row.query ?? ''}>
                {truncatedQuery}
            </td>
            <td className="py-3 px-2 max-w-[200px]" title={row.response_text ?? ''}>
                {responsePreview
                    ? <span className="text-white/35 truncate block">{responsePreview}</span>
                    : <span className="text-white/15 italic">—</span>}
            </td>
            <td className="py-3 px-2">
                <span className="text-[10px] font-bold text-white/50 uppercase">
                    {row.detected_intent ?? '—'}
                </span>
            </td>
            <td className="py-3 px-2">
                <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                    row.capsule === 'product_search_integrity' ? "bg-vape-500/10 text-vape-400" :
                    row.capsule === 'knowledge_rag_foundation' ? "bg-blue-500/10 text-blue-400" :
                    "bg-white/5 text-white/30"
                )}>
                    {row.capsule === 'product_search_integrity' ? 'Producto' :
                     row.capsule === 'knowledge_rag_foundation' ? 'RAG' :
                     row.capsule ?? '—'}
                </span>
            </td>
            <td className="py-3 px-2 text-center">
                {row.semantic_match_success
                    ? <span className="text-emerald-400 text-xs">✓</span>
                    : <span className="text-white/20 text-xs">✗</span>}
            </td>
            <td className="py-3 px-2 text-center">
                {isRescue
                    ? <span className="text-amber-400 text-[10px] font-bold">RESCUE</span>
                    : row.fallback_used
                    ? <span className="text-red-400 text-[10px] font-bold">FB</span>
                    : <span className="text-white/20 text-xs">—</span>}
            </td>
            <td className="py-3 px-2 text-center">
                <span className={cn(
                    "text-xs font-bold",
                    row.product_card_count > 0 ? "text-emerald-400" : "text-white/20"
                )}>
                    {row.product_card_count}
                </span>
            </td>
            <td className="py-3 px-2 text-right text-white/30">
                {row.latency_ms > 0 ? `${(row.latency_ms / 1000).toFixed(1)}s` : '—'}
            </td>
            <td className="py-3 px-2 text-right text-white/25 text-[10px]">
                {new Date(row.created_at).toLocaleString('es-MX', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                })}
            </td>
            <td className="py-3 px-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                    <span
                        className={cn(
                            "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                            row.decision_trace.evidenceKind === 'authoritative_runtime'
                                ? "bg-emerald-500/10 text-emerald-400"
                                : row.decision_trace.evidenceKind === 'partial_runtime'
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-indigo-500/10 text-indigo-400"
                        )}
                        title={row.decision_trace.evidenceDetail}
                    >
                        {row.decision_trace.evidenceShortLabel}
                    </span>
                    {evalEntry && (
                        <span className={cn(
                            "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                            evalEntry.score >= 4 ? "bg-emerald-500/10 text-emerald-400" :
                            evalEntry.score >= 3 ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                        )} title={`Evaluado: ${evalEntry.score}/5 — ${evalEntry.primary_tag}`}>
                            ★{evalEntry.score}
                        </span>
                    )}
                    {sigEntry && (
                        <span className={cn(
                            "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                            sigEntry.status === 'convertida_regla' || sigEntry.status === 'resuelta' ? "bg-emerald-500/10 text-emerald-400" :
                            sigEntry.status === 'convertida_mejora' ? "bg-vape-500/10 text-vape-400" :
                            sigEntry.status === 'descartada' ? "bg-white/5 text-white/25" :
                            "bg-blue-500/10 text-blue-400"
                        )} title={`Aprendizaje: ${sigEntry.status}`}>
                            {sigEntry.status === 'convertida_regla' ? '→R' :
                             sigEntry.status === 'convertida_mejora' ? '→M' :
                             sigEntry.status === 'resuelta' ? '✓' :
                             sigEntry.status === 'descartada' ? '✕' : '👁'}
                        </span>
                    )}
                    <span
                        className={cn(
                            "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                            workflow.evidenceKind === 'authoritative'
                                ? "bg-emerald-500/10 text-emerald-400"
                                : workflow.evidenceKind === 'partial'
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-white/5 text-white/25"
                        )}
                        title={workflow.currentStatusDetail}
                    >
                        {workflow.currentStatusLabel}
                    </span>
                    <button
                        onClick={() => onReview(row)}
                        className="p-1.5 rounded-lg bg-vape-500/10 text-vape-400 hover:bg-vape-500 hover:text-white transition-all group/btn"
                        title="Evaluar Interacción"
                    >
                        <Target className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Main Component ────────────────────────────────

export function PilotTelemetry({ onReview, signalStates }: { onReview: (row: PilotQueryRow) => void; signalStates: Record<string, SignalState> }) {
    const {
        timeRange, setTimeRange,
        kpis, isLoadingKPIs,
        fullQueryLog, queryLog, totalLogRows, filteredLogRows,
        isLoadingLog,
        activeBucket, setActiveBucket,
        includeSimulation, setIncludeSimulation,
        refresh,
    } = usePilotOps();

    const [evalMap,   setEvalMap]   = useState<Record<string, EvaluationData>>({});
    const [improvementMap, setImprovementMap] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!queryLog || queryLog.length === 0) {
            setEvalMap({});
            setImprovementMap({});
            return;
        }
        const ids = queryLog.map(r => r.id);
        Promise.all([
            getEvaluationsByIds(ids),
            getImprovementItemsByAnalyticsIds(ids),
        ]).then(([evaluations, improvements]) => {
            setEvalMap(evaluations);
            setImprovementMap(improvements);
        }).catch(console.error);
    }, [queryLog]);

    const pct = (val: number) => `${(val * 100).toFixed(1)}%`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        Telemetría operativa
                    </h3>
                    <p className="text-[11px] text-white/30 font-medium">
                        Lectura diaria de turnos reales, misses y rescates desde <code className="text-white/50">ai_analytics</code>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time Range */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
                        {TIME_RANGES.map((tr) => (
                            <button
                                key={tr.value}
                                onClick={() => setTimeRange(tr.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    timeRange === tr.value
                                        ? "bg-vape-500 text-white shadow-lg shadow-vape-500/20"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                {tr.label}
                            </button>
                        ))}
                    </div>
                    {/* Simulation Toggle (Hygiene) */}
                    <button
                        onClick={() => setIncludeSimulation(!includeSimulation)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            includeSimulation 
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                                : "bg-white/5 border-white/5 text-white/20"
                        )}
                        title={includeSimulation ? "Ocultar datos de laboratorio" : "Incluir datos de laboratorio"}
                    >
                        <RefreshCw className={cn("h-3 w-3", includeSimulation && "animate-pulse")} />
                        {includeSimulation ? 'Laboratorio incluido' : 'Solo producción'}
                    </button>

                    <button
                        onClick={refresh}
                        className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
                        title="Refrescar"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", (isLoadingKPIs || isLoadingLog) && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            {isLoadingKPIs ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : kpis ? (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <KPICard
                        label="Interacciones"
                        value={String(kpis.totalInteractions)}
                        icon={<Activity className="h-5 w-5 text-vape-400" />}
                        accent="vape"
                    />
                    <KPICard
                        label="Resolucion semantica"
                        value={pct(kpis.semanticMatchRate)}
                        sublabel={`${Math.round(kpis.semanticMatchRate * kpis.totalInteractions)} hits`}
                        icon={<Target className="h-5 w-5 text-emerald-400" />}
                        accent="emerald"
                    />
                    <KPICard
                        label="Uso de fallback"
                        value={pct(kpis.fallbackRate)}
                        icon={<ShieldAlert className="h-5 w-5 text-amber-400" />}
                        accent="amber"
                    />
                    <KPICard
                        label="Latencia media"
                        value={kpis.avgLatencyMs > 0 ? `${(kpis.avgLatencyMs / 1000).toFixed(1)}s` : '—'}
                        icon={<Clock className="h-5 w-5 text-blue-400" />}
                        accent="blue"
                    />
                    <KPICard
                        label="Cards por turno"
                        value={kpis.avgProductCards.toFixed(1)}
                        sublabel="promedio/query"
                        icon={<Search className="h-5 w-5 text-indigo-400" />}
                        accent="indigo"
                    />
                    <KPICard
                        label="Rescates de seguridad"
                        value={String(kpis.guardrailRescueCount)}
                        sublabel="UNKNOWN corregidos antes de responder"
                        icon={<ShieldAlert className="h-5 w-5 text-orange-400" />}
                        accent="orange"
                    />
                    <KPICard
                        label="Busquedas sin resultado"
                        value={String(kpis.zeroProductCardCount)}
                        sublabel="product_search sin resultado"
                        icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
                        accent="red"
                    />
                    <KPICard
                        label="Acciones Carrito"
                        value={String(kpis.totalCartActions)}
                        icon={<ShoppingCart className="h-5 w-5 text-teal-400" />}
                        accent="teal"
                    />
                </motion.div>
            ) : null}

            {/* Quick stats row */}
            {kpis && (
                <div className="flex items-center gap-4 text-[10px] font-medium text-white/25">
                    <span>Consultas documentales: <strong className="text-white/50">{kpis.policyQueryCount}</strong></span>
                    <span>Frustracion detectada: <strong className="text-white/50">{pct(kpis.frustrationRate)}</strong></span>
                </div>
            )}

            {/* Miss Taxonomy Panel */}
            {!isLoadingLog && fullQueryLog.length > 0 && (
                <MissTaxonomyPanel
                    fullQueryLog={fullQueryLog}
                    onBucketSelect={setActiveBucket}
                />
            )}

            {/* Bucket Filter Tabs + Query Log */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 flex-wrap">
                        {BUCKET_TABS.map((bt) => (
                            <button
                                key={bt.value}
                                onClick={() => setActiveBucket(bt.value)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                    activeBucket === bt.value
                                        ? "bg-white/10 text-white"
                                        : "text-white/30 hover:text-white/50"
                                )}
                            >
                                {bt.icon}
                                {bt.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] text-white/20">
                        {filteredLogRows} / {totalLogRows} filas
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/25">
                                    <th className="py-3 px-3 text-left">Consulta</th>
                                    <th className="py-3 px-2 text-left">Respuesta</th>
                                    <th className="py-3 px-2 text-left">Lectura</th>
                                    <th className="py-3 px-2 text-left">Ruta</th>
                                    <th className="py-3 px-2 text-center">Sem.</th>
                                    <th className="py-3 px-2 text-center">Rescate</th>
                                    <th className="py-3 px-2 text-center">Cards</th>
                                    <th className="py-3 px-2 text-right">Latencia</th>
                                    <th className="py-3 px-2 text-right">Fecha</th>
                                    <th className="py-3 px-3 text-right">Revision</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingLog ? (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-white/20 text-xs">
                                            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                            Cargando turnos...
                                        </td>
                                    </tr>
                                ) : filteredLogRows === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-white/20 text-xs">
                                            Sin datos para este filtro y rango.
                                        </td>
                                    </tr>
                                ) : (
                                    queryLog.map((row) => (
                                        <QueryRow
                                            key={row.id}
                                            row={row}
                                            onReview={onReview}
                                            evalMap={evalMap}
                                            signalMap={signalStates}
                                            improvementMap={improvementMap}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
