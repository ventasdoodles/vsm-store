import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bot, 
    Zap, 
    ShieldCheck, 
    Brain, 
    MessageSquare, 
    Database, 
    Target, 
    TrendingUp, 
    RefreshCcw,
    Save,
    Play,
    AlertCircle,
    Search,
    CheckCircle2,
    Layers,
    Coffee,
    ArrowRight,
    Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

/**
 * CESARIN OS - Command Center
 * Wave 158: The "Sales Operating System"
 */

interface AIConfig {
    id: string;
    name: string;
    voice_tone: string;
    behavior_mode: 'vendedor' | 'informativo' | 'soporte';
    welcome_message: string;
    temperature: number;
    top_p: number;
}

interface AIRule {
    id: string;
    category: string;
    content: string;
    is_enabled: boolean;
}

export function AdminCesarinOS() {
    type TabType = 'persona' | 'knowledge' | 'rules' | 'analytics' | 'simulator' | 'learning';
    const [activeTab, setActiveTab] = useState<TabType>('persona');
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<AIConfig>({
        id: '',
        name: 'Cesarin',
        voice_tone: 'Asesor experto, vibrante y profesional',
        behavior_mode: 'vendedor',
        welcome_message: '¡Hola! Soy Cesarin, tu asistente de VSM.',
        temperature: 0.7,
        top_p: 0.9
    });
    const [rules, setRules] = useState<AIRule[]>([]);
    const [products, setProducts] = useState<any[]>([]); 
    const [learningItems, setLearningItems] = useState<any[]>([]);
    const [newRule, setNewRule] = useState({ content: '', category: 'personalidad' });
    const [productSearch, setProductSearch] = useState('');
    const [simQuery, setSimQuery] = useState('');
    const [simHistory, setSimHistory] = useState<{role: string, content: string}[]>([]);
    const [simDebug, setSimDebug] = useState<any>(null);

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
        if (!error && data) setRules(data);
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
                query = query.limit(30);
            }

            const { data, error } = await query;
            if (!error && data) setProducts(data);
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
            if (data) setConfig(data);
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
            setLearningItems(data || []);
        } catch (error) {
            console.error('Error fetching learning items:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!simQuery.trim()) return;
        
        const userMsg = { role: 'user', content: simQuery };
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
            
            // Reparación del Simulador: Cesarin devuelve un objeto con { text, ... } o { message, ... }
            const responseText = data?.text || data?.message;
            if (responseText) {
                setSimHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
                if (data.debug) setSimDebug(data.debug);
            } else if (typeof data === 'string') {
                // Fallback si por alguna razón devuelve texto plano
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
            setRules(prev => [data, ...prev]);
            setNewRule({ content: '', category: 'personalidad' });
            toast.success('Nueva regla activada');
        } catch (error) {
            console.error('Error adding rule:', error);
            toast.error('Error al crear regla');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Sincroniza campos específicos de productos con la base de datos.
     * Estos campos (ai_is_featured, ai_sales_note, ai_exclude) son los que
     * alimentan el razonamiento de Cesarin.
     */
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

    const handleSave = async () => {
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Premium */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0a0a0f] to-[#12121a] p-8 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-vape-500/10 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-vape-600/5 blur-[80px]" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-3xl bg-vape-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                                <Bot className="h-10 w-10 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-[#0a0a0f] shadow-lg animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                Cesarin OS
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-vape-500/20 text-vape-400 px-3 py-1 rounded-full border border-vape-500/30">
                                    V2.0 Core
                                </span>
                            </h1>
                            <p className="text-theme-secondary text-sm mt-1 max-w-md">
                                Centro de mando del Sistema Operativo de Ventas. Gestiona IA, reglas y conocimiento de negocio en tiempo real.
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="group relative flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-vape-500 text-white font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Sincronizar Cambios
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-3xl bg-white/[0.03] border border-white/5 w-fit">
                {[
                    { id: 'persona', label: '1. Personalidad', icon: Brain },
                    { id: 'knowledge', label: '2. Conocimiento', icon: Database },
                    { id: 'rules', label: '3. Reglas', icon: ShieldCheck },
                    { id: 'simulator', label: '4. Simulador', icon: Play },
                    { id: 'learning', label: '5. Aprendizaje', icon: Coffee },
                    { id: 'analytics', label: '6. Analítica', icon: TrendingUp },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all",
                            activeTab === tab.id 
                                ? "bg-white/10 text-white shadow-xl border border-white/10" 
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-vape-400" : "text-white/20")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'persona' && (
                            <motion.div 
                                key="persona"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-black text-white flex items-center gap-3">
                                            <Coffee className="h-5 w-5 text-vape-400" />
                                            Identidad del Asistente
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Nombre Público</label>
                                                <input 
                                                    type="text" 
                                                    value={config.name}
                                                    onChange={(e) => setConfig({...config, name: e.target.value})}
                                                    placeholder="Ej: Cesarin"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-vape-500/50 focus:bg-white/[0.08] transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Modo de Comportamiento</label>
                                                <select 
                                                    value={config.behavior_mode}
                                                    onChange={(e) => setConfig({...config, behavior_mode: e.target.value as AIConfig['behavior_mode']})}
                                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-vape-500/50 transition-all appearance-none"
                                                >
                                                    <option value="vendedor">Modo Vendedor (Agresivo & Persuasivo)</option>
                                                    <option value="informativo">Modo Informativo (Educativo & Técnico)</option>
                                                    <option value="soporte">Modo Soporte (Empático & Solucionador)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Tono de Voz & Personalidad</label>
                                        <textarea 
                                            value={config.voice_tone}
                                            onChange={(e) => setConfig({...config, voice_tone: e.target.value})}
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-vape-500/50 focus:bg-white/[0.08] transition-all"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Mensaje de Bienvenida</label>
                                        <textarea 
                                            value={config.welcome_message}
                                            onChange={(e) => setConfig({...config, welcome_message: e.target.value})}
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-vape-500/50 focus:bg-white/[0.08] transition-all"
                                        />
                                    </div>

                                    {/* Wave 159: Neural Parameters */}
                                    <div className="pt-6 border-t border-white/5 space-y-6">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-vape-400" />
                                            Parámetros Neuronales (Avanzado)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Temperatura (Creatividad)</label>
                                                    <span className="text-xs font-mono text-vape-400">{config.temperature || 0.7}</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="1" step="0.1"
                                                    value={config.temperature || 0.7}
                                                    onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                                                    className="w-full accent-vape-500"
                                                />
                                                <p className="text-[10px] text-white/20 italic">0 = Precisión absoluta, 1 = Creatividad máxima.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Top P (Diversidad)</label>
                                                    <span className="text-xs font-mono text-vape-400">{config.top_p || 0.9}</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="1" step="0.05"
                                                    value={config.top_p || 0.9}
                                                    onChange={(e) => setConfig({...config, top_p: parseFloat(e.target.value)})}
                                                    className="w-full accent-vape-500"
                                                />
                                                <p className="text-[10px] text-white/20 italic">Controla la diversidad del vocabulario seleccionado.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'rules' && (
                            <motion.div 
                                key="rules"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5 text-vape-400" />
                                        Reglas de Operación
                                    </h2>
                                    <button className="px-4 py-2 rounded-xl bg-vape-500/20 text-vape-400 text-xs font-bold border border-vape-500/30 hover:bg-vape-500/30 transition-all">
                                        + Nueva Regla
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {/* New Rule Form */}
                                    <div className="p-8 rounded-[2rem] bg-vape-500/5 border border-vape-500/10 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-vape-500/20 flex items-center justify-center">
                                                <Zap className="h-4 w-4 text-vape-400" />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Entrenar Nueva Regla</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-3">
                                                <input 
                                                    type="text" 
                                                    value={newRule.content}
                                                    onChange={(e) => setNewRule({...newRule, content: e.target.value})}
                                                    placeholder="Ej: Si preguntan por CBD, mencionar que solo es para mayores de 18..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-vape-500/50 transition-all"
                                                />
                                            </div>
                                            <select 
                                                value={newRule.category}
                                                onChange={(e) => setNewRule({...newRule, category: e.target.value})}
                                                className="bg-[#0a0a0f] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white/70 focus:outline-none transition-all"
                                            >
                                                <option value="personalidad">Personalidad</option>
                                                <option value="logistica">Logística</option>
                                                <option value="ventas">Ventas</option>
                                                <option value="integralidad">Legal/Seguridad</option>
                                            </select>
                                        </div>
                                        <button 
                                            onClick={addRule}
                                            disabled={isLoading || !newRule.content.trim()}
                                            className="w-full py-3.5 rounded-2xl bg-vape-500 text-black text-xs font-black uppercase tracking-widest hover:bg-vape-400 transition-all disabled:opacity-50"
                                        >
                                            Añadir Instrucción al Cerebro
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                    {rules.map((rule) => (
                                        <div key={rule.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4 transition-all hover:bg-white/[0.04]">
                                            <button 
                                                onClick={() => toggleRule(rule.id, rule.is_enabled)}
                                                className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95",
                                                    rule.is_enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/20"
                                                )}
                                            >
                                                <Target className="h-5 w-5" />
                                            </button>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-vape-400">{rule.category}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-2 w-2 rounded-full", rule.is_enabled ? "bg-emerald-500" : "bg-white/20")} />
                                                        <span className="text-[10px] font-bold text-white/40">{rule.is_enabled ? 'ACTIVA' : 'INACTIVA'}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-white/80 leading-relaxed">{rule.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {rules.length === 0 && (
                                                <AlertCircle className="h-8 w-8 text-white/20" />
                                            </div>
                                            <p className="text-theme-secondary text-sm">No hay reglas configuradas. Cesarin usará las reglas maestras por defecto.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'knowledge' && (
                            <motion.div 
                                key="knowledge"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-6 rounded-3xl bg-vape-500/5 border border-vape-500/20 text-xs text-white/60 space-y-2">
                                    <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-vape-400" /> <b>Destacado:</b> Cesarin priorizará estos productos en sus recomendaciones.</p>
                                    <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-vape-400" /> <b>Excluir IA:</b> El producto nunca será mencionado por Cesarin (útil para errores o stock crítico).</p>
                                    <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-vape-400" /> <b>Nota de Venta:</b> Instrucción secreta para la IA (ej: "Dile que es ideal para principiantes").</p>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <input 
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Buscar productos en el inventario..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-vape-500/50 focus:bg-white/[0.08] transition-all"
                                    />
                                    {isLoading && activeTab === 'knowledge' && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <RefreshCcw className="h-4 w-4 text-vape-400 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Producto</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Destacado</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Excluir IA</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Instrucción / Nota de Venta</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {products.map((p) => (
                                                <tr key={p.id} className="hover:bg-white/[0.02] transition-all group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-white text-sm">{p.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={p.ai_is_featured} 
                                                            onChange={(e) => updateProductAI(p.id, 'ai_is_featured', e.target.checked)}
                                                            className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-vape-500 focus:ring-vape-500 transition-all cursor-pointer" 
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={p.ai_exclude} 
                                                            onChange={(e) => updateProductAI(p.id, 'ai_exclude', e.target.checked)}
                                                            className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-rose-500 focus:ring-rose-500 transition-all cursor-pointer" 
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="text"
                                                            defaultValue={p.ai_sales_note || ''}
                                                            onBlur={(e) => updateProductAI(p.id, 'ai_sales_note', e.target.value)}
                                                            placeholder="Instrucción de venta..."
                                                            className="w-full bg-transparent border-b border-white/5 py-1 text-xs text-white/80 focus:outline-none focus:border-vape-500/50 transition-all"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'simulator' && (
                            <motion.div 
                                key="simulator"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                    <div className="xl:col-span-3 p-8 rounded-[2rem] bg-[#0a0a0f] border border-vape-500/20 shadow-2xl space-y-6 h-[600px] flex flex-col">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-vape-500 flex items-center justify-center">
                                                    <Bot className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-white">{config.name} Simulator</h3>
                                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Live Neural Mode</span>
                                                </div>
                                            </div>
                                            {simDebug?.frustration && (
                                                <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full border border-rose-500/30 animate-pulse">
                                                    <AlertCircle className="h-3 w-3" />
                                                    <span className="text-[10px] font-black uppercase">Frustración Detectada</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar">
                                            <div className="flex justify-start">
                                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                                    <p className="text-sm text-white/80">{config.welcome_message}</p>
                                                </div>
                                            </div>
                                            {simHistory.map((msg, i) => (
                                                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                                    <div className={cn(
                                                        "p-4 rounded-2xl max-w-[80%] text-sm",
                                                        msg.role === 'user' 
                                                            ? "bg-vape-500 text-white rounded-tr-none" 
                                                            : "bg-white/5 border border-white/5 text-white/80 rounded-tl-none"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="relative mt-auto pt-4 border-t border-white/5">
                                            <input 
                                                type="text" 
                                                value={simQuery}
                                                onChange={(e) => setSimQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                disabled={isLoading}
                                                placeholder="Escribe para probar a Cesarin..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white pr-16 focus:outline-none focus:border-vape-500/50 disabled:opacity-50"
                                            />
                                            <button 
                                                onClick={handleSendMessage}
                                                disabled={isLoading || !simQuery.trim()}
                                                className="absolute right-4 top-[1.45rem] h-10 w-10 rounded-xl bg-vape-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Explainability Sidebar (Wave 159) */}
                                    <div className="xl:col-span-1 space-y-4">
                                        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                                <Brain className="h-3 w-3" />
                                                Explicabilidad (Debug)
                                            </h4>
                                            
                                            {simDebug ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-bold text-white/30 uppercase">Intención Detectada</span>
                                                        <div className="text-xs font-black text-white bg-white/5 px-3 py-2 rounded-xl border border-white/5 capitalize">
                                                            {simDebug.intent}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-bold text-white/30 uppercase">Reglas Activas</span>
                                                        <div className="text-xs font-black text-indigo-400 bg-indigo-400/10 px-3 py-2 rounded-xl border border-indigo-400/20">
                                                            {simDebug.active_rules_count} reglas aplicadas
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-bold text-white/30 uppercase">Configuración Usada</span>
                                                        <div className="text-[10px] font-mono text-white/60 bg-black/40 p-3 rounded-xl border border-white/5">
                                                            temp: {simDebug.model_params?.temperature}<br/>
                                                            topP: {simDebug.model_params?.topP}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-12 text-center opacity-20">
                                                    <Target className="h-8 w-8 mx-auto mb-2" />
                                                    <p className="text-[10px] font-bold uppercase italic">Esperando interacción...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                                                <Users className="h-3 w-3" />
                                                Perfil de Cliente (Sim)
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-white/40">Fidelidad:</span>
                                                    <span className="text-vape-400 font-black">PLATINUM</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-white/40">Intereses:</span>
                                                    <span className="text-white font-bold">Vapeo, Frutales</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-white/40">Ticket Promedio:</span>
                                                    <span className="text-emerald-400 font-bold">$1,250 MXN</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'learning' && (
                            <motion.div 
                                key="learning"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <Bot className="h-5 w-5 text-vape-400" />
                                        Modo Aprendizaje
                                    </h2>
                                    <p className="text-sm text-white/40 max-w-2xl">
                                        Aquí aparecen las preguntas que Cesarin no pudo clasificar o donde el usuario mostró frustración. Úsalas para crear nuevas **Reglas de Operación**.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {learningItems.length > 0 ? (
                                        learningItems.map((item, i) => (
                                            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                                                        <MessageSquare className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-vape-400 transition-colors">"{item.query}"</p>
                                                        <span className="text-[10px] text-white/20 font-bold uppercase">
                                                            {new Date(item.created_at).toLocaleString()} • {item.frustration_detected ? 'FRUSTRACIÓN' : (item.detected_intent || 'DESCONOCIDO')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setNewRule({ 
                                                            content: `Corregir respuesta para: "${item.query}". La respuesta correcta debería ser...`, 
                                                            category: item.frustration_detected ? 'soporte' : 'ventas' 
                                                        });
                                                        setActiveTab('rules');
                                                    }}
                                                    className="px-4 py-2 rounded-xl bg-vape-500/10 text-vape-400 text-[10px] font-black uppercase tracking-widest border border-vape-500/20 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    Crear Regla
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-white/20 text-center py-12">No hay dudas críticas detectadas por ahora.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div 
                                key="analytics"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20">
                                        <Users className="h-8 w-8 text-indigo-400 mb-4" />
                                        <div className="text-2xl font-black text-white">1,204</div>
                                        <div className="text-xs text-indigo-400/60 font-bold uppercase tracking-widest mt-1">Interacciones Totales</div>
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20">
                                        <MessageSquare className="h-8 w-8 text-emerald-400 mb-4" />
                                        <div className="text-2xl font-black text-white">88%</div>
                                        <div className="text-xs text-emerald-400/60 font-bold uppercase tracking-widest mt-1">Sentimiento Positivo</div>
                                    </div>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 h-64 flex flex-col items-center justify-center text-center">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                        <TrendingUp className="h-6 w-6 text-white/20" />
                                    </div>
                                    <p className="text-theme-secondary text-sm max-w-xs">El gráfico de rendimiento histórico se está procesando. Revisa más tarde para ver tendencias.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Stats / Info */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-gradient-to-br from-vape-500/20 to-vape-600/5 border border-vape-500/20 p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-vape-400">Salud del Motor</span>
                            <Zap className="h-4 w-4 text-vape-400" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-white">99.8%</span>
                            <span className="text-xs text-vape-400 mb-1">Precisión</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '99.8%' }}
                                className="h-full bg-vape-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                            />
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Layers className="h-4 w-4 text-vape-400" />
                            Capas Activas
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Detección de Intención', status: 'Optimal', icon: Target },
                                { name: 'Constructor de Contexto', status: 'Active', icon: Database },
                                { name: 'Validación de Inventario', status: 'Online', icon: CheckCircle2 },
                                { name: 'Guardrails de Seguridad', status: 'Monitoring', icon: ShieldCheck },
                            ].map((layer, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <layer.icon className="h-4 w-4 text-white/20" />
                                        <span className="text-xs font-bold text-white/70">{layer.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">{layer.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60 block">Consultas Hoy</span>
                            <span className="text-xl font-black text-white">124</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminCesarinOS;
