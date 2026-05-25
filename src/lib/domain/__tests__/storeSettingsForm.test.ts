import { describe, expect, it } from 'vitest';
import type { StoreSettings } from '@/services';
import {
    applyStoreSettingsFormChange,
    buildStoreSettingsFormData,
    buildStoreSettingsUpdatePayload,
    DEFAULT_STORE_SETTINGS_FORM,
    DEFAULT_LOYALTY_SETTINGS,
} from '../storeSettingsForm';

describe('storeSettingsForm', () => {
    it('builds the default store settings form when settings are empty', () => {
        const form = buildStoreSettingsFormData(null);

        expect(form).toEqual(DEFAULT_STORE_SETTINGS_FORM);
        expect(form).not.toBe(DEFAULT_STORE_SETTINGS_FORM);
        expect(form.social_links).not.toBe(DEFAULT_STORE_SETTINGS_FORM.social_links);
        expect(form.payment_methods).not.toBe(DEFAULT_STORE_SETTINGS_FORM.payment_methods);
        expect(form.loyalty_config).not.toBe(DEFAULT_STORE_SETTINGS_FORM.loyalty_config);
    });

    it('normalizes partial store settings without losing explicit values', () => {
        const settings: Partial<StoreSettings> = {
            site_name: 'VSM Store',
            description: 'Wholesale and retail',
            social_links: {
                instagram: 'https://instagram.com/vsm',
            },
            payment_methods: {
                transfer: false,
                mercadopago: true,
                cash: false,
            },
            loyalty_config: {
                enable_loyalty: false,
                points_per_currency: 2,
            } as StoreSettings['loyalty_config'],
            whatsapp_number: '5551231234',
        };

        const form = buildStoreSettingsFormData(settings);

        expect(form.site_name).toBe('VSM Store');
        expect(form.description).toBe('Wholesale and retail');
        expect(form.whatsapp_number).toBe('5551231234');
        expect(form.social_links).toEqual({
            facebook: '',
            instagram: 'https://instagram.com/vsm',
            youtube: '',
            tiktok: '',
        });
        expect(form.payment_methods).toEqual({
            transfer: false,
            mercadopago: true,
            cash: false,
        });
        expect(form.loyalty_config).toEqual({
            ...DEFAULT_LOYALTY_SETTINGS,
            enable_loyalty: false,
            points_per_currency: 2,
        });
    });

    it('applies social payment and loyalty changes immutably', () => {
        const base = buildStoreSettingsFormData(null);

        const socialUpdated = applyStoreSettingsFormChange(base, {
            name: 'social_facebook',
            value: 'https://facebook.com/vsm',
            type: 'text',
        });
        const paymentUpdated = applyStoreSettingsFormChange(socialUpdated, {
            name: 'payment_transfer',
            value: '',
            type: 'checkbox',
            checked: false,
        });
        const loyaltyUpdated = applyStoreSettingsFormChange(paymentUpdated, {
            name: 'loyalty_points_per_currency',
            value: '3',
            type: 'number',
        });

        expect(socialUpdated).not.toBe(base);
        expect(socialUpdated.social_links.facebook).toBe('https://facebook.com/vsm');
        expect(paymentUpdated.payment_methods.transfer).toBe(false);
        expect(loyaltyUpdated.loyalty_config.points_per_currency).toBe(3);
        expect(base.social_links.facebook).toBe('');
        expect(base.payment_methods.transfer).toBe(true);
        expect(base.loyalty_config.points_per_currency).toBe(1);
    });

    it('ignores unrecognized fields instead of corrupting the form contract', () => {
        const base = buildStoreSettingsFormData(null);

        const updated = applyStoreSettingsFormChange(base, {
            name: 'unexpected_field',
            value: 'boom',
            type: 'text',
        });

        expect(updated).toBe(base);
        expect(updated).toEqual(DEFAULT_STORE_SETTINGS_FORM);
    });

    it('builds the update payload with the page-owned id', () => {
        const payload = buildStoreSettingsUpdatePayload(buildStoreSettingsFormData(null), 1);

        expect(payload).toMatchObject({
            ...DEFAULT_STORE_SETTINGS_FORM,
            id: 1,
        });
    });
});
