import { createContext, useContext } from 'react';
import type { Product } from '@/types/product';

export interface RowContextType {
    editing: boolean;
    setEditing: (val: boolean) => void;
    editForm: { price: number; stock: number };
    setEditForm: (val: { price: number; stock: number }) => void;
}

export const RowContext = createContext<RowContextType | null>(null);

export function useRowContext() {
    const ctx = useContext(RowContext);
    if (!ctx) throw new Error("useRowContext must be used within RowContext.Provider");
    return ctx;
}

export interface TableMetaType {
    onToggle: (id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', current: boolean) => void;
    onDelete: (id: string, name: string) => void;
    onQuickSave: (id: string, data: { price: number; stock: number }) => void;
    onEdit: (product: Product) => void;
    onDuplicate: (product: Product) => void;
    isTogglingId?: string;
    isDeletingId?: string;
    isSavingId?: string;
}
