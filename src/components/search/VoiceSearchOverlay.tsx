import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Sparkles, AlertCircle } from 'lucide-react';
import { useStorefrontTactical } from '@/hooks/useStorefrontTactical';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VoiceSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    transcript: string;
    isListening: boolean;
    isDiagnosing?: boolean;
    error: string | null;
}

/**
 * VoiceSearchOverlay - Experiencia Inmersiva de Voz
 * Visualización de ondas reactivas y transcripción en vivo.
 */
export function VoiceSearchOverlay({ isOpen, onClose, transcript, isListening, isDiagnosing, error }: VoiceSearchOverlayProps) {
    const { triggerSensory } = useStorefrontTactical();

    // Feedback sensorial al abrir/estados
    useEffect(() => {
        if (isOpen && isListening) {
            triggerSensory('voice-listen');
        }
    }, [isOpen, isListening, triggerSensory]);

    useEffect(() => {
        if (error) {
            triggerSensory('voice-error');
        }
    }, [error, triggerSensory]);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0b14]/95 backdrop-blur-3xl"
                >
                    {/* Background Dynamic Aura */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div 
                            animate={{
                                scale: isListening ? [1, 1.2, 1] : 1,
                                opacity: isListening ? [0.1, 0.2, 0.1] : 0.05
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vape-500 rounded-full blur-[160px]" 
                        />
                    </div>

                    <div className="relative w-full max-w-lg px-6 flex flex-col items-center text-center gap-12">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-32 right-6 p-4 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-2xl backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Visualizer / Mic Icon */}
                        <div className="relative">
                            <motion.div
                                animate={isListening ? {
                                    scale: [1, 1.4, 1],
                                    opacity: [0.2, 0.5, 0.2]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-x-[-60px] inset-y-[-60px] rounded-full bg-vape-500/20 blur-3xl"
                            />
                            
                            <motion.div 
                                className={cn(
                                    "w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all duration-700 border-[6px] shadow-[0_0_60px_rgba(234,88,12,0.3)]",
                                    isListening ? "bg-vape-500 border-vape-400" : "bg-white/5 border-white/10"
                                )}
                                animate={isListening ? { y: [0, -10, 0] } : {}}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Mic className={cn("w-12 h-12", isListening ? "text-white" : "text-white/10")} />
                            </motion.div>
                            
                            {/* Pro-Waves Rings */}
                            {isListening && [1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0.6 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                                    className="absolute inset-0 rounded-full border-2 border-vape-500/40"
                                />
                            ))}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-8 w-full">
                            <AnimatePresence mode="wait">
                                {error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                            <AlertCircle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <h3 className="text-red-400 text-xl font-black italic tracking-tight underline decoration-red-500/30 underline-offset-8">
                                            {error}
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                            <button 
                                                onClick={onClose}
                                                className="px-8 py-3 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                                            >
                                                Intentar de nuevo
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if ('serviceWorker' in navigator) {
                                                        const regs = await navigator.serviceWorker.getRegistrations();
                                                        for (const reg of regs) await reg.unregister();
                                                    }
                                                    window.location.reload();
                                                }}
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400/60 hover:text-vape-400 transition-colors py-2"
                                            >
                                                Forzar Actualización (Limpiar Cache)
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="transcript"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full bg-vape-500",
                                                (isListening || isDiagnosing) && "animate-pulse"
                                            )} />
                                            <p className="text-vape-400 text-[10px] font-black uppercase tracking-[0.4em] font-mono">
                                                {isDiagnosing ? "Verificando Hardware" : isListening ? "Escuchando Entorno" : "IA Procesando..."}
                                            </p>
                                        </div>
                                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-[1.1] min-h-[120px] drop-shadow-2xl">
                                            {isDiagnosing ? 'Prepara tu voz...' : transcript || '¿Qué estás buscando?'}
                                        </h2>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!isListening && !error && transcript && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-center gap-3 py-3 px-6 rounded-full bg-vape-500/10 border border-vape-500/20 w-fit mx-auto"
                                >
                                    <Sparkles className="w-4 h-4 text-vape-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400 italic">Conversión Inteligente Activa</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Hint System */}
                        <div className="pt-8">
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-4">Ejemplos vsm</p>
                            <div className="flex flex-wrap justify-center gap-3 px-4">
                                {["Pods de menta", "Líquidos dulces", "Vapes 5%"].map((hint, idx) => (
                                    <span key={idx} className="text-xs font-medium italic text-white/40 border-b border-white/5 pb-1">"{hint}"</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

