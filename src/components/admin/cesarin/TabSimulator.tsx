import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, RefreshCcw, Database } from 'lucide-react';
import { SimulationMessage, SimulationDebug, SimulationSession } from '@/types/cesarin';

interface TabSimulatorProps {
    simQuery: string;
    setSimQuery: (query: string) => void;
    simHistory: SimulationMessage[];
    simDebug: SimulationDebug | null;
    isLoading: boolean;
    onSendMessage: () => void;
    sessions: SimulationSession[];
    currentSessionId: string | null;
    onLoadSession: (session: SimulationSession) => void;
    onNewSession: () => void;
    onReviewLastTurn: () => void;
}

export function TabSimulator({ 
    simQuery, setSimQuery, simHistory, simDebug, isLoading, onSendMessage,
    sessions, currentSessionId, onLoadSession, onNewSession, onReviewLastTurn
}: TabSimulatorProps) {
    const isClosed = simDebug?.should_close_session || false;

    return (
        <motion.div 
            key="simulator"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
            {/* Sidebar de Sesiones */}
            <div className="lg:col-span-1 space-y-4">
                <button 
                    onClick={onNewSession}
                    className="w-full p-4 rounded-2xl bg-vape-500/10 border border-vape-500/20 text-vape-400 text-[10px] font-black uppercase tracking-widest hover:bg-vape-500/20 transition-all flex items-center justify-center gap-3"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Nueva Simulación
                </button>

                <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide pr-2">
                    {sessions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => onLoadSession(s)}
                            className={`w-full p-4 rounded-2xl border transition-all text-left space-y-2 group ${
                                currentSessionId === s.id 
                                    ? 'bg-white/10 border-white/20 shadow-xl' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-tighter text-white/30 italic">
                                    {new Date(s.created_at).toLocaleDateString()}
                                </span>
                                {!s.is_active && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                )}
                            </div>
                            <p className="text-[11px] text-white/60 font-medium line-clamp-2 leading-relaxed">
                                {s.history[0]?.content || 'Sin mensajes'}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2 flex flex-col h-[650px] bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 inset-x-0 h-14 px-8 flex items-center justify-between bg-white/[0.02] border-b border-white/5 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${isClosed ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {isClosed ? 'Interacción Finalizada' : 'Sesión Activa'}
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 pt-20 space-y-6 scrollbar-hide">
                    {simHistory.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <Bot className="h-16 w-16 text-vape-400 mb-2" />
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-white">Neural Sandbox</p>
                            <p className="text-xs text-theme-secondary max-w-xs leading-relaxed">Prueba el razonamiento de Cesarin en tiempo real antes de desplegar a producción.</p>
                        </div>
                    )}
                    
                    <AnimatePresence initial={false}>
                        {simHistory.map((msg, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                        msg.role === 'user' ? 'bg-white/10' : 'bg-vape-500 shadow-[0_5px_15px_rgba(168,85,247,0.3)]'
                                    }`}>
                                        {msg.role === 'user' ? <User className="h-5 w-5 text-white/60" /> : <Bot className="h-5 w-5 text-white" />}
                                    </div>
                                    <div className={`p-5 rounded-[1.8rem] text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-white/5 text-white/90 rounded-br-none border border-white/5' 
                                            : 'bg-gradient-to-br from-white/[0.08] to-transparent text-white rounded-bl-none border border-white/10'
                                    }`}>
                                        {msg.content}
                                        {msg.role === 'assistant' && i === simHistory.length - 1 && !isLoading && (
                                            <div className="absolute -bottom-10 right-0 flex gap-2">
                                                <button
                                                    onClick={onReviewLastTurn}
                                                    className="px-4 py-2 rounded-xl bg-vape-500/10 border border-vape-500/20 text-vape-400 text-[10px] font-black uppercase tracking-widest hover:bg-vape-500 hover:text-white transition-all shadow-xl backdrop-blur-md whitespace-nowrap"
                                                >
                                                    Evaluar Turno
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="flex items-end gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-vape-500 flex items-center justify-center shrink-0">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="p-4 bg-white/5 rounded-[1.5rem] rounded-bl-none flex gap-1.5 px-6">
                                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-1.5 w-1.5 rounded-full bg-vape-400" />
                                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-vape-400" />
                                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-vape-400" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {isClosed && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 text-center space-y-4">
                                <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Esta sesión ha sido cerrada por la IA</p>
                                <button 
                                    onClick={onNewSession}
                                    className="px-6 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-tighter transition-all"
                                >
                                    Abrir Nuevo Ticket
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white/[0.03] border-t border-white/5">
                    <div className={`flex gap-3 bg-[#0a0a0f] border rounded-2xl px-6 py-2 transition-all ${isClosed ? 'opacity-20 pointer-events-none' : 'focus-within:border-vape-500/50 border-white/10'}`}>
                        <input 
                            value={simQuery}
                            disabled={isClosed}
                            onChange={(e) => setSimQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                            placeholder={isClosed ? "Chat cerrado..." : "Interactúa con la red neural..."}
                            className="flex-1 bg-transparent text-sm text-white py-4 focus:outline-none placeholder:text-white/10 font-medium"
                        />
                        <button 
                            onClick={onSendMessage}
                            disabled={isLoading || !simQuery.trim() || isClosed}
                            className="h-10 w-10 rounded-xl bg-vape-500 text-white flex items-center justify-center my-auto hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Diagnostics Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                {/* Layer 1: The Analyst */}
                <div className="p-8 rounded-[2.5rem] bg-vape-500/10 border border-vape-400/20 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-vape-400">Analyst Report</h4>
                        <Database className="h-4 w-4 text-vape-400" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Intención & Dudas</span>
                            <div className="text-sm font-bold text-white uppercase">{simDebug?.analyst_report?.intent || 'Analizando...'}</div>
                            {simDebug?.analyst_report?.doubts && simDebug.analyst_report.doubts.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {simDebug.analyst_report.doubts.map((doubt, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] text-white/60">{doubt}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">DNA del Cliente</span>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-white/40">Lealtad:</span>
                                    <span className="text-vape-400 font-bold">{simDebug?.analyst_report?.customer_dna?.loyalty || 'NEW'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-white/40">Ticket Est.:</span>
                                    <span className="text-emerald-400 font-bold">{simDebug?.analyst_report?.customer_dna?.avg_ticket || '$---'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-white/40">Intereses:</span>
                                    <span className="text-white/80 font-medium truncate ml-2 max-w-[80px]">
                                        {simDebug?.analyst_report?.customer_dna?.interests?.join(', ') || 'Explorando'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer 2: The Sommelier */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Sommelier Logic</h4>
                        <Bot className="h-4 w-4 text-white/10" />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Reglas Aplicadas</span>
                            <div className="space-y-2">
                                {(simDebug?.sommelier_report?.rules_applied || ['Personalidad Estándar', 'Vendedor Empático']).map((rule, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] text-white/60">
                                        <div className="h-1 w-1 rounded-full bg-vape-500" />
                                        {rule}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Capa Creativa</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
