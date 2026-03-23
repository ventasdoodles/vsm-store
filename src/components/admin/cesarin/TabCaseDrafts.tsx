/**
 * TabCaseDrafts — B2 Pass 1: Reusable Private Case Draft Queue
 * Minimal operational queue showing all case drafts created from
 * ReviewDrawer (real interactions) or TabQuality (simulation failures).
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookmarkPlus, RefreshCw, Trash2, MessageSquare, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { PrivateCaseDraft, CaseDraftReadinessStatus } from '@/types/cesarin';
import { getCaseDrafts, deleteCaseDraft } from '@/services/admin/admin-case-drafts.service';

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

export function TabCaseDrafts() {
    const [drafts, setDrafts] = useState<PrivateCaseDraft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDrafts();
    }, []);

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
            toast.success('Caso eliminado');
        } catch (_err) {
            toast.error('Error al eliminar el caso');
        } finally {
            setDeletingId(null);
        }
    };

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
                                return (
                                    <tr key={draft.id} className="group hover:bg-white/[0.015] transition-all">
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
                                        {/* Delete */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(draft.id)}
                                                disabled={deletingId === draft.id}
                                                className="p-1.5 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                title="Eliminar caso"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}
