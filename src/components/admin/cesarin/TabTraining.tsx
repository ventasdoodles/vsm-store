import { m } from 'framer-motion';
import { Brain, UploadCloud, Link2, Settings2 } from 'lucide-react';
import { useState } from 'react';

export function TabTraining() {
    const [dragActive, setDragActive] = useState(false);

    return (
        <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Brain className="h-8 w-8 text-emerald-400" />
                    Cerebro y Entrenamiento
                </h2>
                <p className="text-white/50 text-sm">
                    Enséñale cosas nuevas a Cesarin. Sube documentos, manuales o dale URLs para que estudie y mejore sus respuestas.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div 
                    className={`p-10 rounded-[2rem] border-2 border-dashed transition-all ${
                        dragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                    } flex flex-col items-center justify-center text-center`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                >
                    <div className="h-20 w-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                        <UploadCloud className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sube documentos PDF o TXT</h3>
                    <p className="text-white/40 text-sm mb-6 max-w-sm">
                        Arrastra tus archivos aquí o haz clic para buscar en tu equipo. Cesarin los leerá automáticamente.
                    </p>
                    <button className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold">
                        Seleccionar Archivo
                    </button>
                </div>

                {/* Settings & Links Section */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <Link2 className="h-6 w-6 text-vape-400" />
                            <h3 className="text-lg font-bold text-white">Aprender de Enlace Web</h3>
                        </div>
                        <p className="text-white/40 text-sm mb-4">
                            Pega la URL de una página web, manual online o FAQ para que Cesarin la analice.
                        </p>
                        <div className="flex gap-3">
                            <input 
                                type="url" 
                                placeholder="https://..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-vape-500 outline-none"
                            />
                            <button className="px-6 py-3 bg-vape-500 text-white rounded-xl hover:bg-vape-400 transition-colors font-semibold">
                                Ingerir
                            </button>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <Settings2 className="h-6 w-6 text-indigo-400" />
                            <h3 className="text-lg font-bold text-white">Personalidad Básica</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Nombre del Asistente</label>
                                <input 
                                    type="text" 
                                    defaultValue="Cesarin"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Comportamiento (1 línea)</label>
                                <input 
                                    type="text" 
                                    defaultValue="Eres un vendedor experto, amable y muy servicial."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <button className="w-full px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold">
                                Guardar Personalidad
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </m.div>
    );
}
