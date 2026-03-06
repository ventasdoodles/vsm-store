import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminEmptyStateProps {
    /** El ícono lucide a renderizar (e.g. Package, Users, Ticket) */
    icon: LucideIcon;
    /** Título principal (H3) */
    title: string;
    /** Texto descriptivo secundario */
    description?: string;
    /** Clases extra de Tailwind */
    className?: string;
}

/**
 * // ─── COMPONENTE: AdminEmptyState ───
 * // Arquitectura: Dumb Component (Visual)
 * // Propósito principal: Estandariza visualmente todas las vistas de "No hay datos" en el Admin.
 * // Efectos: Utiliza un orbe luminoso sutil en el fondo y Glassmorphism transparente.
 */
export function AdminEmptyState({ icon: Icon, title, description, className }: AdminEmptyStateProps) {
    return (
        <div className={cn(
            "relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem]",
            "border border-white/5 bg-theme-primary/10 py-16 px-4 text-center backdrop-blur-md",
            className
        )}>
            {/* Ambient Glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[80px]" />

            {/* Visual Header */}
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner mb-4">
                <Icon className="h-8 w-8 text-white/40 drop-shadow-md" />
            </div>

            {/* Typography */}
            <h3 className="relative z-10 text-lg font-black text-theme-primary mb-1">
                {title}
            </h3>
            {description && (
                <p className="relative z-10 text-sm font-medium text-theme-secondary">
                    {description}
                </p>
            )}
        </div>
    );
}
