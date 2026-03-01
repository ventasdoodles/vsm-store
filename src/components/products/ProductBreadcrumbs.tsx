/**
 * ProductBreadcrumbs — Navegación jerárquica para la página de producto.
 * 
 * @module ProductBreadcrumbs
 * @independent Componente independiente. Obtiene el nombre de la categoría via API.
 */
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryById } from '@/hooks/useCategories';
import type { Section } from '@/types/product';

interface ProductBreadcrumbsProps {
    section: Section;
    productName: string;
    categoryId?: string;
}

export function ProductBreadcrumbs({ section, productName, categoryId }: ProductBreadcrumbsProps) {
    const isVape = section === 'vape';
    const sectionLabel = isVape ? 'Vape' : '420';

    const { data: category } = useCategoryById(categoryId);

    return (
        <nav className="flex items-center gap-1.5 text-xs text-theme-primary0 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <Link
                to="/"
                className="flex-shrink-0 hover:text-theme-secondary transition-colors"
            >
                Inicio
            </Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary" />
            <Link
                to={`/${section}`}
                className={cn(
                    'flex-shrink-0 transition-colors',
                    isVape ? 'hover:text-vape-400' : 'hover:text-herbal-400'
                )}
            >
                {sectionLabel}
            </Link>
            {category && (
                <>
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary" />
                    <Link
                        to={`/${section}/${category.slug}`}
                        className={cn(
                            'flex-shrink-0 transition-colors',
                            isVape ? 'hover:text-vape-400' : 'hover:text-herbal-400'
                        )}
                    >
                        {category.name}
                    </Link>
                </>
            )}
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-theme-secondary" />
            <span className="truncate text-theme-secondary font-medium">
                {productName}
            </span>
        </nav>
    );
}
