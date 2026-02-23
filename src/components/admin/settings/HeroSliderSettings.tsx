import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import type { HeroSlider } from '@/services/settings.service';

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
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Título</label>
                                <input
                                    type="text"
                                    value={slider.title}
                                    onChange={(e) => handleSliderChange(index, 'title', e.target.value)}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Subtítulo</label>
                                <input
                                    type="text"
                                    value={slider.subtitle}
                                    onChange={(e) => handleSliderChange(index, 'subtitle', e.target.value)}
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
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
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Gradiente (Dark Mode)</label>
                                <input
                                    type="text"
                                    value={slider.bgGradient}
                                    onChange={(e) => handleSliderChange(index, 'bgGradient', e.target.value)}
                                    placeholder="from-violet-900 via-fuchsia-900 to-purple-900"
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-secondary">Gradiente (Light Mode)</label>
                                <input
                                    type="text"
                                    value={slider.bgGradientLight}
                                    onChange={(e) => handleSliderChange(index, 'bgGradientLight', e.target.value)}
                                    placeholder="from-violet-500 via-fuchsia-500 to-purple-600"
                                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                />
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
