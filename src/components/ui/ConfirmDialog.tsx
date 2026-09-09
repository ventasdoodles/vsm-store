import { m, AnimatePresence } from 'framer-motion';
import { useConfirmStore } from '@/stores/confirm.store';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useCallback } from 'react';

export function ConfirmDialog() {
    const { isOpen, title, description, confirmText, cancelText, type, closeConfirm } = useConfirmStore();
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Iconos mapeados por tipo
    const iconMap = {
        danger: <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden="true" />,
        warning: <AlertCircle className="h-6 w-6 text-yellow-500" aria-hidden="true" />,
        info: <Info className="h-6 w-6 text-blue-500" aria-hidden="true" />
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
            previousFocusRef.current = document.activeElement as HTMLElement;
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    closeConfirm(false);
                }
            };
            window.addEventListener('keydown', handleEsc);
            
            // Auto focus
            const timer = setTimeout(() => {
                const cancelBtn = dialogRef.current?.querySelector<HTMLButtonElement>('button[data-cancel]');
                const confirmBtn = dialogRef.current?.querySelector<HTMLButtonElement>('button[data-confirm]');
                (cancelBtn || confirmBtn)?.focus();
            }, 100);

            return () => {
                document.body.style.overflow = originalOverflow;
                window.removeEventListener('keydown', handleEsc);
                clearTimeout(timer);
                
                // Restore focus
                if (previousFocusRef.current) {
                    previousFocusRef.current.focus();
                }
            };
        }
    }, [isOpen, closeConfirm]);
    
    // Focus trap
    const handleFocusTrap = useCallback((e: React.KeyboardEvent) => {
        if (e.key !== 'Tab' || !dialogRef.current) return;
        
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => closeConfirm(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Dialog */}
                    <m.div
                        ref={dialogRef}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirm-dialog-title"
                        aria-describedby="confirm-dialog-desc"
                        onKeyDown={handleFocusTrap}
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
                                    <h3 id="confirm-dialog-title" className="text-lg font-bold text-white mb-2">
                                        {title}
                                    </h3>
                                    <p id="confirm-dialog-desc" className="text-sm text-theme-secondary leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3 sm:gap-4">
                            <button
                                type="button"
                                data-cancel
                                onClick={() => closeConfirm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-theme-secondary hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-theme/50"
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                data-confirm
                                onClick={() => closeConfirm(true)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-vsm-bg",
                                    btnMap[type],
                                    type === 'danger' ? "focus:ring-red-500" : type === 'warning' ? "focus:ring-yellow-500" : "focus:ring-theme"
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
}
