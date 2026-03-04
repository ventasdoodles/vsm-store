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
    image_url: string | null;   // Imagen de portada/thumbnail (opcional)
    is_popular: boolean;        // Badge de llama "Trending" en tienda y admin
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
