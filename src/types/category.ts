// Tipos para categorías - VSM Store
// Basado en schema de Supabase (001_initial_schema.sql)
import type { Section } from './product';

export interface Category {
    id: string;
    name: string;
    slug: string;
    section: Section;
    parent_id: string | null; // null = categoría raíz, string = subcategoría
    description: string | null;
    order_index: number;
    is_active: boolean;
    created_at: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

// Categoría con subcategorías anidadas (para UI)
export interface CategoryWithChildren extends Category {
    children: Category[];
}

// Categorías predefinidas por sección
export const VAPE_CATEGORIES = [
    'Mods',
    'Atomizadores',
    'Líquidos',
    'Coils',
    'Accesorios Vape',
] as const;

export const HERBAL_CATEGORIES = [
    'Vaporizers',
    'Fumables',
    'Comestibles',
    'Concentrados',
    'Tópicos',
    'Accesorios 420',
] as const;
