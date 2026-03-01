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
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import type { Section } from '@/types/product';

interface ProductBreadcrumbsProps {
    section: Section;
    productName: string;
    productSlug?: string;
    categoryId?: string;
}

export function ProductBreadcrumbs({ section, productName, productSlug, categoryId }: ProductBreadcrumbsProps) {
    const isVape = section === 'vape';
    const sectionLabel = isVape ? 'Vape' : '420';

    const { data: category } = useCategoryById(categoryId);

    // Construir breadcrumbs schema validado dinámicamente
    const breadcrumbItems = [
        { name: 'Inicio', item: '/' },
        { name: sectionLabel, item: `/${section}` },
    ];
    if (category) {
        breadcrumbItems.push({ name: category.name, item: `/${section}/${category.slug}` });
    }
    breadcrumbItems.push({ 
        name: productName, 
        item: productSlug ? `/${section}/${productSlug}` : window.location.pathname 
    });

    return (
        <nav className="flex items-center gap-1.5 text-xs text-theme-secondary overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <BreadcrumbJsonLd items={breadcrumbItems} />
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
