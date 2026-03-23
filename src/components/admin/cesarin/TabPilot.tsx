import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2, XCircle, AlertCircle,
    Rocket,
    ShieldAlert, Save, RefreshCw,
    ClipboardList, ExternalLink,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { PilotRunbookItem } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { PilotTelemetry } from './PilotTelemetry';
import { PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';
import { PilotParityDiagnostics } from './PilotParityDiagnostics';
import { SignalState } from '@/hooks/useCesarinSignalStates';
import { getAllOrders } from '@/services/admin';

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

export function TabPilot({ onReview, signalStates }: { onReview: (row: PilotQueryRow) => void; signalStates: Record<string, SignalState> }) {
    const { data: settings } = useStoreSettings();
    const updateSettings = useUpdateStoreSettings();
    
    const [localRunbook, setLocalRunbook] = useState<PilotRunbookItem[]>(
        settings?.pilot_runbook_status || DEFAULT_SCENARIOS
    );

    const handleUpdateStatus = (id: string, newStatus: 'pass' | 'fail' | 'pending') => {
        setLocalRunbook(prev => prev.map(item => 
            item.id === id 
                ? { ...item, status: newStatus, updated_at: new Date().toISOString() } 
                : item
        ));
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
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/15">Verificacion manual de comportamiento</span>
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
