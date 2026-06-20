import { Sparkles, Ticket, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntelligenceToolRendererProps {
    strategicAnalysis: any;
    loadingStrategic: boolean;
    loadStrategicAI: () => void;
}

export function IntelligenceToolRenderer({
    strategicAnalysis,
    loadingStrategic,
    loadStrategicAI
}: IntelligenceToolRendererProps) {
    return (
        <div className={cn(
            "col-span-1 md:col-span-2 flex flex-col gap-6 p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-vape-500/5 to-transparent border border-white/10 relative overflow-hidden transition-all duration-700",
            strategicAnalysis ? "shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]" : "hover:border-white/20"
        )}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                        <Sparkles className={cn("h-6 w-6", loadingStrategic && "animate-spin-slow")} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white tracking-tight">Analista Estratégico Pro</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 opacity-80">Motor de Retención Gemini 2.5 Flash Lite</p>
                    </div>
                </div>

                {!strategicAnalysis && (
                    <button
                        onClick={() => loadStrategicAI()}
                        disabled={loadingStrategic}
                        className="px-6 py-3 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-indigo-500/40"
                    >
                        {loadingStrategic ? 'Analizando Historial...' : 'Ejecutar Análisis Profundo'}
                    </button>
                )}
            </div>

            {strategicAnalysis && (
                <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
                    {/* Analysis Text */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                        <p className="text-sm font-medium text-white/90 leading-relaxed mb-4">
                            {strategicAnalysis.analysis}
                        </p>
                        
                        {/* Next Steps */}
                        {strategicAnalysis.next_steps && (
                            <div className="space-y-3 mt-6">
                                <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Pasos Recomendados</h6>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {strategicAnalysis.next_steps.map((step: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 group/step hover:bg-white/10 transition-colors">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover/step:scale-150 transition-transform" />
                                            <span className="text-xs font-medium text-white/70">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggested Coupon */}
                    {strategicAnalysis.suggested_coupon && (
                        <div className="group relative p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
                                        <Ticket className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-white uppercase tracking-wider">Incentivo Sugerido</h5>
                                        <p className="text-xs text-indigo-300/80 font-medium">{strategicAnalysis.suggested_coupon.reason}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10">
                                    <div className="text-center px-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">Código</p>
                                        <p className="text-lg font-black text-white tracking-[0.1em]">{strategicAnalysis.suggested_coupon.code}</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <div className="text-center px-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">DCTO</p>
                                        <p className="text-lg font-black text-white">{strategicAnalysis.suggested_coupon.discount}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recovery Message Copy Section */}
                    {strategicAnalysis.recovery_message && (
                        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 space-y-4">
                            <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Mensaje de Recuperación Sugerido</h5>
                                <button
                                    onClick={() => {
                                        if (strategicAnalysis.recovery_message) {
                                            navigator.clipboard.writeText(strategicAnalysis.recovery_message);
                                            alert('Mensaje copiado al portapapeles');
                                        }
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-vape-400 hover:text-vape-300 transition-colors"
                                >
                                    Copiar para WhatsApp
                                    <MessageSquare className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 italic text-sm text-white/70 leading-relaxed">
                                "{strategicAnalysis.recovery_message}"
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => {/* Strategic Analysis is managed by query cache now, we could invalidate it if needed */}}
                        className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors mx-auto block"
                    >
                        Resetear Análisis IA
                    </button>
                </div>
            )}
        </div>
    );
}
