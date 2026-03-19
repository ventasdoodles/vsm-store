import React, { useEffect, useState } from 'react';
import { ShieldCheck, Database, Layout, Search, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PilotDebugBadgeProps {
    isAuthorized: boolean;
    isGlobalEnabled: boolean | undefined;
}

export const PilotDebugBadge: React.FC<PilotDebugBadgeProps> = ({ isAuthorized, isGlobalEnabled }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [requested, setRequested] = useState(false);
    const [persisted, setPersisted] = useState(false);

    useEffect(() => {
        // Sync internal flags with real storage/url state
        const params = new URLSearchParams(window.location.search);
        setRequested(params.get('pilot') === 'cesarin');
        setPersisted(sessionStorage.getItem('vsm_storefront_ai_pilot_enabled') === 'true');
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
                            <span className="text-[11px] font-medium">Session Persisted</span>
                        </div>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", persisted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30")}>
                            {persisted ? 'YES' : 'NO'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <Layout className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Global Gate</span>
                        </div>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", isGlobalEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                            {isGlobalEnabled ? 'OPEN' : 'CLOSED'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                        <div className="flex items-center gap-2 text-white">
                            <ShieldCheck className="h-3 w-3 text-emerald-400" />
                            <span className="text-[11px] font-black">Gate Result</span>
                        </div>
                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase", isAuthorized ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                            {isAuthorized ? 'AUTHORIZED' : 'DENIED'}
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-[8px] leading-relaxed text-white/40 italic">
                        The AI Assistant is currently mounted based on the Pilot Session override.
                    </p>
                </div>
            </div>
        </div>
    );
};
