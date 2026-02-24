import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

/**
 * BottomSheet - Componente de UI para mostrar contenido desde abajo en dispositivos móviles.
 * Ideal para filtros, opciones de ordenamiento, o menús contextuales.
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsRendered(false), 300); // Match transition duration
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isRendered) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0'
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div
                className={cn(
                    'fixed inset-x-0 bottom-0 z-[101] flex max-h-[90vh] flex-col rounded-t-3xl bg-theme-primary shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-sheet-title"
            >
                {/* Handle (Visual indicator for swipe/drag - optional functionality) */}
                <div className="flex w-full items-center justify-center pt-3 pb-1">
                    <div className="h-1.5 w-12 rounded-full bg-theme-secondary/40" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 pb-4 pt-2">
                    <h2 id="bottom-sheet-title" className="text-lg font-bold text-theme-primary">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-theme-secondary transition-colors hover:bg-white/5 hover:text-theme-primary active:scale-95"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                    {children}
                </div>
            </div>
        </>
    );
}
