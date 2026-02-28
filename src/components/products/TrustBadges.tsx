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
        <section className="vsm-surface bg-theme-secondary/5">
            <div className="vsm-feature-grid lg:grid-cols-6 py-2">
                {BADGES.map((badge) => (
                    <div
                        key={badge.id}
                        className="vsm-feature-item group"
                    >
                        {/* Icon */}
                        <div className="vsm-feature-icon bg-accent-primary/10 text-accent-primary group-hover:scale-110">
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
