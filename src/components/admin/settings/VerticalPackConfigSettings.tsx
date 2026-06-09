import { useState, useEffect } from 'react';
import type { SettingsChangeHandler, SettingsFormData } from './settings.types';
import type { VerticalPackConfig } from '@/config/productization/types';
import { Package, Settings, MessageSquare, LayoutGrid, Terminal } from 'lucide-react';

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

    // Initial load and parse
    useEffect(() => {
        try {
            if (!formData.vertical_pack_config || formData.vertical_pack_config.trim() === '') {
                setConfig(DEFAULT_CONFIG);
                setParseError(false);
                return;
            }
            const parsed = JSON.parse(formData.vertical_pack_config);
            // Basic merge to avoid undefined nesting
            setConfig({ ...DEFAULT_CONFIG, ...parsed, marketing: { ...DEFAULT_CONFIG.marketing, ...(parsed.marketing || {}) } });
            setParseError(false);
        } catch (e) {
            setParseError(true);
            setConfig(null);
            // Force advanced tab if broken
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
        { id: 'general', label: 'General', icon: Settings },
        { id: 'hero', label: 'Marketing Hero', icon: MessageSquare },
        { id: 'sections', label: 'Secciones', icon: LayoutGrid },
        { id: 'advanced', label: 'JSON Avanzado', icon: Terminal },
    ] as const;

    return (
        <section className="col-span-1 lg:col-span-2 rounded-2xl bg-[#13141f] border border-white/10 overflow-hidden relative shadow-2xl transition-colors focus-within:border-accent-primary/50 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="p-6 sm:px-8 sm:pt-8 sm:pb-6 relative z-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary shadow-inner">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-theme-primary tracking-tight">
                            Personalización de la Tienda (Productización)
                        </h2>
                        <p className="text-sm text-theme-secondary font-medium mt-0.5">
                            Configura cómo se presenta tu catálogo visualmente al cliente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex px-6 sm:px-8 border-b border-white/5 bg-black/20 gap-4 overflow-x-auto relative z-10">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 px-2 border-b-2 text-sm font-bold transition-all ${
                                isActive 
                                ? 'border-accent-primary text-accent-primary' 
                                : 'border-transparent text-theme-secondary hover:text-white hover:border-white/20'
                            } ${parseError && tab.id !== 'advanced' ? 'opacity-30 cursor-not-allowed' : ''}`}
                            disabled={parseError && tab.id !== 'advanced'}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 relative z-10 flex-1 bg-black/10">
                {parseError && activeTab !== 'advanced' && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 font-medium">
                        ⚠️ Error al leer la configuración actual. Por favor, revisa la sintaxis del JSON en la pestaña "Avanzado".
                    </div>
                )}

                {activeTab === 'general' && config && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    ID de Configuración
                                </label>
                                <input
                                    type="text"
                                    value={config.id || ''}
                                    onChange={(e) => updateGeneral('id', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent-primary outline-none focus:bg-black/60 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Etiqueta (Nombre Corto)
                                </label>
                                <input
                                    type="text"
                                    value={config.label || ''}
                                    onChange={(e) => updateGeneral('label', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent-primary outline-none focus:bg-black/60 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                Descripción Interna
                            </label>
                            <textarea
                                value={config.description || ''}
                                onChange={(e) => updateGeneral('description', e.target.value)}
                                rows={4}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent-primary outline-none focus:bg-black/60 transition-all shadow-inner resize-y"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'hero' && config?.marketing?.homeHero?.primaryCopy && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Título Principal (H1)
                                </label>
                                <input
                                    type="text"
                                    value={config.marketing.homeHero.primaryCopy.title || ''}
                                    onChange={(e) => updateHero('title', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent-primary outline-none focus:bg-black/60 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Subtítulo Destacado
                                </label>
                                <input
                                    type="text"
                                    value={config.marketing.homeHero.primaryCopy.subtitle || ''}
                                    onChange={(e) => updateHero('subtitle', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent-primary outline-none focus:bg-black/60 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                Párrafo Descriptivo
                            </label>
                            <textarea
                                value={config.marketing.homeHero.primaryCopy.description || ''}
                                onChange={(e) => updateHero('description', e.target.value)}
                                rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent-primary outline-none focus:bg-black/60 transition-all resize-y"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                Etiqueta Superior (Ej. 'Nuevo', 'Promo')
                            </label>
                            <input
                                type="text"
                                value={config.marketing.homeHero.primaryCopy.tag || ''}
                                onChange={(e) => updateHero('tag', e.target.value)}
                                className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-accent-secondary font-bold text-sm focus:border-accent-primary outline-none focus:bg-black/60 transition-all"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'sections' && config && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-theme-secondary">Configura las categorías/verticales principales de tu tienda (ej. Disposables, Líquidos, Accesorios).</p>
                            <button type="button" onClick={addSection} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-lg font-bold transition-all">
                                + Añadir Sección
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(!config.sections || config.sections.length === 0) && (
                                <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl text-theme-secondary">
                                    No hay secciones configuradas.
                                </div>
                            )}
                            
                            {config.sections?.map((section, idx) => (
                                <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative group">
                                    <button type="button" onClick={() => removeSection(idx)} className="absolute top-4 right-4 text-theme-secondary/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        &times;
                                    </button>
                                    
                                    <div className="md:col-span-4 space-y-3">
                                        <div>
                                            <label className="text-[10px] text-theme-secondary uppercase tracking-widest block mb-1">Nombre Corto</label>
                                            <input type="text" value={section.shortLabel || ''} onChange={(e) => updateSection(idx, 'shortLabel', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent-primary outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-theme-secondary uppercase tracking-widest block mb-1">Slug (URL)</label>
                                            <input type="text" value={section.slug || ''} onChange={(e) => updateSection(idx, 'slug', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-emerald-400 font-mono text-xs focus:border-accent-primary outline-none" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-8 space-y-3">
                                        <div>
                                            <label className="text-[10px] text-theme-secondary uppercase tracking-widest block mb-1">Nombre Completo (Label)</label>
                                            <input type="text" value={section.label || ''} onChange={(e) => updateSection(idx, 'label', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent-primary outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-theme-secondary uppercase tracking-widest block mb-1">Descripción</label>
                                            <input type="text" value={section.description || ''} onChange={(e) => updateSection(idx, 'description', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-theme-secondary text-sm focus:border-accent-primary outline-none" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1 flex justify-between items-center">
                            <span>Raw JSON Payload</span>
                            <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[9px]">SOLO DESARROLLADORES</span>
                        </label>
                        <textarea
                            name="vertical_pack_config"
                            value={formData.vertical_pack_config}
                            onChange={handleChange}
                            className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-emerald-400 font-mono text-xs focus:outline-none focus:bg-black/60 focus:ring-4 transition-all shadow-inner font-medium resize-y min-h-[400px] ${parseError ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : 'border-white/10 focus:border-accent-primary focus:ring-accent-primary/10'}`}
                            placeholder='{"id": "...", ...}'
                        />
                        <p className="text-xs text-theme-secondary/60 mt-3 ml-1 flex items-center gap-2">
                            Asegúrate de proporcionar un JSON válido. Cualquier error tipográfico romperá el editor visual.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
