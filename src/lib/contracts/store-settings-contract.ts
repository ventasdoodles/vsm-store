import { z } from 'zod';

/**
 * // ─── CONTRACT: Store Settings Guard ───
 * // Protege la configuración global de la tienda (el cerebro matemático y UI central).
 */

const LoyaltyConfigSchema = z.object({
    points_per_currency: z.number().min(0).max(10, { message: "Tasa de obtención de puntos destructiva (max 10)" }),
    currency_per_point: z.number().min(0).max(10, { message: "Valor del punto irreal" }),
    min_points_to_redeem: z.number().min(0),
    max_points_per_order: z.number().min(0),
    points_expiry_days: z.number().min(0),
    enable_loyalty: z.boolean(),
});

const LoyaltyTierSchema = z.object({
    id: z.enum(['bronze', 'silver', 'gold', 'platinum']),
    name: z.string(),
    threshold: z.number().min(0),
    multiplier: z.number().min(1).max(5, { message: "Multiplicador VIP irracional (max 5x)" }),
    color: z.string(),
    benefits: z.array(z.string()),
});

export const StoreSettingsUpdateSchema = z.object({
    site_name: z.string().optional(),
    description: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
    whatsapp_number: z.string().optional(),
    whatsapp_default_message: z.string().nullable().optional(),
    social_links: z.record(z.string(), z.string()).nullable().optional(),
    location_address: z.string().nullable().optional(),
    location_city: z.string().nullable().optional(),
    location_map_url: z.string().nullable().optional(),
    bank_account_info: z.string().nullable().optional(),
    payment_methods: z.object({
        transfer: z.boolean(),
        mercadopago: z.boolean(),
        cash: z.boolean(),
    }).nullable().optional(),
    hero_sliders: z.array(z.any()).nullable().optional(),
    featured_categories: z.array(z.any()).nullable().optional(),
    loyalty_config: LoyaltyConfigSchema.nullable().optional(),
    loyalty_tiers_config: z.array(LoyaltyTierSchema).nullable().optional(),
    flash_deals_end: z.string().nullable().optional(),
    is_ai_assistant_enabled: z.boolean().optional(),
    pilot_runbook_status: z.array(z.any()).nullable().optional(),
    vertical_pack_config: z.any().nullable().optional(),
}).partial();

export type StoreSettingsUpdate = z.infer<typeof StoreSettingsUpdateSchema>;
