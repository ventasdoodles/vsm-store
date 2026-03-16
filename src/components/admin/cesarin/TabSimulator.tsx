import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, RefreshCcw, Database, Users } from 'lucide-react';
import { SimulationMessage, SimulationDebug } from '@/types/cesarin';

interface TabSimulatorProps {
    simQuery: string;
    setSimQuery: (query: string) => void;
    simHistory: SimulationMessage[];
    simDebug: SimulationDebug | null;
    isLoading: boolean;
    onSendMessage: () => void;
}

export function TabSimulator({ simQuery, setSimQuery, simHistory, simDebug, isLoading, onSendMessage }: TabSimulatorProps) {
    return (
        <motion.div 
            key="simulator"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            {/* Chat Interface */}
            <div className="lg:col-span-2 flex flex-col h-[650px] bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-2 px-8 pt-6 flex gap-1">
                    <div className="h-1 flex-1 bg-vape-500/20 rounded-full" />
                    <div className="h-1 flex-1 bg-vape-500/10 rounded-full" />
                    <div className="h-1 flex-1 bg-white/5 rounded-full" />
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
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
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white/[0.03] border-t border-white/5">
                    <div className="flex gap-3 bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-2 transition-all focus-within:border-vape-500/50">
                        <input 
                            value={simQuery}
                            onChange={(e) => setSimQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                            placeholder="Interactúa con la red neural..."
                            className="flex-1 bg-transparent text-sm text-white py-4 focus:outline-none placeholder:text-white/10 font-medium"
                        />
                        <button 
                            onClick={onSendMessage}
                            disabled={isLoading || !simQuery.trim()}
                            className="h-10 w-10 rounded-xl bg-vape-500 text-white flex items-center justify-center my-auto hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Diagnostics Sidebar */}
            <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-vape-500/10 border border-vape-400/20 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-vape-400">Neural Debugger</h4>
                        <Database className="h-4 w-4 text-vape-400" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Intención Detectada</span>
                            <div className="text-sm font-bold text-white uppercase">{simDebug?.intent || 'Pendiente'}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Confianza del Modelo</span>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div animate={{ width: `${(simDebug?.confidence || 0) * 100}%` }} className="h-full bg-emerald-500" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-400">{(simDebug?.confidence || 0) * 100}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Simulación Cliente</h4>
                        <Users className="h-4 w-4 text-white/10" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Fidelidad', value: 'PLATINUM', color: 'text-vape-400' },
                            { label: 'Intereses', value: 'Vapeo, Frutales', color: 'text-white' },
                            { label: 'Ticket Promedio', value: '$1,250 MXN', color: 'text-emerald-400' }
                        ].map((stat, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px]">
                                <span className="text-white/40">{stat.label}:</span>
                                <span className={`${stat.color} font-bold`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
