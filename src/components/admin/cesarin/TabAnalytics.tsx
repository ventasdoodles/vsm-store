import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageSquare, Brain } from 'lucide-react';

export function TabAnalytics() {
    return (
        <motion.div 
            key="analytics"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Consultas Mes', value: '4,892', sub: '+12% vs mes anterior', icon: MessageSquare, color: 'text-vape-400', bg: 'bg-vape-500/10' },
                    { label: 'Conversión IA', value: '24.5%', sub: 'Asistida por Cesarin', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Sentimiento', value: '92%', sub: 'Satisfacción Global', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Usuarios Únicos', value: '1,204', sub: 'Engagement Directo', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-all group">
                        <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">{stat.label}</div>
                            <div className={`text-[10px] font-bold mt-2 ${stat.color}/60`}>{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-vape-500/5 to-transparent shadow-inner" />
                    <div className="relative space-y-4">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <TrendingUp className="h-8 w-8 text-white/10" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-widest">Neural Flow Analytics</h4>
                        <p className="text-sm text-theme-secondary max-w-xs mx-auto">Visualización de tendencias en tiempo real en desarrollo. Estará disponible en la Wave 162.</p>
                    </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-8">
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Intenciones Top</h4>
                    <div className="space-y-6">
                        {[
                            { label: 'Búsqueda Producto', value: 45, color: 'bg-vape-500' },
                            { label: 'Soporte Post-Venta', value: 20, color: 'bg-indigo-500' },
                            { label: 'Dudas Logísticas', value: 15, color: 'bg-emerald-500' },
                            { label: 'Comparativa Precios', value: 10, color: 'bg-amber-500' },
                            { label: 'Otros', value: 10, color: 'bg-white/10' }
                        ].map((intent, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/60 uppercase">{intent.label}</span>
                                    <span className="text-white">{intent.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${intent.value}%` }}
                                        transition={{ delay: 0.2 + (i * 0.1), duration: 1 }}
                                        className={`h-full ${intent.color}`} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
