export interface ProductAttribute {
    id: string;
    name: string;
    created_at?: string;
    values?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
    id: string;
    attribute_id: string;
    value: string;
    created_at?: string;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string | null;
    price: number | null;
    stock: number;
    images: string[];
    is_active: boolean;
    options: ProductVariantOption[];
    created_at?: string;
    updated_at?: string;
}

export interface ProductVariantOption {
    variant_id: string;
    attribute_value_id: string;
    attribute_value?: ProductAttributeValue;
    attribute_name?: string; // Helper for UI
}

// Para la creación en el Admin
export interface VariantMatrixRow {
    combination: Record<string, string>; // { attribute_id: value_id }
    sku: string;
    price: number;
    stock: number;
}
