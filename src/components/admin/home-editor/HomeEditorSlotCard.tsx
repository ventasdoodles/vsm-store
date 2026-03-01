import type { FeaturedCategory } from '@/services/settings.service';
import type { Category } from '@/types/category';
import { ImageUploader } from '@/components/admin/products/ImageUploader';
import { CATEGORY_GRADIENTS, CATEGORY_ICONS } from '@/constants/category-showcase';
import { uploadSliderImage } from '@/services/settings.service';

interface HomeEditorSlotCardProps {
    slot: FeaturedCategory;
    index: number;
    storeCategories: Category[];
    selectedCategoryId: string;
    onUpdateSlot: (index: number, field: keyof FeaturedCategory, value: string) => void;
    onCategorySelect: (index: number, categoryId: string) => void;
}

export function HomeEditorSlotCard({
    slot,
    index,
    storeCategories,
    selectedCategoryId,
    onUpdateSlot,
    onCategorySelect,
}: HomeEditorSlotCardProps) {
    const IconComponent = CATEGORY_ICONS[slot.iconName] ?? CATEGORY_ICONS['Box']!;

    return (
        <div className="p-5 rounded-xl border border-theme bg-theme-primary/50 relative">
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
                        onChange={(e) => onCategorySelect(index, e.target.value)}
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
                            onChange={(urls) => onUpdateSlot(index, 'image', urls[0] || '')}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-theme-secondary">o desde URL:</span>
                            <input
                                type="text"
                                value={slot.image || ''}
                                onChange={(e) => onUpdateSlot(index, 'image', e.target.value)}
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
                            onChange={(e) => onUpdateSlot(index, 'name', e.target.value)}
                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            placeholder="Ej. Líquidos"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Ícono Decorativo</label>
                        <div className="relative">
                            <select
                                value={slot.iconName || 'Box'}
                                onChange={(e) => onUpdateSlot(index, 'iconName', e.target.value)}
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
                            onChange={(e) => onUpdateSlot(index, 'section', e.target.value)}
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
                            onChange={(e) => onUpdateSlot(index, 'slug', e.target.value)}
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
                                onClick={() => onUpdateSlot(index, 'presetId', preset.id)}
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
}
