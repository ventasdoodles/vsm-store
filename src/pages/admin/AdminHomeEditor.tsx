/**
 * AdminHomeEditor — Página independiente para gestionar las Categorías Destacadas del Home.
 *
 * @module AdminHomeEditor
 * @independent No depende de AdminSettings. Lee/escribe directamente a `store_settings.featured_categories`.
 * @data Consume useStoreSettings + useUpdateStoreSettings para persistencia y useCategories para auto-completar.
 */
import { useState, useEffect, useCallback } from 'react';
import { Grid, Save, Loader2, Undo2 } from 'lucide-react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { useCategories } from '@/hooks/useCategories';
import { useNotification } from '@/hooks/useNotification';
import type { FeaturedCategory } from '@/services/settings.service';
import type { Category } from '@/types/category';
import { uploadSliderImage } from '@/services/settings.service';
import { ImageUploader } from '@/components/admin/products/ImageUploader';
import { CATEGORY_GRADIENTS, CATEGORY_ICONS, FALLBACK_CATEGORIES } from '@/constants/category-showcase';

/** Número fijo de slots del grid de categorías en el Home */
const SLOTS_COUNT = 4;

/** Construye un array de 4 categorías completas, rellenando con fallbacks */
function buildInitialCategories(dbCategories: FeaturedCategory[] | null | undefined): FeaturedCategory[] {
    return Array.from({ length: SLOTS_COUNT }, (_, i) => {
        const saved = dbCategories?.[i];
        if (saved && saved.slug && saved.name) return saved;
        return { ...FALLBACK_CATEGORIES[i]! };
    });
}

