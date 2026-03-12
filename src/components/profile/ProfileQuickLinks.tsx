/**
 * // ─── COMPONENTE: PROFILE QUICK LINKS ───
 * // Propósito: Grid de accesos rápidos del perfil con estética premium.
 * // Arquitectura: Pure presentation bridge (§1.3).
 * // Estilo: High-End Glass Cards & Cinematic Icons.
 */
import { Link } from 'react-router-dom';
import {
    ShoppingBag,
    MapPin,
    Star,
    BarChart3,
    Bell,
    ChevronRight,
    Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickLink {
    to: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    gradient: string;
}

const LINKS: QuickLink[] = [
    {
        to: '/wishlist',
        icon: <Heart className="h-5 w-5" />,
        label: 'Mis favoritos',
        description: 'Objetos de deseo',
        gradient: 'from-red-500 to-rose-400',
    },
    {
        to: '/orders',
        icon: <ShoppingBag className="h-5 w-5" />,
        label: 'Mis pedidos',
        description: 'Historial y bitácora',
        gradient: 'from-blue-500 to-cyan-400',
    },
    {
        to: '/addresses',
        icon: <MapPin className="h-5 w-5" />,
        label: 'Mis direcciones',
        description: 'Puntos de entrega',
        gradient: 'from-emerald-500 to-teal-400',
    },
    {
        to: '/loyalty',
        icon: <Star className="h-5 w-5" />,
        label: 'Lealtad VSM',
        description: 'Puntos y privilegios',
        gradient: 'from-yellow-500 to-amber-400',
    },
    {
        to: '/stats',
        icon: <BarChart3 className="h-5 w-5" />,
        label: 'Estadísticas',
        description: 'Análisis de actividad',
        gradient: 'from-violet-500 to-purple-400',
    },
    {
        to: '/notifications',
        icon: <Bell className="h-5 w-5" />,
        label: 'Alertas',
        description: 'Notificaciones críticas',
        gradient: 'from-rose-500 to-pink-400',
    },
];

export function ProfileQuickLinks() {
    return (
        <section className="space-y-4">
            <h2 className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] px-2 opacity-40">
                Accesos Críticos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LINKS.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="group flex items-center gap-5 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl px-6 py-5 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl hover:-translate-y-1"
                    >
                        {/* Gradient icon */}
                        <div className={cn(
                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6",
                            link.gradient
                        )}>
                            {link.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white uppercase italic group-hover:text-accent-primary transition-colors duration-500">
                                {link.label}
                            </p>
                            <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest opacity-60 truncate">
                                {link.description}
                            </p>
                        </div>

                        <ChevronRight className="h-4 w-4 text-theme-tertiary group-hover:text-white group-hover:translate-x-1 transition-all duration-500 opacity-40" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
