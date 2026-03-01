// CategoriesHeader — VSM Admin
import { Plus, FolderTree } from 'lucide-react';
import type { Category } from '@/types/category';
import type { Section } from '@/types/product';

interface Props {
    categories: Category[];
    sectionFilter: Section | 'all';
    onSectionChange: (s: Section | 'all') => void;
    onNew: () => void;
}

const TABS: { label: string; value: Section | 'all' }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Vape', value: 'vape' },
    { label: '420', value: '420' },
];

export function CategoriesHeader({ categories, sectionFilter, onSectionChange, onNew }: Props) {
    const roots  = categories.filter(c => !c.parent_id);
    const children = categories.filter(c => !!c.parent_id);
    const popular = categories.filter(c => c.is_popular);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vape-500/10">
                    <FolderTree className="h-5 w-5 text-vape-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-theme-primary">Categorías</h1>
                    <p className="text-xs text-theme-secondary">
                        {roots.length} principales · {children.length} subcategorías
                        {popular.length > 0 && <span className="ml-1 text-orange-400">· 🔥 {popular.length} populares</span>}
                    </p>
                </div>
            </div>

            {/* Right: tabs + new button */}
            <div className="flex items-center gap-3">
                {/* Section tabs */}
                <div className="flex gap-1 rounded-xl border border-theme bg-theme-primary/40 p-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => onSectionChange(tab.value)}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                sectionFilter === tab.value
                                    ? 'bg-vape-500 text-white shadow'
                                    : 'text-theme-secondary hover:text-theme-primary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* New */}
                <button
                    onClick={onNew}
                    className="inline-flex items-center gap-2 rounded-xl bg-vape-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-vape-500 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nueva
                </button>
            </div>
        </div>
    );
}
