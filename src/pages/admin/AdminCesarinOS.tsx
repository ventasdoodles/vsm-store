import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Bot, Power, PowerOff, RefreshCcw, MessageSquare, Brain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { STORE_SETTINGS_ID } from '@/constants/app';

// New Components
import { TabInteractions } from '@/components/admin/cesarin/TabInteractions';
import { TabTraining } from '@/components/admin/cesarin/TabTraining';
import { TabPerformance } from '@/components/admin/cesarin/TabPerformance';
import { TabRules } from '@/components/admin/cesarin/TabRules';
import { ShieldCheck } from 'lucide-react';

type CesarinTabId = 'interactions' | 'training' | 'performance' | 'rules';

const TABS = [
    { id: 'interactions' as CesarinTabId, label: 'Interacciones', icon: MessageSquare, description: 'Revisa qué preguntan tus clientes y califica las respuestas de Cesarin.' },
    { id: 'training' as CesarinTabId, label: 'Material de Estudio', icon: Brain, description: 'Sube manuales, pega enlaces y ajusta la personalidad de Cesarin.' },
    { id: 'rules' as CesarinTabId, label: 'Reglas de Venta', icon: ShieldCheck, description: 'Establece directrices estrictas sobre lo que Cesarin debe o no debe hacer.' },
    { id: 'performance' as CesarinTabId, label: 'Desempeño', icon: TrendingUp, description: 'Mide cuántos chats cierra y cuál es la calificación promedio.' },
];

export function AdminCesarinOS() {
    const [activeTab, setActiveTab] = useState<CesarinTabId>('interactions');
    
    // Global Kill Switch
    const { data: storeSettings, isLoading: isLoadingSettings } = useStoreSettings();
    const updateSettingsMutation = useUpdateStoreSettings();

    const handleToggleStorefrontAI = async () => {
        if (!storeSettings) return;
        try {
            await updateSettingsMutation.mutateAsync({
                id: STORE_SETTINGS_ID,
                is_ai_assistant_enabled: !storeSettings.is_ai_assistant_enabled
            });
            toast.success(
                `Storefront AI ${!storeSettings.is_ai_assistant_enabled ? 'activado' : 'desactivado'} correctamente`
            );
        } catch (error) {
            console.error('Error toggling storefront AI:', error);
            toast.error('Error al actualizar el estado de la IA');
        }
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'interactions':
                return <TabInteractions />;
            case 'training':
                return <TabTraining />;
            case 'rules':
                return <TabRules />;
            case 'performance':
                return <TabPerformance />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Header Lujoso Glassmorphism */}
            <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0a0a0f] p-10 shadow-2xl">
                <div className="absolute right-0 top-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-[100px]" />

                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-6">
                        <div className="relative shrink-0">
                            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_20px_50px_rgba(99,102,241,0.35)]">
                                <Bot className="h-10 w-10" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-4 border-[#0a0a0f] bg-emerald-500" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-black tracking-tighter text-white">Cesarin OS</h1>
                            <p className="max-w-2xl text-sm font-medium leading-relaxed text-theme-secondary">
                                El cerebro de tu tienda. Supervisa sus chats, dale nuevos manuales para estudiar y mira qué impacto está teniendo en tus clientes. Todo sin tocar una sola línea de código.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-stretch xl:min-w-[320px]">
                        <div
                            className={cn(
                                'flex items-center gap-4 rounded-[1.8rem] border px-5 py-4 backdrop-blur-md transition-all duration-500',
                                storeSettings?.is_ai_assistant_enabled
                                    ? 'border-emerald-500/20 bg-emerald-500/5'
                                    : 'border-red-500/20 bg-red-500/5',
                            )}
                        >
                            <div className="flex-1">
                                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                                    Visibilidad
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className={cn('h-2 w-2 rounded-full', storeSettings?.is_ai_assistant_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                                    <span className={cn('text-xs font-black uppercase tracking-wider', storeSettings?.is_ai_assistant_enabled ? 'text-emerald-400' : 'text-red-400')}>
                                        {storeSettings?.is_ai_assistant_enabled ? 'Hablando con clientes' : 'Pausado'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleToggleStorefrontAI}
                                disabled={updateSettingsMutation.isPending || isLoadingSettings}
                                className={cn(
                                    'rounded-xl p-3 transition-all duration-300 active:scale-95 disabled:opacity-50',
                                    storeSettings?.is_ai_assistant_enabled
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                        : 'bg-red-500 text-white hover:bg-red-400',
                                )}
                                title={storeSettings?.is_ai_assistant_enabled ? 'Pausar Cesarin' : 'Activar Cesarin'}
                            >
                                {updateSettingsMutation.isPending ? (
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                ) : storeSettings?.is_ai_assistant_enabled ? (
                                    <Power className="h-4 w-4" />
                                ) : (
                                    <PowerOff className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación Simple de 3 Pestañas */}
            <nav aria-label="Navegacion Cesarin OS" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'relative flex items-start gap-4 rounded-[2rem] border p-6 transition-all text-left overflow-hidden group',
                                isActive
                                    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06]'
                            )}
                        >
                            {isActive && (
                                <m.div
                                    layoutId="activeAdminTab"
                                    className="absolute inset-0 bg-indigo-500/20 backdrop-blur-md"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className="relative z-10 flex items-center justify-center p-3 rounded-2xl bg-white/5">
                                <Icon className={cn("h-6 w-6", isActive ? "text-indigo-400" : "text-white/40")} />
                            </div>
                            <div className="relative z-10">
                                <div className={cn("text-lg font-black tracking-tight", isActive ? "text-white" : "text-white/60")}>
                                    {tab.label}
                                </div>
                                <div className="text-xs text-white/40 mt-1 pr-4">
                                    {tab.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Contenido Principal */}
            <div className="rounded-[3rem] border border-white/5 bg-[#0a0a0f] p-10 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {renderActiveTab()}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AdminCesarinOS;
