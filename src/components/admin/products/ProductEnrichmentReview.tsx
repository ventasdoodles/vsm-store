import { Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnrichmentPackage } from '@/services/admin';

interface EnrichmentFieldRowProps {
    fieldKey: string;
    label: string;
    approved: boolean;
    onToggle: (key: string) => void;
    children: React.ReactNode;
}

export function EnrichmentFieldRow({ fieldKey, label, approved, onToggle, children }: EnrichmentFieldRowProps) {
    return (
        <div className={cn(
            'rounded-xl p-3.5 border transition-all',
            approved ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/5 bg-white/[0.01] opacity-40'
        )}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
                <button
                    type="button"
                    onClick={() => onToggle(fieldKey)}
                    className={cn(
                        'h-5 w-5 rounded flex items-center justify-center border transition-all text-[10px] font-black',
                        approved
                            ? 'bg-violet-500 border-violet-500 text-white'
                            : 'bg-transparent border-white/20 text-white/20'
                    )}
                >
                    ✓
                </button>
            </div>
            {children}
        </div>
    );
}

interface ProductEnrichmentReviewProps {
    enrichmentResult: EnrichmentPackage;
    approvedFields: Set<string>;
    setApprovedFields: React.Dispatch<React.SetStateAction<Set<string>>>;
    handleApplyEnrichment: () => void;
    setEnrichmentResult: (val: EnrichmentPackage | null) => void;
}

export function ProductEnrichmentReview({
    enrichmentResult,
    approvedFields,
    setApprovedFields,
    handleApplyEnrichment,
    setEnrichmentResult
}: ProductEnrichmentReviewProps) {
    return (
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between px-2">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Sugerencias de Enriquecimiento
                </h3>
                <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest',
                    enrichmentResult.confidence === 'high'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : enrichmentResult.confidence === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                )}>
                    Confianza {enrichmentResult.confidence === 'high' ? 'Alta' : enrichmentResult.confidence === 'medium' ? 'Media' : 'Baja'}
                </span>
            </div>

            <div className="rounded-[1.25rem] border border-violet-500/20 bg-violet-500/5 p-5 space-y-4">
                {/* Warnings */}
                {enrichmentResult.warnings.length > 0 && (
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Verificación Manual Requerida
                        </div>
                        <ul className="space-y-1">
                            {enrichmentResult.warnings.map((w, i) => (
                                <li key={i} className="text-xs text-amber-300/80 flex gap-2">
                                    <span className="text-amber-500 shrink-0">•</span>
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Short description */}
                {enrichmentResult.short_description && (
                    <EnrichmentFieldRow
                        fieldKey="short_description"
                        label="Descripción Corta"
                        approved={approvedFields.has('short_description')}
                        onToggle={(k) => setApprovedFields(prev => {
                            const next = new Set(prev);
                            if (next.has(k)) { next.delete(k); } else { next.add(k); }
                            return next;
                        })}
                    >
                        <p className="text-xs text-white/60 italic">{enrichmentResult.short_description}</p>
                    </EnrichmentFieldRow>
                )}

                {/* AI Sales Note */}
                {enrichmentResult.ai_sales_note && (
                    <EnrichmentFieldRow
                        fieldKey="ai_sales_note"
                        label="Nota de Venta"
                        approved={approvedFields.has('ai_sales_note')}
                        onToggle={(k) => setApprovedFields(prev => {
                            const next = new Set(prev);
                            if (next.has(k)) { next.delete(k); } else { next.add(k); }
                            return next;
                        })}
                    >
                        <p className="text-xs text-white/60 italic">{enrichmentResult.ai_sales_note}</p>
                    </EnrichmentFieldRow>
                )}

                {/* Long description */}
                {enrichmentResult.description && (
                    <EnrichmentFieldRow
                        fieldKey="description"
                        label="Descripción Completa"
                        approved={approvedFields.has('description')}
                        onToggle={(k) => setApprovedFields(prev => {
                            const next = new Set(prev);
                            if (next.has(k)) { next.delete(k); } else { next.add(k); }
                            return next;
                        })}
                    >
                        <p className="text-xs text-white/60 italic line-clamp-3">{enrichmentResult.description}</p>
                    </EnrichmentFieldRow>
                )}

                {/* Specs */}
                {Object.keys(enrichmentResult.specs).length > 0 && (
                    <EnrichmentFieldRow
                        fieldKey="specs"
                        label="Specs Sugeridos"
                        approved={approvedFields.has('specs')}
                        onToggle={(k) => setApprovedFields(prev => {
                            const next = new Set(prev);
                            if (next.has(k)) { next.delete(k); } else { next.add(k); }
                            return next;
                        })}
                    >
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {Object.entries(enrichmentResult.specs).map(([k, v]) => (
                                <span key={k} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/60 border border-white/5">
                                    {k}: <span className="text-white/80 font-semibold">{v}</span>
                                </span>
                            ))}
                        </div>
                        <p className="text-[9px] text-white/25 mt-1.5 italic">Solo se añaden llaves nuevas — no se sobreescriben specs ya ingresadas.</p>
                    </EnrichmentFieldRow>
                )}

                {/* Tags */}
                {enrichmentResult.tags.length > 0 && (
                    <EnrichmentFieldRow
                        fieldKey="tags"
                        label="Tags Sugeridos"
                        approved={approvedFields.has('tags')}
                        onToggle={(k) => setApprovedFields(prev => {
                            const next = new Set(prev);
                            if (next.has(k)) { next.delete(k); } else { next.add(k); }
                            return next;
                        })}
                    >
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {enrichmentResult.tags.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-[10px] text-violet-400 ring-1 ring-inset ring-violet-500/20">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </EnrichmentFieldRow>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                    <button
                        type="button"
                        onClick={handleApplyEnrichment}
                        disabled={approvedFields.size === 0}
                        className="flex-1 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/20 text-violet-300 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30"
                    >
                        Aplicar Aprobadas ({approvedFields.size})
                    </button>
                    <button
                        type="button"
                        onClick={() => setEnrichmentResult(null)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        Descartar
                    </button>
                </div>
            </div>
        </section>
    );
}
