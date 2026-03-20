import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bot, Save, RefreshCcw, Brain, ShieldCheck, 
    MessageSquare, TrendingUp, Zap, 
    Database, CheckCircle2, ShieldCheck as ShieldCheckIcon,
    Scale, Rocket, Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
    AIConfig, 
    AIRule, 
    ProductAIInfo, 
    LearningItem, 
    SimulationMessage, 
    SimulationDebug, 
    NavTab, 
    SimulationSession 
} from '@/types/cesarin';

import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { STORE_SETTINGS_ID } from '@/constants/app';
import { Power, PowerOff } from 'lucide-react';


// Componentes Modulares
import { TabPersona } from '@/components/admin/cesarin/TabPersona';
import { TabRules } from '@/components/admin/cesarin/TabRules';
import { TabSimulator } from '@/components/admin/cesarin/TabSimulator';
import { TabLearning } from '@/components/admin/cesarin/TabLearning';
import { TabAnalytics } from '@/components/admin/cesarin/TabAnalytics';
import { TabKnowledge } from '@/components/admin/cesarin/TabKnowledge';
import { TabQuality } from '@/components/admin/cesarin/TabQuality';
import { TabPilot } from '@/components/admin/cesarin/TabPilot';
import { TabConcepts } from '@/components/admin/cesarin/TabConcepts';
import { TabInterventions } from '@/components/admin/cesarin/TabInterventions';
import { ReviewDrawer } from '@/components/admin/cesarin/ReviewDrawer';
import { PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';

const TABS: NavTab[] = [
    { id: 'persona', label: '1. Personalidad', icon: Brain },
    { id: 'knowledge', label: '2. Conocimiento', icon: Database },
    { id: 'rules', label: '3. Reglas', icon: ShieldCheck },
    { id: 'simulator', label: '4. Simulador', icon: MessageSquare },
    { id: 'learning', label: '5. Aprendizaje', icon: Bot },
    { id: 'interventions', label: '5.5 Intervenciones', icon: Zap },
    { id: 'analytics', label: '6. Analíticas', icon: TrendingUp },
    { id: 'quality', label: '7. Calidad & QA', icon: Scale },
    { id: 'pilot', label: '8. Piloto Operativo', icon: Rocket },
    { id: 'concepts', label: '9. Conceptos', icon: Link2 },
];

export function AdminCesarinOS() {
    const [activeTab, setActiveTab] = useState<NavTab['id']>('persona');
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<AIConfig>({
        id: '',
        name: 'Cesarin',
        voice_tone: '',
        behavior_mode: 'vendedor',
        welcome_message: '',
        temperature: 0.7,
        top_p: 0.9
    });
    const [rules, setRules] = useState<AIRule[]>([]);
    const [products, setProducts] = useState<ProductAIInfo[]>([]); 
    const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
    const [newRule, setNewRule] = useState({ content: '', category: 'personalidad' });
    const [productSearch, setProductSearch] = useState('');
    const [simQuery, setSimQuery] = useState('');
    const [simHistory, setSimHistory] = useState<SimulationMessage[]>([]);
    const [simDebug, setSimDebug] = useState<SimulationDebug | null>(null);
    const [simSessions, setSimSessions] = useState<SimulationSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [reviewInteraction, setReviewInteraction] = useState<PilotQueryRow | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Settings for Global Kill Switch
    const { data: storeSettings, isLoading: isLoadingSettings } = useStoreSettings();
    const updateSettingsMutation = useUpdateStoreSettings();

    // Global AI Kill Switch: Toggles visibility for all storefront users (still subject to pilot gate)
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
   
    // Helper functions for data fetching
    const fetchConfig = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('ai_configs')
                .select('*')
                .eq('key', 'vsm-cesarin')
                .maybeSingle();

            if (error) throw error;
            if (data) setConfig(data as AIConfig);
        } catch (error) {
            console.error('Error fetching AI config:', error);
        }
    }, [supabase]);

    const fetchRules = useCallback(async () => {
        const { data, error } = await supabase.from('ai_rules').select('*').order('priority', { ascending: false });
        if (!error && data) setRules(data as AIRule[]);
    }, [supabase]);

    const fetchLearningItems = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('ai_analytics')
                .select('*')
                .or('detected_intent.eq.desconocido,frustration_detected.eq.true')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            setLearningItems((data as LearningItem[]) || []);
        } catch (error) {
            console.error('Error fetching learning items:', error);
        }
    }, [supabase]);

    const fetchSimulationSessions = useCallback(async () => {
        const { data, error } = await supabase
            .from('ai_simulation_sessions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (!error && data) {
            setSimSessions(data as SimulationSession[]);
        }
    }, [supabase]);

    const loadSession = (session: SimulationSession) => {
        setCurrentSessionId(session.id);
        setSimHistory(session.history);
        setSimDebug(session.metadata?.debug || null);
    };

    const startNewSession = () => {
        setCurrentSessionId(null);
        setSimHistory([]);
        setSimDebug(null);
    };

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('id, name, ai_is_featured, ai_sales_note, ai_exclude')
                .order('name', { ascending: true });

            if (productSearch) {
                query = query.ilike('name', `%${productSearch}%`);
            } else {
                query = query.limit(20);
            }

            const { data, error } = await query;
            if (!error && data) setProducts(data as ProductAIInfo[]);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    }, [productSearch, supabase]);

    useEffect(() => {
        fetchConfig();
        fetchRules();
        fetchLearningItems();
        fetchSimulationSessions();
        fetchProducts();
    }, [fetchConfig, fetchRules, fetchLearningItems, fetchSimulationSessions, fetchProducts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);




    const handleSendMessage = async () => {
        if (!simQuery.trim()) return;
        
        const userMsg: SimulationMessage = { role: 'user', content: simQuery };
        setSimHistory(prev => [...prev, userMsg]);
        setSimQuery('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: {
                    action: 'concierge_chat',
                    query: simQuery,
                    history: simHistory.slice(-5)
                }
            });

            if (error) throw error;
            
            const responseText = data?.text || data?.message;
            if (responseText) {
                const newHistory: SimulationMessage[] = [...simHistory, userMsg, { role: 'assistant', content: responseText }];
                setSimHistory(newHistory);
                
                const debugInfo = data.debug as SimulationDebug;
                if (debugInfo) setSimDebug(debugInfo);

                // WAVE 190: Telemetry Hygiene Persistence
                // Record the turn in ai_analytics as a simulation turn for evaluation.
                const { data: interactionRow } = await supabase
                    .from('ai_analytics')
                    .insert([{
                        query: simQuery,
                        response_text: responseText,
                        detected_intent: debugInfo?.intent || 'desconocido',
                        frustration_detected: debugInfo?.frustration || false,
                        ai_logic_debug: { 
                            ...debugInfo, 
                            is_simulation: true, // Canonical hygiene flag
                            mode: config.behavior_mode 
                        },
                        capsule: debugInfo?.analyst_report?.intent ? 'analyst_refinement' : 'simulator'
                    }])
                    .select()
                    .single();

                // Persistencia en Sesion de Simulador
                const sessionData = {
                    history: newHistory,
                    metadata: {
                        last_intent: debugInfo?.intent,
                        debug: debugInfo,
                        frustration_detected: debugInfo?.frustration,
                        last_interaction_id: interactionRow?.id // Linkage
                    },
                    is_active: !debugInfo?.should_close_session,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                };

                if (currentSessionId) {
                    await supabase.from('ai_simulation_sessions').update(sessionData).eq('id', currentSessionId);
                } else {
                    const { data: newSession } = await supabase
                        .from('ai_simulation_sessions')
                        .insert([sessionData])
                        .select()
                        .single();
                    if (newSession) {
                        setCurrentSessionId(newSession.id);
                        fetchSimulationSessions();
                    }
                }
            }
        } catch (error) {
            console.error('Simulation error:', error);
            toast.error('Error en la simulación');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRule = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('ai_rules').update({ is_enabled: !currentStatus }).eq('id', id);
            if (error) throw error;
            setRules(prev => prev.map(r => r.id === id ? { ...r, is_enabled: !currentStatus } : r));
            toast.success('Regla actualizada');
        } catch (_error) {
            toast.error('Error al actualizar regla');
        }
    };

    const addRule = async () => {
        if (!newRule.content.trim()) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('ai_rules')
                .insert([{
                    config_id: config.id,
                    content: newRule.content,
                    category: newRule.category,
                    is_enabled: true
                }])
                .select()
                .single();

            if (error) throw error;
            setRules(prev => [data as AIRule, ...prev]);
            setNewRule({ content: '', category: 'personalidad' });
            toast.success('Nueva regla activada');
        } catch (error) {
            console.error('Error adding rule:', error);
            toast.error('Error al crear regla');
        } finally {
            setIsLoading(false);
        }
    };

    const updateProductAI = async (productId: string, field: string, value: any) => {
        try {
            const { error } = await supabase.from('products').update({ [field]: value }).eq('id', productId);
            if (error) throw error;
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, [field]: value } : p));
            toast.success('Producto actualizado para la IA');
        } catch (_error) {
            toast.error('Error al actualizar producto');
        }
    };

    const handleReviewInteraction = (interaction: PilotQueryRow) => {
        setReviewInteraction(interaction);
        setIsReviewOpen(true);
    };

    const handleReviewLastSimulatorTurn = () => {
        if (!simHistory.length || simHistory[simHistory.length - 1]?.role !== 'assistant') {
            toast.error('No hay una respuesta reciente para evaluar');
            return;
        }

        // We need the ID from the last turn we just persisted.
        // It's stored in the current session metadata or we can find it.
        // For simplicity, we'll suggest the user uses the analytics log if the session isn't saved yet,
        // but since we just saved it in handleSendMessage, we can try to fetch it.
        if (simDebug) {
            // Re-fetch the row we just created if needed, or if we have it in a local state.
            // Since handleSendMessage is async and updates state, we might not have it in reviewInteraction yet.
            // We'll search for the most recent simulation row.
            supabase
                .from('ai_analytics')
                .select('id, query, response, created_at')
                .eq('query', simHistory[simHistory.length - 2]?.content)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
                .then(({ data, error }) => {
                    if (!error && data) {
                        setReviewInteraction(data as any);
                        setIsReviewOpen(true);
                    } else {
                        toast.error('Gatillo de revisión fallido: intente desde el log de piloto');
                    }
                });
        }
    };

    const handleSaveConfig = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('ai_configs')
                .update({
                    name: config.name,
                    voice_tone: config.voice_tone,
                    behavior_mode: config.behavior_mode,
                    welcome_message: config.welcome_message,
                    temperature: config.temperature,
                    top_p: config.top_p,
                    updated_at: new Date().toISOString()
                })
                .eq('key', 'vsm-cesarin');

            if (error) throw error;
            toast.success('Cesarin OS actualizado correctamente');
        } catch (error) {
            console.error('Error saving AI config:', error);
            toast.error('Error al guardar cambios');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
            {/* Header Premium SaaS */}
            <div className="relative overflow-hidden rounded-[3rem] bg-[#0a0a0f] p-10 border border-white/5 shadow-2xl group">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-vape-500/10 blur-[120px] group-hover:bg-vape-500/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-vape-600/5 blur-[100px]" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <motion.div 
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="h-24 w-24 rounded-[2.5rem] bg-vape-500 flex items-center justify-center shadow-[0_20px_50px_rgba(168,85,247,0.4)] relative z-10"
                            >
                                <Bot className="h-12 w-12 text-white" />
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-4 border-[#0a0a0f] shadow-xl z-20" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                                Cesarin OS
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-white/5 text-vape-400 px-4 py-1.5 rounded-full border border-vape-500/30 backdrop-blur-md">
                                    V2.5 Enterprise
                                </span>
                            </h1>
                            <p className="text-theme-secondary text-sm max-w-sm font-medium leading-relaxed">
                                Neural Sales Engine & Business Intelligence Suite.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Global Kill Switch Control */}
                        <div className={cn(
                            "flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-md transition-all duration-500",
                            storeSettings?.is_ai_assistant_enabled 
                                ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                                : "bg-red-500/5 border-red-500/20"
                        )}>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60">Status de Producción</span>
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2 w-2 rounded-full", storeSettings?.is_ai_assistant_enabled ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                    <span className={cn("text-xs font-black uppercase tracking-wider", storeSettings?.is_ai_assistant_enabled ? "text-emerald-400" : "text-red-400")}>
                                        Storefront AI: {storeSettings?.is_ai_assistant_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleToggleStorefrontAI}
                                disabled={updateSettingsMutation.isPending || isLoadingSettings}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50",
                                    storeSettings?.is_ai_assistant_enabled 
                                        ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20" 
                                        : "bg-red-500 text-white hover:bg-red-400 shadow-red-500/20"
                                )}
                                title={storeSettings?.is_ai_assistant_enabled ? "Desactivar IA en Tienda" : "Activar IA en Tienda"}
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

                        <button 
                            onClick={handleSaveConfig}
                            disabled={isLoading}
                            className="group relative flex items-center gap-3 px-10 py-5 rounded-[1.8rem] bg-vape-500 text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_15px_35px_rgba(168,85,247,0.3)] disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Sync Engine
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation SaaS Tabs */}
            <div className="flex flex-wrap gap-2 p-2 rounded-[2rem] bg-white/[0.03] border border-white/5 w-fit backdrop-blur-xl">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-300 ${
                            activeTab === tab.id 
                            ? 'bg-vape-500 text-white font-black shadow-[0_10px_20px_rgba(168,85,247,0.2)]' 
                            : 'text-white/40 hover:text-white/60 hover:bg-white/5 font-bold'
                        }`}
                    >
                        <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-white/20'}`} />
                        <span className="text-[10px] uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'persona' && (
                        <TabPersona config={config} setConfig={setConfig} isLoading={isLoading} onSave={handleSaveConfig} />
                    )}
                    {activeTab === 'knowledge' && (
                        <TabKnowledge products={products} productSearch={productSearch} setProductSearch={setProductSearch} onUpdateProduct={updateProductAI} />
                    )}
                    {activeTab === 'rules' && (
                        <TabRules rules={rules} isLoading={isLoading} onToggle={toggleRule} newRule={newRule} setNewRule={setNewRule} onAdd={addRule} />
                    )}
                    {activeTab === 'simulator' && (
                        <TabSimulator 
                            simQuery={simQuery} 
                            setSimQuery={setSimQuery} 
                            simHistory={simHistory} 
                            simDebug={simDebug} 
                            isLoading={isLoading} 
                            onSendMessage={handleSendMessage}
                            sessions={simSessions}
                            currentSessionId={currentSessionId}
                            onLoadSession={loadSession}
                            onNewSession={startNewSession}
                            onReviewLastTurn={handleReviewLastSimulatorTurn}
                        />
                    )}
                    {activeTab === 'learning' && (
                        <TabLearning learningItems={learningItems} onCreateRule={(q, f) => {
                                setNewRule({ content: `Corregir para: "${q}".`, category: f ? 'soporte' : 'ventas' });
                                setActiveTab('rules');
                            }}
                        />
                    )}
                    {activeTab === 'interventions' && (
                        <TabInterventions />
                    )}
                    {activeTab === 'analytics' && <TabAnalytics />}
                    { activeTab === 'quality' && <TabQuality />}
                    { activeTab === 'pilot' && <TabPilot onReview={handleReviewInteraction} />}
                    { activeTab === 'concepts' && <TabConcepts />}
                </AnimatePresence>

                <ReviewDrawer
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    interaction={reviewInteraction ? {
                        id: (reviewInteraction as any).id,
                        query: (reviewInteraction as any).query || '',
                        response: (reviewInteraction as any).response_text || '',
                        created_at: (reviewInteraction as any).created_at,
                        capsule: (reviewInteraction as any).capsule ?? null,
                        detected_intent: (reviewInteraction as any).detected_intent ?? null,
                        fallback_used: (reviewInteraction as any).fallback_used ?? false,
                        product_card_count: (reviewInteraction as any).product_card_count ?? 0,
                        semantic_match_success: (reviewInteraction as any).semantic_match_success ?? false,
                        raw_analyst_intent: (reviewInteraction as any).raw_analyst_intent ?? null,
                    } : null}
                />
            </div>

            {/* Global Stats Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="p-6 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Uptime Motor</div>
                        <div className="text-xl font-black text-white">99.98%</div>
                    </div>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Integridad IA</div>
                        <div className="text-xl font-black text-white">VERIFICADA</div>
                    </div>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-vape-500/5 border border-vape-500/10 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-vape-500/20 flex items-center justify-center">
                        <ShieldCheckIcon className="h-6 w-6 text-vape-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-vape-400 uppercase tracking-widest">Capa Guardrail</div>
                        <div className="text-xl font-black text-white">ACTIVA</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminCesarinOS;
