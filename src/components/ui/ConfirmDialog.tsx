import { motion, AnimatePresence } from 'framer-motion';
import { useConfirmStore } from '@/stores/confirm.store';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function ConfirmDialog() {
    const { isOpen, title, description, confirmText, cancelText, type, closeConfirm } = useConfirmStore();

    // Iconos mapeados por tipo
    const iconMap = {
        danger: <AlertTriangle className="h-6 w-6 text-red-500" />,
        warning: <AlertCircle className="h-6 w-6 text-yellow-500" />,
        info: <Info className="h-6 w-6 text-blue-500" />
    };

    // Estilos de botón mapeados por tipo
    const btnMap = {
        danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20",
        warning: "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20",
        info: "bg-theme hover:bg-theme-secondary text-white shadow-lg shadow-theme/20"
    };

    // Bloquear el scroll y cerrar con Escape
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') closeConfirm(false);
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, closeConfirm]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => closeConfirm(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl vsm-surface border border-white/10 shadow-2xl"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/5",
                                    type === 'danger' && "bg-red-500/10",
                                    type === 'warning' && "bg-yellow-500/10",
                                    type === 'info' && "bg-blue-500/10"
                                )}>
                                    {iconMap[type]}
                                </div>

                                <div className="mt-1 flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-theme-secondary leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={() => closeConfirm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-theme-secondary hover:text-white hover:bg-white/5 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={() => closeConfirm(true)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                                    btnMap[type]
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
