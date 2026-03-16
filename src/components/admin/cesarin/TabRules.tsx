import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Target, AlertCircle } from 'lucide-react';
import { AIRule } from '@/types/cesarin';
import { cn } from '@/lib/utils';

interface TabRulesProps {
    rules: AIRule[];
    isLoading: boolean;
    onToggle: (id: string, currentStatus: boolean) => void;
    newRule: { content: string; category: string };
    setNewRule: (rule: { content: string; category: string }) => void;
    onAdd: () => void;
}

export function TabRules({ rules, isLoading, onToggle, newRule, setNewRule, onAdd }: TabRulesProps) {
    return (
        <motion.div 
            key="rules"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-vape-400" />
                        Gobernanza Neural
                    </h2>
                    <p className="text-sm text-theme-secondary">Instrucciones críticas que definen el comportamiento ético y comercial.</p>
                </div>
            </div>

            {/* New Rule Form */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap className="h-24 w-24 text-vape-400" />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-vape-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-vape-400" />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Entrenar Instrucción</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                        <textarea 
                            value={newRule.content}
                            onChange={(e) => setNewRule({...newRule, content: e.target.value})}
                            placeholder="Ej: Si preguntan por CBD, mencionar solo a mayores de 18 con tono serio..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-vape-500/50 transition-all min-h-[100px] resize-none font-medium"
                        />
                    </div>
                    <div className="space-y-4">
                        <select 
                            value={newRule.category}
                            onChange={(e) => setNewRule({...newRule, category: e.target.value})}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-5 py-4 text-xs font-black text-vape-400 focus:outline-none transition-all cursor-pointer uppercase tracking-widest"
                        >
                            <option value="personalidad">Personalidad</option>
                            <option value="logistica">Logística</option>
                            <option value="ventas">Ventas</option>
                            <option value="integralidad">Legal/Seguridad</option>
                        </select>
                        <button 
                            onClick={onAdd}
                            disabled={isLoading || !newRule.content.trim()}
                            className="w-full py-4 rounded-2xl bg-vape-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-vape-400 transition-all shadow-[0_10px_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
                        >
                            Inyectar Conocimiento
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                    <div 
                        key={rule.id} 
                        className={cn(
                            "p-6 rounded-[2rem] border transition-all duration-500 flex items-start gap-4 group",
                            rule.is_enabled 
                                ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]" 
                                : "bg-white/[0.01] border-transparent opacity-40 grayscale"
                        )}
                    >
                        <button 
                            onClick={() => onToggle(rule.id, rule.is_enabled)}
                            className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-90",
                                rule.is_enabled 
                                    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                    : "bg-white/5 text-white/20"
                            )}
                        >
                            <Target className="h-6 w-6" />
                        </button>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-vape-400 bg-vape-500/10 px-2 py-1 rounded-md">{rule.category}</span>
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-1.5 w-1.5 rounded-full", rule.is_enabled ? "bg-emerald-500 animate-pulse" : "bg-white/20")} />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{rule.is_enabled ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed font-medium">{rule.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {rules.length === 0 && (
                <div className="p-16 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/5">
                        <AlertCircle className="h-10 w-10 text-white/10" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-white font-black uppercase tracking-widest text-xs">Cerebro en Blanco</p>
                        <p className="text-theme-secondary text-sm max-w-sm mx-auto">No hay reglas específicas configuradas. Cesarin operará con su red neural base.</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
