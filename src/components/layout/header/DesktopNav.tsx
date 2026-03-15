/**
 * // ─── COMPONENTE: DesktopNav ───
 * // Arquitectura: Independent UI Lego (Lego Master)
 * // Proposito principal: Navegación principal con Spotlights interactivos.
 *    Design: Glassmorphism suave, Haz de luz mouse-following, Transiciones Spring.
 * // Regla / Notas: Recibe `compact` para modo pill.
 */
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Flame, Leaf, Truck, Tag, Sparkles, PackageCheck, TicketPercent } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { DeliveryLocation } from './DeliveryLocation';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode, MouseEvent } from 'react';

// ── Tipos ────────────────────────────────────────────────────
interface DesktopNavProps {
    compact?: boolean;
}

type NavItem =
    | { type: 'link'; to: string; label: string; icon: ReactNode; hoverColor: string; hoverBg: string; authOnly?: boolean; desktopOnly?: boolean }
    | { type: 'dropdown'; section: 'vape' | '420'; label: string; icon: ReactNode; hoverColor: string; hoverBg: string }
    | { type: 'divider' };

// ── Configuración de items ───────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    { type: 'link', to: '/nuevo', label: 'Lo Nuevo', icon: <Sparkles className="h-4 w-4" />, hoverColor: 'group-hover:text-blue-400', hoverBg: 'hover:bg-white/10' },
    { type: 'divider' },
    { type: 'link', to: '/mas-vendidos', label: 'Más Vendidos', icon: <Flame className="h-4 w-4" />, hoverColor: 'group-hover:text-vape-400', hoverBg: 'hover:bg-white/10' },
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

/** Componente de Link con Spotlight Individual */
function NavLinkWithSpotlight({ item, compact }: { item: Extract<NavItem, { type: 'link' }>; compact: boolean }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <Link
            to={item.to}
            onMouseMove={handleMouseMove}
            className={cn(
                'flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-all duration-300 relative overflow-hidden group border border-transparent hover:border-white/10',
                item.hoverBg
            )}
            title={item.label}
        >
            {/* 🔦 Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            65px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />
            
            <span className={cn('relative z-10 transition-colors flex-shrink-0', item.hoverColor)}>
                {item.icon}
            </span>
            {!compact && <span className="relative z-10 tracking-wide">{item.label}</span>}
        </Link>
    );
}

export function DesktopNav({ compact = false }: DesktopNavProps) {
    const { isAuthenticated } = useAuth();

    const visibleItems = NAV_ITEMS.filter((item) => {
        if (item.type === 'link' && item.authOnly && !isAuthenticated) return false;
        if (item.type === 'link' && item.desktopOnly && compact) return false;
        return true;
    });

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
            {!compact && (
                <>
                    <div className="flex-shrink-0">
                        <DeliveryLocation />
                    </div>
                </>
            )}

            {cleanItems.map((item, i) => {

                if (item.type === 'divider') {
                    return <div key={`div-${i}`} className="w-px h-4 bg-white/10 mx-0.5" aria-hidden="true" />;
                }

                if (item.type === 'dropdown') {
                    return (
                        <MegaMenu
                            key={item.section}
                            section={item.section}
                            label={item.label}
                            icon={item.icon}
                            colorClass={item.hoverColor}
                            compact={compact}
                        />
                    );
                }

                return (
                    <NavLinkWithSpotlight key={item.to} item={item} compact={compact} />
                );
            })}
        </nav>
    );
}
