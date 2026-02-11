// Tipos para productos - VSM Store
// Secciones del e-commerce

export type Section = 'vape' | '420';

export type ProductStatus = 'active' | 'legacy' | 'discontinued' | 'coming_soon';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    sku: string;
    section: Section;
    category_id: string;
    tags: string[];
    images: string[];
    status: ProductStatus;
    is_featured: boolean;
    is_new: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Tipo parcial para crear/actualizar productos
export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;
