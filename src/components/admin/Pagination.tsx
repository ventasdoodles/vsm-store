import { Button } from "@/components/ui/Button";
// Componente de paginación reutilizable - VSM Store Admin
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** Items shown info, e.g. "1-10 de 42" */
    itemsLabel?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, itemsLabel }: PaginationProps) {
    if (totalPages <= 1) return null;

    // Build visible page numbers (max 5 around current)
    const pages: (number | '...')[] = [];
    const addPage = (p: number) => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };

    addPage(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) addPage(i);
    if (currentPage < totalPages - 2) pages.push('...');
    addPage(totalPages);

    const btnBase = 'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

    return (
        <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between">
            {itemsLabel && (
                <p className="text-xs text-theme-secondary">{itemsLabel}</p>
            )}
            <div className="flex items-center gap-1">
                {/* First */}
                <Button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={cn(btnBase, 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary')}
                    title="Primera página"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                {/* Prev */}
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(btnBase, 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary')}
                    title="Anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`dots-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-accent-primary">
                            ···
                        </span>
                    ) : (
                        <Button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={cn(
                                btnBase,
                                p === currentPage
                                    ? 'bg-vape-500/20 font-semibold text-vape-400'
                                    : 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
                            )}
                        >
                            {p}
                        </Button>
                    )
                )}

                {/* Next */}
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(btnBase, 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary')}
                    title="Siguiente"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                {/* Last */}
                <Button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={cn(btnBase, 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary')}
                    title="Última página"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ─── Helper Hook ─────────────────────────────────
export function usePagination<T>(items: T[], pageSize = 10) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    return { totalPages, pageSize };
}

export function paginateItems<T>(items: T[], page: number, pageSize = 10): T[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}
