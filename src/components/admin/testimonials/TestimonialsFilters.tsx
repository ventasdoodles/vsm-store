import { Search } from 'lucide-react';

interface FiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    filterSection: string;
    onFilterSectionChange: (val: string) => void;
}

export function TestimonialsFilters({
    search,
    onSearchChange,
    filterSection,
    onFilterSectionChange,
}: FiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 py-2">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-secondary/80 group-focus-within:text-accent-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, extracto de reseña o ubicación..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-theme-primary/10 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-theme-primary focus:border-accent-primary focus:bg-theme-primary/20 focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all placeholder:text-theme-secondary/40 shadow-inner"
                />
            </div>
            
            <div className="relative group">
                <select
                    value={filterSection}
                    onChange={(e) => onFilterSectionChange(e.target.value)}
                    className="appearance-none w-full sm:w-64 bg-theme-primary/10 border border-white/10 rounded-2xl px-5 py-3.5 text-theme-primary focus:border-accent-primary focus:bg-theme-primary/20 focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all font-medium whitespace-nowrap overflow-hidden text-ellipsis shadow-inner"
                >
                    <option value="all">🌐 Todas las secciones</option>
                    <option value="vape">🌬️ Vape (Contexto)</option>
                    <option value="420">🌿 420 (Contexto)</option>
                    <option value="general">📌 Generales (Sin contexto)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                     <svg className="w-4 h-4 text-theme-secondary/80 group-focus-within:text-accent-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );
}
