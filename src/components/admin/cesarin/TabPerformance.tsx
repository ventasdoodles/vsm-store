import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageSquare, ThumbsUp } from 'lucide-react';

export function TabPerformance() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                    Desempeño Global
                </h2>
                <p className="text-white/50 text-sm">
                    Un vistazo rápido a cómo está rindiendo Cesarin y qué impacto tiene en tus clientes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col gap-4">
                    <div className="h-12 w-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white/40 uppercase tracking-wider mb-1">Dudas Resueltas Hoy</div>
                        <div className="text-4xl font-black text-white">124</div>
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col gap-4">
                    <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                        <ThumbsUp className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white/40 uppercase tracking-wider mb-1">Calificación Promedio</div>
                        <div className="text-4xl font-black text-white">4.8 <span className="text-lg text-white/30">/ 5</span></div>
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col gap-4">
                    <div className="h-12 w-12 bg-vape-500/20 text-vape-400 rounded-2xl flex items-center justify-center">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white/40 uppercase tracking-wider mb-1">Clientes Atendidos</div>
                        <div className="text-4xl font-black text-white">89</div>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] h-64 flex items-center justify-center">
                <p className="text-white/30 font-semibold">Aquí iría un gráfico de líneas súper limpio de los últimos 7 días</p>
            </div>
        </motion.div>
    );
}
