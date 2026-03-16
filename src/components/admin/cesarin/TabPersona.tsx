import { motion } from 'framer-motion';
import { Brain, Save, RefreshCcw } from 'lucide-react';
import { AIConfig } from '@/types/cesarin';

interface TabPersonaProps {
    config: AIConfig;
    setConfig: (config: AIConfig) => void;
    isLoading: boolean;
    onSave: () => void;
}

export function TabPersona({ config, setConfig, isLoading, onSave }: TabPersonaProps) {
    return (
        <motion.div 
            key="persona"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Info Card */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Brain className="h-32 w-32 text-vape-400" />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-vape-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            Identidad Neural
                        </h3>
                        <p className="text-sm text-theme-secondary leading-relaxed">
                            Define cómo se presenta Cesarin ante tus clientes. Su nombre, tono de voz y objetivos principales.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400/60 ml-1">Nombre del Asistente</label>
                            <input 
                                type="text" 
                                value={config.name}
                                onChange={(e) => setConfig({...config, name: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-vape-500/50 transition-all font-bold placeholder:text-white/10"
                                placeholder="Escribe un nombre..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400/60 ml-1">Tono de Voz & Personalidad</label>
                            <textarea 
                                rows={3}
                                value={config.voice_tone}
                                onChange={(e) => setConfig({...config, voice_tone: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-vape-500/50 transition-all font-medium leading-relaxed resize-none"
                                placeholder="Ej: Educado, experto en vapeo, con un toque de humor..."
                            />
                        </div>
                    </div>
                </div>

                {/* Behavioral Settings */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Algoritmo de Comportamiento</h3>
                        <p className="text-sm text-theme-secondary">Ajusta los parámetros de razonamiento y creatividad del motor.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {(['vendedor', 'informativo', 'soporte'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setConfig({...config, behavior_mode: mode})}
                                className={`px-6 py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${
                                    config.behavior_mode === mode 
                                    ? 'bg-vape-500 border-vape-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-8 pt-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-vape-400">Creatividad (Temperature)</span>
                                <span className="text-white bg-vape-500/20 px-2 py-1 rounded-md">{config.temperature}</span>
                            </div>
                            <input 
                                type="range" min="0" max="1" step="0.1" 
                                value={config.temperature}
                                onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-vape-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={onSave}
                    disabled={isLoading}
                    className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-vape-500 text-white font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] disabled:opacity-50"
                >
                    {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar Configuración
                </button>
            </div>
        </motion.div>
    );
}
