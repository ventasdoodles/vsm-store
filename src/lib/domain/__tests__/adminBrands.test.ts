import { describe, expect, it } from 'vitest';
import type { Brand } from '@/services/admin';
import {
    buildBrandCreateForm,
    buildBrandDuplicateForm,
    buildBrandEditForm,
    buildBrandSubmitPayload,
    buildEmptyBrandForm,
    DEFAULT_BRAND_FORM,
    normalizeBrandSortOrderInput,
} from '../adminBrands';

describe('adminBrands', () => {
    const brands: Brand[] = [
        { id: '1', name: 'Alpha', logo_url: '', is_active: true, sort_order: 10, created_at: '1', updated_at: '1' },
        { id: '2', name: 'Beta', logo_url: 'https://example.com/beta.png', is_active: false, sort_order: 20, created_at: '1', updated_at: '1' },
    ];

    it('builds a fresh empty brand form', () => {
        const form = buildEmptyBrandForm();

        expect(form).toEqual(DEFAULT_BRAND_FORM);
        expect(form).not.toBe(DEFAULT_BRAND_FORM);
    });

    it('builds create, edit, and duplicate forms with the current page semantics', () => {
        expect(buildBrandCreateForm(brands)).toEqual({
            name: '',
            logo_url: '',
            is_active: true,
            sort_order: 30,
        });

        expect(buildBrandEditForm(brands[1]!)).toEqual({
            name: 'Beta',
            logo_url: 'https://example.com/beta.png',
            is_active: false,
            sort_order: 20,
        });

        expect(buildBrandDuplicateForm(brands[0]!)).toEqual({
            name: 'Alpha (Copia)',
            logo_url: '',
            is_active: false,
            sort_order: 11,
        });
    });

    it('normalizes submit data and sort order inputs', () => {
        expect(normalizeBrandSortOrderInput('17')).toBe(17);
        expect(normalizeBrandSortOrderInput('')).toBe(0);

        const payload = buildBrandSubmitPayload({
            name: 'Gamma',
            logo_url: '',
            is_active: true,
            sort_order: 40,
        });

        expect(payload).toEqual({
            name: 'Gamma',
            logo_url: '',
            is_active: true,
            sort_order: 40,
        });
    });
});
