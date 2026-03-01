/**
 * DesktopNav — Navegación principal del escritorio.
 * Componente puro: recibe `compact` para modo icono-only (header scrolled).
 * Compone CategoryDropdown internamente. No sabe de search ni notificaciones.
 */
import { Link } from 'react-router-dom';
import { Flame, Leaf, Truck, Tag, Sparkles, PackageCheck, TicketPercent } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

// ── Tipos ────────────────────────────────────────────────────
interface DesktopNavProps {
    /** Modo compacto: solo iconos, sin etiquetas (usado en header scrolled) */
    compact?: boolean;
}

type NavItem =
    | { type: 'link'; to: string; label: string; icon: ReactNode; hoverColor: string; hoverBg: string; authOnly?: boolean; desktopOnly?: boolean }
    | { type: 'dropdown'; section: 'vape' | '420'; label: string; icon: ReactNode; hoverColor: string; hoverBg: string }
    | { type: 'divider' };

// ── Configuración de items ───────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    { type: 'link', to: '/novedades', label: 'Lo Nuevo', icon: <Sparkles className="h-4 w-4" />, hoverColor: 'group-hover:text-blue-400', hoverBg: 'hover:bg-white/10' },
    { type: 'divider' },
    { type: 'link', to: '/', label: 'Más Vendidos', icon: <Flame className="h-4 w-4" />, hoverColor: 'group-hover:text-vape-400', hoverBg: 'hover:bg-white/10' },
    { type: 'divider' },
    { type: 'dropdown', section: 'vape', label: 'Vape', icon: <Flame className="h-4 w-4" />, hoverColor: 'hover:text-accent-primary', hoverBg: 'hover:bg-accent-primary/10' },
    { type: 'dropdown', section: '420', label: '420', icon: <Leaf className="h-4 w-4" />, hoverColor: 'hover:text-emerald-500', hoverBg: 'hover:bg-emerald-500/10' },
    { type: 'divider' },
    { type: 'link', to: '/ofertas', label: 'Ofertas', icon: <Tag className="h-4 w-4" />, hoverColor: 'group-hover:text-red-400', hoverBg: 'hover:bg-red-500/10' },
    { type: 'divider' },
    { type: 'link', to: '/cupones', label: 'Cupones', icon: <TicketPercent className="h-4 w-4" />, hoverColor: 'group-hover:text-purple-400', hoverBg: 'hover:bg-purple-500/10' },
    { type: 'divider' },
    { type: 'link', to: '/perfil/pedidos', label: 'Mis Compras', icon: <PackageCheck className="h-4 w-4" />, hoverColor: 'group-hover:text-blue-400', hoverBg: 'hover:bg-blue-500/10', authOnly: true },
    { type: 'divider' },
    { type: 'link', to: '/rastreo', label: 'Rastrear', icon: <Truck className="h-4 w-4" />, hoverColor: 'group-hover:text-yellow-400', hoverBg: 'hover:bg-yellow-500/10', desktopOnly: true },
];

// ── Estilos base reutilizables ───────────────────────────────
const LINK_BASE = 'flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 relative overflow-hidden group';
const DIVIDER = 'w-px h-4 bg-white/10 mx-0.5';

/** Divisor visual entre items del nav */
function NavDivider() {
    return <div className={DIVIDER} aria-hidden="true" />;
}

export function DesktopNav({ compact = false }: DesktopNavProps) {
    const { isAuthenticated } = useAuth();

    /** Filtra items según contexto (auth, pantalla, compact) */
    const visibleItems = NAV_ITEMS.filter((item) => {
        if (item.type === 'link' && item.authOnly && !isAuthenticated) return false;
        if (item.type === 'link' && item.desktopOnly && compact) return false;
        return true;
    });

    /** Elimina divisores consecutivos o al inicio/final */
    const cleanItems = visibleItems.filter((item, i, arr) => {
        if (item.type !== 'divider') return true;
        if (i === 0 || i === arr.length - 1) return false;
        if (arr[i - 1]?.type === 'divider') return false;
        return true;
    });

    return (
        <nav aria-label="Navegación principal" className={cn(
            'hidden lg:flex items-center justify-center gap-1 flex-shrink-0 p-1.5 rounded-full',
            'bg-[#1e2538]/60 backdrop-blur-md border border-white/10 shadow-inner shadow-black/20',
            'transition-all hover:bg-[#1e2538]/80 hover:border-white/20',
            compact && 'gap-0.5'
        )}>
            {cleanItems.map((item, i) => {
                if (item.type === 'divider') {
                    return <NavDivider key={`div-${i}`} />;
                }

                if (item.type === 'dropdown') {
                    return (
                        <CategoryDropdown
                            key={item.section}
                            section={item.section}
                            label={item.label}
                            icon={item.icon}
                            colorClass={item.hoverColor}
                            hoverBg={item.hoverBg}
                            compact={compact}
                        />
                    );
                }

                // type === 'link'
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(LINK_BASE, item.hoverBg)}
                        title={item.label}
                    >
                        <span className={cn('relative z-10 transition-colors flex-shrink-0', item.hoverColor)}>
                            {item.icon}
                        </span>
                        {!compact && <span className="relative z-10 tracking-wide">{item.label}</span>}
                    </Link>
                );
            })}
        </nav>
    );
}
