import { Gift } from 'lucide-react';

export function LoyaltySettings({ formData, handleChange }: any) {
    return (
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10"><Gift className="h-6 w-6 text-yellow-500" /></div>
                <h2 className="text-lg font-semibold text-theme-primary">Programa de Lealtad (Puntos)</h2>
            </div>

            <div className="mb-4">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-theme bg-theme-secondary/30 cursor-pointer hover:bg-theme-secondary/50 transition-colors">
                    <input
                        type="checkbox"
                        name="loyalty_enable_loyalty"
                        checked={formData.loyalty_config.enable_loyalty}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-theme text-vape-500 focus:ring-vape-500 bg-theme-primary"
                    />
                    <div>
                        <p className="text-sm font-medium text-theme-primary">Habilitar Programa de Lealtad</p>
                        <p className="text-xs text-theme-secondary">Permite a los usuarios ganar y canjear puntos.</p>
                    </div>
                </label>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!formData.loyalty_config.enable_loyalty ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Puntos ganados por cada $1 gastado</label>
                    <input
                        type="number"
                        step="0.1"
                        name="loyalty_points_per_currency"
                        value={formData.loyalty_config.points_per_currency}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Valor en $ de cada punto al canjear</label>
                    <input
                        type="number"
                        step="0.01"
                        name="loyalty_currency_per_point"
                        value={formData.loyalty_config.currency_per_point}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Mínimo de puntos para canjear</label>
                    <input
                        type="number"
                        name="loyalty_min_points_to_redeem"
                        value={formData.loyalty_config.min_points_to_redeem}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Máximo de puntos a canjear por orden</label>
                    <input
                        type="number"
                        name="loyalty_max_points_per_order"
                        value={formData.loyalty_config.max_points_per_order}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Días de expiración de los puntos</label>
                    <input
                        type="number"
                        name="loyalty_points_expiry_days"
                        value={formData.loyalty_config.points_expiry_days}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                    />
                </div>
            </div>
        </div>
    );
}
