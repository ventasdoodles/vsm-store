// Riel de Categorías - VSM Store
// Lista horizontal de iconos circulares (tipo stories/rappi)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Leaf } from 'lucide-react';
import { getCategories } from '@/services/categories.service';
import type { Category } from '@/types/category';

interface CategoryRailProps {
    className?: string;
}

export function CategoryRail({ className }: CategoryRailProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className={className}>
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
            <div className="scrollbar-hide flex overflow-x-auto pb-4 gap-4 snap-x">
                {categories.map((cat) => (
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
