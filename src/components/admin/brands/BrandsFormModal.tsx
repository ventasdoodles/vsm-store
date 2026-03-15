import { Loader2, Save, X, ImageIcon } from 'lucide-react';
import type { Brand } from '@/services/admin';
import { cn } from '@/lib/utils';
import { ImageUploader } from '@/components/admin/products/ImageUploader';

export type BrandFormData = Omit<Brand, 'id' | 'created_at' | 'updated_at'>;

interface BrandsFormModalProps {
    isOpen: boolean;
    form: BrandFormData;
    setForm: (val: BrandFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    editingId: string | null;
    isPending: boolean;
    onUploadLogo: (file: File) => Promise<string>;
}

export function BrandsFormModal({
    isOpen,
    form,
    setForm,
    onSubmit,
    onCancel,
    editingId,
    isPending,
    onUploadLogo
}: BrandsFormModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onCancel} 
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#13141f] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 duration-300">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center justify-between shadow-sm border-b border-white/[0.08] pb-6 mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-theme-primary drop-shadow-sm flex items-center gap-3">
                            <span className="w-2 h-8 bg-blue-500 rounded-full inline-block shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            {editingId ? 'Editar Marca' : 'Nueva Marca'}
                        </h2>
                        <p className="text-sm font-medium text-theme-secondary mt-1 ml-5">
                            Configuración global de la marca
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

                <form onSubmit={onSubmit} className="space-y-6 relative z-10">
                    
                    {/* Name */}
                    <div>
                        <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                            Nombre de la Marca *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-blue-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner block"
                            placeholder="Ej: Elfbar, SMOK, RAW..."
                            required
                        />
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                            Logo de la Marca
                        </label>
                        <div className="bg-theme-primary/[0.03] border border-white/10 rounded-2xl p-5 shadow-inner">
                            <ImageUploader
                                images={form.logo_url ? [form.logo_url] : []}
                                maxImages={1}
                                onChange={(urls) => setForm({ ...form, logo_url: urls[0] || '' })}
                                onUpload={onUploadLogo}
                            />
                            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-theme-secondary/60 uppercase tracking-wider font-bold bg-black/20 py-2 rounded-lg border border-white/5">
                                 <ImageIcon className="w-3.5 h-3.5" />
                                 <span>Recomendado: PNG fondo transparente (Blanco)</span>
                            </div>
                        </div>
                    </div>

                    {/* Sort Order & Active */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                                Orden
                            </label>
                            <input
                                type="number"
                                value={form.sort_order}
                                onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-blue-500 outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner block font-mono"
                            />
                        </div>
                        <div className="flex items-end shadow-inner bg-theme-primary/[0.03] border-white/10 border rounded-2xl px-4 py-3 h-full">
                            <ToggleSwitch
                                label="Activa (Visible)"
                                checked={form.is_active ?? true}
                                onChange={(v) => setForm({ ...form, is_active: v })}
                                color="bg-blue-500"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-white/[0.08]">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-4 rounded-2xl text-theme-primary bg-theme-secondary/20 hover:bg-theme-secondary/40 border border-white/5 hover:border-white/10 transition-all font-bold tracking-wide active:scale-95"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-2xl font-black tracking-wide transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {editingId ? 'GUARDAR CAMBIOS' : 'CREAR MARCA'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

function ToggleSwitch({
    label,
    checked,
    onChange,
    color = 'bg-blue-500'
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    color?: string;
}) {
    return (
        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer select-none w-full h-full group">
             <span className="text-[10px] uppercase font-black tracking-[0.2em] text-theme-secondary group-hover:text-theme-primary transition-colors text-center">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner border border-white/5',
                    checked ? color : 'bg-[#181825]'
                )}
            >
                <span
                    className={cn(
                        'absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                        checked ? 'translate-x-7 scale-100' : 'translate-x-0 scale-90 opacity-80',
                    )}
                />
            </button>
        </label>
    );
}
