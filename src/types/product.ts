// Tipos para productos - VSM Store
// Basado en schema de Supabase (001_initial_schema.sql)

export type Section = 'vape' | '420';

export type ProductStatus = 'active' | 'legacy' | 'discontinued' | 'coming_soon';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    price: number;
    compare_at_price: number | null; // Precio anterior / tachado
    stock: number;
    sku: string | null;
    section: Section;
    category_id: string;
    tags: string[];
    status: ProductStatus;
    images: string[];
    is_featured: boolean;
    is_new: boolean;
    is_bestseller: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Tipos para insert/update parcial
export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;
