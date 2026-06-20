import { ShieldCheck, Sparkles, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductSpecsBuilderProps {
    specs: Record<string, string>;
    specSuggestions: string[];
    categoryName?: string;
    onAddSpec: (key: string) => boolean;
    onUpdateSpec: (key: string, value: string) => void;
    onRemoveSpec: (key: string) => void;
}

/** Glassmorphism input style constant */
const INPUT_CLS = 'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20';

export function ProductSpecsBuilder({
    specs,
    specSuggestions,
    categoryName,
    onAddSpec,
    onUpdateSpec,
    onRemoveSpec
}: ProductSpecsBuilderProps) {
    return (
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
                            Sugerencias para {categoryName || 'esta sección'}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {specSuggestions.map(s => {
                                const isUsed = !!specs[s];
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => onAddSpec(s)}
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
                    {Object.entries(specs).map(([key, val], idx) => (
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
                                onChange={(e) => onUpdateSpec(key, e.target.value)}
                                className={cn(INPUT_CLS, "flex-1")} 
                            />
                            <button 
                                onClick={() => onRemoveSpec(key)} 
                                className="p-2 text-white/20 hover:text-red-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
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
                                if (onAddSpec(input.value)) input.value = '';
                            }
                        }}
                    />
                    <button 
                        type="button"
                        onClick={() => {
                            const keyInput = document.getElementById('new-spec-key') as HTMLInputElement;
                            if (onAddSpec(keyInput.value)) keyInput.value = '';
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        Añadir
                    </button>
                </div>
                <p className="text-[10px] text-white/20 italic">Las specs son propiedades técnicas fijas que no crean variaciones de stock.</p>
            </div>
        </section>
    );
}
