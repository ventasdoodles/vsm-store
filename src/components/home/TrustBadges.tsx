import { Shield, Truck, Zap, RotateCcw, Star, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface Badge {
    id: string;
    icon: JSX.Element;
    title: string;
    description: string;
    color: string;
}

const BADGES: Badge[] = [
    {
        id: '1',
        icon: <Shield className="w-8 h-8" />,
        title: 'Pago Seguro',
        description: 'Protección al 100%',
        color: 'rgb(16, 185, 129)', // emerald
    },
    {
        id: '2',
        icon: <Truck className="w-8 h-8" />,
        title: 'Envío Gratis',
        description: 'En Xalapa +$500',
        color: 'rgb(234, 179, 8)', // yellow
    },
    {
        id: '3',
        icon: <Zap className="w-8 h-8" />,
        title: 'Entrega Rápida',
        description: '24-48 hrs zona con.',
        color: 'rgb(168, 85, 247)', // purple
    },
    {
        id: '4',
        icon: <RotateCcw className="w-8 h-8" />,
        title: 'Devoluciones',
        description: '7 días para cambios',
        color: 'rgb(59, 130, 246)', // blue
    },
    {
        id: '5',
        icon: <Star className="w-8 h-8" />,
        title: '+500 Clientes',
        description: 'Satisfechos en Veracruz',
        color: 'rgb(249, 115, 22)', // orange
    },
    {
        id: '6',
        icon: <CreditCard className="w-8 h-8" />,
        title: 'Pagos',
        description: 'Efectivo y más',
        color: 'rgb(6, 182, 212)', // cyan
    },
];

export const TrustBadges = () => {
    return (
        <section className="py-20 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-primary/[0.05] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-vape-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-8 container-vsm relative z-10">
                {BADGES.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center text-center group/badge"
                    >
                        {/* Icon Container with Floating Animation */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: index * 0.5
                            }}
                            className="relative mb-6"
                        >
                            <div
                                className="w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 bg-white/[0.02] border border-white/[0.08] shadow-2xl relative overflow-hidden group-hover/badge:scale-110 group-hover/badge:bg-white/[0.05] group-hover/badge:border-white/20"
                                style={{
                                    boxShadow: `0 10px 30px -10px ${badge.color}20`
                                }}
                            >
                                {/* Background Shine */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity" />

                                <div style={{ color: badge.color }} className="relative z-10 transition-transform duration-500 group-hover/badge:rotate-12">
                                    {badge.icon}
                                </div>
                            </div>

                            {/* Outer Glow */}
                            <div
                                className="absolute inset-0 blur-2xl opacity-0 group-hover/badge:opacity-20 transition-opacity"
                                style={{ backgroundColor: badge.color }}
                            />
                        </motion.div>

                        {/* Text Content */}
                        <div className="space-y-2">
                            <h3 className="font-black text-white/90 uppercase tracking-wider text-[10px] sm:text-xs leading-none">
                                {badge.title}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-white/40 font-bold uppercase tracking-[0.2em] leading-tight px-2">
                                {badge.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
