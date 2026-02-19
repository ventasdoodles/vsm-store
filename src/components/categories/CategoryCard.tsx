// Card de subcategoría - VSM Store
import { Link } from 'react-router-dom';
import { FolderOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category';
import type { Section } from '@/types/product';

interface CategoryCardProps {
    category: Category;
    section: Section;
    className?: string;
}

export function CategoryCard({ category, section, className }: CategoryCardProps) {
    const isVape = section === 'vape';

    return (
        <Link
            to={`/${section}/${category.slug}`}
            className={cn(
                'group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-8 text-center',
                'transition-all duration-300 cursor-pointer',
                isVape
                    ? 'border-vape-500/20 bg-vape-500/5 hover:border-vape-500/40 hover:bg-vape-500/10 hover:shadow-lg hover:shadow-vape-500/10'
                    : 'border-herbal-500/20 bg-herbal-500/5 hover:border-herbal-500/40 hover:bg-herbal-500/10 hover:shadow-lg hover:shadow-herbal-500/10',
                'hover:-translate-y-1',
                className
            )}
        >
            {/* Icono */}
            <div
                className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-xl transition-colors',
                    isVape
                        ? 'bg-vape-500/15 text-vape-400 group-hover:bg-vape-500/25'
                        : 'bg-herbal-500/15 text-herbal-400 group-hover:bg-herbal-500/25'
                )}
            >
                <FolderOpen className="h-7 w-7" />
            </div>

            {/* Nombre */}
            <h3 className="text-lg font-bold text-theme-primary group-hover:text-white transition-colors">
                {category.name}
            </h3>

            {/* Descripción */}
            {category.description && (
                <p className="text-xs text-theme-primary0 leading-relaxed line-clamp-2 max-w-[200px]">
                    {category.description}
                </p>
            )}

            {/* Flecha */}
            <ChevronRight
                className={cn(
                    'h-4 w-4 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1',
                    isVape ? 'text-vape-400' : 'text-herbal-400'
                )}
            />
        </Link>
    );
}
