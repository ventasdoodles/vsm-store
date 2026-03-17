/**
 * // ─── COMPONENTE: ProductEditorDrawer ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Panel lateral glassmorphism para crear/editar productos.
 *    Secciones: Imagenes, Info Basica, Catalogo (seccion + categoria + tags),
 *    Precio, Inventario. Inputs glassmorphism border-white/10 bg-white/5.
 *    Footer pegajoso con boton glow violeta.
 * // Regla / Notas: Props tipadas. Sin `any`. Sin cadenas magicas.
 */
import { useState, useEffect, useMemo } from 'react';
import { Camera, Save, Package2, Loader2, FolderTree, X, Plus, Layers, Sparkles, LayoutDashboard, BrainCircuit, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
    SUGGESTED_SPECS, 
    SECTION_DEFAULT_SPECS, 
    normalizeSpecKey 
} from '@/constants/specs.constants';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { useNotification } from '@/hooks/useNotification';
import { type Product } from '@/types/product';
import { useAdminProductDetail, type ProductFormData, uploadProductImage, generateProductCopy } from '@/hooks/admin/useAdminProducts';
import type { Category } from '@/types/category';
import type { Section, ProductStatus } from '@/types/constants';
import { ImageUploader } from './ImageUploader';
import { CategoryCascader } from './CategoryCascader';
import { ProductVariantsEditor } from './ProductVariantsEditor';
import { z } from 'zod';

type EditorTab = 'comercial' | 'clasificacion' | 'configuracion' | 'inteligencia';

interface ProductEditorDrawerProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<ProductFormData>) => void;
    isSaving: boolean;
    /** All categories from admin query */
    categories: Category[];
    /** All tag names for autocomplete */
    tagNames: string[];
}

const DEFAULT_FORM: Partial<ProductFormData> = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_at_price: null,
    stock: 0,
    sku: '',
    section: 'vape',
    category_id: '',
    tags: [],
    specs: {},
    badges: [],
    status: 'draft' as ProductStatus,
    images: [],
    cover_image: null,
    is_active: true,
    ai_sales_note: '',
    ai_is_featured: false,
    ai_exclude: false
};

/** Esquema de validación Zod para el editor de productos */
const ProductEditorSchema = z.object({
    name: z.string().min(1, 'El nombre del paquete o producto es obligatorio.'),
    price: z.coerce.number().min(0.01, 'El precio debe ser mayor a $0.'),
    stock: z.coerce.number().min(0, 'El stock no puede ser un valor negativo.'),
    category_id: z.string().min(1, 'Debes seleccionar una categoría.'),
    section: z.string().min(1, 'Debes seleccionar una sección (Vape o 420).'),
});

/** Glassmorphism input style constant */
const INPUT_CLS = 'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20';

