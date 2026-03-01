// ─── SliderFormModal ──────────────────────────────────────────────────────────
// Modal de creación/edición de slides. Puramente presentacional, recibe toda
// la lógica y callbacks del orquestador (AdminHomeSliders).
import { Loader2, Save, X, Image as ImageIcon, Zap } from 'lucide-react';
import type { HeroSlider } from '@/services/settings.service';
import { PREMIUM_GRADIENTS, PREDEFINED_TAGS } from '@/constants/slider';
import { cn } from '@/lib/utils';
import { ImageUploader } from '@/components/admin/products/ImageUploader';

interface SliderFormModalProps {
    isOpen: boolean;
    form: HeroSlider;
    setForm: (val: HeroSlider) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isPending: boolean;
    /** Función de upload inyectada por el orquestador */
    onUploadImage: (file: File) => Promise<string>;
}

export function SliderFormModal({
    isOpen,
    form,
    setForm,
    onSubmit,
    onCancel,
    isPending,
    onUploadImage,
}: SliderFormModalProps) {
    if (!isOpen) return null;

    const isEditing = !!form.title || form.id !== '';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onCancel} 
            />
            
            <div className="relative w-full max-w-3xl bg-[#13141f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/[0.08] relative z-10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-theme-primary drop-shadow-sm flex items-center gap-3">
                            <span className="w-2 h-8 bg-pink-500 rounded-full inline-block shadow-[0_0_10px_rgba(236,72,153,0.5)]"></span>
                            {isEditing ? 'Editar Slide' : 'Nuevo Slide'}
                        </h2>
                        <p className="text-sm font-medium text-theme-secondary mt-1 ml-5">
                            Configura el diseño y datos del MegaHero
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2.5 rounded-xl hover:bg-theme-secondary/20 transition-all border border-transparent hover:border-white/10 active:scale-95 group"
                    >
                        <X className="w-5 h-5 text-theme-secondary group-hover:text-theme-primary transition-colors" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8 custom-scrollbar relative z-10 flex-1">
                    <form id="slider-form" onSubmit={onSubmit} className="space-y-8">
                        
                        {/* 1. Visual Theme Selection */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-pink-500" /> Tema Visual Premium
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {PREMIUM_GRADIENTS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => setForm({ 
                                            ...form, 
                                            bgGradientLight: preset.id,
                                            bgGradient: preset.bg // retro-compatibilidad
                                        })}
                                        className={cn(
                                            'h-14 rounded-2xl border-2 transition-all relative overflow-hidden group',
                                            form.bgGradientLight === preset.id 
                                                ? 'border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10' 
                                                : 'border-transparent hover:border-white/20'
                                        )}
                                        title={preset.name}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r ${preset.bg} opacity-100`} />
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent`} />
                                        
                                        {/* Status indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {form.bgGradientLight === preset.id && (
                                                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Image Upload */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5 text-pink-500" /> Imagen del Producto / Modelo
                            </label>
                            <div className="bg-theme-primary/[0.02] border border-white/10 rounded-3xl p-6 shadow-inner">
                                <ImageUploader
                                    images={form.image ? [form.image] : []}
                                    maxImages={1}
                                    onChange={(urls) => setForm({ ...form, image: urls[0] || '' })}
                                    onUpload={onUploadImage}
                                />
                                {/* Optional Direct URL fallback */}
                                <div className="mt-4 flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-theme-secondary/50 uppercase tracking-widest whitespace-nowrap">o URL externa:</span>
                                    <input
                                        type="text"
                                        value={form.image || ''}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        placeholder="https://..."
                                        className="flex-1 bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-theme-primary outline-none focus:border-pink-500/50 font-mono text-xs transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/5" />

                        {/* 3. Text Content */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Etiqueta (Badge)
                                </label>
                                <select
                                    value={form.tag || 'Ninguno'}
                                    onChange={(e) => setForm({ ...form, tag: e.target.value === 'Ninguno' ? '' : e.target.value })}
                                    className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-pink-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner appearance-none"
                                >
                                    {PREDEFINED_TAGS.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Título Principal *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-pink-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner font-bold"
                                    placeholder="Ej: Nuevo Lanzamiento"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Subtítulo Resaltado *
                                </label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-pink-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner font-black text-lg"
                                    placeholder="Ej: ELFBAR BC5000"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={form.description || ''}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-pink-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner resize-none font-medium leading-relaxed"
                                    placeholder="Texto descriptivo corto..."
                                />
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/5" />

                        {/* 4. CTA */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Texto del Botón *
                                </label>
                                <input
                                    type="text"
                                    value={form.ctaText}
                                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                                    className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-pink-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner font-bold uppercase tracking-wider text-sm"
                                    placeholder="COMPRAR AHORA"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                    Link / URL del Botón *
                                </label>
                                <input
                                    type="text"
                                    value={form.ctaLink}
                                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                                    className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-pink-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner font-mono text-sm"
                                    placeholder="/productos/categoria"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                             <div className="flex items-end shadow-inner bg-theme-primary/[0.02] border-white/5 border rounded-2xl px-5 py-4 h-full">
                                <ToggleSwitch
                                    label="Slide Activo y Visible"
                                    checked={form.active}
                                    onChange={(v) => setForm({ ...form, active: v })}
                                    color="bg-pink-500"
                                />
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-4 p-6 sm:p-8 border-t border-white/[0.08] shrink-0 bg-[#13141f]">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-4 rounded-2xl text-theme-primary bg-theme-secondary/20 hover:bg-theme-secondary/40 border border-white/5 hover:border-white/10 transition-all font-bold tracking-wide active:scale-95"
                    >
                        CANCELAR
                    </button>
                    <button
                        type="submit"
                        form="slider-form"
                        disabled={isPending}
                        className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white px-8 py-4 rounded-2xl font-black tracking-wide transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEditing ? 'GUARDAR CAMBIOS' : 'CREAR SLIDE'}
                    </button>
                </div>

            </div>
        </div>
    );
}

function ToggleSwitch({
    label,
    checked,
    onChange,
    color = 'bg-pink-500'
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    color?: string;
}) {
    return (
        <label className="flex flex-col items-center justify-center gap-3 cursor-pointer select-none w-full h-full group">
             <span className="text-[11px] uppercase font-black tracking-[0.2em] text-theme-secondary group-hover:text-theme-primary transition-colors text-center">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative w-16 h-8 rounded-full transition-all duration-300 shadow-inner border border-white/5',
                    checked ? color : 'bg-[#181825]'
                )}
            >
                <span
                    className={cn(
                        'absolute top-[3px] left-[3px] w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                        checked ? 'translate-x-8 scale-100' : 'translate-x-0 scale-90 opacity-80',
                    )}
                />
            </button>
        </label>
    );
}
