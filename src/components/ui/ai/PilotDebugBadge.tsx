import React, { useEffect, useState } from 'react';
import { ShieldCheck, Database, Layout, Search, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isPilotActive, PILOT_ACTIVATION_EVENT, resolveStorefrontAIExposure } from '@/lib/pilot-activation';
import { readServiceWorkerDiagnostics, runtimeBuildInfo } from '@/lib/runtime-build';

interface PilotDebugBadgeProps {
    isAuthorized: boolean;
    isGlobalEnabled: boolean | undefined;
}

export const PilotDebugBadge: React.FC<PilotDebugBadgeProps> = ({ isAuthorized, isGlobalEnabled }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [requested, setRequested] = useState(false);
    const [persisted, setPersisted] = useState(false);
    const [shellFreshness, setShellFreshness] = useState('unknown');
    const [deployedFingerprint, setDeployedFingerprint] = useState<string | null>(null);
    const exposure = resolveStorefrontAIExposure({
        isGlobalEnabled,
        isPilotAuthorized: isAuthorized,
    });

    const exposureSourceLabel = {
        Disabled: 'HIDDEN',
        PilotOverride: 'PILOT',
        GlobalFlag: 'GLOBAL',
        GlobalFlagWithPilot: 'GLOBAL + PILOT',
    }[exposure.source];

    useEffect(() => {
        const syncDebugState = async () => {
            const params = new URLSearchParams(window.location.search);
            setRequested(params.get('pilot') === 'cesarin');
            setPersisted(isPilotActive());

            try {
                const diagnostics = await readServiceWorkerDiagnostics();
                setShellFreshness(diagnostics.freshness);
                setDeployedFingerprint(diagnostics.deployedFingerprint);
            } catch {
                setShellFreshness('unknown');
                setDeployedFingerprint(null);
            }
        };

        void syncDebugState();
        window.addEventListener(PILOT_ACTIVATION_EVENT, syncDebugState as EventListener);
        window.addEventListener('focus', syncDebugState as EventListener);
        navigator.serviceWorker?.addEventListener('controllerchange', syncDebugState as EventListener);

        return () => {
            window.removeEventListener(PILOT_ACTIVATION_EVENT, syncDebugState as EventListener);
            window.removeEventListener('focus', syncDebugState as EventListener);
            navigator.serviceWorker?.removeEventListener('controllerchange', syncDebugState as EventListener);
        };
    }, [isAuthorized]);

    if (!isAuthorized && !requested) return null;

    return (
        <div className="fixed bottom-24 left-6 z-[60] flex flex-col items-start gap-2 pointer-events-none">
            {/* Main Toggle Badge */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xl transition-all backdrop-blur-md",
                    isAuthorized 
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                        : "bg-amber-500/20 border-amber-500/30 text-amber-400"
                )}
            >
                <div className={cn(
                    "h-2 w-2 rounded-full",
                    isAuthorized ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                    PILOT: {isAuthorized ? 'ACTIVE' : 'REQUESTED'}
                </span>
                <Activity className="h-3 w-3" />
            </button>

            {/* Debug Details Panel */}
            <div className={cn(
                "w-56 p-4 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-2xl transition-all origin-bottom-left",
                isExpanded ? "scale-100 opacity-100" : "scale-75 opacity-0 hidden"
            )}>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Runtime Debug Signal</p>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <Search className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Param Detected</span>
                        </div>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", requested ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30")}>
                            {requested ? 'YES' : 'NO'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <Database className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Durable Persisted</span>
                        </div>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", persisted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30")}>
                            {persisted ? 'YES' : 'NO'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <Layout className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Global Exposure</span>
                        </div>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", isGlobalEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                            {isGlobalEnabled ? 'OPEN' : 'CLOSED'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                        <div className="flex items-center gap-2 text-white">
                            <ShieldCheck className="h-3 w-3 text-emerald-400" />
                            <span className="text-[11px] font-black">Exposure Result</span>
                        </div>
                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase", exposure.isVisible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                            {exposure.isVisible ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <ShieldCheck className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Access Path</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-white/5 text-white/70">
                            {exposureSourceLabel}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <Activity className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Shell Freshness</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-white/5 text-white/70">
                            {shellFreshness}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <Database className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Deployed Build</span>
                        </div>
                        <span className="max-w-[90px] truncate text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-white/5 text-white/70" title={deployedFingerprint ?? ''}>
                            {deployedFingerprint ?? 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-[8px] leading-relaxed text-white/40 italic">
                        Runtime {runtimeBuildInfo.runtimeBuildFingerprint} {exposure.source === 'PilotOverride'
                            ? 'mounted from the durable Pilot override.'
                            : exposure.isVisible
                                ? 'mounted from storefront global exposure.'
                                : 'is not mounted because storefront exposure is closed.'}
                    </p>
                </div>
            </div>
        </div>
    );
};
