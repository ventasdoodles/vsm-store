/**
 * TrustBadges — Grid de insignias de confianza (pago seguro, envío, etc.).
 *
 * @module TrustBadges
 * @independent Componente 100% independiente. Sin dependencias externas.
 * @data Badges estáticos definidos internamente (BADGES array).
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { Shield, Truck, Zap, RotateCcw, Star, CreditCard } from 'lucide-react';

interface Badge {
    id: string;
    icon: JSX.Element;
    title: string;
    description: string;
    colorClasses: string;
}

const BADGES: Badge[] = [
    {
        id: '1',
        icon: <Shield className="w-8 h-8" />,
        title: 'Pago Seguro',
        description: 'Protección al 100%',
        colorClasses: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    },
    {
        id: '2',
        icon: <Truck className="w-8 h-8" />,
        title: 'Envío Gratis',
        description: 'En Xalapa +$500',
        colorClasses: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]',
    },
    {
        id: '3',
        icon: <Zap className="w-8 h-8" />,
        title: 'Entrega Rápida',
        description: '24-48 hrs zona con.',
        colorClasses: 'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    },
    {
        id: '4',
        icon: <RotateCcw className="w-8 h-8" />,
        title: 'Devoluciones',
        description: '7 días para cambios',
        colorClasses: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]',
    },
    {
        id: '5',
        icon: <Star className="w-8 h-8" />,
        title: '+500 Clientes',
        description: 'Satisfechos en Veracruz',
        colorClasses: 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]',
    },
    {
        id: '6',
        icon: <CreditCard className="w-8 h-8" />,
        title: 'Pagos',
        description: 'Efectivo y más',
        colorClasses: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    },
];

export const TrustBadges = () => {
    return (
        <section className="py-12 bg-theme-primary/50 backdrop-blur-sm rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 container-vsm relative z-10">
                {BADGES.map((badge) => (
                    <div
                        key={badge.id}
                        className="flex flex-col items-center text-center group transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Icon Container with dynamic colors */}
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 border group-hover:scale-110 ${badge.colorClasses}`}>
                            {badge.icon}
                        </div>

                        {/* Text */}
                        <h3 className="font-bold text-theme-primary mb-1 tracking-wide text-xs sm:text-sm lg:text-base leading-tight text-balance">
                            {badge.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-theme-secondary font-medium px-1 sm:px-2 text-balance leading-tight">
                            {badge.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};
