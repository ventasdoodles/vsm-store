import type { StoreSettings, LoyaltyConfig } from '@/services';
import type { SettingsFormData } from '@/components/admin/settings/settings.types';

export const DEFAULT_LOYALTY_SETTINGS: LoyaltyConfig = {
    points_per_currency: 1,
    currency_per_point: 0.1,
    min_points_to_redeem: 100,
    max_points_per_order: 1000,
    points_expiry_days: 365,
    enable_loyalty: true,
};

export const DEFAULT_STORE_SETTINGS_FORM: SettingsFormData = {
    site_name: '',
    description: '',
    whatsapp_number: '',
    whatsapp_default_message: '',
    social_links: { facebook: '', instagram: '', youtube: '', tiktok: '' },
    location_address: '',
    location_city: '',
    location_map_url: '',
    bank_account_info: '',
    payment_methods: { transfer: true, mercadopago: false, cash: false },
    loyalty_config: DEFAULT_LOYALTY_SETTINGS,
    vertical_pack_config: '{}',
};

type ChangeTarget = {
    name: string;
    value: string;
    type: string;
    checked?: boolean;
};

const TOP_LEVEL_FIELDS = new Set<keyof SettingsFormData>([
    'site_name',
    'description',
    'whatsapp_number',
    'whatsapp_default_message',
    'location_address',
    'location_city',
    'location_map_url',
    'bank_account_info',
    'vertical_pack_config',
]);

const DEFAULT_SOCIAL_LINKS = DEFAULT_STORE_SETTINGS_FORM.social_links;
const DEFAULT_PAYMENT_METHODS = DEFAULT_STORE_SETTINGS_FORM.payment_methods;

function cloneDefaultStoreSettingsForm(): SettingsFormData {
    return {
        ...DEFAULT_STORE_SETTINGS_FORM,
        social_links: { ...DEFAULT_STORE_SETTINGS_FORM.social_links },
        payment_methods: { ...DEFAULT_STORE_SETTINGS_FORM.payment_methods },
        loyalty_config: { ...DEFAULT_STORE_SETTINGS_FORM.loyalty_config },
    };
}

function normalizeLoyaltyConfig(loyaltyConfig: Partial<LoyaltyConfig> | null | undefined): LoyaltyConfig {
    return {
        ...DEFAULT_LOYALTY_SETTINGS,
        ...(loyaltyConfig ?? {}),
        enable_loyalty: loyaltyConfig?.enable_loyalty ?? DEFAULT_LOYALTY_SETTINGS.enable_loyalty,
        points_per_currency: loyaltyConfig?.points_per_currency ?? DEFAULT_LOYALTY_SETTINGS.points_per_currency,
        currency_per_point: loyaltyConfig?.currency_per_point ?? DEFAULT_LOYALTY_SETTINGS.currency_per_point,
        min_points_to_redeem: loyaltyConfig?.min_points_to_redeem ?? DEFAULT_LOYALTY_SETTINGS.min_points_to_redeem,
        max_points_per_order: loyaltyConfig?.max_points_per_order ?? DEFAULT_LOYALTY_SETTINGS.max_points_per_order,
        points_expiry_days: loyaltyConfig?.points_expiry_days ?? DEFAULT_LOYALTY_SETTINGS.points_expiry_days,
    };
}

export function buildStoreSettingsFormData(
    settings: Partial<StoreSettings> | null | undefined,
): SettingsFormData {
    if (!settings) return cloneDefaultStoreSettingsForm();

    return {
        site_name: settings.site_name || '',
        description: settings.description || '',
        whatsapp_number: settings.whatsapp_number || '',
        whatsapp_default_message: settings.whatsapp_default_message || '',
        social_links: {
            facebook: settings.social_links?.facebook || DEFAULT_SOCIAL_LINKS.facebook,
            instagram: settings.social_links?.instagram || DEFAULT_SOCIAL_LINKS.instagram,
            youtube: settings.social_links?.youtube || DEFAULT_SOCIAL_LINKS.youtube,
            tiktok: settings.social_links?.tiktok || DEFAULT_SOCIAL_LINKS.tiktok,
        },
        location_address: settings.location_address || '',
        location_city: settings.location_city || '',
        location_map_url: settings.location_map_url || '',
        bank_account_info: settings.bank_account_info || '',
        payment_methods: {
            transfer: settings.payment_methods?.transfer ?? DEFAULT_PAYMENT_METHODS.transfer,
            mercadopago: settings.payment_methods?.mercadopago ?? DEFAULT_PAYMENT_METHODS.mercadopago,
            cash: settings.payment_methods?.cash ?? DEFAULT_PAYMENT_METHODS.cash,
        },
        loyalty_config: normalizeLoyaltyConfig(settings.loyalty_config),
        vertical_pack_config: settings.vertical_pack_config ? JSON.stringify(settings.vertical_pack_config, null, 2) : '{}',
    };
}

export function buildStoreSettingsUpdatePayload(
    formData: SettingsFormData,
    settingsId: number,
): Omit<SettingsFormData, 'vertical_pack_config'> & { vertical_pack_config: Record<string, unknown>; id: number } {
    let parsedConfig = {};
    try {
        parsedConfig = JSON.parse(formData.vertical_pack_config || '{}');
    } catch (_e) {
        // Fallback to empty if invalid JSON
        parsedConfig = {};
    }

    return {
        ...formData,
        vertical_pack_config: parsedConfig,
        id: settingsId,
    };
}

export function applyStoreSettingsFormChange(
    formData: SettingsFormData,
    target: ChangeTarget,
): SettingsFormData {
    const { name, value, type, checked } = target;

    if (type === 'checkbox') {
        if (name.startsWith('payment_')) {
            const paymentKey = name.replace('payment_', '') as keyof SettingsFormData['payment_methods'];
            if (paymentKey in formData.payment_methods) {
                return {
                    ...formData,
                    payment_methods: {
                        ...formData.payment_methods,
                        [paymentKey]: Boolean(checked),
                    },
                };
            }
        }

        if (name.startsWith('loyalty_')) {
            const loyaltyKey = name.replace('loyalty_', '') as keyof LoyaltyConfig;
            if (loyaltyKey in formData.loyalty_config) {
                return {
                    ...formData,
                    loyalty_config: {
                        ...formData.loyalty_config,
                        [loyaltyKey]: Boolean(checked),
                    },
                };
            }
        }
    }

    if (name.startsWith('social_')) {
        const socialKey = name.replace('social_', '') as keyof SettingsFormData['social_links'];
        if (socialKey in formData.social_links) {
            return {
                ...formData,
                social_links: {
                    ...formData.social_links,
                    [socialKey]: value,
                },
            };
        }
        return formData;
    }

    if (name.startsWith('loyalty_')) {
        const loyaltyKey = name.replace('loyalty_', '') as keyof LoyaltyConfig;
        if (loyaltyKey in formData.loyalty_config) {
            return {
                ...formData,
                loyalty_config: {
                    ...formData.loyalty_config,
                    [loyaltyKey]: Number(value),
                },
            };
        }
        return formData;
    }

    if (TOP_LEVEL_FIELDS.has(name as keyof SettingsFormData)) {
        return {
            ...formData,
            [name]: value,
        };
    }

    return formData;
}
