import { useState, useEffect } from 'react';
import { Activity, Fingerprint, Database, GitMerge, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export function PilotParityDiagnostics() {
    const [isPWA, setIsPWA] = useState(false);
    const [pilotOrigin, setPilotOrigin] = useState<string | null>(null);

    useEffect(() => {
        // Detectar si está instalado como PWA o corre en navegador
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone 
            || document.referrer.includes('android-app://');
        setIsPWA(!!isStandalone);

        // Detectar estado de Pilot Gate
        const persisted = sessionStorage.getItem('vsm_storefront_ai_pilot_enabled');
        if (persisted === 'true') {
            setPilotOrigin('SessionStorage');
        } else {
            setPilotOrigin('Inactive');
        }
    }, []);

    const enablePilotSession = () => {
        sessionStorage.setItem('vsm_storefront_ai_pilot_enabled', 'true');
        setPilotOrigin('SessionStorage');
        toast.success('Pilot Session activada para esta sesión. Recargando...', { icon: '🚀' });
        setTimeout(() => window.location.reload(), 800);
    };

    const clearPilotSession = () => {
        sessionStorage.removeItem('vsm_storefront_ai_pilot_enabled');
        setPilotOrigin('Inactive');
        toast.success('Pilot Session cleared localmente. Recargando...', { icon: '🧹' });
        setTimeout(() => window.location.reload(), 800);
    };

    return (
        <div className="mb-8 p-6 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Runtime Parity Hygiene
                    </h3>
                    <p className="text-[10px] text-white/40 max-w-lg leading-relaxed">
                        Diagnostic invariants to distinguish logic regressions from deployment drift, cache ghosts, or pilot session variance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {pilotOrigin === 'Inactive' ? (
                        <button 
                            onClick={enablePilotSession}
                            className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                            title="Activates the pilot for your current browser session only"
                        >
                            <Activity className="h-3 w-3" />
                            Enable Pilot Session
                        </button>
                    ) : (
                        <button 
                            onClick={clearPilotSession}
                            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
                            title="Removes the pilot activation from your current browser session"
                        >
                            <Trash2 className="h-3 w-3" />
                            Clear Pilot Session
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Canonical Build */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white/40">
                        <Database className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Canon Base Build</span>
                    </div>
                    <div className="text-lg font-black text-white/90">
                        {typeof __CANON_BASE_BUILD__ !== 'undefined' ? __CANON_BASE_BUILD__ : 'v112'}
                    </div>
                </div>

                {/* Runtime Fingerprint */}
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Fingerprint className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Active Runtime Build</span>
                    </div>
                    <div className="text-lg font-black text-indigo-300">
                        {typeof __RUNTIME_BUILD_FINGERPRINT__ !== 'undefined' ? __RUNTIME_BUILD_FINGERPRINT__ : 'Unknown'}
                    </div>
                    <div className="text-[9px] text-indigo-400/50 uppercase tracking-wider truncate" title={typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : ''}>
                        {typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'No timestamp'}
                    </div>
                </div>

                {/* Pilot Gate */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white/40">
                        <GitMerge className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Pilot Gate Origin</span>
                    </div>
                    <div className={cn(
                        "text-sm font-black uppercase",
                        pilotOrigin === 'Inactive' ? "text-white/30" : "text-emerald-400"
                    )}>
                        {pilotOrigin}
                    </div>
                    <div className="text-[9px] text-white/30 uppercase">
                        Mode: {isPWA ? 'PWA Installed' : 'Standard Browser'}
                    </div>
                </div>

                {/* Canonical Stack (Expected) */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white/40">
                        <Activity className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Expected AI Stack</span>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="text-xs font-black text-white/70 uppercase flex items-center justify-between">
                                <span>Analyst</span>
                                <span className="text-[8px] bg-white/5 px-1 rounded text-white/30 truncate ml-2">/v1</span>
                            </div>
                            <div className="text-[9px] text-white/40 font-medium">Gemini 2.5 Flash</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs font-black text-white/70 uppercase flex items-center justify-between">
                                <span>Embeddings</span>
                                <span className="text-[8px] bg-white/5 px-1 rounded text-white/30 truncate ml-2">/v1beta</span>
                            </div>
                            <div className="text-[9px] text-white/40 font-medium">gemini-embedding-001 @ 3072d</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
