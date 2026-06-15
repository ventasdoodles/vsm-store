import { useEffect, useState } from 'react';
import { Activity, Fingerprint, Database, GitMerge, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { cn } from '@/lib/utils';
import {
    activatePilot,
    deactivatePilot,
    getPilotActivationState,
    PILOT_ACTIVATION_EVENT,
} from '@/lib/pilot-activation';
import {
    detectStandaloneMode,
    readServiceWorkerDiagnostics,
    runtimeBuildInfo,
    type ServiceWorkerDiagnostics,
} from '@/lib/runtime-build';

export function PilotParityDiagnostics() {
    const [isPWA, setIsPWA] = useState(false);
    const [pilotOrigin, setPilotOrigin] = useState<string | null>(null);
    const [swDiagnostics, setSwDiagnostics] = useState<ServiceWorkerDiagnostics | null>(null);

    useEffect(() => {
        const syncDiagnostics = async () => {
            setIsPWA(detectStandaloneMode());

            const state = getPilotActivationState();
            setPilotOrigin(state.source);

            try {
                setSwDiagnostics(await readServiceWorkerDiagnostics());
            } catch (error) {
                console.error('[PilotParityDiagnostics] Error reading service worker diagnostics:', error);
                setSwDiagnostics(null);
            }
        };

        void syncDiagnostics();
        window.addEventListener(PILOT_ACTIVATION_EVENT, syncDiagnostics as EventListener);
        window.addEventListener('focus', syncDiagnostics as EventListener);
        navigator.serviceWorker?.addEventListener('controllerchange', syncDiagnostics as EventListener);

        return () => {
            window.removeEventListener(PILOT_ACTIVATION_EVENT, syncDiagnostics as EventListener);
            window.removeEventListener('focus', syncDiagnostics as EventListener);
            navigator.serviceWorker?.removeEventListener('controllerchange', syncDiagnostics as EventListener);
        };
    }, []);

    const enablePilotSession = () => {
        activatePilot();
        setPilotOrigin('DurableCookie');
        toast.success('Pilot Gate activado de forma duradera. Recargando...', { icon: 'R' });
        setTimeout(() => window.location.reload(), 800);
    };

    const clearPilotSession = () => {
        deactivatePilot();
        setPilotOrigin('Inactive');
        toast.success('Pilot Gate durable cleared localmente. Recargando...', { icon: 'L' });
        setTimeout(() => window.location.reload(), 800);
    };

    return (
        <div className="mb-8 space-y-6 rounded-[2rem] border border-indigo-500/10 bg-indigo-500/[0.03] p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-400">
                        <Activity className="h-4 w-4" />
                        Paridad de runtime
                    </h3>
                    <p className="max-w-lg text-[10px] leading-relaxed text-white/40">
                        Usa esta lectura para distinguir si un problema viene del codigo, del deploy, del shell cacheado o del estado local del piloto.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {pilotOrigin === 'Inactive' ? (
                        <button
                            onClick={enablePilotSession}
                            className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/20"
                            title="Activa el piloto local de forma durable en este origen"
                        >
                            <Activity className="h-3 w-3" />
                            Activar piloto local
                        </button>
                    ) : (
                        <button
                            onClick={clearPilotSession}
                            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/20"
                            title="Limpia el piloto local durable en este origen"
                        >
                            <Trash2 className="h-3 w-3" />
                            Limpiar piloto local
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Fingerprint className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Build cargado</span>
                    </div>
                    <div className="text-lg font-black text-indigo-300">
                        {runtimeBuildInfo.runtimeBuildFingerprint}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-indigo-400/50">
                        Base {runtimeBuildInfo.canonBaseBuild}
                    </div>
                    <div
                        className="truncate text-[9px] uppercase tracking-wider text-indigo-400/50"
                        title={runtimeBuildInfo.buildTimestamp}
                    >
                        {runtimeBuildInfo.buildTimestamp}
                    </div>
                </div>

                <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-white/40">
                        <Database className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Release desplegado</span>
                    </div>
                    <div
                        className={cn(
                            'text-sm font-black uppercase',
                            swDiagnostics?.deployedFingerprint ? 'text-white/90' : 'text-white/40',
                        )}
                    >
                        {swDiagnostics?.deployedFingerprint ?? 'manifest no disponible'}
                    </div>
                    <div
                        className="truncate text-[9px] uppercase tracking-wider text-white/40"
                        title={swDiagnostics?.deployedBuildTimestamp ?? swDiagnostics?.manifestGeneratedAt ?? ''}
                    >
                        {swDiagnostics?.deployedBuildTimestamp ?? swDiagnostics?.manifestGeneratedAt ?? 'Sin timestamp de manifest'}
                    </div>
                </div>

                <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-white/40">
                        <GitMerge className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Origen del piloto</span>
                    </div>
                    <div
                        className={cn(
                            'text-sm font-black uppercase',
                            pilotOrigin === 'Inactive' ? 'text-white/30' : 'text-emerald-400',
                        )}
                    >
                        {pilotOrigin}
                    </div>
                    <div className="text-[9px] uppercase text-white/30">
                        Modo: {isPWA ? 'PWA instalada' : 'Browser normal'}
                    </div>
                </div>

                <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-white/40">
                        <RefreshCw className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Frescura del shell</span>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div
                                className={cn(
                                    'text-sm font-black uppercase',
                                    swDiagnostics?.freshness === 'fresh' ? 'text-emerald-400'
                                        : swDiagnostics?.freshness === 'update-pending' ? 'text-amber-400'
                                            : swDiagnostics?.freshness === 'unsupported' ? 'text-white/40'
                                                : 'text-red-400',
                                )}
                            >
                                {swDiagnostics?.freshness ?? 'unknown'}
                            </div>
                            <div className="text-[9px] font-medium text-white/40">
                                Controller: {swDiagnostics?.controllerVersion ?? 'sw.js sin version'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase text-white/70">
                                Update pendiente
                            </div>
                            <div className="text-[9px] font-medium text-white/40">
                                {swDiagnostics?.waitingVersion ?? 'ninguno'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase text-white/70">
                                Marca local
                            </div>
                            <div className="truncate text-[9px] font-medium text-white/40" title={swDiagnostics?.storedFingerprint ?? ''}>
                                {swDiagnostics?.storedFingerprint ?? 'ninguna'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
