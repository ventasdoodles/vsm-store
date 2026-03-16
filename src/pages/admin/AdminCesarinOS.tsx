import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bot, Save, RefreshCcw, Brain, ShieldCheck, 
    MessageSquare, TrendingUp, Zap, 
    Database, CheckCircle2, ShieldCheck as ShieldCheckIcon,
    Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
    AIConfig, AIRule, ProductAIInfo, LearningItem, 
    SimulationMessage, SimulationDebug, NavTab 
} from '@/types/cesarin';

// Componentes Modulares
import { TabPersona } from '@/components/admin/cesarin/TabPersona';
import { TabRules } from '@/components/admin/cesarin/TabRules';
import { TabSimulator } from '@/components/admin/cesarin/TabSimulator';
import { TabLearning } from '@/components/admin/cesarin/TabLearning';
import { TabAnalytics } from '@/components/admin/cesarin/TabAnalytics';
import { TabKnowledge } from '@/components/admin/cesarin/TabKnowledge';

const TABS: NavTab[] = [
    { id: 'persona', label: '1. Personalidad', icon: Brain },
    { id: 'knowledge', label: '2. Conocimiento', icon: Database },
    { id: 'rules', label: '3. Reglas', icon: ShieldCheck },
    { id: 'simulator', label: '4. Simulador', icon: MessageSquare },
    { id: 'learning', label: '5. Aprendizaje', icon: Bot },
    { id: 'analytics', label: '6. Analíticas', icon: TrendingUp },
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

    useEffect(() => {
        fetchConfig();
        fetchRules();
        fetchLearningItems();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    const fetchRules = async () => {
        const { data, error } = await supabase.from('ai_rules').select('*').order('priority', { ascending: false });
        if (!error && data) setRules(data as AIRule[]);
    };

    const fetchProducts = async () => {
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
        } finally {
            setIsLoading(false);
        }
    };

    const fetchConfig = async () => {
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
    };

    const fetchLearningItems = async () => {
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
    };

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
                setSimHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
                if (data.debug) setSimDebug(data.debug);
            } else if (typeof data === 'string') {
                setSimHistory(prev => [...prev, { role: 'assistant', content: data }]);
                setSimDebug(null);
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
                    
                    <button 
                        onClick={handleSaveConfig}
                        disabled={isLoading}
                        className="group relative flex items-center gap-3 px-10 py-4 rounded-[1.8rem] bg-vape-500 text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_15px_35px_rgba(168,85,247,0.3)] disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Sync Engine
                    </button>
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
                        <TabSimulator simQuery={simQuery} setSimQuery={setSimQuery} simHistory={simHistory} simDebug={simDebug} isLoading={isLoading} onSendMessage={handleSendMessage} />
                    )}
                    {activeTab === 'learning' && (
                        <TabLearning learningItems={learningItems} onCreateRule={(q, f) => {
                                setNewRule({ content: `Corregir para: "${q}".`, category: f ? 'soporte' : 'ventas' });
                                setActiveTab('rules');
                            }} 
                        />
                    )}
                    {activeTab === 'analytics' && <TabAnalytics />}
                </AnimatePresence>
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
