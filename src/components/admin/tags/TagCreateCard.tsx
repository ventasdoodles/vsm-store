/**
 * // ─── COMPONENTE: TagCreateCard ───
 * // Arquitectura: Dumb Component (Interactive Input Card)
 * // Propósito principal: Tarjeta base para crear tags de forma ultra-rápida estilo inline.
 * // Regla / Notas: Autogenera el slug mientras el usuario teclea, se bloquea si el estado de red carga.
 */
import { useState } from 'react';
import { Plus, Loader2, Hash } from 'lucide-react';

interface TagCreateCardProps {
    onCreate: (name: string, label: string) => void;
    isLoading: boolean;
}

export function TagCreateCard({ onCreate, isLoading }: TagCreateCardProps) {
    const [label, setLabel] = useState('');
    const [name, setName] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleLabelChange = (val: string) => {
        setLabel(val);
        setName(val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && name.trim()) {
            onCreate(name, label || name);
            setLabel('');
            setName('');
            (e.currentTarget as HTMLInputElement).blur();
        }
    };

    const handleCreateClick = () => {
        if (name.trim()) {
            onCreate(name, label || name);
            setLabel('');
            setName('');
        }
    };

    return (
        <div 
            className={`group relative overflow-hidden rounded-[1.5rem] border transition-all duration-500 h-full min-h-[140px] flex flex-col justify-between p-5 ${
                isFocused || label.length > 0
                    ? 'border-accent-primary/40 bg-accent-primary/5 shadow-lg shadow-accent-primary/10' 
                    : 'border-white/10 border-dashed bg-[#13141f]/40 hover:bg-[#13141f]/70 hover:border-accent-primary/30'
            }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-[0.75rem] transition-colors ${isFocused || label ? 'bg-accent-primary/20' : 'bg-white/5 group-hover:bg-accent-primary/10'}`}>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 text-accent-primary animate-spin" />
                    ) : (
                        <Plus className={`h-4 w-4 transition-colors ${isFocused || label ? 'text-accent-primary' : 'text-theme-secondary group-hover:text-accent-primary'}`} />
                    )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isFocused || label ? 'text-accent-primary' : 'text-theme-secondary/70 group-hover:text-accent-primary'}`}>
                    Nueva Etiqueta
                </span>
            </div>

            <div className="space-y-3 relative z-10 w-full">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ej. Base Libre"
                        value={label}
                        onChange={(e) => handleLabelChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="w-full bg-transparent border-0 border-b border-white/10 px-0 py-1 text-sm font-black text-white focus:border-accent-primary focus:ring-0 placeholder-theme-secondary/30"
                    />
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                    <Hash className="h-3 w-3 text-accent-primary" />
                    <span className="text-[10px] font-mono text-accent-primary truncate">
                        {name || 'auto-slug'}
                    </span>
                </div>
            </div>

            {(label.trim().length > 0) && (
                <button
                    onClick={handleCreateClick}
                    disabled={isLoading || !name.trim()}
                    className="absolute right-4 bottom-4 bg-accent-primary text-black p-2 rounded-full hover:bg-accent-primary/90 transition-transform active:scale-90 disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
