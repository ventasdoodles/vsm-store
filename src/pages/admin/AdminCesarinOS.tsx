import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Bot, Save, RefreshCcw, Brain, ShieldCheck,
    MessageSquare, TrendingUp, Zap,
    Database,
    Scale, Rocket, Link2, ListChecks, ChevronDown, Trash2
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
import { useAuth } from '@/hooks/useAuth';
import { useCesarinSignalStates, SignalState } from '@/hooks/useCesarinSignalStates';
import { useCesarinActivityLog } from '@/hooks/useCesarinActivityLog';
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
import { TabImprovements } from '@/components/admin/cesarin/TabImprovements';
import { ReviewDrawer } from '@/components/admin/cesarin/ReviewDrawer';
import { PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';
import { createImprovementItem } from '@/services/admin/admin-improvement.service';
import { probeCesarinTrace } from '@/services/admin/admin-operator-actions.service';

const TABS: NavTab[] = [
    { id: 'persona', label: 'Persona', icon: Brain },
    { id: 'knowledge', label: 'Conocimiento', icon: Database },
    { id: 'rules', label: 'Reglas', icon: ShieldCheck },
    { id: 'simulator', label: 'Simulador', icon: MessageSquare },
    { id: 'learning', label: 'Aprendizaje', icon: Bot },
    { id: 'interventions', label: 'Intervenciones', icon: Zap },
    { id: 'analytics', label: 'Historico', icon: TrendingUp },
    { id: 'quality', label: 'Calidad', icon: Scale },
    { id: 'pilot', label: 'Operacion', icon: Rocket },
    { id: 'improvements', label: 'Mejoras', icon: ListChecks },
    { id: 'concepts', label: 'Conceptos', icon: Link2 },
];

type CesarinTabId = NavTab['id'];
type CesarinTabGroup = 'monitor' | 'review' | 'configure' | 'lab';

interface CesarinTabDefinition {
    id: CesarinTabId;
    label: string;
    title: string;
    description: string;
    operatorCue: string;
    translator?: string[];
    icon: NavTab['icon'];
    group: CesarinTabGroup;
}

const TAB_ICON_MAP = TABS.reduce<Record<CesarinTabId, NavTab['icon']>>((acc, tab) => {
    acc[tab.id] = tab.icon;
    return acc;
}, {} as Record<CesarinTabId, NavTab['icon']>);

const TAB_GROUPS: Array<{ id: CesarinTabGroup; label: string; description: string }> = [
    {
        id: 'monitor',
        label: 'Leer que esta pasando',
        description: 'Operacion diaria para el estado real del piloto. Resumen historico para tendencias del mes. Empieza siempre por Operacion.',
    },
    {
        id: 'review',
        label: 'Revisar y decidir',
        description: 'Intervenciones para aprobar o rechazar sugerencias del sistema. Cola de mejoras para cerrar hallazgos con seguimiento y evidencia.',
    },
    {
        id: 'configure',
        label: 'Configurar el sistema',
        description: 'Ajusta conocimiento, reglas, persona y compatibilidad de productos. Entra aqui cuando el problema sea de informacion, no de un caso puntual.',
    },
    {
        id: 'lab',
        label: 'Laboratorio y validacion',
        description: 'Simula consultas en tiempo real, revisa reportes de calidad automatizados y convierte friccion detectada en directrices de mejora.',
    },
];

const TAB_DEFINITIONS: CesarinTabDefinition[] = [
    {
        id: 'pilot',
        label: 'Operacion diaria',
        title: 'Cabina operativa',
        description: 'Telemetria real, respuestas revisables y salud del piloto en una sola lectura.',
        operatorCue: 'Empieza aqui. Si detectas misses o respuestas flojas, salta a Calidad o a Cola de mejoras.',
        translator: [
            'Capsule = modo de respuesta elegido para resolver una consulta',
            'Guardrail = red de seguridad que rescata intenciones ambiguas o inestables',
        ],
        icon: TAB_ICON_MAP.pilot,
        group: 'monitor',
    },
    {
        id: 'analytics',
        label: 'Resumen historico',
        title: 'Lectura historica',
        description: 'Tendencias agregadas y lectura secundaria para ver como viene cambiando el sistema.',
        operatorCue: 'Abrela cuando frustracion supere 15%, FEATURED_FALLBACK este alto, o notes que la mezcla de rutas cambio. Para casos puntuales, vuelve a Operacion diaria.',
        translator: ['Match semantico = consulta que encontro una respuesta comercial util'],
        icon: TAB_ICON_MAP.analytics,
        group: 'monitor',
    },
    {
        id: 'quality',
        label: 'Calidad y QA',
        title: 'Auditoria y validacion',
        description: 'Reportes de simulacion, veredictos del juez y lectura fria de la calidad del sistema.',
        operatorCue: 'Abrela cuando necesites comprobar si una mejora ya funciono o si un comportamiento sigue fallando.',
        translator: ['Judge = auditor semantico secundario; no reemplaza la evaluacion deterministica'],
        icon: TAB_ICON_MAP.quality,
        group: 'lab',
    },
    {
        id: 'improvements',
        label: 'Cola de mejoras',
        title: 'Seguimiento gobernado',
        description: 'Hallazgos convertidos en trabajo trazable con owner, estado y evidencia de cierre.',
        operatorCue: 'Usala para que una revision humana no se pierda y termine en una accion cerrada con evidencia.',
        icon: TAB_ICON_MAP.improvements,
        group: 'review',
    },
    {
        id: 'interventions',
        label: 'Intervenciones',
        title: 'Intervenciones sugeridas',
        description: 'Recomendaciones generadas por patrones de senal que requieren aprobacion manual del operador.',
        operatorCue: 'Aqui decides si una recomendacion merece ejecucion manual o si todavia no aplica.',
        icon: TAB_ICON_MAP.interventions,
        group: 'review',
    },
    {
        id: 'knowledge',
        label: 'Conocimiento',
        title: 'Base de conocimiento',
        description: 'Notas de producto, contenido RAG y sincronizacion del conocimiento que Cesarin usa para responder.',
        operatorCue: 'Ven aqui cuando el problema sea de informacion faltante, notas pobres o conocimiento desactualizado.',
        translator: ['RAG = contenido documental que Cesarin consulta para responder con grounding'],
        icon: TAB_ICON_MAP.knowledge,
        group: 'configure',
    },
    {
        id: 'rules',
        label: 'Reglas',
        title: 'Gobernanza de comportamiento',
        description: 'Reglas activas que moldean tono, restricciones comerciales y disciplina operativa.',
        operatorCue: 'Usa esta vista cuando necesites fijar una instruccion clara, no cuando solo quieres revisar un caso.',
        translator: ['Regla = instruccion activa y persistente sobre como debe comportarse Cesarin'],
        icon: TAB_ICON_MAP.rules,
        group: 'configure',
    },
    {
        id: 'persona',
        label: 'Persona',
        title: 'Identidad base',
        description: 'Tono, modo de comportamiento y configuracion central de la personalidad de Cesarin.',
        operatorCue: 'Tocala poco y solo cuando el cambio sea de identidad global, no para corregir un caso puntual.',
        icon: TAB_ICON_MAP.persona,
        group: 'configure',
    },
    {
        id: 'concepts',
        label: 'Conceptos',
        title: 'Compatibilidad avanzada',
        description: 'Mapa taxonomico y relaciones de compatibilidad para operadores avanzados.',
        operatorCue: 'Es una vista profunda. Usala cuando el problema sea estructural de compatibilidad o taxonomia.',
        translator: ['Edge = relacion direccional entre dos conceptos del grafo de compatibilidad'],
        icon: TAB_ICON_MAP.concepts,
        group: 'configure',
    },
    {
        id: 'simulator',
        label: 'Simulador',
        title: 'Laboratorio de turnos',
        description: 'Sandbox para probar consultas, ver debug y abrir evaluacion sobre respuestas recientes.',
        operatorCue: 'Ideal para reproducir un caso antes de cambiar reglas o conocimiento.',
        icon: TAB_ICON_MAP.simulator,
        group: 'lab',
    },
    {
        id: 'learning',
        label: 'Casos para entrenar',
        title: 'Aprendizaje sugerido',
        description: 'Consultas con senal de baja confianza o frustracion que pueden convertirse en entrenamiento.',
        operatorCue: 'Usa esta vista para convertir friccion repetida en reglas o cambios de conocimiento.',
        icon: TAB_ICON_MAP.learning,
        group: 'lab',
    },
];

const TAB_DEFINITION_MAP = TAB_DEFINITIONS.reduce<Record<CesarinTabId, CesarinTabDefinition>>((acc, tab) => {
    acc[tab.id] = tab;
    return acc;
}, {} as Record<CesarinTabId, CesarinTabDefinition>);

const SHELL_SHORTCUTS: Array<{ id: CesarinTabId; label: string; description: string }> = [
    {
        id: 'pilot',
        label: 'Leer hoy',
        description: 'Ve primero las interacciones reales, misses y rescates.',
    },
    {
        id: 'improvements',
        label: 'Cerrar follow-ups',
        description: 'Asigna, mueve de estado y cierra con evidencia.',
    },
    {
        id: 'knowledge',
        label: 'Ajustar contenido',
        description: 'Corrige conocimiento, notas y contexto documental.',
    },
];

export function AdminCesarinOS() {
    const [activeTab, setActiveTab] = useState<NavTab['id']>('pilot');
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
    const [showActivityLog, setShowActivityLog] = useState(false);

    const { signalStates, markSignal } = useCesarinSignalStates();
    const { activityLog, logAction, clearLog } = useCesarinActivityLog();

    // Operator identity — used for shared action attribution
    const { user } = useAuth();
    const operatorEmail = user?.email ?? null;

    /**
     * Stable wrapper: enriches every logAction call with actor + module context.
     * All internal handlers call this instead of logAction directly.
     */
    const logAdminAction = useCallback((
        label:      string,
        detail?:    string,
        target_ref?: string | null
    ) => {
        logAction(label, detail, {
            actor:      operatorEmail,
            module:     'cesarin_os',
            target_ref: target_ref ?? null,
        });
    }, [logAction, operatorEmail]);

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

        // Write-path diagnostic — runs once on mount, logs to browser console.
        // Open DevTools → Console and filter '[cesarin-trace]' to see results.
        probeCesarinTrace().catch(() => {});
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
            const target = rules.find(r => r.id === id);
            logAdminAction(
                !currentStatus ? 'Directriz activada' : 'Directriz pausada',
                target?.content?.slice(0, 60),
                target?.content?.slice(0, 60)
            );
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
            logAdminAction('Directriz creada', newRule.content.slice(0, 60), newRule.content.slice(0, 60));
            setNewRule({ content: '', category: 'personalidad' });
            toast.success('Nueva regla activada');
        } catch (error) {
            console.error('Error adding rule:', error);
            toast.error('Error al crear regla');
        } finally {
            setIsLoading(false);
        }
    };

    const updateRule = useCallback(async (id: string, updates: { content: string; category: string }) => {
        try {
            const { error } = await supabase
                .from('ai_rules')
                .update({ content: updates.content, category: updates.category })
                .eq('id', id);
            if (error) throw error;
            setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
            logAdminAction('Directriz editada', updates.content.slice(0, 60), updates.content.slice(0, 60));
            toast.success('Directriz actualizada');
        } catch (_err) {
            toast.error('Error al actualizar directriz');
            throw _err;
        }
    }, [supabase, logAdminAction]);

    const createImprovementForLearning = useCallback(async (item: LearningItem): Promise<{ ref_label?: string } | void> => {
        if (!item.id) {
            toast.error('Esta señal no tiene ID de origen. No se puede abrir mejora.');
            throw new Error('missing_id');
        }
        try {
            const lane = item.frustration_detected ? 'rule' as const : 'other' as const;
            const severity = item.frustration_detected ? 'high' as const : 'medium' as const;
            const title = `Señal de friccion: "${item.query.slice(0, 80)}"`;
            const result = await createImprovementItem({
                analytics_id: item.id,
                lane,
                title,
                severity,
                summary: `Detectado en piloto. Intencion: ${item.detected_intent ?? 'desconocida'}. Frustracion: ${item.frustration_detected ? 'si' : 'no'}.`,
            });
            if (result === null) {
                toast('Ya existe una mejora para esta señal.', { icon: '⚠️' });
            } else {
                logAdminAction('Señal → Mejora', title.slice(0, 60), title.slice(0, 60));
                toast.success('Mejora abierta en Cola de trabajo.');
                return { ref_label: title.slice(0, 60) };
            }
        } catch (err) {
            if ((err as any)?.message !== 'missing_id') {
                toast.error('Error al crear mejora');
            }
            throw err;
        }
    }, [logAdminAction]);

    const handleMarkSignal = useCallback((id: string, state: SignalState) => {
        markSignal(id, state, operatorEmail);
        const statusLabels: Record<string, string> = {
            convertida_regla:  'Señal → Directriz',
            convertida_mejora: 'Señal → Mejora',
            descartada:        'Señal descartada',
            revisada:          'Señal revisada',
            resuelta:          'Señal resuelta',
        };
        logAdminAction(
            statusLabels[state.status] ?? 'Señal procesada',
            state.ref_label,
            state.ref_label ?? null
        );
    }, [markSignal, logAdminAction, operatorEmail]);

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
                .select('id, query, response_text, created_at')
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

    const activeTabDefinition = TAB_DEFINITION_MAP[activeTab];
    const activeGroup = TAB_GROUPS.find(group => group.id === activeTabDefinition.group);
    const ActiveTabIcon = activeTabDefinition.icon;

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'persona':
                return <TabPersona config={config} setConfig={setConfig} isLoading={isLoading} onSave={handleSaveConfig} />;
            case 'knowledge':
                return <TabKnowledge products={products} productSearch={productSearch} setProductSearch={setProductSearch} onUpdateProduct={updateProductAI} />;
            case 'rules':
                return <TabRules rules={rules} isLoading={isLoading} onToggle={toggleRule} onUpdate={updateRule} newRule={newRule} setNewRule={setNewRule} onAdd={addRule} />;
            case 'simulator':
                return (
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
                );
            case 'learning':
                return (
                    <TabLearning
                        learningItems={learningItems}
                        signalStates={signalStates}
                        onMarkSignal={handleMarkSignal}
                        onCreateRule={async (q, f, intent) => {
                            if (!config.id) { toast.error('Configuracion no disponible'); return; }
                            const content = `Mejorar respuesta para: "${q}".${intent ? ` Intencion detectada: ${intent}.` : ''}`;
                            const category = f ? 'soporte' : 'ventas';
                            const { data, error } = await supabase
                                .from('ai_rules')
                                .insert([{ config_id: config.id, content, category, is_enabled: true }])
                                .select()
                                .single();
                            if (error) { toast.error('Error al crear directriz'); throw error; }
                            setRules(prev => [data as AIRule, ...prev]);
                            logAdminAction('Señal → Directriz', content.slice(0, 60), content.slice(0, 60));
                            toast.success('Directriz creada. Revisa Reglas para editarla si es necesario.');
                            return { ref_label: content.slice(0, 60) };
                        }}
                        onCreateImprovement={createImprovementForLearning}
                    />
                );
            case 'interventions':
                return <TabInterventions />;
            case 'analytics':
                return <TabAnalytics />;
            case 'quality':
                return <TabQuality />;
            case 'pilot':
                return <TabPilot onReview={handleReviewInteraction} />;
            case 'improvements':
                return <TabImprovements />;
            case 'concepts':
                return <TabConcepts />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0a0a0f] p-10 shadow-2xl">
                <div className="absolute right-0 top-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-vape-500/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-[100px]" />

                <div className="relative space-y-8">
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex items-start gap-6">
                            <div className="relative shrink-0">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-vape-500 text-white shadow-[0_20px_50px_rgba(168,85,247,0.35)]">
                                    <Bot className="h-10 w-10" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-4 border-[#0a0a0f] bg-emerald-500" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-4xl font-black tracking-tighter text-white">Cesarin OS</h1>
                                    <span className="rounded-full border border-vape-500/20 bg-vape-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-vape-400">
                                        Consola operativa
                                    </span>
                                </div>
                                <p className="max-w-2xl text-sm font-medium leading-relaxed text-theme-secondary">
                                    Lee el estado del negocio, revisa respuestas, decide follow-ups y ajusta conocimiento sin perderte en diagnosticos que no necesitas ver todo el tiempo.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-stretch gap-4 xl:min-w-[360px]">
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
                                        Storefront AI
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className={cn('h-2 w-2 rounded-full', storeSettings?.is_ai_assistant_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                                        <span className={cn('text-xs font-black uppercase tracking-wider', storeSettings?.is_ai_assistant_enabled ? 'text-emerald-400' : 'text-red-400')}>
                                            {storeSettings?.is_ai_assistant_enabled ? 'Activo en tienda' : 'Pausado en tienda'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[11px] text-white/35">
                                        Control global de visibilidad. El piloto sigue respetando su propia compuerta.
                                    </p>
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
                                    title={storeSettings?.is_ai_assistant_enabled ? 'Desactivar IA en tienda' : 'Activar IA en tienda'}
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
                                className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-vape-500 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar configuracion base
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-vape-400">Vista activa</div>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="rounded-2xl bg-vape-500/10 p-3 text-vape-400">
                                    <ActiveTabIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white">{activeTabDefinition.title}</div>
                                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/25">{activeGroup?.label}</div>
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-white/45">{activeTabDefinition.description}</p>
                        </div>

                        <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">Que mirar ahora</div>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">{activeTabDefinition.operatorCue}</p>
                        </div>

                        <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">Ruta rapida</div>
                            <div className="mt-3 flex flex-col gap-2">
                                {SHELL_SHORTCUTS.map(shortcut => (
                                    <button
                                        key={shortcut.id}
                                        onClick={() => setActiveTab(shortcut.id)}
                                        className={cn(
                                            'rounded-2xl border px-4 py-3 text-left transition-all',
                                            activeTab === shortcut.id
                                                ? 'border-vape-500/30 bg-vape-500/10'
                                                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]',
                                        )}
                                    >
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{shortcut.label}</div>
                                        <div className="mt-1 text-xs text-white/35">{shortcut.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {TAB_GROUPS.map(group => (
                    <div key={group.id} className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl">
                        <div className="px-2 pb-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">{group.label}</div>
                            <p className="mt-1 text-xs leading-relaxed text-white/30">{group.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {TAB_DEFINITIONS.filter(tab => tab.group === group.id).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all',
                                        activeTab === tab.id
                                            ? 'border-vape-500/30 bg-vape-500 text-white shadow-[0_10px_20px_rgba(168,85,247,0.2)]'
                                            : 'border-white/5 bg-white/[0.02] text-white/45 hover:bg-white/[0.05] hover:text-white/70',
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-widest">{tab.label}</div>
                                        <div className="text-[10px] text-inherit/70">{tab.title}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-[3rem] border border-white/5 bg-white/[0.02]">
                <div className="border-b border-white/5 px-8 py-8">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-3xl space-y-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                                {activeGroup?.label}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-vape-500/10 p-3 text-vape-400">
                                    <ActiveTabIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-white">{activeTabDefinition.title}</h2>
                                    <p className="mt-1 text-sm text-theme-secondary">{activeTabDefinition.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-md rounded-[2rem] border border-white/5 bg-black/20 p-5">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-vape-400">Lectura recomendada</div>
                            <p className="mt-2 text-sm leading-relaxed text-white/65">{activeTabDefinition.operatorCue}</p>
                        </div>
                    </div>

                    {activeTabDefinition.translator && activeTabDefinition.translator.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {activeTabDefinition.translator.map(item => (
                                <span
                                    key={item}
                                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold text-white/50"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8">
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {renderActiveTab()}
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
                                offered_products: (reviewInteraction as any).offered_products ?? null,
                            } : null}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <button
                    onClick={() => setActiveTab('pilot')}
                    className="rounded-[2rem] border border-white/5 bg-indigo-500/5 p-6 text-left transition-all hover:bg-indigo-500/10"
                >
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">Operacion diaria</div>
                    <div className="mt-2 text-lg font-black text-white">Empieza por el piloto</div>
                    <p className="mt-2 text-sm text-white/45">Si no sabes por donde arrancar, esta es la vista mas cercana a la realidad del negocio.</p>
                </button>

                <button
                    onClick={() => setActiveTab('improvements')}
                    className="rounded-[2rem] border border-white/5 bg-emerald-500/5 p-6 text-left transition-all hover:bg-emerald-500/10"
                >
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">Trabajo accionable</div>
                    <div className="mt-2 text-lg font-black text-white">No dejes hallazgos sueltos</div>
                    <p className="mt-2 text-sm text-white/45">Cola de mejoras e intervenciones ya no compiten por el mismo rol: una cierra seguimiento, la otra propone accion.</p>
                </button>

                <button
                    onClick={() => setActiveTab('knowledge')}
                    className="rounded-[2rem] border border-white/5 bg-vape-500/5 p-6 text-left transition-all hover:bg-vape-500/10"
                >
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-vape-400">Sistema base</div>
                    <div className="mt-2 text-lg font-black text-white">Ajusta contenido, no intuiciones</div>
                    <p className="mt-2 text-sm text-white/45">Cuando el problema sea de conocimiento, reglas o compatibilidad, entra por configuracion y no por el cockpit.</p>
                </button>
            </div>

            {/* Activity Log — collapsible, shared across operators via DB */}
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
                <button
                    onClick={() => setShowActivityLog(v => !v)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Actividad reciente</span>
                        {activityLog.length > 0 && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-black text-white/40">
                                {activityLog.length}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={cn('h-4 w-4 text-white/20 transition-transform duration-200', showActivityLog && 'rotate-180')} />
                </button>

                {showActivityLog && (
                    <div className="border-t border-white/5 px-6 pb-5 pt-4 space-y-3">
                        <p className="text-[10px] text-white/20 pb-2">Registro compartido: quién cambió qué, cuándo. Visible para todos los operadores.</p>
                        {activityLog.length === 0 ? (
                            <p className="text-xs text-white/25 py-4 text-center">Sin actividad registrada todavia.</p>
                        ) : (
                            <>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {activityLog.slice(0, 10).map(entry => (
                                        <div key={entry.id} className="flex items-start gap-3 py-1">
                                            <span className="text-[10px] text-white/20 font-bold shrink-0 pt-0.5 tabular-nums w-20">
                                                {new Date(entry.ts).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <span className="text-[11px] font-semibold text-white/55">{entry.label}</span>
                                                    {entry.actor && (
                                                        <span className="text-[9px] font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                                                            {entry.actor}
                                                        </span>
                                                    )}
                                                </div>
                                                {(entry.target_ref || entry.detail) && (
                                                    <p className="text-[10px] text-white/25 truncate">
                                                        {entry.target_ref ?? entry.detail}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-1">
                                    <button
                                        onClick={clearLog}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-white/25 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white/50 transition-all"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Limpiar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminCesarinOS;
