import { Search } from 'lucide-react';

interface FiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
}

export function BrandsFilters({ search, onSearchChange }: FiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 py-2">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-secondary/80 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar marca por nombre..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-theme-primary/10 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-theme-primary focus:border-blue-500 focus:bg-theme-primary/20 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-theme-secondary/40 shadow-inner block"
                />
            </div>
        </div>
    );
}
