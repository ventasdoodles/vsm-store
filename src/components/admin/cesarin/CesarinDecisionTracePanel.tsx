import type { ComponentType } from 'react';
import { ShieldCheck, FlaskConical, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminDecisionTraceView } from '@/services/admin/admin-decision-trace.service';

interface CesarinDecisionTracePanelProps {
    trace: AdminDecisionTraceView;
    title?: string;
}

const EVIDENCE_STYLES: Record<AdminDecisionTraceView['evidenceKind'], string> = {
    authoritative_runtime: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    partial_runtime: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    simulated: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

const EVIDENCE_ICONS = {
    authoritative_runtime: ShieldCheck,
    partial_runtime: AlertTriangle,
    simulated: FlaskConical,
} satisfies Record<AdminDecisionTraceView['evidenceKind'], ComponentType<{ className?: string }>>;

function TraceField({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-white/25">{label}</div>
            <div className="mt-1 text-xs font-medium text-white/75 leading-relaxed">
                {value ?? 'No disponible'}
            </div>
        </div>
    );
}

export function CesarinDecisionTracePanel({
    trace,
    title = 'Traza causal',
}: CesarinDecisionTracePanelProps) {
    const EvidenceIcon = EVIDENCE_ICONS[trace.evidenceKind];
    const retrievalValue = [trace.retrievalSource, trace.matchStrategy].filter(Boolean).join(' · ') || null;
    const guardrailValue = trace.guardrailOverrides.length > 0 ? trace.guardrailOverrides.join(', ') : 'Sin override';
    const injectedToolsValue = trace.injectedTools.length > 0 ? trace.injectedTools.join(', ') : 'Sin tools inyectadas';

    return (
        <div className="space-y-4 rounded-3xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <ArrowRightCircle className="h-3 w-3 text-vape-400" />
                        {title}
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">
                        {trace.evidenceDetail}
                    </p>
                </div>
                <span className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest',
                    EVIDENCE_STYLES[trace.evidenceKind],
                )}>
                    <EvidenceIcon className="h-3.5 w-3.5" />
                    {trace.evidenceLabel}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TraceField label="Analyst intent" value={trace.analystIntent} />
                <TraceField label="Intento final" value={trace.finalIntent} />
                <TraceField label="Ruta material" value={trace.routeLabel} />
                <TraceField label="Estado de ejecucion" value={trace.executionStatus} />
                <TraceField label="Guardrail" value={guardrailValue} />
                <TraceField label="Tools inyectadas" value={injectedToolsValue} />
                <TraceField label="Degradacion / fallback" value={trace.degradedReason} />
                <TraceField label="Retrieval / match" value={retrievalValue} />
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-4">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/25">Respuesta registrada</div>
                <p className="mt-2 text-sm text-white/75 leading-relaxed">
                    {trace.responseText ?? 'No se persistio respuesta junto a esta traza.'}
                </p>
            </div>

            {trace.offeredProducts.length > 0 && (
                <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-4">
                    <div className="text-[9px] font-black uppercase tracking-widest text-white/25">Productos ofrecidos</div>
                    <ul className="mt-2 space-y-1">
                        {trace.offeredProducts.map((product) => (
                            <li key={product.id} className="text-[11px] text-white/55 leading-tight">
                                {product.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
