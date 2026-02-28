/**
 * ProfileQuickLinks — Grid de accesos rápidos del perfil.
 *
 * @module ProfileQuickLinks
 * @independent Componente 100% independiente. No depende de auth ni de otros módulos.
 * @removable Quitar de Profile.tsx sin consecuencias para el resto de la página.
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
        description: 'Productos guardados',
        gradient: 'from-red-500 to-rose-400',
    },
    {
        to: '/orders',
        icon: <ShoppingBag className="h-5 w-5" />,
        label: 'Mis pedidos',
        description: 'Historial y seguimiento',
        gradient: 'from-blue-500 to-cyan-400',
    },
    {
        to: '/addresses',
        icon: <MapPin className="h-5 w-5" />,
        label: 'Mis direcciones',
        description: 'Direcciones de entrega',
        gradient: 'from-emerald-500 to-teal-400',
    },
    {
        to: '/loyalty',
        icon: <Star className="h-5 w-5" />,
        label: 'Programa de lealtad',
        description: 'Puntos y recompensas',
        gradient: 'from-yellow-500 to-amber-400',
    },
    {
        to: '/stats',
        icon: <BarChart3 className="h-5 w-5" />,
        label: 'Mis estadísticas',
        description: 'Resumen de actividad',
        gradient: 'from-violet-500 to-purple-400',
    },
    {
        to: '/notifications',
        icon: <Bell className="h-5 w-5" />,
        label: 'Notificaciones',
        description: 'Alertas y avisos',
        gradient: 'from-rose-500 to-pink-400',
    },
];

export function ProfileQuickLinks() {
    return (
        <section className="space-y-3">
            <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider px-1">
                Accesos rápidos
            </h2>
            <div className="grid gap-2">
                {LINKS.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="group flex items-center gap-4 rounded-xl border border-theme bg-theme-secondary/20 backdrop-blur-sm px-4 py-3.5 transition-all duration-300 hover:bg-theme-secondary/40 hover:border-theme hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {/* Gradient icon */}
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${link.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            {link.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-theme-primary group-hover:text-accent-primary transition-colors">
                                {link.label}
                            </p>
                            <p className="text-xs text-theme-secondary truncate">
                                {link.description}
                            </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 text-theme-tertiary group-hover:text-theme-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
