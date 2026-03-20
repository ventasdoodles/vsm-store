import { motion } from 'framer-motion';
import {
    Activity, Target, ShieldAlert, ShoppingCart,
    AlertTriangle, RefreshCw, Search,
    BookOpen, Filter, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePilotOps, type TimeRange } from '@/hooks/admin/useAdminPilotOps';
import type { PilotBucket, PilotKPIs, PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';

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
    { value: 'zero_product_cards', label: '0 Cards', icon: <AlertTriangle className="h-3 w-3" /> },
    { value: 'guardrail_rescue', label: 'Guardrail', icon: <ShieldAlert className="h-3 w-3" /> },
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

function buildMissTaxonomy(kpis: PilotKPIs, queryLog: PilotQueryRow[]): MissCategory[] {
    const total = kpis.totalInteractions;
    // fallbackCount includes ALL fallback activations: rescues, OOS paths, no-match paths.
    // It is NOT scoped to zero-card outcomes — so it cannot share the zero_product_cards bucket.
    const fallbackCount = Math.round(kpis.fallbackRate * total);
    const frustrationCount = Math.round(kpis.frustrationRate * total);
    // noCapsuleCount is bounded by the loaded queryLog page — not a KPI aggregate.
    const noCapsuleCount = queryLog.filter(r => r.capsule === null).length;

    const primary: MissCategory[] = [
        {
            // Hard miss: product search capsule returned zero product cards.
            label: 'Producto sin resultado',
            count: kpis.zeroProductCardCount,
            bucket: 'zero_product_cards' as PilotBucket,
            color: 'red',
            description: 'product_search → 0 cards devueltos',
            tier: 'primary',
        },
        {
            // Broader degradation signal: fallback branch activated in any capsule path.
            // No dedicated drilldown bucket — fallback_used ≠ zero_product_cards.
            label: 'Fallback activado',
            count: fallbackCount,
            bucket: null,
            color: 'amber',
            description: 'respaldo activado — rescates y misses incluidos',
            tier: 'primary',
        },
        {
            // Recovery signal: Analyst returned UNKNOWN, guardrail rescued to product search.
            // This is a successful recovery, not an outright miss — framed conservatively.
            label: 'Rescue guardrail',
            count: kpis.guardrailRescueCount,
            bucket: 'guardrail_rescue' as PilotBucket,
            color: 'teal',
            description: 'UNKNOWN rescatado — Analyst sin clasificación directa',
            tier: 'primary',
        },
        {
            // Informational routing category: policy/RAG queries are expected successes.
            // Not a miss unless the query was commercial — that distinction is not available here.
            label: 'Consulta política / RAG',
            count: kpis.policyQueryCount,
            bucket: 'policy_query' as PilotBucket,
            color: 'blue',
            description: 'consulta de conocimiento, no comercial',
            tier: 'primary',
        },
    ].sort((a, b) => b.count - a.count);

    const signal: MissCategory[] = [
        {
            // Symptom signal: user frustration detected. Not a root-cause — it may co-occur
            // with any of the primary categories. Kept for escalation awareness only.
            label: 'Señal de frustración',
            count: frustrationCount,
            bucket: 'frustration' as PilotBucket,
            color: 'pink',
            description: 'síntoma de escalación — causa raíz puede ser cualquier miss',
            tier: 'signal',
        },
        {
            // Weak heuristic: capsule === null in the current log page only (not a KPI aggregate).
            // Do not weight against primary counts — sample is uncontrolled.
            label: 'Sin cápsula asignada',
            count: noCapsuleCount,
            bucket: null,
            color: 'white',
            description: 'muestra acotada del log — señal débil',
            tier: 'signal',
        },
    ].sort((a, b) => b.count - a.count);

    return [...primary, ...signal];
}

interface MissTaxonomyPanelProps {
    kpis: PilotKPIs;
    queryLog: PilotQueryRow[];
    onBucketSelect: (bucket: PilotBucket) => void;
}

function MissTaxonomyPanel({ kpis, queryLog, onBucketSelect }: MissTaxonomyPanelProps) {
    const categories = buildMissTaxonomy(kpis, queryLog);
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
                    {kpis.totalInteractions} interacciones
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

function QueryRow({ row, onReview }: { row: PilotQueryRow; onReview: (row: PilotQueryRow) => void }) {
    const isRescue = row.raw_analyst_intent === 'UNKNOWN' && row.capsule !== null;
    const truncatedQuery = row.query
        ? row.query.length > 80 ? row.query.slice(0, 77) + '...' : row.query
        : '—';

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors text-xs">
            <td className="py-3 px-3 text-white/70 max-w-[220px] truncate" title={row.query ?? ''}>
                {truncatedQuery}
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
                <button
                    onClick={() => onReview(row)}
                    className="p-1.5 rounded-lg bg-vape-500/10 text-vape-400 hover:bg-vape-500 hover:text-white transition-all group/btn"
                    title="Evaluar Interacción"
                >
                    <Target className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                </button>
            </td>
        </tr>
    );
}

// ─── Main Component ────────────────────────────────

export function PilotTelemetry({ onReview }: { onReview: (row: PilotQueryRow) => void }) {
    const {
        timeRange, setTimeRange,
        kpis, isLoadingKPIs,
        queryLog, totalLogRows, filteredLogRows,
        isLoadingLog,
        activeBucket, setActiveBucket,
        includeSimulation, setIncludeSimulation,
        refresh,
    } = usePilotOps();

    const pct = (val: number) => `${(val * 100).toFixed(1)}%`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        Telemetría del Piloto
                    </h3>
                    <p className="text-[11px] text-white/30 font-medium">
                        Señales operativas reales desde <code className="text-white/50">ai_analytics</code>
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
                        title={includeSimulation ? "Ocultar Datos de Labs/Simulador" : "Mostrar Datos de Labs/Simulador"}
                    >
                        <RefreshCw className={cn("h-3 w-3", includeSimulation && "animate-pulse")} />
                        {includeSimulation ? 'Simulations: ON' : 'Labs/QA: OFF'}
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
                        label="Match Semántico"
                        value={pct(kpis.semanticMatchRate)}
                        sublabel={`${Math.round(kpis.semanticMatchRate * kpis.totalInteractions)} hits`}
                        icon={<Target className="h-5 w-5 text-emerald-400" />}
                        accent="emerald"
                    />
                    <KPICard
                        label="Tasa Fallback"
                        value={pct(kpis.fallbackRate)}
                        icon={<ShieldAlert className="h-5 w-5 text-amber-400" />}
                        accent="amber"
                    />
                    <KPICard
                        label="Latencia Prom."
                        value={kpis.avgLatencyMs > 0 ? `${(kpis.avgLatencyMs / 1000).toFixed(1)}s` : '—'}
                        icon={<Clock className="h-5 w-5 text-blue-400" />}
                        accent="blue"
                    />
                    <KPICard
                        label="Product Cards"
                        value={kpis.avgProductCards.toFixed(1)}
                        sublabel="promedio/query"
                        icon={<Search className="h-5 w-5 text-indigo-400" />}
                        accent="indigo"
                    />
                    <KPICard
                        label="Guardrail Rescue"
                        value={String(kpis.guardrailRescueCount)}
                        sublabel="analyst→UNKNOWN rescatados"
                        icon={<ShieldAlert className="h-5 w-5 text-orange-400" />}
                        accent="orange"
                    />
                    <KPICard
                        label="0 Cards (Misses)"
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
                <div className="flex items-center gap-4 text-[10px] text-white/25 font-medium">
                    <span>📋 Políticas: <strong className="text-white/50">{kpis.policyQueryCount}</strong></span>
                    <span>😤 Frustración: <strong className="text-white/50">{pct(kpis.frustrationRate)}</strong></span>
                </div>
            )}

            {/* Miss Taxonomy Panel */}
            {kpis && !isLoadingKPIs && (
                <MissTaxonomyPanel
                    kpis={kpis}
                    queryLog={queryLog}
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
                                    <th className="py-3 px-3 text-left">Query</th>
                                    <th className="py-3 px-2 text-left">Intent</th>
                                    <th className="py-3 px-2 text-left">Capsule</th>
                                    <th className="py-3 px-2 text-center">Sem.</th>
                                    <th className="py-3 px-2 text-center">Guard</th>
                                    <th className="py-3 px-2 text-center">Cards</th>
                                    <th className="py-3 px-2 text-right">Latencia</th>
                                    <th className="py-3 px-2 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingLog ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-white/20 text-xs">
                                            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                            Cargando queries...
                                        </td>
                                    </tr>
                                ) : filteredLogRows === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-white/20 text-xs">
                                            Sin datos para este filtro y rango.
                                        </td>
                                    </tr>
                                ) : (
                                    queryLog.map((row) => (
                                        <QueryRow key={row.id} row={row} onReview={onReview} />
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
