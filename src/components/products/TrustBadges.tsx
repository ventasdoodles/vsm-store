import { ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Section } from '@/types/product';

interface TrustBadgesProps {
    section: Section;
    className?: string;
}

export function TrustBadges({ section, className }: TrustBadgesProps) {
    const isVape = section === 'vape';
    const activeColor = isVape ? 'text-vape-400' : 'text-herbal-400';
    const bgActive = isVape ? 'bg-vape-500/10 border-vape-500/20' : 'bg-herbal-500/10 border-herbal-500/20';

    const badges = [
        {
            icon: Truck,
            title: 'Envío Gratis',
            desc: 'En pedidos > $500 en Xalapa',
        },
        {
            icon: ShieldCheck,
            title: 'Garantía VSM',
            desc: 'Productos 100% Originales',
        },
        {
            icon: CreditCard,
            title: 'Pago Seguro',
            desc: 'Efectivo, Transferencia o Tarjeta',
        },
    ];

    return (
        <div className={cn("grid grid-cols-1 gap-3 border-t border-primary-800/50 py-6 sm:grid-cols-3", className)}>
            {badges.map((badge, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-primary-800/30 bg-primary-900/20 p-3 transition-colors hover:bg-primary-900/40"
                >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border", bgActive, activeColor)}>
                        <badge.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-primary-200">{badge.title}</h4>
                        <p className="text-[11px] text-primary-500">{badge.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
