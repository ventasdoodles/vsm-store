import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRightCircle,
    Bot,
    FlaskConical,
    RefreshCcw,
    Send,
    User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SimulationSession } from '@/types/cesarin';
import type { AdminSimulationLabView } from '@/services/admin/admin-simulation-lab.service';
import { CesarinDecisionTracePanel } from './CesarinDecisionTracePanel';
import { CesarinImprovementWorkflowPanel } from './CesarinImprovementWorkflowPanel';

interface TabSimulatorProps {
    simQuery: string;
    setSimQuery: (query: string) => void;
    sessionView: AdminSimulationLabView;
    errorMessage: string | null;
    isLoading: boolean;
    onSendMessage: () => void;
    sessions: SimulationSession[];
    currentSessionId: string | null;
    onLoadSession: (session: SimulationSession) => void;
    onNewSession: () => void;
    onSelectTurn: (turnId: string) => void;
    onReviewTurn: (turnId: string) => void;
}

function getSessionPreview(session: SimulationSession): string {
    return session.history.find((message) => message.role === 'user')?.content ?? 'Sin mensajes';
}

function getAssistantTurnCount(session: SimulationSession): number {
    return session.history.filter((message) => message.role === 'assistant').length;
}

export function TabSimulator({
    simQuery,
    setSimQuery,
    sessionView,
    errorMessage,
    isLoading,
    onSendMessage,
    sessions,
    currentSessionId,
    onLoadSession,
    onNewSession,
    onSelectTurn,
    onReviewTurn,
}: TabSimulatorProps) {
    const isClosed = sessionView.state === 'closed';

    return (
        <motion.div
            key="simulator"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-4"
        >
            <div className="space-y-4 lg:col-span-1">
                <button
                    onClick={onNewSession}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-vape-500/20 bg-vape-500/10 p-4 text-[10px] font-black uppercase tracking-widest text-vape-400 transition-all hover:bg-vape-500/20"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Nueva simulación
                </button>

                <div className="space-y-3 rounded-[2rem] border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                            Conversation Lab
                        </span>
                        <span className={cn(
                            'rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest',
                            sessionView.state === 'active'
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                : sessionView.state === 'closed'
                                    ? 'border-red-500/20 bg-red-500/10 text-red-400'
                                    : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
                        )}>
                            {sessionView.stateLabel}
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-white/55">
                        {sessionView.stateDetail}
                    </p>
                    <p className="text-[10px] leading-relaxed text-white/30">
                        {sessionView.contextWindowLabel}
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/25">Turnos</div>
                            <div className="mt-1 text-sm font-black text-white">{sessionView.turns.length}</div>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/25">Modo</div>
                            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-300">
                                <FlaskConical className="h-3.5 w-3.5" />
                                Simulado
                            </div>
                        </div>
                    </div>
                </div>

                {errorMessage && (
                    <div className="space-y-2 rounded-[2rem] border border-red-500/20 bg-red-500/5 p-5">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-red-400">
                            <AlertTriangle className="h-3 w-3" />
                            Error de sesión
                        </div>
                        <p className="text-xs leading-relaxed text-red-200/70">
                            {errorMessage}
                        </p>
                    </div>
                )}

                <div className="space-y-2 pr-2 scrollbar-hide max-h-[500px] overflow-y-auto">
                    {sessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => onLoadSession(session)}
                            className={cn(
                                'w-full rounded-2xl border p-4 text-left transition-all space-y-2',
                                currentSessionId === session.id
                                    ? 'border-white/20 bg-white/10 shadow-xl'
                                    : 'border-white/5 bg-white/[0.02] hover:border-white/10',
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                                    {new Date(session.created_at).toLocaleDateString('es-MX')}
                                </span>
                                <span className={cn(
                                    'rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest',
                                    session.is_active
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-red-500/10 text-red-400',
                                )}>
                                    {session.is_active ? 'Activa' : 'Cerrada'}
                                </span>
                            </div>
                            <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-white/60">
                                {getSessionPreview(session)}
                            </p>
                            <p className="text-[9px] uppercase tracking-widest text-white/20">
                                {getAssistantTurnCount(session)} turno{getAssistantTurnCount(session) === 1 ? '' : 's'}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex h-[720px] flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] lg:col-span-2">
                <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-4 backdrop-blur-sm">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                            Laboratorio conversacional
                        </div>
                        <div className="text-xs text-white/45">
                            Habla con Cesarin, inspecciona el turno real y abre review desde la misma conversación.
                        </div>
                    </div>
                    <span className={cn(
                        'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest',
                        isClosed
                            ? 'border-red-500/20 bg-red-500/10 text-red-400'
                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
                    )}>
                        {sessionView.stateLabel}
                    </span>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-8 scrollbar-hide">
                    {sessionView.turns.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center opacity-40">
                            <Bot className="h-16 w-16 text-vape-400" />
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-white">
                                Cesarin Conversation Lab
                            </p>
                            <p className="max-w-sm text-xs leading-relaxed text-theme-secondary">
                                Inicia una sesión real de simulación. El contexto se conserva solo dentro de esta sesión y cada respuesta puede abrirse a revisión.
                            </p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {sessionView.turns.map((turn) => {
                            const isSelected = sessionView.selectedTurnId === turn.id;
                            return (
                                <motion.div
                                    key={turn.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex justify-end">
                                        <div className="flex max-w-[85%] items-end gap-3">
                                            <div className="rounded-[1.8rem] rounded-br-none border border-white/5 bg-white/5 p-5 text-sm leading-relaxed text-white/90">
                                                {turn.userMessage}
                                            </div>
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                                                <User className="h-5 w-5 text-white/60" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-start">
                                        <div className="flex max-w-[88%] items-end gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-vape-500 shadow-[0_5px_15px_rgba(168,85,247,0.3)]">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => onSelectTurn(turn.id)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault();
                                                        onSelectTurn(turn.id);
                                                    }
                                                }}
                                                className={cn(
                                                    'space-y-3 rounded-[1.8rem] rounded-bl-none border p-5 text-left transition-all',
                                                    isSelected
                                                        ? 'border-vape-500/40 bg-vape-500/10 shadow-[0_0_0_1px_rgba(168,85,247,0.15)]'
                                                        : 'border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent hover:border-white/20',
                                                )}
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                                                        {turn.trace.evidenceShortLabel}
                                                    </span>
                                                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/40">
                                                        Turno {turn.turnNumber}
                                                    </span>
                                                    {turn.trace.routedCapsule && (
                                                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/40">
                                                            {turn.trace.routedCapsule}
                                                        </span>
                                                    )}
                                                    {turn.sessionClosedByTurn && (
                                                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-400">
                                                            Cierra sesión
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm leading-relaxed text-white">
                                                    {turn.assistantMessage}
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <span className="text-[10px] uppercase tracking-widest text-white/25">
                                                        {turn.createdAt
                                                            ? new Date(turn.createdAt).toLocaleString('es-MX', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })
                                                            : 'Sin hora'}
                                                    </span>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/35">
                                                            {turn.trace.routeLabel}
                                                        </span>
                                                        {turn.canOpenReview && (
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    onReviewTurn(turn.id);
                                                                }}
                                                                className="rounded-full border border-vape-500/20 bg-vape-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-vape-300 transition-all hover:bg-vape-500/20"
                                                            >
                                                                Abrir review
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="flex items-end gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-vape-500">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex gap-1.5 rounded-[1.5rem] rounded-bl-none bg-white/5 px-6 py-4">
                                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-1.5 w-1.5 rounded-full bg-vape-400" />
                                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-vape-400" />
                                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-vape-400" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="border-t border-white/5 bg-white/[0.03] p-6">
                    <div className={cn(
                        'flex gap-3 rounded-2xl border bg-[#0a0a0f] px-6 py-2 transition-all',
                        isClosed
                            ? 'pointer-events-none opacity-30 border-white/10'
                            : 'border-white/10 focus-within:border-vape-500/50',
                    )}>
                        <input
                            value={simQuery}
                            disabled={isClosed}
                            onChange={(event) => setSimQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    onSendMessage();
                                }
                            }}
                            placeholder={isClosed ? 'Sesión cerrada. Inicia una nueva para seguir.' : 'Escribe un nuevo turno de prueba para Cesarin...'}
                            className="flex-1 bg-transparent py-4 text-sm font-medium text-white placeholder:text-white/15 focus:outline-none"
                        />
                        <button
                            onClick={onSendMessage}
                            disabled={isLoading || !simQuery.trim() || isClosed}
                            className="my-auto flex h-10 w-10 items-center justify-center rounded-xl bg-vape-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
                {sessionView.selectedTurn ? (
                    <>
                        <div className="space-y-3 rounded-[2rem] border border-white/5 bg-white/[0.02] p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-vape-400">
                                    <ArrowRightCircle className="h-3 w-3" />
                                    Turno seleccionado
                                </div>
                                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/35">
                                    {sessionView.selectedTurn.trace.evidenceShortLabel}
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed text-white/55">
                                {sessionView.selectedTurn.canOpenReview
                                    ? 'Este turno ya tiene interacción persistida y puede abrirse al flujo de review/mejora.'
                                    : 'Este turno se puede inspeccionar, pero no tiene una interacción persistida para review directo.'}
                            </p>
                            {sessionView.selectedTurn.canOpenReview && (
                                <button
                                    onClick={() => onReviewTurn(sessionView.selectedTurn!.id)}
                                    className="w-full rounded-2xl border border-vape-500/20 bg-vape-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-vape-300 transition-all hover:bg-vape-500/20"
                                >
                                    Abrir turno en review
                                </button>
                            )}
                        </div>

                        <CesarinDecisionTracePanel
                            trace={sessionView.selectedTurn.trace}
                            title="Traza del turno seleccionado"
                        />

                        {sessionView.selectedTurn.workflow ? (
                            <CesarinImprovementWorkflowPanel
                                workflow={sessionView.selectedTurn.workflow}
                                title="Workflow del turno seleccionado"
                            />
                        ) : (
                            <div className="space-y-3 rounded-[2rem] border border-white/5 bg-white/[0.02] p-5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                                    Workflow no disponible
                                </div>
                                <p className="text-xs leading-relaxed text-white/45">
                                    Este turno no tiene todavía una interacción enlazada a evaluación o mejora. La conversación sigue siendo útil para inspección de traza, pero el handoff necesita evidencia persistida.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-3 rounded-[2rem] border border-white/5 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                            <FlaskConical className="h-3 w-3 text-indigo-400" />
                            Inspector del lab
                        </div>
                        <p className="text-xs leading-relaxed text-white/45">
                            Envía un turno o abre una sesión existente para inspeccionar la traza y el workflow del conversation lab.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
