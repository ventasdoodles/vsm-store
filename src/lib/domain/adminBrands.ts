import type { Brand } from '@/services/admin';

export type BrandFormData = Omit<Brand, 'id' | 'created_at' | 'updated_at'>;

export const DEFAULT_BRAND_FORM: BrandFormData = {
    name: '',
    logo_url: '',
    is_active: true,
    sort_order: 0,
};

export function buildEmptyBrandForm(): BrandFormData {
    return { ...DEFAULT_BRAND_FORM };
}

export function buildBrandCreateForm(brands: Brand[]): BrandFormData {
    const sortOrder = brands.length > 0
        ? Math.max(...brands.map((brand) => brand.sort_order || 0)) + 10
        : 0;

    return {
        ...DEFAULT_BRAND_FORM,
        sort_order: sortOrder,
    };
}

export function buildBrandEditForm(brand: Brand): BrandFormData {
    return {
        name: brand.name,
        logo_url: brand.logo_url || '',
        is_active: brand.is_active,
        sort_order: brand.sort_order,
    };
}

export function buildBrandDuplicateForm(brand: Brand): BrandFormData {
    return {
        name: `${brand.name} (Copia)`,
        logo_url: brand.logo_url || '',
        is_active: false,
        sort_order: brand.sort_order + 1,
    };
}

export function normalizeBrandSortOrderInput(value: string): number {
    return parseInt(value, 10) || 0;
}

export function buildBrandSubmitPayload(form: BrandFormData): BrandFormData {
    return {
        ...form,
        logo_url: form.logo_url || '',
    };
}
