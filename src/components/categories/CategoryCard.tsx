// Card de subcategoría - VSM Store
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVape420ProductSurfacePresentationConfig } from '@/config/productization';
import type { Category } from '@/types/category';
import type { Section } from '@/types/constants';

interface CategoryCardProps {
    category: Category;
    section: Section;
    className?: string;
}

export function CategoryCard({ category, section, className }: CategoryCardProps) {
    const productSurfaceConfig = getVape420ProductSurfacePresentationConfig(section);

    return (
        <Link
            to={`/${section}/${category.slug}`}
            className={cn(
                'group relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border p-10 text-center glass-premium',
                'transition-all duration-500 cursor-pointer spotlight-container',
                productSurfaceConfig.categoryHoverShadowClassName,
                'hover:-translate-y-2',
                className
            )}
        >
            {/* Glossy Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon Container with Glow */}
            <div
                className={cn(
                    'relative flex h-20 w-20 items-center justify-center rounded-xl transition-all duration-500 shadow-inner',
                    productSurfaceConfig.categoryIconContainerClassName
                )}
            >
                <div className={cn(
                    "absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity",
                    productSurfaceConfig.categoryIconGlowClassName
                )} />
                <FolderOpen className="relative z-10 h-10 w-10 drop-shadow-glow" />
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-2">
                <h3 className="text-xl font-black text-theme-primary group-hover:text-white transition-colors tracking-tight uppercase">
                    {category.name}
                </h3>

                {category.description && (
                    <p className="text-xs uppercase tracking-widest text-theme-tertiary leading-relaxed line-clamp-2 max-w-[240px] opacity-60 font-bold">
                        {category.description}
                    </p>
                )}
            </div>

            {/* Indicator Dot */}
            <div className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-500",
                productSurfaceConfig.categoryDotClassName
            )} />
        </Link>
    );
}
