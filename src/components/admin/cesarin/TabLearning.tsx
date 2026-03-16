import { motion } from 'framer-motion';
import { Bot, MessageSquare, ArrowRight } from 'lucide-react';
import { LearningItem } from '@/types/cesarin';

interface TabLearningProps {
    learningItems: LearningItem[];
    onCreateRule: (query: string, frustration: boolean, intent: string | null) => void;
}

export function TabLearning({ learningItems, onCreateRule }: TabLearningProps) {
    return (
        <motion.div 
            key="learning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                    <Bot className="h-40 w-40 text-vape-400" />
                </div>
                
                <div className="relative space-y-4">
                    <h2 className="text-2xl font-black text-white flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-500 flex items-center justify-center">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        Red de Aprendizaje Activo
                    </h2>
                    <p className="text-sm text-theme-secondary max-w-2xl leading-relaxed">
                        Cesarin detecta automáticamente consultas donde la confianza es baja o existe frustración. 
                        Convierte estos insights en **Reglas Neurales** para optimizar el motor de ventas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {learningItems.length > 0 ? (
                    learningItems.map((item, i) => (
                        <div 
                            key={i} 
                            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] hover:border-vape-500/20 transition-all duration-500"
                        >
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-vape-400 group-hover:bg-vape-500/10 transition-all">
                                    <MessageSquare className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-white group-hover:text-vape-400 transition-colors">"{item.query}"</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                            item.frustration_detected ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
                                        }`}>
                                            {item.frustration_detected ? 'Frustración Detectada' : (item.detected_intent || 'Intento Desconocido')}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-bold uppercase">{new Date(item.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onCreateRule(item.query, item.frustration_detected, item.detected_intent)}
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-vape-500/10 text-vape-400 text-xs font-black uppercase tracking-widest border border-vape-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-vape-500 hover:text-white"
                            >
                                Entrenar Cerebro
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-white/5">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/5">
                            <Bot className="h-10 w-10 text-white/10" />
                        </div>
                        <p className="text-theme-secondary text-sm font-medium">No se han detectado anomalías críticas. Cesarin está operando de forma óptima.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