export function AdminHomeEditor() {
    const { data: settings, isLoading } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { data: storeCategories = [] } = useCategories();
    const { success, error: notifyError } = useNotification();

    const [categories, setCategories] = useState<FeaturedCategory[]>(() =>
        buildInitialCategories(null)
    );
    const [isDirty, setIsDirty] = useState(false);

    // Sincronizar con la BD cuando llegan los settings
    useEffect(() => {
        if (settings?.featured_categories) {
            setCategories(buildInitialCategories(settings.featured_categories));
            setIsDirty(false);
        }
    }, [settings?.featured_categories]);

    /** Actualiza un campo de un slot específico */
    const updateSlot = useCallback((index: number, field: keyof FeaturedCategory, value: string) => {
        setCategories(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index]!, [field]: value };
            return updated;
        });
        setIsDirty(true);
    }, []);

    /** Al seleccionar una categoría del dropdown, auto-rellena slug, nombre, imagen y sección */
    const handleCategorySelect = useCallback((index: number, categoryId: string) => {
        const matched: Category | undefined = storeCategories.find(c => c.id === categoryId);
        if (!matched) return;

        setCategories(prev => {
            const updated = [...prev];
            const current = updated[index]!;
            updated[index] = {
                ...current,
                slug: matched.slug,
                name: matched.name,
                section: (matched.section === 'vape' || matched.section === '420') ? matched.section : current.section,
                ...(matched.image_url ? { image: matched.image_url } : {}),
            };
            return updated;
        });
        setIsDirty(true);
    }, [storeCategories]);

    /** Guardar solo las categorías destacadas, sin tocar el resto de settings */
    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                featured_categories: categories,
                id: 1,
            });
            success('Categorías guardadas', 'Las categorías destacadas se actualizaron correctamente.');
            setIsDirty(false);
        } catch (err: unknown) {
            const supaError = err as { message?: string; code?: string; details?: string };
            console.error('Error saving featured categories:', supaError);
            notifyError(
                'Error al guardar',
                supaError?.message || 'No se pudieron guardar las categorías destacadas.',
            );
        }
    };

    /** Descartar cambios y volver al estado de la BD */
    const handleDiscard = () => {
        setCategories(buildInitialCategories(settings?.featured_categories));
        setIsDirty(false);
    };

    /** Encontrar el ID de la categoría que corresponde al slug+section actual de un slot */
    const findMatchingCategoryId = (slot: FeaturedCategory): string => {
        const match = storeCategories.find(
            c => c.slug === slot.slug && c.section === slot.section
        );
        return match?.id ?? '';
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-vape-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                        <Grid className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-theme-primary">Categorías Destacadas (Home)</h1>
                        <p className="text-sm text-theme-secondary mt-1">
                            Configura las {SLOTS_COUNT} categorías principales que aparecen en la página de inicio.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {isDirty && (
                        <button
                            type="button"
                            onClick={handleDiscard}
                            className="flex items-center gap-2 rounded-xl border border-theme px-4 py-2.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/20 transition-colors"
                        >
                            <Undo2 className="h-4 w-4" />
                            Descartar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={updateMutation.isPending || !isDirty}
                        className="flex items-center gap-2 rounded-xl bg-vape-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-vape-500/20 transition-all hover:bg-vape-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Guardar Categorías
                    </button>
                </div>
            </div>

            {/* Grid de 4 slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((slot, index) => {
                    const IconComponent = CATEGORY_ICONS[slot.iconName] ?? CATEGORY_ICONS['Box']!;
                    const selectedCategoryId = findMatchingCategoryId(slot);

                    return (
                        <div key={slot.id} className="p-5 rounded-xl border border-theme bg-theme-primary/50 relative">
                            {/* Badge numérico */}
                            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-vape-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                                {index + 1}
                            </div>

                            <div className="space-y-4 mt-2">
                                {/* Selector de categoría de la BD */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-theme-secondary">
                                        Seleccionar Categoría de la Base de Datos
                                    </label>
                                    <select
                                        value={selectedCategoryId}
                                        onChange={(e) => handleCategorySelect(index, e.target.value)}
                                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                    >
                                        <option value="">— Elegir categoría existente —</option>
                                        {storeCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} ({cat.section === '420' ? '420' : 'Vape'})
                                                {cat.image_url ? ' 📷' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Imagen de fondo */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-theme-secondary">Imagen de Fondo</label>
                                    <div className="space-y-3">
                                        <ImageUploader
                                            images={slot.image ? [slot.image] : []}
                                            maxImages={1}
                                            onUpload={uploadSliderImage}
                                            onChange={(urls) => updateSlot(index, 'image', urls[0] || '')}
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-theme-secondary">o desde URL:</span>
                                            <input
                                                type="text"
                                                value={slot.image || ''}
                                                onChange={(e) => updateSlot(index, 'image', e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 rounded-lg border border-theme bg-theme-secondary px-3 py-1.5 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Nombre + Ícono */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Etiqueta</label>
                                        <input
                                            type="text"
                                            value={slot.name}
                                            onChange={(e) => updateSlot(index, 'name', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                            placeholder="Ej. Líquidos"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Ícono Decorativo</label>
                                        <div className="relative">
                                            <select
                                                value={slot.iconName || 'Box'}
                                                onChange={(e) => updateSlot(index, 'iconName', e.target.value)}
                                                className="w-full rounded-lg border border-theme bg-theme-secondary pl-10 pr-3 py-2 text-theme-primary outline-none focus:border-vape-500 appearance-none"
                                            >
                                                {Object.keys(CATEGORY_ICONS).map(iconKey => (
                                                    <option key={iconKey} value={iconKey}>{iconKey}</option>
                                                ))}
                                            </select>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary pointer-events-none">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección + Slug */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Sección Enlace</label>
                                        <select
                                            value={slot.section}
                                            onChange={(e) => updateSlot(index, 'section', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        >
                                            <option value="vape">Vape</option>
                                            <option value="420">420</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Slug URL</label>
                                        <input
                                            type="text"
                                            value={slot.slug}
                                            onChange={(e) => updateSlot(index, 'slug', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                            placeholder="liquidos"
                                        />
                                    </div>
                                </div>

                                {/* Gradiente */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Tono / Gradiente</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                                        {CATEGORY_GRADIENTS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => updateSlot(index, 'presetId', preset.id)}
                                                className={`h-8 rounded-lg border-2 transition-all ${
                                                    slot.presetId === preset.id
                                                        ? 'border-vape-500 scale-110 shadow-lg'
                                                        : 'border-transparent hover:border-white/20 hover:scale-105'
                                                }`}
                                                title={preset.name}
                                            >
                                                <div className={`w-full h-full rounded-md ${preset.colorCode} opacity-90`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
