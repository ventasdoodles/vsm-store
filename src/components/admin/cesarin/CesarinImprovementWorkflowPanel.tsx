import { CheckCircle2, Clock3, AlertCircle, FlaskConical, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
    AdminImprovementWorkflowView,
    AdminWorkflowEvidenceKind,
    AdminWorkflowStepState,
} from '@/services/admin/admin-improvement-workflow.service';

const EVIDENCE_BADGE: Record<AdminWorkflowEvidenceKind, string> = {
    authoritative: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    partial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    simulated: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    missing: 'bg-white/5 text-white/30 border-white/10',
};

const STEP_BADGE: Record<AdminWorkflowStepState, string> = {
    complete: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    current: 'bg-vape-500/10 text-vape-400 border-vape-500/20',
    partial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    missing: 'bg-white/5 text-white/30 border-white/10',
};

function EvidenceIcon({ kind }: { kind: AdminWorkflowEvidenceKind }) {
    if (kind === 'authoritative') return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (kind === 'simulated') return <FlaskConical className="h-3.5 w-3.5" />;
    if (kind === 'partial') return <Clock3 className="h-3.5 w-3.5" />;
    return <AlertCircle className="h-3.5 w-3.5" />;
}

export function CesarinImprovementWorkflowPanel({
    workflow,
    title = 'Workflow de mejora',
}: {
    workflow: AdminImprovementWorkflowView;
    title?: string;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-vape-400">
                <Link2 className="h-3 w-3" />
                {title}
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-5 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-sm font-black text-white uppercase tracking-tight">
                            {workflow.headline}
                        </p>
                        <p className="text-xs text-white/45">
                            {workflow.sourceLabel} · {workflow.currentStatusLabel}
                        </p>
                        <p className="text-xs text-white/60 max-w-3xl">
                            {workflow.currentStatusDetail}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest',
                            EVIDENCE_BADGE[workflow.evidenceKind],
                        )}>
                            <EvidenceIcon kind={workflow.evidenceKind} />
                            {workflow.evidenceLabel}
                        </span>
                        {workflow.hasRecommendation && (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                                Recommendation
                            </span>
                        )}
                        {workflow.hasImprovementItem && (
                            <span className="rounded-full border border-vape-500/20 bg-vape-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-vape-400">
                                Improvement Item
                            </span>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        Base de evidencia
                    </p>
                    <p className="mt-2 text-xs text-white/55 leading-relaxed">
                        {workflow.evidenceDetail}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {workflow.steps.map((step) => (
                        <div
                            key={step.key}
                            className="rounded-2xl border border-white/5 bg-white/[0.015] p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                                    {step.label}
                                </p>
                                <span className={cn(
                                    'rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest',
                                    STEP_BADGE[step.state],
                                )}>
                                    {step.statusLabel}
                                </span>
                            </div>
                            <p className="text-xs text-white/65 leading-relaxed">
                                {step.detail}
                            </p>
                            <span className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest',
                                EVIDENCE_BADGE[step.evidenceKind],
                            )}>
                                <EvidenceIcon kind={step.evidenceKind} />
                                {step.evidenceLabel}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
