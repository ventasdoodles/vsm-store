import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { useNotification } from '@/hooks/useNotification';
import { Loader2, Save } from 'lucide-react';
import type { LoyaltyConfig } from '@/services/settings.service';

// Subcomponents
import { LoyaltyHeader } from '@/components/admin/loyalty/LoyaltyHeader';
import { LoyaltyRulesForm } from '@/components/admin/loyalty/LoyaltyRulesForm';
import { LoyaltySimulator } from '@/components/admin/loyalty/LoyaltySimulator';
import { LoyaltyStats } from '@/components/admin/loyalty/LoyaltyStats';

// Configuración por defecto si no existe
const DEFAULT_LOYALTY: LoyaltyConfig = {
    enable_loyalty: false,
    points_per_currency: 1,
    currency_per_point: 0.1,
    min_points_to_redeem: 100,
    max_points_per_order: 1000,
    points_expiry_days: 365,
};

export function AdminLoyalty() {
    const { data: settings, isLoading } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { success, error } = useNotification();

    const [config, setConfig] = useState<LoyaltyConfig>(DEFAULT_LOYALTY);
    const [isDirty, setIsDirty] = useState(false);

    // Sincronizar estado local al cargar params de la BD
    useEffect(() => {
        if (settings?.loyalty_config) {
            setConfig(settings.loyalty_config);
            setIsDirty(false);
        }
    }, [settings?.loyalty_config]);

    // Handle updates inside individual rule cards
    const handleRuleChange = (key: keyof LoyaltyConfig, value: number) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };

    // Handle toggling the entire system ON/OFF
    const handleToggleEnable = (val: boolean) => {
        if (config.enable_loyalty === val) return;
        setConfig(prev => ({ ...prev, enable_loyalty: val }));
        setIsDirty(true);
    };

    // Save everything to the database
    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                id: 1,
                loyalty_config: config
            });
            setIsDirty(false);
            success(
                'Programa de Lealtad actualizado',
                config.enable_loyalty ? 'Las nuevas reglas de V-Coins ya están activas en el checkout.' : 'El programa de lealtad ha sido pausado.'
            );
        } catch (err) {
            console.error('Error saving loyalty config:', err);
            error('Error al guardar', 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                <p className="text-theme-secondary font-medium tracking-wide">Cargando el vault de V-Coins...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header + Master Switch */}
            <LoyaltyHeader 
                loyaltyConfig={config} 
                onToggleEnable={handleToggleEnable} 
            />

            {/* Content Area */}
            <div className={`space-y-6 sm:space-y-8 transition-opacity duration-300 ${!config.enable_loyalty ? 'opacity-80' : ''}`}>
                
                {/* Global Stats */}
                <LoyaltyStats />

                {/* Visual Simulator */}
                <LoyaltySimulator config={config} />

                {/* Form Matrix */}
                <div className="bg-[#13141f] rounded-[2.5rem] p-6 sm:p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-4 w-1.5 rounded-full bg-amber-500" />
                        <h2 className="text-xl font-black text-theme-primary tracking-tight">Parametrización del Programa</h2>
                    </div>

                    <LoyaltyRulesForm 
                        config={config} 
                        onChange={handleRuleChange} 
                    />
                </div>
            </div>

            {/* Floating Save Action */}
            {isDirty && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
                    <div className="bg-[#13141f]/90 backdrop-blur-xl border border-amber-500/30 p-2.5 rounded-2xl shadow-[0_10px_40px_rgba(251,191,36,0.15)] flex items-center gap-4">
                        <span className="text-sm font-bold text-theme-secondary ml-4 hidden sm:block">Hay cambios sin guardar</span>
                        <button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-6 py-2.5 rounded-xl font-black tracking-wide transition-all active:scale-95 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            GUARDAR AJUSTES
                        </button>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default AdminLoyalty;
