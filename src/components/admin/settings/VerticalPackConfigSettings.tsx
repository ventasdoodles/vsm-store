import { useState, useEffect } from 'react';
import type { SettingsChangeHandler, SettingsFormData } from './settings.types';
import type { VerticalPackConfig } from '@/config/productization/types';
import { Package, Settings, LayoutGrid, Terminal, Plus, Trash2, ChevronRight, Layers, Sparkles, Box, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface Props {
    formData: SettingsFormData;
    handleChange: SettingsChangeHandler;
}

const DEFAULT_CONFIG: VerticalPackConfig = {
    id: 'default_pack',
    label: 'Nueva Tienda',
    description: '',
    sections: [],
    categoryTaxonomyHints: [],
    productAttributeHints: [],
    attributeSchema: {
        suggestedSpecsByCategorySlug: {},
        defaultSpecsBySectionSlug: {},
        specKeyNormalization: {},
    },
    compatibilityRuleLabels: [],
    recommendationRuleLabels: [],
    legalPolicyCaveatLabels: [],
    marketing: {
        homeHero: {
            primaryCopy: {
                title: '',
                subtitle: '',
                description: '',
                tag: '',
            },
        },
        categoryShowcase: {
            fallbackCategories: [],
        },
    },
    fixtureMetadata: {
        demoProductFamilies: [],
        demoCategorySlugs: [],
        fallbackImageKeys: [],
    },
};

export function VerticalPackConfigSettings({ formData, handleChange }: Props) {
    const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'sections' | 'advanced'>('general');
    const [config, setConfig] = useState<VerticalPackConfig | null>(null);
    const [parseError, setParseError] = useState(false);

    useEffect(() => {
        try {
            if (!formData.vertical_pack_config || formData.vertical_pack_config.trim() === '') {
                setConfig(DEFAULT_CONFIG);
                setParseError(false);
                return;
            }
            const parsed = JSON.parse(formData.vertical_pack_config);
            setConfig({ ...DEFAULT_CONFIG, ...parsed, marketing: { ...DEFAULT_CONFIG.marketing, ...(parsed.marketing || {}) } });
            setParseError(false);
        } catch (e) {
            setParseError(true);
            setConfig(null);
            setActiveTab('advanced');
        }
    }, [formData.vertical_pack_config]);

    const handleObjectChange = (updatedConfig: VerticalPackConfig) => {
        const jsonString = JSON.stringify(updatedConfig, null, 2);
        handleChange({
            target: {
                name: 'vertical_pack_config',
                value: jsonString,
                type: 'textarea',
            },
        } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    const updateGeneral = (field: keyof VerticalPackConfig, value: string) => {
        if (!config) return;
        handleObjectChange({ ...config, [field]: value });
    };

    const updateHero = (field: keyof VerticalPackConfig['marketing']['homeHero']['primaryCopy'], value: string) => {
        if (!config) return;
        const newConfig = { ...config };
        if (!newConfig.marketing) newConfig.marketing = DEFAULT_CONFIG.marketing;
        if (!newConfig.marketing.homeHero) newConfig.marketing.homeHero = DEFAULT_CONFIG.marketing.homeHero;
        if (!newConfig.marketing.homeHero.primaryCopy) newConfig.marketing.homeHero.primaryCopy = DEFAULT_CONFIG.marketing.homeHero.primaryCopy;
        
        newConfig.marketing.homeHero.primaryCopy[field] = value;
        handleObjectChange(newConfig);
    };

    const updateSection = (index: number, field: string, value: string) => {
        if (!config) return;
        const newConfig = { ...config };
        if (!newConfig.sections) newConfig.sections = [];
        const currentSection = newConfig.sections[index] || {
            slug: '', label: '', shortLabel: '', routePrefix: '', description: '', seoDescription: '', themeToken: ''
        };
        newConfig.sections[index] = { ...currentSection, [field]: value } as any;
        handleObjectChange(newConfig);
    };

    const addSection = () => {
        if (!config) return;
        const newConfig = { ...config };
        if (!newConfig.sections) newConfig.sections = [];
        newConfig.sections.push({
            slug: `nueva-seccion-${newConfig.sections.length + 1}`,
            label: 'Nueva Sección',
            shortLabel: 'Sección',
            routePrefix: '/nueva',
            description: '',
            seoDescription: '',
            themeToken: 'blue',
        });
        handleObjectChange(newConfig);
    };

    const removeSection = (index: number) => {
        if (!config) return;
        const newConfig = { ...config };
        newConfig.sections.splice(index, 1);
        handleObjectChange(newConfig);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings, desc: 'Identidad básica' },
        { id: 'hero', label: 'Marketing Hero', icon: Sparkles, desc: 'Impacto visual principal' },
        { id: 'sections', label: 'Secciones', icon: Layers, desc: 'Estructura de catálogo' },
        { id: 'advanced', label: 'JSON Avanzado', icon: Terminal, desc: 'Control total de datos' },
    ] as const;

    // Componente de Input Premium
    const PremiumInput = ({ label, value, onChange, icon: Icon, placeholder, mono = false }: any) => (
        <div className="relative group">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 ml-1 transition-colors group-focus-within:text-violet-400">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:border-violet-500/50 outline-none focus:bg-violet-500/5 transition-all shadow-inner focus:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] ${mono ? 'font-mono text-emerald-400 text-xs' : ''}`}
                />
            </div>
        </div>
    );

    const PremiumTextarea = ({ label, value, onChange, rows = 3, placeholder }: any) => (
        <div className="relative group">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 ml-1 transition-colors group-focus-within:text-violet-400">
                {label}
            </label>
            <textarea
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-violet-500/50 outline-none focus:bg-violet-500/5 transition-all shadow-inner focus:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] resize-y"
            />
        </div>
    );

    return (
        <section className="col-span-1 lg:col-span-2 relative mt-8">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/20 blur-[128px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[128px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="rounded-[2rem] bg-[#0c0d14]/80 backdrop-blur-3xl border border-white/10 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.8)] focus-within:border-violet-500/30 transition-all duration-500 flex flex-col lg:flex-row min-h-[700px]">
                
                {/* Left Sidebar Navigator */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.01] flex flex-col relative z-10">
                    <div className="p-8 pb-6">
                        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/10 text-white mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                            <Package className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                            Arquitectura<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Vertical</span>
                        </h2>
                        <p className="text-sm text-white/40 font-medium mt-3 leading-relaxed">
                            Diseña la identidad, estructura y persuasión de tu modelo de negocio de manera centralizada.
                        </p>
                    </div>

                    <div className="flex-1 px-4 pb-8 flex flex-col gap-2 overflow-y-auto">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            const isDisabled = parseError && tab.id !== 'advanced';
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                                    disabled={isDisabled}
                                    className={`relative flex items-center gap-4 w-full p-4 rounded-2xl text-left transition-all duration-300 group ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/[0.04]'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent border border-violet-500/20 rounded-2xl"
                                            initial={false}
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className={`relative z-10 p-2 rounded-xl border transition-colors duration-300 ${isActive ? 'bg-violet-500/20 border-violet-500/30 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-black/50 border-white/5 text-white/50 group-hover:text-white/80 group-hover:border-white/10'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="relative z-10 flex-1">
                                        <div className={`font-bold text-sm transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                                            {tab.label}
                                        </div>
                                        <div className={`text-xs mt-0.5 transition-colors ${isActive ? 'text-violet-200/60' : 'text-white/30'}`}>
                                            {tab.desc}
                                        </div>
                                    </div>
                                    {isActive && <ChevronRight className="relative z-10 h-4 w-4 text-violet-400" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 relative z-10 bg-gradient-to-b from-transparent to-black/20 overflow-y-auto">
                    <div className="p-8 lg:p-12 min-h-full">
                        
                        {parseError && activeTab !== 'advanced' && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8 font-medium flex items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                <div className="p-2 bg-red-500/20 rounded-full">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div>
                                    <strong className="block text-red-300 text-base mb-1">Error de parseo JSON</strong>
                                    La configuración actual está corrupta. Dirígete a "JSON Avanzado" para repararla.
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && config && (
                                <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8 max-w-3xl">
                                    <div className="mb-10">
                                        <h3 className="text-2xl font-bold text-white mb-2">Identidad General</h3>
                                        <p className="text-white/50 text-sm">Define cómo el sistema identifica internamente tu tienda y el nombre base que se mostrará en lugares neutros.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <PremiumInput 
                                            label="ID de Configuración" 
                                            value={config.id || ''} 
                                            onChange={(e: any) => updateGeneral('id', e.target.value)} 
                                            icon={Terminal}
                                            mono
                                        />
                                        <PremiumInput 
                                            label="Nombre Corto (Label)" 
                                            value={config.label || ''} 
                                            onChange={(e: any) => updateGeneral('label', e.target.value)} 
                                            icon={Box}
                                        />
                                    </div>
                                    <PremiumTextarea 
                                        label="Descripción del Propósito de la Tienda" 
                                        value={config.description || ''} 
                                        onChange={(e: any) => updateGeneral('description', e.target.value)} 
                                        rows={4}
                                    />
                                </motion.div>
                            )}

                            {activeTab === 'hero' && config?.marketing?.homeHero?.primaryCopy && (
                                <motion.div key="hero" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8 max-w-3xl">
                                    <div className="mb-10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-transparent p-6 rounded-2xl border border-violet-500/20">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Impacto Visual Hero</h3>
                                            <p className="text-violet-200/60 text-sm">El primer mensaje que ven tus clientes al entrar a la tienda.</p>
                                        </div>
                                        <Sparkles className="w-12 h-12 text-violet-400/20" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <PremiumInput 
                                            label="Título Principal (H1)" 
                                            value={config.marketing.homeHero.primaryCopy.title || ''} 
                                            onChange={(e: any) => updateHero('title', e.target.value)} 
                                            placeholder="Ej. Encuentra tu estilo"
                                        />
                                        <PremiumInput 
                                            label="Subtítulo Destacado" 
                                            value={config.marketing.homeHero.primaryCopy.subtitle || ''} 
                                            onChange={(e: any) => updateHero('subtitle', e.target.value)} 
                                            placeholder="Ej. La mejor colección de temporada"
                                        />
                                    </div>
                                    <PremiumTextarea 
                                        label="Párrafo Descriptivo Persuasivo" 
                                        value={config.marketing.homeHero.primaryCopy.description || ''} 
                                        onChange={(e: any) => updateHero('description', e.target.value)} 
                                        rows={4}
                                    />
                                    <div className="w-full md:w-1/2">
                                        <PremiumInput 
                                            label="Etiqueta Superior (Badge)" 
                                            value={config.marketing.homeHero.primaryCopy.tag || ''} 
                                            onChange={(e: any) => updateHero('tag', e.target.value)} 
                                            placeholder="Ej. NUEVO, PROMO, HOT"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'sections' && config && (
                                <motion.div key="sections" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8 max-w-5xl">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Estructura de Secciones</h3>
                                            <p className="text-white/50 text-sm">Organiza las grandes divisiones de tu catálogo en tarjetas visuales independientes.</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={addSection} 
                                            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-xl font-bold text-sm text-white transition-all overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                                            <span className="relative z-10">Añadir Sección</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        <AnimatePresence>
                                            {(!config.sections || config.sections.length === 0) && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full p-12 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/30 bg-white/[0.01]">
                                                    <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <p className="text-lg font-medium">No has definido ninguna sección todavía.</p>
                                                    <p className="text-sm mt-1">Crea tu primera sección para empezar a estructurar la tienda.</p>
                                                </motion.div>
                                            )}
                                            
                                            {config.sections?.map((section, idx) => (
                                                <motion.div 
                                                    key={idx} 
                                                    initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                                                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                                                    className="group bg-[#1a1b26]/50 backdrop-blur-md border border-white/5 hover:border-violet-500/30 rounded-3xl p-6 relative shadow-xl transition-all focus-within:border-violet-500/50 focus-within:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
                                                >
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeSection(idx)} 
                                                        className="absolute top-5 right-5 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                                        title="Eliminar sección"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    
                                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5 pr-10">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-lg text-white/80 shadow-inner">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <input 
                                                                type="text" 
                                                                value={section.label || ''} 
                                                                onChange={(e) => updateSection(idx, 'label', e.target.value)} 
                                                                placeholder="Nombre de la sección..."
                                                                className="bg-transparent border-none text-xl font-bold text-white focus:outline-none focus:ring-0 p-0 placeholder-white/20 w-full" 
                                                            />
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-mono bg-emerald-400/10 px-2 py-0.5 rounded">SLUG</span>
                                                                <input 
                                                                    type="text" 
                                                                    value={section.slug || ''} 
                                                                    onChange={(e) => updateSection(idx, 'slug', e.target.value)} 
                                                                    placeholder="ej-mi-seccion"
                                                                    className="bg-transparent border-none text-xs font-mono text-emerald-400 focus:outline-none focus:ring-0 p-0 placeholder-emerald-400/30 w-full" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-5">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5 ml-1">Etiqueta Corta</label>
                                                                <input type="text" value={section.shortLabel || ''} onChange={(e) => updateSection(idx, 'shortLabel', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500/50 outline-none focus:bg-violet-500/5 transition-all" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5 ml-1">Ruta Base</label>
                                                                <input type="text" value={section.routePrefix || ''} onChange={(e) => updateSection(idx, 'routePrefix', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 font-mono text-blue-300 text-sm focus:border-violet-500/50 outline-none focus:bg-violet-500/5 transition-all" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5 ml-1">Descripción Breve</label>
                                                            <textarea value={section.description || ''} onChange={(e) => updateSection(idx, 'description', e.target.value)} rows={2} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-white/70 text-sm focus:border-violet-500/50 outline-none focus:bg-violet-500/5 transition-all resize-none" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'advanced' && (
                                <motion.div key="advanced" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                                JSON Raw <span className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/30">Modo Desarrollador</span>
                                            </h3>
                                            <p className="text-white/50 text-sm">Control total sobre el esquema subyacente. Útil para copiar/pegar configuraciones enteras.</p>
                                        </div>
                                    </div>
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent pointer-events-none rounded-3xl z-10 h-8" />
                                        <textarea
                                            name="vertical_pack_config"
                                            value={formData.vertical_pack_config}
                                            onChange={handleChange}
                                            spellCheck={false}
                                            className={`w-full h-[500px] bg-[#0a0a0f] border-2 rounded-3xl p-8 pt-10 font-mono text-sm leading-relaxed focus:outline-none transition-all shadow-inner resize-y ${parseError ? 'border-red-500/50 text-red-400 focus:border-red-500 focus:shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-white/5 text-emerald-400/90 focus:border-violet-500/50 focus:shadow-[0_0_40px_rgba(139,92,246,0.15)]'}`}
                                            placeholder='{"id": "...", ...}'
                                        />
                                        {parseError && (
                                            <div className="absolute bottom-6 right-8 text-red-400 text-xs font-bold bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 backdrop-blur-md">
                                                Error de Sintaxis Detectado
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
