/**
 * // ─── COMPONENTE: ProductTableRow ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Fila de producto premium con thumbnail glow, quick-edit glassmorphism.
 * // Refactor TanStack Table: Envuelve las celdas en RowContext.
 */
import { useState } from 'react';
import { m, useMotionValue, useMotionTemplate } from 'framer-motion';
import { flexRender, Row } from '@tanstack/react-table';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { RowContext } from './ProductsTableContext';

interface ProductTableRowProps {
    row: Row<Product>;
}

export function ProductTableRow({ row }: ProductTableRowProps) {
    const product = row.original;
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ price: product.price, stock: product.stock });

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    return (
        <RowContext.Provider value={{ editing, setEditing, editForm, setEditForm }}>
            <m.tr
                onMouseMove={handleMouseMove}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    'group relative transition-colors overflow-hidden',
                    row.getIsSelected() ? 'bg-vape-500/10' : 'hover:bg-white/[0.02]',
                    !product.is_active && 'opacity-40'
                )}
                style={{
                    backgroundImage: useMotionTemplate`
                        radial-gradient(
                            150px circle at ${mouseX}px ${mouseY}px,
                            rgba(168, 85, 247, 0.08),
                            transparent 80%
                        )
                    `,
                } as unknown as React.CSSProperties}
            >
                {row.getVisibleCells().map(cell => {
                    const isSelect = cell.column.id === 'select';
                    const isActions = cell.column.id === 'actions';
                    const isFlags = cell.column.id === 'flags';
                    
                    return (
                        <td 
                            key={cell.id} 
                            className={cn(
                                "px-4 py-3",
                                isSelect && "w-10",
                                isActions && "text-right",
                                isFlags && "hidden sm:table-cell"
                            )}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    );
                })}
            </m.tr>
        </RowContext.Provider>
    );
}
