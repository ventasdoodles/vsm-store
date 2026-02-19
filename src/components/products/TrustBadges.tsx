import { Shield, Truck, Zap, RotateCcw, Star, CreditCard } from 'lucide-react';

interface Badge {
    id: string;
    icon: JSX.Element;
    title: string;
    description: string;
}

const BADGES: Badge[] = [
    {
        id: '1',
        icon: <Shield className="w-8 h-8" />,
        title: 'Pago Seguro',
        description: 'Protección en todas tus compras',
    },
    {
        id: '2',
        icon: <Truck className="w-8 h-8" />,
        title: 'Envío Gratis',
        description: 'En Xalapa en compras +$500',
    },
    {
        id: '3',
        icon: <Zap className="w-8 h-8" />,
        title: 'Entrega Rápida',
        description: '24-48 horas en la zona',
    },
    {
        id: '4',
        icon: <RotateCcw className="w-8 h-8" />,
        title: 'Devoluciones',
        description: '7 días para cambios',
    },
    {
        id: '5',
        icon: <Star className="w-8 h-8" />,
        title: '+500 Clientes',
        description: 'Satisfechos en Veracruz',
    },
    {
        id: '6',
        icon: <CreditCard className="w-8 h-8" />,
        title: 'Pago Flexible',
        description: 'Efectivo o transferencia',
    },
];

export const TrustBadges = () => {
    return (
        <section className="py-12 bg-theme-secondary rounded-2xl border border-theme">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 container-vsm">
                {BADGES.map((badge) => (
                    <div
                        key={badge.id}
                        className="flex flex-col items-center text-center group"
                    >
                        {/* Icon */}
                        <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mb-3 text-accent-primary group-hover:scale-110 transition-transform">
                            {badge.icon}
                        </div>

                        {/* Text */}
                        <h3 className="font-semibold text-theme-primary mb-1">
                            {badge.title}
                        </h3>
                        <p className="text-sm text-theme-secondary">
                            {badge.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};
