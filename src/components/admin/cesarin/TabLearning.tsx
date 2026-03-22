import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, ShieldCheck, ListChecks, X, CheckCircle2 } from 'lucide-react';
import { LearningItem } from '@/types/cesarin';
import { SignalState } from '@/hooks/useCesarinSignalStates';
import { cn } from '@/lib/utils';

type SignalStatus = SignalState['status'];

const STATUS_CONFIG: Record<SignalStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    revisada:          { label: 'Revisada',           color: 'text-white/40',    bg: 'bg-white/5        border border-white/10',        icon: CheckCircle2 },
    convertida_regla:  { label: 'Directriz creada',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20', icon: ShieldCheck  },
    convertida_mejora: { label: 'Abierta en mejoras', color: 'text-indigo-400',  bg: 'bg-indigo-500/10  border border-indigo-500/20',  icon: ListChecks   },
    descartada:        { label: 'Descartada',          color: 'text-white/30',   bg: 'bg-white/5        border border-white/10',        icon: X            },
    resuelta:          { label: 'Resuelta',            color: 'text-emerald-300', bg: 'bg-emerald-500/5  border border-emerald-500/10', icon: CheckCircle2 },
};

interface TabLearningProps {
    learningItems: LearningItem[];
    signalStates: Record<string, SignalState>;
    onMarkSignal: (id: string, state: SignalState) => void;
    onCreateRule: (query: string, frustration: boolean, intent: string | null) => Promise<{ ref_label?: string } | void>;
    onCreateImprovement: (item: LearningItem) => Promise<{ ref_label?: string } | void>;
}

// Stable key for a learning item — persisted items always have an id.
// Items without id fall back to session key (edge case, shouldn't happen in production).
function itemKey(item: LearningItem, i: number): string {
    return item.id ?? `session-${i}`;
}

