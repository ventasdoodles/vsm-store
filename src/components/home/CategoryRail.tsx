// Riel de Categorías - VSM Store
// Lista horizontal de iconos circulares (tipo stories/rappi)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategories } from '@/services/categories.service';
import type { Category } from '@/types/category';
import type { Section } from '@/types/product';

interface CategoryRailProps {
    className?: string;
}

export function CategoryRail({ className }: CategoryRailProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filter, setFilter] = useState<Section | 'all'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all'
        ? categories
        : categories.filter((c) => c.section === filter);

    const SectionToggle = () => (
        <div className="mb-6 flex justify-center gap-3">
            {[
                { id: 'all', label: 'Todos' },
                { id: 'vape', label: 'Vape' },
                { id: '420', label: '420' }
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setFilter(item.id as any)}
                    className={cn(
                        'rounded-xl px-5 py-2 text-sm font-medium transition-all duration-300',
                        filter === item.id
                            ? item.id === 'vape' ? 'bg-vape-500 text-white shadow-lg shadow-vape-500/30'
                                : item.id === '420' ? 'bg-herbal-500 text-white shadow-lg shadow-herbal-500/30'
                                    : 'bg-primary-100 text-primary-950 shadow-lg'
                            : 'bg-primary-800/30 text-primary-400 hover:bg-primary-800/50'
                    )}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className={className}>
                <SectionToggle />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="h-16 w-16 animate-pulse rounded-full bg-primary-800/40" />
                            <div className="h-3 w-12 animate-pulse rounded bg-primary-800/40" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <SectionToggle />

            <div className="scrollbar-hide flex overflow-x-auto pb-4 gap-4 snap-x">
                {filtered.map((cat) => (
                    <Link
                        key={cat.id}
                        to={`/${cat.section}?category=${cat.slug}`}
                        className="group flex flex-col items-center gap-3 snap-start min-w-[80px]"
                    >
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-800 to-primary-900 shadow-lg ring-2 ring-white/5 transition-all group-hover:scale-105 group-hover:ring-vape-500/50 group-active:scale-95">
                            {cat.section === 'vape' ? (
                                <Flame className="h-8 w-8 text-vape-400" />
                            ) : (
                                <Leaf className="h-8 w-8 text-herbal-400" />
                            )}
                        </div>
                        <span className="max-w-[90px] text-center text-xs font-medium leading-tight text-primary-400 group-hover:text-primary-100 transition-colors">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
