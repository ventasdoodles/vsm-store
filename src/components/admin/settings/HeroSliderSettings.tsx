import { Image as ImageIcon, Plus, Trash2, Zap, Sparkles, Flame, TrendingUp, Star, Gift, Crown, Box } from 'lucide-react';
import type { HeroSlider } from '@/services/settings.service';
import { uploadSliderImage } from '@/services/settings.service';
import { ImageUploader } from '@/components/admin/products/ImageUploader';

const PREDEFINED_TAGS = [
    { label: 'Ninguno', icon: null },
    { label: 'Nuevo', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Lanzamiento', icon: <Zap className="w-4 h-4" /> },
    { label: 'Top Ventas', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Destacado', icon: <Star className="w-4 h-4" /> },
    { label: 'Exclusivo', icon: <Crown className="w-4 h-4" /> },
    { label: 'Oferta', icon: <Gift className="w-4 h-4" /> },
    { label: 'Premium', icon: <Crown className="w-4 h-4" /> },
    { label: 'Restock', icon: <Box className="w-4 h-4" /> }
];

const PREMIUM_GRADIENTS = [
    {
        id: 'cyberpunk',
        name: 'Neon Cyberpunk (Morado/Fucsia)',
        bg: 'from-violet-900 via-fuchsia-900 to-purple-900',
        textGradient: 'from-fuchsia-400 to-purple-500',
        buttonGradient: 'from-fuchsia-600 to-purple-600',
        glowColor: 'rgba(192,38,211,0.5)'
    },
    {
        id: 'nature',
        name: 'Kush Nature (Verde/Esmeralda)',
        bg: 'from-emerald-900 via-green-900 to-teal-900',
        textGradient: 'from-green-400 to-emerald-500',
        buttonGradient: 'from-green-600 to-emerald-600',
        glowColor: 'rgba(5,150,105,0.5)'
    },
    {
        id: 'fire',
        name: 'Fire Vape (Rojo/Naranja)',
        bg: 'from-orange-900 via-red-900 to-rose-900',
        textGradient: 'from-red-400 to-orange-500',
        buttonGradient: 'from-red-600 to-orange-500',
        glowColor: 'rgba(239,68,68,0.5)'
    },
    {
        id: 'ocean',
        name: 'Deep Blue (Azul/Cian)',
        bg: 'from-blue-900 via-cyan-900 to-slate-900',
        textGradient: 'from-cyan-400 to-blue-500',
        buttonGradient: 'from-cyan-600 to-blue-600',
        glowColor: 'rgba(56,189,248,0.5)'
    },
    {
        id: 'gold',
        name: 'Luxury Gold (Dorado/Ambar)',
        bg: 'from-amber-900 via-yellow-900 to-stone-900',
        textGradient: 'from-amber-300 to-yellow-500',
        buttonGradient: 'from-amber-600 to-yellow-600',
        glowColor: 'rgba(245,158,11,0.5)'
    }
];

export function HeroSliderSettings({ formData, handleSliderChange, addSlider, removeSlider }: any) {
    return (
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/10"><ImageIcon className="h-6 w-6 text-pink-500" /></div>
                    <h2 className="text-lg font-semibold text-theme-primary">Sliders del Home (MegaHero)</h2>
                </div>
                <button
                    type="button"
                    onClick={addSlider}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-vape-500 rounded-lg hover:bg-vape-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Agregar Slide
                </button>
            </div>

            <div className="space-y-6">
                {formData.hero_sliders.map((slider: HeroSlider, index: number) => (
                    <div key={slider.id} className="p-4 rounded-lg border border-theme bg-theme-secondary/30 relative">
                        <button
                            type="button"
                            onClick={() => removeSlider(index)}
                            className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar slide"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-12">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-theme-secondary">Imagen del Slide</label>
                                <div className="space-y-3">
                                    <ImageUploader 
                                        images={slider.image ? [slider.image] : []}
                                        maxImages={1}
                                        onUpload={uploadSliderImage}
                                        onChange={(urls) => handleSliderChange(index, 'image', urls[0] || '')}
                                    />
                                    {/* Fallback de input manual por si quieren poner url directa */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-theme-secondary">o desde URL:</span>
                                        <input
                                            type="text"
                                            value={slider.image || ''}
                                            onChange={(e) => handleSliderChange(index, 'image', e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 rounded-lg border border-theme bg-theme-secondary px-3 py-1.5 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Etiqueta (Badge Superior)</label>
                                <select
                                    value={slider.tag || 'Ninguno'}
                                    onChange={(e) => handleSliderChange(index, 'tag', e.target.value === 'Ninguno' ? '' : e.target.value)}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                >
                                    {PREDEFINED_TAGS.map(tag => (
                                        <option key={tag.label} value={tag.label}>{tag.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Título Principal</label>
                                <input
                                    type="text"
                                    value={slider.title}
                                    onChange={(e) => handleSliderChange(index, 'title', e.target.value)}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Subtítulo (Resaltado)</label>
                                <input
                                    type="text"
                                    value={slider.subtitle}
                                    onChange={(e) => handleSliderChange(index, 'subtitle', e.target.value)}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Descripción (Texto corto)</label>
                                <textarea
                                    value={slider.description || ''}
                                    onChange={(e) => handleSliderChange(index, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 resize-none"
                                />
                            </div>
                            
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Texto del Botón</label>
                                <input
                                    type="text"
                                    value={slider.ctaText}
                                    onChange={(e) => handleSliderChange(index, 'ctaText', e.target.value)}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Link del Botón</label>
                                <input
                                    type="text"
                                    value={slider.ctaLink}
                                    onChange={(e) => handleSliderChange(index, 'ctaLink', e.target.value)}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Estilo Visual (Paleta Premium)</label>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-2">
                                    {PREMIUM_GRADIENTS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => {
                                                handleSliderChange(index, 'bgGradient', preset.bg);
                                                // Guardamos el ID del preset en el bgGradientLight para poder reconstruirlo después en MegaHero
                                                handleSliderChange(index, 'bgGradientLight', preset.id); 
                                            }}
                                            className={`h-12 rounded-xl border-2 transition-all relative overflow-hidden group ${slider.bgGradientLight === preset.id ? 'border-vape-500 scale-105 shadow-lg' : 'border-transparent hover:border-white/20 hover:scale-105'}`}
                                            title={preset.name}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${preset.bg} opacity-80`} />
                                            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent`} />
                                            {slider.bgGradientLight === preset.id && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Zap className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={slider.active}
                                        onChange={(e) => handleSliderChange(index, 'active', e.target.checked)}
                                        className="h-4 w-4 rounded border-theme text-vape-500 focus:ring-vape-500 bg-theme-primary"
                                    />
                                    <span className="text-sm font-medium text-theme-primary">Slide Activo</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-theme-secondary">Orden:</label>
                                    <input
                                        type="number"
                                        value={slider.order || 0}
                                        onChange={(e) => handleSliderChange(index, 'order', Number(e.target.value))}
                                        className="w-20 rounded-lg border border-theme bg-theme-secondary px-2 py-1 text-theme-primary outline-none focus:border-vape-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {formData.hero_sliders.length === 0 && (
                    <p className="text-center text-theme-secondary py-4">No hay slides configurados. Agrega uno para mostrar en el inicio.</p>
                )}
            </div>
        </div>
    );
}
