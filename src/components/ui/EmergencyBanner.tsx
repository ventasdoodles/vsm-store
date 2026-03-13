import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MessageCircle } from 'lucide-react';
import { useSafety } from '@/contexts/SafetyContext';

/**
 * EmergencyBanner
 * High-visibility disclaimer shown only when the system is in Emergency Mode.
 */
export const EmergencyBanner: React.FC = () => {
    const { isEmergency } = useSafety();

    return (
        <AnimatePresence>
            {isEmergency && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-600 text-white py-2 px-4 relative z-[100] border-b border-red-500 shadow-2xl"
                >
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 rounded-full animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold tracking-tight">
                                MODO DE EMERGENCIA ACTIVO: Nuestro catálogo principal está temporalmente desconectado.
                            </span>
                        </div>
                        <a 
                            href="https://wa.me/521234567890" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-1.5 bg-white text-red-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-colors shadow-lg"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Comprar por WhatsApp
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
