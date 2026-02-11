// Tipos para categorías - VSM Store
import type { Section } from './product';

export interface Category {
    id: string;
    name: string;
    slug: string;
    section: Section;
    parent_id: string | null; // null = categoría raíz, string = subcategoría
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

// Categorías predefinidas por sección
export const VAPE_CATEGORIES = [
    'Mods',
    'Atomizadores',
    'Líquidos',
    'Coils/Resistencias',
    'Accesorios',
] as const;

export const HERBAL_CATEGORIES = [
    'Vaporizers',
    'Fumables',
    'Comestibles',
    'Concentrados',
    'Tópicos',
    'Accesorios',
] as const;
