import type { Category } from '@/types/category';
import type { Product, Section, ProductStatus } from '@/types/product';
import type { ProductFormData } from '@/services/admin';
import { slugify } from '@/lib/utils';

export const DEFAULT_PRODUCT_FORM: ProductFormData = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_at_price: null,
    stock: 0,
    sku: '',
    section: 'vape',
    category_id: '',
    tags: [],
    status: 'active' as ProductStatus,
    images: [],
    cover_image: null,
    is_featured: false,
    is_featured_until: null,
    is_new: false,
    is_new_until: null,
    is_bestseller: false,
    is_bestseller_until: null,
    is_active: true,
    specs: {},
    badges: [],
    ai_sales_note: null,
    ai_is_featured: false,
    ai_exclude: false,
};

export function buildDefaultProductForm(): ProductFormData {
    return {
        ...DEFAULT_PRODUCT_FORM,
        tags: [...DEFAULT_PRODUCT_FORM.tags],
        images: [...DEFAULT_PRODUCT_FORM.images],
        specs: { ...DEFAULT_PRODUCT_FORM.specs },
        badges: [...DEFAULT_PRODUCT_FORM.badges],
    };
}

export function buildProductFormFromProduct(product: Product): ProductFormData {
    return {
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        short_description: product.short_description ?? '',
        price: product.price,
        compare_at_price: product.compare_at_price,
        stock: product.stock,
        sku: product.sku ?? '',
        section: product.section,
        category_id: product.category_id,
        tags: [...(product.tags ?? [])],
        status: product.status,
        images: [...(product.images ?? [])],
        cover_image: product.cover_image ?? null,
        is_featured: product.is_featured,
        is_featured_until: product.is_featured_until ?? null,
        is_new: product.is_new,
        is_new_until: product.is_new_until ?? null,
        is_bestseller: product.is_bestseller,
        is_bestseller_until: product.is_bestseller_until ?? null,
        is_active: product.is_active,
        specs: { ...(product.specs ?? {}) },
        badges: [...(product.badges ?? [])],
        ai_sales_note: product.ai_sales_note ?? null,
        ai_is_featured: product.ai_is_featured ?? false,
        ai_exclude: product.ai_exclude ?? false,
    };
}

export function applyProductFormChange<K extends keyof ProductFormData>(
    form: ProductFormData,
    key: K,
    value: ProductFormData[K],
    options: { isEditing?: boolean } = {},
): ProductFormData {
    const next = {
        ...form,
        [key]: value,
    } as ProductFormData;

    if (key === 'name' && !options.isEditing) {
        next.slug = slugify(String(value));
    }

    if (key === 'section') {
        next.category_id = '';
    }

    return next;
}

export function appendProductTag(tags: string[], rawTag: string): string[] {
    const normalized = rawTag.trim().toLowerCase();
    if (!normalized || tags.includes(normalized)) return tags;
    return [...tags, normalized];
}

export function removeProductTag(tags: string[], tagToRemove: string): string[] {
    return tags.filter((tag) => tag !== tagToRemove);
}

export function buildProductCategoriesForSection(categories: Category[], section: Section): Category[] {
    const sectionCategories = categories.filter((category) => category.section === section);
    const roots = sectionCategories.filter((category) => !category.parent_id);
    const children = sectionCategories.filter((category) => !!category.parent_id);
    const ordered: Category[] = [];

    for (const root of roots) {
        ordered.push(root);
        ordered.push(...children.filter((category) => category.parent_id === root.id));
    }

    return ordered;
}

export function hasRequiredProductFields(form: Pick<ProductFormData, 'name' | 'category_id' | 'price'>): boolean {
    return Boolean(form.name && form.category_id && form.price !== undefined && form.price !== null);
}

function cloneProductForm(form: ProductFormData): ProductFormData {
    return {
        ...form,
        tags: [...form.tags],
        images: [...form.images],
        specs: { ...form.specs },
        badges: [...form.badges],
    };
}

export function buildProductSubmitPayload(form: ProductFormData): ProductFormData {
    return cloneProductForm(form);
}
