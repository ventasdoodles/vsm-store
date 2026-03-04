/**
 * CustomerDirectoryStats — KPIs Globales del Directorio
 * 
 * Tarjetas de métricas: total clientes, nuevos este mes,
 * porcentaje contactable y cumpleañeros del mes.
 * Cálculos se derivan in-memory del listado completo.
 * 
 * @module admin/customers
 */
import { Users, UserPlus, PhoneCall, Cake } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminCustomer } from '@/services/admin';

interface Props {
    customers: AdminCustomer[];
}

export function CustomerDirectoryStats({ customers }: Props) {
    const total = customers.length;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Growth
    const newThisMonth = customers.filter(c => new Date(c.created_at) >= startOfMonth).length;
    
    // Contactability
    const withPhone = customers.filter(c => c.phone || c.whatsapp).length;
    const contactablePercentage = total > 0 ? Math.round((withPhone / total) * 100) : 0;

    // Birthdays this month
    const birthdaysThisMonth = customers.filter(c => {
        if (!c.birthdate) return false;
        const b = new Date(c.birthdate);
        return b.getMonth() === now.getMonth();
    }).length;

    const cards = [
        {
            title: "Total Clientes",
            value: total.toString(),
            subtitle: "Registrados en plataforma",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            glow: "bg-blue-500",
            border: "border-blue-500/20"
        },
        {
            title: "Nuevos (+)",
            value: newThisMonth.toString(),
            subtitle: "Adquisición este mes",
            icon: UserPlus,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            glow: "bg-emerald-500",
            border: "border-emerald-500/20"
        },
        {
            title: "Contactables",
            value: `${contactablePercentage}%`,
            subtitle: `${withPhone} clientes con tel.`,
            icon: PhoneCall,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            glow: "bg-amber-500",
            border: "border-amber-500/20"
        },
        {
            title: "Cumpleañeros",
            value: birthdaysThisMonth.toString(),
            subtitle: "Festejos en este mes",
            icon: Cake,
            color: "text-fuchsia-400",
            bg: "bg-fuchsia-500/10",
            glow: "bg-fuchsia-500",
            border: "border-fuchsia-500/20"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((s, idx) => {
                const Icon = s.icon;
                return (
                    <div 
                        key={idx} 
                        className={cn(
                            "relative overflow-hidden rounded-3xl bg-[#13141f]/80 backdrop-blur-xl border p-5 group transition-all duration-300 hover:-translate-y-1 hover:bg-[#181825]",
                            s.border
                        )}
                    >
                        {/* Glow effect */}
                        <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-all pointer-events-none", s.glow)} />
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn("p-2.5 rounded-2xl flex items-center justify-center border shadow-inner", s.bg, s.color, s.border)}>
                                <Icon className="w-5 h-5 drop-shadow-sm" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-theme-secondary mb-1">{s.title}</h3>
                            <p className="text-3xl font-black text-theme-primary tracking-tight mb-1">{s.value}</p>
                            <p className="text-xs font-medium text-theme-secondary/50 tracking-wide">{s.subtitle}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
