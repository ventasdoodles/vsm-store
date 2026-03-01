import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div 
                className={`relative flex h-full w-full flex-col bg-theme-primary shadow-2xl transition-transform duration-300 ease-in-out ${width}`}
                style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-theme-subtle px-6 py-4">
                    <h2 className="text-lg font-bold text-theme-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary-800">
                    {children}
                </div>
            </div>
        </div>
    );
}
