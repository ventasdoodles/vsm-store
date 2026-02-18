// Tipos para productos - VSM Store
// Basado en schema de Supabase (001_initial_schema.sql)

import type { Section, ProductStatus } from '@/types/constants';
export type { Section, ProductStatus };

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
    cover_image: string | null;
    is_featured: boolean;
    is_featured_until: string | null;
    is_new: boolean;
    is_new_until: string | null;
    is_bestseller: boolean;
    is_bestseller_until: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Tipos para insert/update parcial
export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;