function formatHandledAt(iso: string): string {
    try {
        return new Date(iso).toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export function TabLearning({ learningItems, signalStates, onMarkSignal, onCreateRule, onCreateImprovement }: TabLearningProps) {
    // Session-only fallback for items without a persistent ID
    const [sessionStates, setSessionStates] = useState<Record<string, SignalState>>({});
    const [loadingKey, setLoadingKey] = useState<string | null>(null);

    const getState = (item: LearningItem, i: number): SignalState | undefined => {
        if (item.id) return signalStates[item.id];
        return sessionStates[`session-${i}`];
    };

    const markState = (item: LearningItem, i: number, state: SignalState) => {
        if (item.id) {
            onMarkSignal(item.id, state);
        } else {
            setSessionStates(prev => ({ ...prev, [`session-${i}`]: state }));
        }
    };

    const handleCreateRule = async (item: LearningItem, i: number) => {
        const key = itemKey(item, i);
        setLoadingKey(key);
        try {
            const result = await onCreateRule(item.query, item.frustration_detected, item.detected_intent);
            markState(item, i, {
                status: 'convertida_regla',
                handled_at: new Date().toISOString(),
                ref_label: (result as { ref_label?: string } | void)?.ref_label,
            });
        } finally {
            setLoadingKey(null);
        }
    };

    const handleCreateImprovement = async (item: LearningItem, i: number) => {
        const key = itemKey(item, i);
        setLoadingKey(key);
        try {
            const result = await onCreateImprovement(item);
            markState(item, i, {
                status: 'convertida_mejora',
                handled_at: new Date().toISOString(),
                ref_label: (result as { ref_label?: string } | void)?.ref_label,
            });
        } catch {
            // error toast handled by parent; don't mark status on failure
        } finally {
            setLoadingKey(null);
        }
    };

    const handleDiscard = (item: LearningItem, i: number) => {
        markState(item, i, {
            status: 'descartada',
            handled_at: new Date().toISOString(),
            ref_label: item.query.slice(0, 60),
        });
    };

    const handledCount = learningItems.filter((item, i) => !!getState(item, i)).length;

    return (
        <motion.div
            key="learning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                    <Bot className="h-40 w-40 text-vape-400" />
                </div>
                <div className="relative space-y-4">
                    <h2 className="text-2xl font-black text-white flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-500 flex items-center justify-center">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        Señales de friccion detectadas
                    </h2>
                    <div className="text-sm text-theme-secondary max-w-2xl leading-relaxed space-y-2">
                        <p>Consultas donde Cesarin mostro baja confianza o el cliente mostro frustracion.</p>
                        <p>Convierte cada señal en: <span className="font-semibold text-white/70">(1) directriz</span> para guiar respuestas futuras, <span className="font-semibold text-white/70">(2) mejora</span> en tu cola, o <span className="font-semibold text-white/70">(3) descarta</span> como revisada.</p>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="grid grid-cols-1 gap-4">
                {learningItems.length > 0 ? (
                    learningItems.map((item, i) => {
                        const key = itemKey(item, i);
                        const state = getState(item, i);
                        const isActed = !!state;
                        const isLoading = loadingKey === key;

                        return (
                            <div
                                key={key}
                                className={cn(
                                    'p-8 rounded-[2.5rem] border transition-all duration-500',
                                    isActed && state?.status === 'descartada'
                                        ? 'bg-white/[0.01] border-white/5 opacity-40'
                                        : isActed
                                        ? 'bg-white/[0.02] border-white/5'
                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-vape-500/20 group'
                                )}
                            >
                                <div className="flex items-start justify-between gap-6">
                                    {/* Left — icon + content */}
                                    <div className="flex items-start gap-6">
                                        <div className={cn(
                                            'h-14 w-14 rounded-3xl flex items-center justify-center shrink-0 transition-all',
                                            isActed ? 'bg-white/5 text-white/20' : 'bg-white/5 text-white/20 group-hover:text-vape-400 group-hover:bg-vape-500/10'
                                        )}>
                                            <MessageSquare className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className={cn(
                                                'text-base font-bold leading-snug',
                                                isActed ? 'text-white/40' : 'text-white'
                                            )}>
                                                "{item.query}"
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={cn(
                                                    'text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md',
                                                    item.frustration_detected
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-indigo-500/20 text-indigo-400'
                                                )}>
                                                    {item.frustration_detected ? 'Frustracion detectada' : (item.detected_intent || 'Intencion desconocida')}
                                                </span>
                                                <span className="text-[10px] text-white/20 font-bold uppercase">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right — actions or status badge */}
                                    <div className="shrink-0 flex flex-col items-end gap-2">
                                        {isActed ? (
                                            // Status badge after action
                                            (() => {
                                                const cfg = STATUS_CONFIG[state!.status];
                                                const Icon = cfg.icon;
                                                return (
                                                    <div className="space-y-1.5 text-right">
                                                        <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest', cfg.bg, cfg.color)}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                            {cfg.label}
                                                        </div>
                                                        {state?.ref_label && (
                                                            <p className="text-[10px] text-white/25 max-w-[200px] text-right leading-relaxed">
                                                                → {state.ref_label}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-end gap-2">
                                                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-wider">
                                                                {formatHandledAt(state!.handled_at)}
                                                            </p>
                                                            {state?.handled_by && (
                                                                <span className="text-[9px] text-white/15 bg-white/5 px-1.5 py-0.5 rounded-md max-w-[100px] truncate">
                                                                    {state.handled_by}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            // Action buttons — visible on hover, or always if loading
                                            <div className={cn(
                                                'flex items-center gap-2 transition-opacity duration-200',
                                                isLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            )}>
                                                {/* Create rule */}
                                                <button
                                                    onClick={() => handleCreateRule(item, i)}
                                                    disabled={isLoading}
                                                    title="Crear directriz de comportamiento a partir de esta señal"
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-vape-500/10 text-vape-400 text-[10px] font-black uppercase tracking-widest border border-vape-500/20 hover:bg-vape-500 hover:text-white transition-all disabled:opacity-40"
                                                >
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                    Crear directriz
                                                </button>

                                                {/* Open in improvements */}
                                                <button
                                                    onClick={() => handleCreateImprovement(item, i)}
                                                    disabled={isLoading}
                                                    title="Abrir esta señal como elemento en la Cola de mejoras"
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-40"
                                                >
                                                    <ListChecks className="h-3.5 w-3.5" />
                                                    Abrir en mejoras
                                                </button>

                                                {/* Discard */}
                                                <button
                                                    onClick={() => handleDiscard(item, i)}
                                                    disabled={isLoading}
                                                    title="Marcar esta señal como revisada y sin accion requerida"
                                                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/5 text-white/30 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 hover:text-white/60 transition-all disabled:opacity-40"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Descartar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-20 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-white/5">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/5">
                            <Bot className="h-10 w-10 text-white/10" />
                        </div>
                        <p className="text-theme-secondary text-sm font-medium max-w-sm mx-auto">
                            No hay señales de friccion recientes. Cuando Cesarin detecte consultas con baja confianza o frustracion, apareceran aqui.
                        </p>
                    </div>
                )}
            </div>

            {/* Progress note */}
            {handledCount > 0 && (
                <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    {handledCount} de {learningItems.length} señales procesadas — los estados se comparten entre operadores.
                </p>
            )}
        </motion.div>
    );
}
