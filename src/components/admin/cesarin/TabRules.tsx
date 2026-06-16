import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Plus, Trash2, Power, AlertTriangle } from 'lucide-react';
import { useBehaviorRules, useCreateBehaviorRule, useToggleBehaviorRule, useDeleteBehaviorRule } from '@/hooks/useBehaviorRules';
import { cn } from '@/lib/utils';

export function TabRules() {
    const { data: rules = [], isLoading } = useBehaviorRules();
    const createRuleMutation = useCreateBehaviorRule();
    const toggleRuleMutation = useToggleBehaviorRule();
    const deleteRuleMutation = useDeleteBehaviorRule();

    const [newRuleText, setNewRuleText] = useState('');
    const [newRuleType, setNewRuleType] = useState<'MUST_DO' | 'NEVER_DO'>('MUST_DO');

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRuleText.trim()) return;

        await createRuleMutation.mutateAsync({
            rule_text: newRuleText,
            type: newRuleType,
        });

        setNewRuleText('');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-indigo-400" />
                    Reglas de Comportamiento
                </h2>
                <p className="text-white/50 text-sm max-w-2xl">
                    Define directrices estrictas que Cesarin deberá seguir en todas sus conversaciones. Estas reglas tienen máxima prioridad sobre su personalidad base.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Panel de Creación */}
                <div className="xl:col-span-1 space-y-6">
                    <form onSubmit={handleAddRule} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase mb-4">Nueva Directriz</label>
                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setNewRuleType('MUST_DO')}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        newRuleType === 'MUST_DO' 
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                            : "bg-black/20 text-white/40 border border-transparent hover:bg-black/40"
                                    )}
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Debe hacer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewRuleType('NEVER_DO')}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        newRuleType === 'NEVER_DO' 
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                                            : "bg-black/20 text-white/40 border border-transparent hover:bg-black/40"
                                    )}
                                >
                                    <ShieldAlert className="w-4 h-4" />
                                    Nunca hacer
                                </button>
                            </div>
                            <textarea
                                value={newRuleText}
                                onChange={(e) => setNewRuleText(e.target.value)}
                                placeholder={newRuleType === 'MUST_DO' ? "Ej. Ofrecer siempre el líquido más vendido cuando pidan recomendaciones..." : "Ej. Nunca recomendar líquidos de tabaco a menos que los pidan explícitamente..."}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-none h-32 placeholder:text-white/20"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!newRuleText.trim() || createRuleMutation.isPending}
                            className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Regla
                        </button>
                    </form>

                    <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-sm flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p>
                            Las reglas muy estrictas pueden hacer que Cesarin suene menos natural. Utilízalas solo para proteger la política de la tienda o corregir errores frecuentes.
                        </p>
                    </div>
                </div>

                {/* Lista de Reglas */}
                <div className="xl:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="text-white/40 text-center py-20">Cargando reglas...</div>
                    ) : rules.length === 0 ? (
                        <div className="border border-dashed border-white/10 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center">
                            <ShieldCheck className="w-16 h-16 text-white/10 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No hay reglas activas</h3>
                            <p className="text-white/40 text-sm max-w-sm">
                                Cesarin se guiará únicamente por su personalidad base y el catálogo.
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {rules.map((rule) => (
                                <motion.div
                                    key={rule.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-[1.5rem] border backdrop-blur-md transition-colors",
                                        rule.is_active 
                                            ? rule.type === 'MUST_DO' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                                            : 'bg-white/5 border-white/5 opacity-50'
                                    )}
                                >
                                    <div className="shrink-0">
                                        {rule.type === 'MUST_DO' ? (
                                            <div className={cn("p-3 rounded-xl", rule.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-black/40 text-white/30")}>
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                        ) : (
                                            <div className={cn("p-3 rounded-xl", rule.is_active ? "bg-red-500/20 text-red-400" : "bg-black/40 text-white/30")}>
                                                <ShieldAlert className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold uppercase tracking-wider mb-1 text-white/40">
                                            {rule.type === 'MUST_DO' ? 'SIEMPRE DEBE' : 'NUNCA DEBE'}
                                        </div>
                                        <p className="text-white text-sm font-medium leading-relaxed">
                                            {rule.rule_text}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleRuleMutation.mutate({ id: rule.id, is_active: !rule.is_active })}
                                            className={cn(
                                                "p-3 rounded-xl transition-all",
                                                rule.is_active ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30" : "bg-white/10 text-white hover:bg-white/20"
                                            )}
                                        >
                                            <Power className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteRuleMutation.mutate(rule.id)}
                                            className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
