/**
 * FeaturedCategoriesSettings — Panel de administración para las 4 categorías destacadas del Home.
 *
 * @module FeaturedCategoriesSettings
 * @independent Componente independiente. Recibe estado vía props desde AdminSettings.
 * @data Consume useCategories() para auto-completar imagen/nombre desde la BD.
 * @constants Gradientes, íconos y fallbacks importados de category-showcase.ts.
 */
import { Grid } from 'lucide-react';
import type { FeaturedCategory } from '@/services/settings.service';
import { uploadSliderImage } from '@/services/settings.service';
import { ImageUploader } from '@/components/admin/products/ImageUploader';
import { CATEGORY_GRADIENTS, CATEGORY_ICONS, FALLBACK_CATEGORIES } from '@/constants/category-showcase';
import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/types/category';

interface FeaturedCategoriesSettingsProps {
    formData: { featured_categories: FeaturedCategory[] | null };
    handleChange: (index: number, field: keyof FeaturedCategory, value: string) => void;
}

export function FeaturedCategoriesSettings({ formData, handleChange }: FeaturedCategoriesSettingsProps) {
    const { data: storeCategories = [] } = useCategories();

    /** Auto-rellena nombre, imagen y sección al seleccionar una categoría de la BD */
    const handleCategorySelect = (index: number, selectedSlug: string) => {
        handleChange(index, 'slug', selectedSlug);

        const matched: Category | undefined = storeCategories.find(c => c.slug === selectedSlug);
        if (!matched) return;

        if (matched.image_url) {
            handleChange(index, 'image', matched.image_url);
        }
        if (matched.name) {
            handleChange(index, 'name', matched.name);
        }
        // Sección solo si es un valor válido del enum
        if (matched.section === 'vape' || matched.section === '420') {
            handleChange(index, 'section', matched.section);
        }
    };

    // Asegurarse de que siempre haya 4 slots disponibles, tomando de base FALLBACK_CATEGORIES
    const categories: FeaturedCategory[] = [0, 1, 2, 3].map(i => {
        if (formData.featured_categories && formData.featured_categories[i]) {
            return formData.featured_categories[i]!;
        }
        return FALLBACK_CATEGORIES[i]!;
    });

    return (
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/10"><Grid className="h-6 w-6 text-orange-500" /></div>
                <div>
                    <h2 className="text-lg font-semibold text-theme-primary">Categorías Destacadas (Home)</h2>
                    <p className="text-xs text-theme-secondary mt-1">Configuración de las 4 categorías principales del inicio para mantener el diseño simétrico.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category, index) => {
                    const IconComponent = CATEGORY_ICONS[category.iconName] || CATEGORY_ICONS['Box']!;

                    return (
                        <div key={category.id} className="p-4 rounded-lg border border-theme bg-theme-secondary/30 relative">
                            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-vape-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                                {index + 1}
                            </div>
                            
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-theme-secondary">Imagen de Fondo</label>
                                    <div className="space-y-3">
                                        <ImageUploader 
                                            images={category.image ? [category.image] : []}
                                            maxImages={1}
                                            onUpload={uploadSliderImage} // Reutilizamos el mismo uploader que los sliders
                                            onChange={(urls) => handleChange(index, 'image', urls[0] || '')}
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-theme-secondary">o desde URL:</span>
                                            <input
                                                type="text"
                                                value={category.image || ''}
                                                onChange={(e) => handleChange(index, 'image', e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 rounded-lg border border-theme bg-theme-secondary px-3 py-1.5 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Etiqueta (Ej. Líquidos)</label>
                                        <input
                                            type="text"
                                            value={category.name}
                                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Ícono Decorativo</label>
                                        <div className="relative">
                                            <select
                                                value={category.iconName || 'Box'}
                                                onChange={(e) => handleChange(index, 'iconName', e.target.value)}
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Sección Enlace</label>
                                        <select
                                            value={category.section}
                                            onChange={(e) => handleChange(index, 'section', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        >
                                            <option value="vape">Vape (vape/slug)</option>
                                            <option value="420">420 (420/slug)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Categoría (Auto-completar)</label>
                                        <select
                                            value={category.slug}
                                            onChange={(e) => handleCategorySelect(index, e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        >
                                            <option value="" disabled>Seleccionar de la base de datos...</option>
                                            {storeCategories.map(cat => (
                                                <option key={cat.id} value={cat.slug}>
                                                    {cat.name} ({cat.section})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={category.slug}
                                            onChange={(e) => handleChange(index, 'slug', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                            placeholder="O personalizar URL/Slug..."
                                            title="La URL final construida"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Tono / Gradiente</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                                        {CATEGORY_GRADIENTS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handleChange(index, 'presetId', preset.id)}
                                                className={`h-8 rounded-lg border-2 transition-all group ${category.presetId === preset.id ? 'border-vape-500 scale-110 shadow-lg' : 'border-transparent hover:border-white/20 hover:scale-105'}`}
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