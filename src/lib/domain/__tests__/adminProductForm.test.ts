import { describe, expect, it } from 'vitest';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import {
    appendProductTag,
    applyProductFormChange,
    buildDefaultProductForm,
    buildProductCategoriesForSection,
    buildProductFormFromProduct,
    buildProductSubmitPayload,
    hasRequiredProductFields,
    removeProductTag,
    DEFAULT_PRODUCT_FORM,
} from '../adminProductForm';
import { getAdminDefaultSectionSlug } from '@/config/productization';

describe('adminProductForm', () => {
    it('builds a fresh default product form', () => {
        const form = buildDefaultProductForm();

        expect(form).toEqual(DEFAULT_PRODUCT_FORM);
        expect(form).not.toBe(DEFAULT_PRODUCT_FORM);
        expect(form.tags).not.toBe(DEFAULT_PRODUCT_FORM.tags);
        expect(form.images).not.toBe(DEFAULT_PRODUCT_FORM.images);
        expect(form.specs).not.toBe(DEFAULT_PRODUCT_FORM.specs);
        expect(form.badges).not.toBe(DEFAULT_PRODUCT_FORM.badges);
        expect(form.section).toBe(getAdminDefaultSectionSlug());
    });

    it('hydrates product data into a form without losing optional values', () => {
        const product: Product = {
            id: 'p1',
            name: 'Blue Dream',
            slug: 'blue-dream',
            description: null,
            short_description: 'Short',
            price: 100,
            compare_at_price: null,
            stock: 5,
            sku: null,
            section: 'vape',
            category_id: 'cat-1',
            tags: ['flower'],
            status: 'active',
            images: ['img-1'],
            cover_image: null,
            is_featured: true,
            is_featured_until: '2026-06-01T00:00:00.000Z',
            is_new: false,
            is_new_until: null,
            is_bestseller: true,
            is_bestseller_until: null,
            is_active: true,
            created_at: '2026-05-25T00:00:00.000Z',
            updated_at: '2026-05-25T00:00:00.000Z',
            specs: { thc: '20%' },
            badges: ['top'],
            ai_is_featured: false,
            ai_sales_note: null,
            ai_exclude: false,
        };

        const form = buildProductFormFromProduct(product);

        expect(form).toMatchObject({
            name: 'Blue Dream',
            slug: 'blue-dream',
            description: '',
            short_description: 'Short',
            sku: '',
            tags: ['flower'],
            images: ['img-1'],
            specs: { thc: '20%' },
            badges: ['top'],
            ai_sales_note: null,
        });
        expect(form.tags).not.toBe(product.tags);
        expect(form.images).not.toBe(product.images);
        expect(form.specs).not.toBe(product.specs);
        expect(form.badges).not.toBe(product.badges);
    });

    it('applies form changes immutably and preserves the current slug/category behavior', () => {
        const base = buildDefaultProductForm();
        const named = applyProductFormChange(base, 'name', 'Fresh Mango', { isEditing: false });
        const sectionChanged = applyProductFormChange(named, 'section', '420');

        expect(named).not.toBe(base);
        expect(named.slug).toBe('fresh-mango');
        expect(sectionChanged.category_id).toBe('');
        expect(base.slug).toBe('');
        expect(base.category_id).toBe('');
    });

    it('handles tags as a normalized contract', () => {
        const appended = appendProductTag(['vape'], '  New Tag  ');
        const duplicate = appendProductTag(appended, 'new tag');
        const removed = removeProductTag(duplicate, 'vape');

        expect(appended).toEqual(['vape', 'new tag']);
        expect(duplicate).toBe(appended);
        expect(removed).toEqual(['new tag']);
    });

    it('orders categories by section with roots before children', () => {
        const categories: Category[] = [
            { id: 'a-1', name: 'Child A', slug: 'child-a', section: 'vape', parent_id: 'a', description: null, image_url: null, is_popular: false, order_index: 2, is_active: true, created_at: '1' },
            { id: 'b', name: 'Root B', slug: 'root-b', section: 'vape', parent_id: null, description: null, image_url: null, is_popular: false, order_index: 3, is_active: true, created_at: '1' },
            { id: 'a', name: 'Root A', slug: 'root-a', section: 'vape', parent_id: null, description: null, image_url: null, is_popular: false, order_index: 1, is_active: true, created_at: '1' },
            { id: 'a-2', name: 'Child B', slug: 'child-b', section: 'vape', parent_id: 'a', description: null, image_url: null, is_popular: false, order_index: 4, is_active: true, created_at: '1' },
            { id: 'c', name: '420 Root', slug: 'root-420', section: '420', parent_id: null, description: null, image_url: null, is_popular: false, order_index: 1, is_active: true, created_at: '1' },
        ];

        expect(buildProductCategoriesForSection(categories, 'vape').map((category) => category.id)).toEqual(['b', 'a', 'a-1', 'a-2']);
    });

    it('builds a normalized submit payload and validates required fields', () => {
        const form = buildDefaultProductForm();
        const payload = buildProductSubmitPayload({
            ...form,
            name: 'Demo',
            category_id: 'cat-1',
            price: 20,
        });

        expect(hasRequiredProductFields(payload)).toBe(true);
        expect(payload).not.toBe(form);
        expect(payload.tags).not.toBe(form.tags);
    });
});