export function ProductEditorDrawer({
    product,
    isOpen,
    onClose,
    onSave,
    isSaving,
    categories,
    tagNames,
}: ProductEditorDrawerProps) {
    const [formData, setFormData] = useState<Partial<ProductFormData>>(DEFAULT_FORM);
    const [activeTab, setActiveTab] = useState<EditorTab>('comercial');
    const [tagInput, setTagInput] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const notify = useNotification();

    const { data: fullProduct } = useAdminProductDetail(isOpen && product?.id ? product.id : null);

    // Sugerencias de Specs basadas en categoría
    const currentCategory = useMemo(() => {
        return categories.find(c => c.id === formData.category_id);
    }, [categories, formData.category_id]);

    const specSuggestions = useMemo(() => {
        const categorySuggestions = currentCategory ? SUGGESTED_SPECS[currentCategory.slug] || [] : [];
        const sectionSuggestions = formData.section ? SECTION_DEFAULT_SPECS[formData.section as Section] || [] : [];
        return Array.from(new Set([...categorySuggestions, ...sectionSuggestions]));
    }, [currentCategory, formData.section]);

    const handleAddSpec = (rawKey: string) => {
        const key = normalizeSpecKey(rawKey);
        if (key && !formData.specs?.[key]) {
            const next = { ...formData.specs };
            next[key] = '';
            setFormData(p => ({ ...p, specs: next }));
            return true;
        }
        return false;
    };

    useEffect(() => {
        const sourceData = fullProduct || product;
        if (sourceData && isOpen) {
            setFormData({
                ...sourceData,
                images: sourceData.images || [],
                tags: sourceData.tags || [],
                specs: sourceData.specs || {},
                badges: sourceData.badges || [],
                description: sourceData.description || '',
                short_description: sourceData.short_description || '',
                sku: sourceData.sku || '',
                ai_sales_note: sourceData.ai_sales_note || '',
                ai_is_featured: sourceData.ai_is_featured || false,
                ai_exclude: sourceData.ai_exclude || false,
            });
        } else if (!sourceData && isOpen) {
            setFormData(DEFAULT_FORM);
        }
        setTagInput('');
        setActiveTab('comercial');
    }, [product, fullProduct, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'number' ? Number(value) : value };
            if (name === 'section') updated.category_id = '';
            return updated;
        });
    };

    const handleImagesChange = (newImages: string[]) => {
        setFormData(prev => ({
            ...prev,
            images: newImages,
            cover_image: newImages.length > 0 ? newImages[0] : null
        }));
    };

    const tagSuggestions = useMemo(() => {
        const currentTags = formData.tags ?? [];
        if (tagInput.length > 0) {
            return tagNames.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !currentTags.includes(t));
        }
        return tagNames.filter(t => !currentTags.includes(t)).slice(0, 8);
    }, [tagNames, tagInput, formData.tags]);

    const addTag = (tag?: string) => {
        const t = (tag ?? tagInput).trim().toLowerCase();
        if (t && !(formData.tags ?? []).includes(t)) {
            setFormData(prev => ({ ...prev, tags: [...(prev.tags ?? []), t] }));
        }
        setTagInput('');
        setShowTagDropdown(false);
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: (prev.tags ?? []).filter(t => t !== tag) }));
    };

    const handleSave = () => {
        const result = ProductEditorSchema.safeParse(formData);
        if (!result.success) {
            const firstError = result.error.issues[0];
            if (firstError) notify.warning('Revisar datos requeridos', firstError.message);
            return;
        }

        const finalData = { ...formData };
        if (!finalData.slug && finalData.name) {
            finalData.slug = finalData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        onSave(finalData);
    };

    const handleAIGenerate = async () => {
        if (!formData.name) {
            notify.warning('Nombre requerido', 'Ingresa un nombre para que la IA tenga contexto.');
            return;
        }

        try {
            setIsGeneratingAI(true);
            const result = await generateProductCopy(formData.name, formData.description || '');
            
            setFormData(prev => ({
                ...prev,
                description: result.description,
                short_description: result.short_description,
                tags: Array.from(new Set([...(prev.tags || []), ...(result.tags || [])]))
            }));

            notify.success('Copiado mágico', 'La IA ha generado la descripción y etiquetas.');
        } catch (_err) {
            notify.error('Error de IA', 'No se pudo generar el contenido en este momento.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const isEditMode = !!product && !!product.id;
    const isDuplicate = !!product && !product.id;

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={isDuplicate ? 'Duplicar Producto' : isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
            width="max-w-3xl w-full"
        >
            <div className="flex flex-col h-full bg-theme-primary/50">
                {/* ─── TAB NAVIGATION ─── */}
                <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl mb-8 mx-auto">
                    {[
                        { id: 'comercial', icon: Package2, label: 'Comercial' },
                        { id: 'clasificacion', icon: FolderTree, label: 'Clasificación' },
                        { id: 'configuracion', icon: Layers, label: 'Configuración' },
                        { id: 'inteligencia', icon: BrainCircuit, label: 'Inteligencia' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as EditorTab)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id 
                                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
                                    : "text-white/30 hover:bg-white/5 hover:text-white/60"
                            )}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-8 pb-32 overflow-y-auto px-1">
                    {/* ─── TAB: COMERCIAL ─── */}
                    {activeTab === 'comercial' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* 1. Imagenes */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 px-2">
                                    <Camera className="h-4 w-4 text-violet-400" />
                                    Fotografias
                                </h3>
                                <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                                    <ImageUploader
                                        images={formData.images || []}
                                        onChange={handleImagesChange}
                                        onUpload={uploadProductImage}
                                        maxImages={4}
                                    />
                                </div>
                            </section>

                            {/* 2. Info Basica */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 px-2">
                                    <Package2 className="h-4 w-4 text-blue-400" />
                                    Identidad & Precios
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Nombre del Producto *</label>
                                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Ej: Vaporesso XROS 3" className={INPUT_CLS} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">SKU (Interno)</label>
                                        <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className={INPUT_CLS} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Stock Disponible *</label>
                                        <input type="number" name="stock" value={formData.stock || 0} onChange={handleChange} className={INPUT_CLS} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Precio de Venta ($) *</label>
                                        <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className={`${INPUT_CLS} text-lg font-black text-emerald-400`} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Precio Comparación</label>
                                        <input type="number" name="compare_at_price" value={formData.compare_at_price || ''} onChange={handleChange} className={INPUT_CLS} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 px-2">
                                    <LayoutDashboard className="h-4 w-4 text-amber-400" />
                                    Descripción Corta
                                </h3>
                                <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                                    <textarea name="short_description" value={formData.short_description || ''} onChange={handleChange} rows={2} className={INPUT_CLS} placeholder="Resumen breve visible en tarjetas..." />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ─── TAB: CLASIFICACION ─── */}
                    {activeTab === 'clasificacion' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 px-2">
                                    <FolderTree className="h-4 w-4 text-cyan-400" />
                                    Ontología del Catálogo
                                </h3>
                                <div className="space-y-4 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                                    {/* Seccion */}
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Sección Exclusiva</label>
                                        <select name="section" value={formData.section} onChange={handleChange} className={INPUT_CLS}>
                                            <option value="vape">Vape (Nicotina/Hardware)</option>
                                            <option value="420">420 (Cannabis/CBD/THC)</option>
                                        </select>
                                    </div>
                                    {/* Estado */}
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Estado de Publicación</label>
                                        <select name="status" value={formData.status || 'draft'} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProductStatus }))} className={INPUT_CLS}>
                                            <option value="active">Activo (Visible en tienda)</option>
                                            <option value="draft">Borrador (Interno)</option>
                                            <option value="archived">Archivado (Descontinuado)</option>
                                        </select>
                                    </div>
                                    {/* Categoria */}
                                    <CategoryCascader
                                        categories={categories}
                                        section={(formData.section ?? 'vape') as Section}
                                        value={formData.category_id || ''}
                                        onChange={(id) => setFormData(prev => ({ ...prev, category_id: id }))}
                                    />
                                    
                                    <div>
                                        <label className="mt-3 flex cursor-pointer items-center gap-3">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                                                />
                                                <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-emerald-500/50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white/70 after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:bg-white" />
                                            </div>
                                            <span className="text-sm font-medium text-white/70">
                                                {formData.is_active ? 'Visible en el listado' : 'Oculto de la interfaz'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ─── TAB: CONFIGURACION ─── */}
                    {activeTab === 'configuracion' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                             {/* Fixed Specs JSON Editor */}
                             <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 px-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                    Especificaciones Técnicas (Specs)
                                </h3>
                                <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm space-y-5">
                                    {/* Sugerencias Guardrails */}
                                    {specSuggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/20">
                                                <Sparkles className="h-3 w-3 text-violet-400" />
                                                Sugerencias para {currentCategory?.name || 'esta sección'}
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {specSuggestions.map(s => {
                                                    const isUsed = !!formData.specs?.[s];
                                                    return (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => handleAddSpec(s)}
                                                            disabled={isUsed}
                                                            className={cn(
                                                                "px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1.5",
                                                                isUsed 
                                                                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500/40 cursor-default" 
                                                                    : "border-white/5 bg-white/5 text-white/40 hover:border-violet-500/30 hover:text-white"
                                                            )}
                                                        >
                                                            {isUsed && <CheckCircle2 className="h-2.5 w-2.5" />}
                                                            {s}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        {Object.entries(formData.specs || {}).map(([key, val], idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={key} 
                                                    readOnly 
                                                    className={cn(INPUT_CLS, "flex-1 opacity-50 cursor-not-allowed")} 
                                                />
                                                <input 
                                                    type="text" 
                                                    value={val} 
                                                    onChange={(e) => {
                                                        const next = { ...formData.specs };
                                                        next[key] = e.target.value;
                                                        setFormData(p => ({ ...p, specs: next }));
                                                    }}
                                                    className={cn(INPUT_CLS, "flex-1")} 
                                                />
                                                <button onClick={() => {
                                                    const next = { ...formData.specs };
                                                    delete next[key];
                                                    setFormData(p => ({ ...p, specs: next }));
                                                }} className="p-2 text-white/20 hover:text-red-400"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 border-t border-white/5 pt-4">
                                        <input 
                                            id="new-spec-key" 
                                            type="text" 
                                            placeholder="Nueva Propiedad (ej: Watts)" 
                                            className={cn(INPUT_CLS, "flex-1")} 
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.currentTarget;
                                                    if (handleAddSpec(input.value)) input.value = '';
                                                }
                                            }}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const keyInput = document.getElementById('new-spec-key') as HTMLInputElement;
                                                if (handleAddSpec(keyInput.value)) keyInput.value = '';
                                            }}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 transition-all font-bold text-[10px] uppercase tracking-wider"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-white/20 italic">Las specs son propiedades técnicas fijas que no crean variaciones de stock.</p>
                                </div>
                            </section>

                            {/* Variantes */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 px-2">
                                    <Layers className="h-4 w-4 text-violet-400" />
                                    Matriz de Variantes (Purchasable)
                                </h3>
                                <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.01] p-1 backdrop-blur-sm">
                                    <ProductVariantsEditor
                                        existingVariants={formData.variants || []}
                                        basePrice={formData.price || 0}
                                        baseSku={formData.sku || null}
                                        section={formData.section || 'vape'}
                                        categoryId={formData.category_id || ''}
                                        onChange={(variants) => setFormData(p => ({ ...p, variants: variants as unknown as ProductFormData['variants'] }))}
                                    />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ─── TAB: INTELIGENCIA ─── */}
                    {activeTab === 'inteligencia' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* AI Marketing Copy */}
                            <section className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                                        <Sparkles className="h-4 w-4 text-violet-400" />
                                        Copywriting & IA
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAIGenerate}
                                        disabled={isGeneratingAI || !formData.name}
                                        className="group flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-400 transition-all hover:bg-violet-500/20 disabled:opacity-30"
                                    >
                                        {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 animate-pulse" />}
                                        Optimizar con IA
                                    </button>
                                </div>
                                <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Descripción Completa</label>
                                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={6} className={INPUT_CLS} placeholder="Larga extensión con detalles para SEO..." />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Nota de Venta sugerida por IA</label>
                                        <textarea 
                                            name="ai_sales_note" 
                                            value={formData.ai_sales_note || ''} 
                                            onChange={handleChange} 
                                            rows={2} 
                                            className={cn(INPUT_CLS, "border-violet-500/20 bg-violet-500/5 text-violet-100 italic")} 
                                            placeholder="Ej: Ideal para usuarios que buscan sabor intenso..." 
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 px-2">
                                    <Zap className="h-4 w-4 text-amber-400" />
                                    Tags & Badges
                                </h3>
                                <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm space-y-6">
                                    {/* Badges Array */}
                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Badges Promocionales (Ej: HOT, NEW, LIMITED)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['HOT', 'NEW', 'LIMITADO', 'RECOMENDADO', 'OFERTA'].map(badge => {
                                                const isActive = formData.badges?.includes(badge);
                                                return (
                                                    <button
                                                        key={badge}
                                                        onClick={() => {
                                                            const next = isActive 
                                                                ? formData.badges?.filter(b => b !== badge)
                                                                : [...(formData.badges || []), badge];
                                                            setFormData(p => ({ ...p, badges: next }));
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                            isActive 
                                                                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                                                                : "bg-white/5 text-white/20 hover:text-white/40"
                                                        )}
                                                    >
                                                        {badge}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Semantic Tags */}
                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Etiquetas Semánticas</label>
                                        <div className="relative flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => { setTagInput(e.target.value); setShowTagDropdown(true); }}
                                                onFocus={() => setShowTagDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                                className={cn(INPUT_CLS, 'flex-1')}
                                                placeholder="Sabor, Perfil, Ocasión..."
                                            />
                                            <button type="button" onClick={() => addTag()} className="px-3 bg-white/5 rounded-xl border border-white/10"><Plus className="h-4 w-4 text-white/40" /></button>
                                            {showTagDropdown && tagSuggestions.length > 0 && (
                                                <div className="absolute left-0 top-full z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-white/10 bg-theme-primary/95 shadow-xl backdrop-blur-xl">
                                                    {tagSuggestions.map(t => (
                                                        <button key={t} type="button" onMouseDown={() => addTag(t)} className="flex w-full items-center px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">{t}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {(formData.tags ?? []).map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-400 ring-1 ring-inset ring-violet-500/20">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-theme-primary/95 px-6 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-white/40 hover:text-white/70 transition-all">Cancelar</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="group relative inline-flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white text-sm bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span>{isEditMode ? 'Guardar Cambios' : 'Crear Producto'}</span>
                    </button>
                </div>
            </div>
        </SideDrawer>
    );
}