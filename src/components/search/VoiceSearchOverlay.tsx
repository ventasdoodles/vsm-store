import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Sparkles } from 'lucide-react';

interface VoiceSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    transcript: string;
    isListening: boolean;
    error: string | null;
}

/**
 * VoiceSearchOverlay - Experiencia Inmersiva de Voz
 * Visualización de ondas reactivas y transcripción en vivo.
 */
export function VoiceSearchOverlay({ isOpen, onClose, transcript, isListening, error }: VoiceSearchOverlayProps) {
    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0b14]/95 backdrop-blur-xl"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vape-500/10 blur-[120px] rounded-full animate-pulse" />
                    </div>

                    <div className="relative w-full max-w-lg px-6 flex flex-col items-center text-center gap-12">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-24 right-6 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all shadow-2xl"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Visualizer / Mic Icon */}
                        <div className="relative">
                            <motion.div
                                animate={isListening ? {
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-x-[-40px] inset-y-[-40px] rounded-full bg-vape-500/20 blur-2xl"
                            />
                            
                            <div className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 border-4 shadow-[0_0_40px_rgba(234,88,12,0.2)]",
                                isListening ? "bg-vape-500 border-vape-400" : "bg-white/5 border-white/10"
                            )}>
                                <Mic className={cn("w-10 h-10", isListening ? "text-white animate-bounce" : "text-white/20")} />
                            </div>
                            
                            {/* Wave Rings (Simuladas) */}
                            {isListening && [1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                                    className="absolute inset-0 rounded-full border border-vape-500/30"
                                />
                            ))}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-6 w-full">
                            <AnimatePresence mode="wait">
                                {error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-lg font-bold"
                                    >
                                        {error}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="transcript"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-vape-400 text-[10px] font-black uppercase tracking-[0.3em] font-mono">
                                            {isListening ? "Escuchando..." : "Procesando..."}
                                        </p>
                                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight min-h-[80px]">
                                            {transcript || '¿Qué estás buscando?'}
                                        </h2>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!isListening && !error && transcript && (
                                <div className="flex items-center justify-center gap-2 text-vape-500">
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-widest italic">AI Assistant Insight</span>
                                </div>
                            )}
                        </div>

                        {/* Hint */}
                        <p className="text-white/30 text-xs font-medium italic">
                            Prueba diciendo: "Busca pods de menta" o "Quiero un líquido dulce"
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Utility local for className merging
function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
