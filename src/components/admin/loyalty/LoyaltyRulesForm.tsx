import { Coins, HandCoins, ArrowRightLeft, ClockAlert, Unlock } from 'lucide-react';
import type { LoyaltyConfig } from '@/services/settings.service';
import { cn } from '@/lib/utils';

interface LoyaltyRulesFormProps {
    config: LoyaltyConfig;
    onChange: (key: keyof LoyaltyConfig, value: number) => void;
}

export function LoyaltyRulesForm({ config, onChange }: LoyaltyRulesFormProps) {
    const isEnabled = config.enable_loyalty;

    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-500",
            !isEnabled && "opacity-50 grayscale-[0.8] pointer-events-none"
        )}>
            {/* Regla: Ganancia */}
            <RuleCard
                title="Tasa de Ganancia"
                description="¿Cuántos V-Coins gana el cliente por cada $1 MXN gastado?"
                icon={<HandCoins className="w-5 h-5 text-emerald-400" />}
                color="emerald"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-theme-secondary">$1 MXN =</span>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={config.points_per_currency}
                        onChange={(e) => onChange('points_per_currency', Number(e.target.value))}
                        className="w-24 bg-theme-primary/[0.03] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-theme-primary text-center focus:border-emerald-500 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner tabular-nums"
                    />
                    <span className="text-sm font-bold text-emerald-400">V-Coins</span>
                </div>
            </RuleCard>

            {/* Regla: Valor de Canje */}
            <RuleCard
                title="Valor de Canje"
                description="¿A cuánto equivale 1 V-Coin en pesos mexicanos de descuento?"
                icon={<ArrowRightLeft className="w-5 h-5 text-amber-400" />}
                color="amber"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-theme-secondary">1 V-Coin =</span>
                    <span className="text-sm font-bold text-amber-400">$</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={config.currency_per_point}
                        onChange={(e) => onChange('currency_per_point', Number(e.target.value))}
                        className="w-24 bg-theme-primary/[0.03] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-theme-primary text-center focus:border-amber-500 outline-none focus:ring-4 focus:ring-amber-500/10 shadow-inner tabular-nums"
                    />
                    <span className="text-sm font-bold text-theme-secondary">MXN</span>
                </div>
            </RuleCard>

            {/* Regla: Límite Mínimo */}
            <RuleCard
                title="Umbral de Canje"
                description="¿Cuántos puntos mínimos necesita el usuario para poder usarlos?"
                icon={<Unlock className="w-5 h-5 text-blue-400" />}
                color="blue"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-theme-secondary">Mínimo:</span>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={config.min_points_to_redeem}
                        onChange={(e) => onChange('min_points_to_redeem', Number(e.target.value))}
                        className="w-24 bg-theme-primary/[0.03] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-theme-primary text-center focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-500/10 shadow-inner tabular-nums"
                    />
                    <span className="text-sm font-bold text-blue-400">V-Coins</span>
                </div>
            </RuleCard>

            {/* Regla: Límite Máximo */}
            <RuleCard
                title="Límite por Pedido"
                description="Límite de puntos permitidos a canjear en una sola compra."
                icon={<Coins className="w-5 h-5 text-pink-400" />}
                color="pink"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-theme-secondary">Máximo:</span>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={config.max_points_per_order}
                        onChange={(e) => onChange('max_points_per_order', Number(e.target.value))}
                        className="w-24 bg-theme-primary/[0.03] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-theme-primary text-center focus:border-pink-500 outline-none focus:ring-4 focus:ring-pink-500/10 shadow-inner tabular-nums"
                    />
                    <span className="text-sm font-bold text-pink-400">V-Coins</span>
                </div>
            </RuleCard>

            {/* Regla: Caducidad */}
            <RuleCard
                title="Vigencia (Caducidad)"
                description="¿Cuántos días duran los puntos antes de expirar por inactividad?"
                icon={<ClockAlert className="w-5 h-5 text-red-400" />}
                color="red"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-theme-secondary">Válidos por:</span>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={config.points_expiry_days}
                        onChange={(e) => onChange('points_expiry_days', Number(e.target.value))}
                        className="w-24 bg-theme-primary/[0.03] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-theme-primary text-center focus:border-red-500 outline-none focus:ring-4 focus:ring-red-500/10 shadow-inner tabular-nums"
                    />
                    <span className="text-sm font-bold text-red-400">Días</span>
                </div>
            </RuleCard>
        </div>
    );
}

function RuleCard({ 
    title, 
    description, 
    icon, 
    color, 
    children 
}: { 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    color: 'emerald' | 'amber' | 'blue' | 'pink' | 'red';
    children: React.ReactNode;
}) {
    const colorMap = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
    };

    return (
        <div className="bg-[#181825]/60 backdrop-blur-md rounded-3xl p-6 border border-white/[0.04] shadow-xl hover:bg-[#181825]/80 hover:border-white/10 transition-all flex flex-col justify-between group">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className={cn("p-2 rounded-xl border", colorMap[color])}>
                        {icon}
                    </div>
                    <h3 className="text-lg font-black text-theme-primary tracking-tight">{title}</h3>
                </div>
                <p className="text-xs font-medium text-theme-secondary/70 mb-6 leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="pt-4 border-t border-white/[0.04] group-hover:border-white/10 transition-colors">
                {children}
            </div>
        </div>
    );
}
