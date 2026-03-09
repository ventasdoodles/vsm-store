/**
 * // ─── COMPONENTE: SideDrawer ───
 * // Arquitectura: Base UI Lego (Lego Master)
 * // Proposito principal: Panel lateral universal con transiciones elasticas premium.
 *    Design: Glassmorphism profundo (40px blur), Spring physics, Backdrop cinematico.
 * // Regla / Notas: Reutilizable en todo el Admin y Store. Animado con Framer Motion.
 */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: string;
}

export function SideDrawer({
    isOpen,
    onClose,
    title,
    children,
    width = 'max-w-md'
}: SideDrawerProps) {

    // Bloquear el scroll del body cuando está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            "relative flex h-full w-full flex-col bg-[#0d0d12]/90 shadow-2xl backdrop-blur-3xl border-l border-white/5",
                            width
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/[0.02]">
                            <h2 className="text-lg font-black italic tracking-tight text-white uppercase">{title}</h2>
                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 text-white/30 hover:bg-white/5 hover:text-white transition-all active:scale-90"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
