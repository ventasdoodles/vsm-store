import { Loader2, Save, X, Star } from 'lucide-react';
import type { TestimonialFormData } from '@/services/admin/admin-testimonials.service';
import { cn } from '@/lib/utils';

interface TestimonialsFormProps {
    form: TestimonialFormData;
    setForm: (val: TestimonialFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    editingId: string | null;
    isPending: boolean;
}

export function TestimonialsForm({
    form,
    setForm,
    onSubmit,
    onCancel,
    editingId,
    isPending,
}: TestimonialsFormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="p-8 rounded-3xl bg-[#13141f] border border-white/[0.08] shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between shadow-sm border-b border-white/[0.08] pb-6 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-theme-primary drop-shadow-sm flex items-center gap-3">
                        <span className="w-2 h-8 bg-accent-primary rounded-full inline-block shadow-[0_0_10px_rgba(var(--color-accent-primary),0.5)]"></span>
                        {editingId ? 'Editar Testimonio' : 'Nuevo Testimonio'}
                    </h2>
                    <p className="text-sm font-medium text-theme-secondary mt-1 ml-5">
                        Los testimonios aumentan la confianza de los clientes en tus productos.
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

            {/* Row 1: Name + Location + Rating */}
            <div className="grid md:grid-cols-3 gap-6 mb-6 relative z-10">
                <div>
                    <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                        Nombre del cliente *
                    </label>
                    <input
                        type="text"
                        value={form.customer_name}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-accent-primary outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-inner"
                        placeholder="Emilio G."
                        required
                    />
                </div>
                <div>
                    <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                        Ubicación
                    </label>
                    <input
                        type="text"
                        value={form.customer_location}
                        onChange={(e) => setForm({ ...form, customer_location: e.target.value })}
                        className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-accent-primary outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-inner"
                        placeholder="CDMX, Mex."
                    />
                </div>
                <div>
                    <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                        Calificación
                    </label>
                    <div className="flex items-center gap-1.5 pt-2 bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-3 h-[58px] shadow-inner">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setForm({ ...form, rating: n })}
                                className="p-0.5 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                            >
                                <Star
                                    className={cn(
                                        'w-7 h-7 transition-all duration-300',
                                        n <= form.rating
                                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] scale-110'
                                            : 'text-zinc-600 hover:text-zinc-400'
                                    )}
                                />
                            </button>
                        ))}
                        <div className="ml-auto w-10 h-10 flex items-center justify-center bg-black/50 border border-white/5 rounded-xl text-lg font-black text-amber-400 tabular-nums shadow-inner">
                            {form.rating}
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Title + Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-6 relative z-10">
                <div>
                    <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                        Título de reseña (opcional)
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-accent-primary outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-inner"
                        placeholder="Excelente producto..."
                    />
                </div>
                <div className="relative group">
                    <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                        Sección (contexto visual)
                    </label>
                    <select
                        value={form.section}
                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                        className="appearance-none w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-accent-primary outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-inner"
                    >
                        <option value="">🌐 General (ambas secciones)</option>
                        <option value="vape">🌬️ Sólo Vape</option>
                        <option value="420">🌿 Sólo 420</option>
                    </select>
                    <div className="absolute right-5 bottom-5 pointer-events-none">
                        <svg className="w-5 h-5 text-theme-secondary/80 group-focus-within:text-accent-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Row 3: Body */}
            <div className="mb-6 relative z-10">
                <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1 flex justify-between">
                    <span>Cuerpo de la reseña *</span>
                    <span className="text-theme-secondary/40 font-mono tracking-normal text-[10px]">{form.body.length} caracteres</span>
                </label>
                <textarea
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-theme-primary focus:border-accent-primary outline-none focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-accent-primary/10 transition-all resize-none shadow-inner leading-relaxed"
                    rows={4}
                    placeholder="Escribe la reseña completa del cliente..."
                    required
                />
            </div>

            {/* Row 4: Toggles + Sort + Date */}
            <div className="grid md:grid-cols-4 gap-6 mb-8 relative z-10">
                <div>
                    <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                        Fecha
                    </label>
                    <input
                        type="date"
                        value={form.review_date}
                        onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                        className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-theme-primary focus:border-accent-primary outline-none font-mono focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-inner"
                    />
                </div>
                <div>
                    <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                        Orden (Prioridad)
                    </label>
                    <input
                        type="number"
                        value={form.sort_order}
                        onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-theme-primary/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-theme-primary focus:border-accent-primary outline-none font-mono focus:bg-theme-primary/[0.08] focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-inner"
                        min={0}
                    />
                </div>
                <div className="col-span-2 flex items-center justify-between gap-6 px-4 py-2 bg-theme-primary/[0.02] border border-white/5 rounded-2xl shadow-inner">
                    <ToggleSwitch
                        label="Verificada"
                        checked={form.verified_purchase}
                        onChange={(v) => setForm({ ...form, verified_purchase: v })}
                        color="bg-emerald-500"
                    />
                    <ToggleSwitch
                        label="Destacada"
                        checked={form.is_featured}
                        onChange={(v) => setForm({ ...form, is_featured: v })}
                        color="bg-amber-500"
                    />
                    <ToggleSwitch
                        label="Visible"
                        checked={form.is_active}
                        onChange={(v) => setForm({ ...form, is_active: v })}
                        color="bg-accent-primary"
                    />
                </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t border-white/[0.08] relative z-10">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-accent-primary to-accent-primary/80 hover:from-accent-primary/90 hover:to-accent-primary/70 text-white px-8 py-3.5 rounded-2xl font-black tracking-wide transition-all shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
                >
                    {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {editingId ? 'GUARDAR CAMBIOS' : 'CREAR TESTIMONIO'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl text-theme-primary bg-theme-secondary/20 hover:bg-theme-secondary/40 border border-white/5 hover:border-white/10 transition-all font-bold tracking-wide active:scale-95"
                >
                    CANCELAR
                </button>
            </div>
        </form>
    );
}

function ToggleSwitch({
    label,
    checked,
    onChange,
    color = 'bg-accent-primary'
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    color?: string;
}) {
    return (
        <label className="flex flex-col items-center gap-2 cursor-pointer select-none group">
             <span className="text-[10px] uppercase font-black tracking-[0.2em] text-theme-secondary group-hover:text-theme-primary transition-colors">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner border border-white/5',
                    checked ? color : 'bg-[#181825]'
                )}
            >
                <span
                    className={cn(
                        'absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                        checked ? 'translate-x-6 scale-100' : 'translate-x-0 scale-90 opacity-80',
                    )}
                />
            </button>
        </label>
    );
}
