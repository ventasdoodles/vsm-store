import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2, XCircle, AlertCircle,
    Rocket,
    ShieldAlert, Save, RefreshCw,
    ClipboardList, ExternalLink,
    MessageSquare, Sparkles, Send, FlaskConical
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import type { PilotRunbookItem } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { PilotTelemetry } from './PilotTelemetry';
import { PilotParityDiagnostics } from './PilotParityDiagnostics';
import type { PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';
import type { SignalState } from '@/hooks/useCesarinSignalStates';
import { getAllOrders } from '@/services/admin';
import { savePilotFeedback } from '@/services/ai-capsule-orchestrator.service';
import type { AdminSimulationLabView } from '@/services/admin/admin-simulation-lab.service';

const DEFAULT_SCENARIOS: PilotRunbookItem[] = [
    {
        id: 'stock-check',
        title: 'Disponibilidad de stock',
        description: 'Verificar que Cesarin informa correctamente sobre productos disponibles y precios actuales.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'oos-discipline',
        title: 'Productos agotados',
        description: 'Verificar que no ofrece productos sin stock y que sugiere alternativas validas cuando corresponde.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'low-signal',
        title: 'Inventario con señal baja',
        description: 'Evaluar respuestas ante productos con stock bajo o informacion de inventario incierta.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'persona-check',
        title: 'Tono y personalidad',
        description: 'Validar que mantiene el tono definido en Identidad y respeta las restricciones de comportamiento.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'kill-switch',
        title: 'Control global de visibilidad',
        description: 'Confirmar que el asistente desaparece instantaneamente al desactivar el switch global en el encabezado.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'ambiguous-request',
        title: 'Consultas vagas o ambiguas',
        description: 'Verificar que ante pedidos vagos ("algo dulce", "un vape") Cesarin aclara antes de recomendar.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'budget-recommendation',
        title: 'Respeto al presupuesto',
        description: 'Verificar que respeta el presupuesto declarado por el cliente y justifica sus recomendaciones por precio.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'comparison-side-by-side',
        title: 'Comparacion entre productos',
        description: 'Verificar que cuando compara dos productos estructura las diferencias clave de forma clara.',
        status: 'pending',
        updated_at: new Date().toISOString()
    },
    {
        id: 'colloquial-recovery',
        title: 'Lenguaje informal del cliente',
        description: 'Verificar que Cesarin entiende fraseos coloquiales y responde de forma util cuando faltan especificaciones.',
        status: 'pending',
        updated_at: new Date().toISOString()
    }
];

interface PilotSimulationProbe {
    query: string;
    setQuery: (value: string) => void;
    sessionView: AdminSimulationLabView;
    isRunning: boolean;
    errorMessage: string | null;
    onRunProbe: () => void;
    onStartNewSession: () => void;
    onOpenConversationLab: () => void;
}

export function TabPilot({
    onReview,
    signalStates,
    simulationProbe,
}: {
    onReview: (row: PilotQueryRow) => void;
    signalStates: Record<string, SignalState>;
    simulationProbe: PilotSimulationProbe;
}) {
    const { data: settings } = useStoreSettings();
    const updateSettings = useUpdateStoreSettings();
    
    const [localRunbook, setLocalRunbook] = useState<PilotRunbookItem[]>(
        settings?.pilot_runbook_status || DEFAULT_SCENARIOS
    );

    const [ratings, setRatings] = useState({ accuracy: 0, tone: 0, utility: 0 });
    
    useEffect(() => {
        setLocalRunbook(settings?.pilot_runbook_status || DEFAULT_SCENARIOS);
    }, [settings?.pilot_runbook_status]);

    const latestRealProbeTurn = useMemo(
        () => simulationProbe.sessionView.turns[simulationProbe.sessionView.turns.length - 1] ?? null,
        [simulationProbe.sessionView.turns],
    );

    const displayedProbeTurn = useMemo(
        () => simulationProbe.sessionView.selectedTurn ?? latestRealProbeTurn,
        [simulationProbe.sessionView.selectedTurn, latestRealProbeTurn],
    );

    const isShowingHistoricalSelectedTurn = Boolean(
        simulationProbe.sessionView.selectedTurn
        && latestRealProbeTurn
        && simulationProbe.sessionView.selectedTurn.id !== latestRealProbeTurn.id,
    );

    const handleUpdateStatus = (id: string, newStatus: 'pass' | 'fail' | 'pending') => {
        setLocalRunbook(prev => prev.map(item => 
            item.id === id 
                ? { ...item, status: newStatus, updated_at: new Date().toISOString() } 
                : item
        ));
    };

    const submitFeedback = async () => {
        if (!displayedProbeTurn) return;
        try {
            await savePilotFeedback({
                prompt: displayedProbeTurn.userMessage,
                response: displayedProbeTurn.assistantMessage,
                capsule_slug: displayedProbeTurn.trace.routedCapsule ?? undefined,
                rating_accuracy: ratings.accuracy,
                rating_tone: ratings.tone,
                rating_utility: ratings.utility
            });
            toast.success("Feedback guardado en el Lab");
            setRatings({ accuracy: 0, tone: 0, utility: 0 });
        } catch (_err) {
            toast.error("Error guardando feedback");
        }
    };

    const handleSave = async () => {
        try {
            await updateSettings.mutateAsync({
                pilot_runbook_status: localRunbook
            });
            toast.success('Runbook de Piloto actualizado');
        } catch (_error) {
            toast.error('Error al guardar el runbook');
        }
    };

    const progress = (localRunbook.filter(i => i.status === 'pass').length / localRunbook.length) * 100;
    const hasFailures = localRunbook.some(i => i.status === 'fail');
    const allChecked = localRunbook.every(i => i.status !== 'pending');

    const { data: pendingOrders = [] } = useQuery({
        queryKey: ['admin', 'orders', 'pending'],
        queryFn: () => getAllOrders('pending'),
        staleTime: 60_000,
    });

    return (
        <div className="space-y-8 p-1">
            {/* Post-Wave 192 Parity Diagnostics */}
            <PilotParityDiagnostics />

            {/* ─── Pedidos Pendientes ───────────────────────────────── */}
            <a
                href="/admin/orders"
                className={cn(
                    'flex items-center justify-between rounded-[2rem] border p-6 transition-all hover:bg-white/[0.04] group relative overflow-hidden',
                    pendingOrders.length > 0
                        ? 'border-violet-500/30 bg-violet-500/5 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]'
                        : 'border-white/5 bg-white/[0.02]'
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 relative',
                        pendingOrders.length > 0
                            ? 'bg-violet-500/10 border-violet-500/20 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                            : 'bg-white/5 border-white/5 text-white/30'
                    )}>
                        <ClipboardList className={cn(
                            "h-5 w-5",
                            pendingOrders.length > 0 && "animate-pulse"
                        )} />
                        {pendingOrders.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-tight text-white">
                            Pedidos pendientes
                        </h4>
                        <p className="text-xs text-white/40 mt-0.5">
                            {pendingOrders.length > 0
                                ? `${pendingOrders.length} pedido${pendingOrders.length !== 1 ? 's' : ''} esperando atención`
                                : 'Sin pedidos pendientes — operación limpia'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {pendingOrders.length > 0 && (
                        <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-black tabular-nums">
                            {pendingOrders.length}
                        </span>
                    )}
                    <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </div>
            </a>

            {/* Pilot Telemetry — Wave 187: Real operational signals */}
            <PilotTelemetry onReview={onReview} signalStates={signalStates} />

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">Laboratorio de Entrenamiento (Pilot Lab)</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* ─── Pilot Chat Simulator ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                <div className="p-8 rounded-[2.5rem] bg-violet-600/5 border border-violet-500/10 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                        <Sparkles className="h-16 w-16 text-violet-500" />
                    </div>

                    <div className="space-y-1 relative">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            Sonda del runtime real
                        </h3>
                        <p className="text-xs text-white/40">
                            Ejecuta el mismo runtime de Cesarin que usa el Conversation Lab. El contexto es de laboratorio y acotado, pero la respuesta ya no es mock ni hardcoded.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/25">Estado</div>
                            <div className="mt-1 text-xs font-black uppercase tracking-widest text-emerald-400">
                                {simulationProbe.sessionView.stateLabel}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/25">Modo</div>
                            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-300">
                                <FlaskConical className="h-3.5 w-3.5" />
                                Runtime real
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/25">Turnos</div>
                            <div className="mt-1 text-sm font-black text-white">
                                {simulationProbe.sessionView.turns.length}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 text-xs leading-relaxed text-white/50">
                        <div>{simulationProbe.sessionView.stateDetail}</div>
                        <div className="mt-2 text-white/30">{simulationProbe.sessionView.contextWindowLabel}</div>
                    </div>

                    <div className="space-y-4">
                        <textarea
                            value={simulationProbe.query}
                            onChange={(e) => simulationProbe.setQuery(e.target.value)}
                            disabled={simulationProbe.sessionView.state === 'closed'}
                            placeholder="Escribe una pregunta para Cesarin y ejecuta una sonda real del runtime..."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-[1.5rem] p-4 text-sm text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none placeholder:text-white/10"
                        />
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={simulationProbe.onRunProbe}
                                disabled={simulationProbe.isRunning || !simulationProbe.query.trim() || simulationProbe.sessionView.state === 'closed'}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                                    simulationProbe.isRunning
                                        ? "bg-white/5 text-white/20"
                                        : "bg-violet-600 text-white hover:bg-violet-500 shadow-xl shadow-violet-600/20 active:scale-95"
                                )}
                            >
                                {simulationProbe.isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Ejecutar sonda real
                            </button>
                            <button
                                onClick={simulationProbe.onOpenConversationLab}
                                className="px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Abrir lab completo
                            </button>
                        </div>
                        {simulationProbe.sessionView.state === 'closed' && (
                            <button
                                onClick={simulationProbe.onStartNewSession}
                                className="w-full py-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300 text-[10px] font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all"
                            >
                                Iniciar nueva sesion de laboratorio
                            </button>
                        )}
                    </div>
                </div>

                <div className={cn(
                    "p-8 rounded-[2.5rem] border transition-all duration-700 flex flex-col",
                    displayedProbeTurn ? "bg-white/[0.04] border-white/10" : "bg-black/20 border-white/5 border-dashed"
                )}>
                    {!displayedProbeTurn ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                            <MessageSquare className="h-8 w-8 text-white" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aun no hay ejecucion real en esta sesion.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            {isShowingHistoricalSelectedTurn ? 'Turno seleccionado del laboratorio' : 'Ultimo turno real de Cesarin'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-white/20 italic">
                                        Capsula: {displayedProbeTurn.trace.routedCapsule ?? 'sin capsula'}
                                    </span>
                                </div>
                                {isShowingHistoricalSelectedTurn && latestRealProbeTurn && (
                                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[11px] leading-relaxed text-amber-200/75">
                                        Estas viendo un turno anterior seleccionado. El ultimo turno real de esta sesion es el turno {latestRealProbeTurn.turnNumber}.
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/25">Prompt</div>
                                    <p className="text-sm text-white/65 leading-relaxed">{displayedProbeTurn.userMessage}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                                        {displayedProbeTurn.trace.evidenceShortLabel}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/35">
                                        {displayedProbeTurn.trace.routeLabel}
                                    </span>
                                </div>
                                <p className="text-sm text-white/80 leading-relaxed italic">{displayedProbeTurn.assistantMessage}</p>
                                {simulationProbe.errorMessage && (
                                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-relaxed text-red-200/70">
                                        {simulationProbe.errorMessage}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-violet-400">Calificar Precision (1-5)</h5>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['accuracy', 'tone', 'utility'] as const).map(axis => (
                                        <div key={axis} className="space-y-2">
                                            <span className="text-[9px] uppercase text-white/40 block text-center capitalize">{axis}</span>
                                            <div className="flex justify-center gap-1">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button 
                                                        key={v}
                                                        onClick={() => setRatings(prev => ({ ...prev, [axis]: v }))}
                                                        className={cn(
                                                            "h-6 w-6 rounded-md text-[10px] font-bold transition-all",
                                                            ratings[axis] === v ? "bg-violet-500 text-white" : "bg-white/5 text-white/20 hover:bg-white/10"
                                                        )}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={submitFeedback}
                                    disabled={!displayedProbeTurn || !ratings.accuracy || !ratings.tone || !ratings.utility}
                                    className="w-full py-3 mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-20"
                                >
                                    Enviar al Circulo de Calidad
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Divider Checkpoints */}
            <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/15">Verificacion de Casos de Borde</span>
                <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Verificacion de comportamiento</h3>
                            <p className="text-xs text-white/40 font-medium leading-relaxed max-w-md">
                                Tu firma de que probaste manualmente los escenarios clave. La telemetria automatica esta arriba — esta lista es el complemento humano.
                            </p>
                        </div>
                        <div className="text-4xl font-black text-vape-400">{Math.round(progress)}%</div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={cn(
                                'h-full transition-all duration-1000',
                                hasFailures ? 'bg-red-500' : 'bg-vape-500'
                            )}
                        />
                    </div>
                </div>

                <div className={cn(
                    'p-8 rounded-[2.5rem] border flex flex-col items-center justify-center text-center space-y-3',
                    !allChecked ? 'bg-white/[0.02] border-white/5 opacity-50' :
                    hasFailures ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                )}>
                    {!allChecked ? (
                        <>
                            <AlertCircle className="h-8 w-8 text-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 text-pretty px-4">Revision en curso</span>
                        </>
                    ) : hasFailures ? (
                        <>
                            <ShieldAlert className="h-8 w-8 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Arreglos requeridos</span>
                        </>
                    ) : (
                        <>
                            <Rocket className="h-8 w-8 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Listo para produccion amplia</span>
                        </>
                    )}
                </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
                {localRunbook.map((item) => (
                    <div 
                        key={item.id}
                        className="group p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all flex items-center gap-6"
                    >
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border",
                            item.status === 'pass' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                            item.status === 'fail' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                            "bg-white/5 border-white/5 text-white/20"
                        )}>
                            {item.status === 'pass' ? <CheckCircle2 className="h-6 w-6" /> :
                             item.status === 'fail' ? <XCircle className="h-6 w-6" /> :
                             <AlertCircle className="h-6 w-6" />}
                        </div>

                        <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.title}</h4>
                            <p className="text-xs text-white/40 leading-relaxed max-w-xl">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleUpdateStatus(item.id, 'pass')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    item.status === 'pass' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                                )}
                            >
                                Pass
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus(item.id, 'fail')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    item.status === 'fail' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                                )}
                            >
                                Fail
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus(item.id, 'pending')}
                                className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white/60 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Actions */}
            <div className="pt-4 flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={updateSettings.isPending}
                    className="group flex items-center gap-3 px-10 py-4 rounded-full bg-vape-500 text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-vape-500/20 disabled:opacity-50"
                >
                    {updateSettings.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar checklist del piloto
                </button>
            </div>
        </div>
    );
}
