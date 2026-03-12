/**
 * // ─── SERVICIO: admin-flash-deals.service ───
 * // Proposito: CRUD para ofertas flash. Cada flash deal vincula un producto con
 *    un precio especial, cantidad limitada, y rango de fechas.
 * // Regla / Notas: Sin `any`. Funciones puras async. Tipado estricto.
 */
import { supabase } from '@/lib/supabase';

/* ─── Tipos ─── */

export interface FlashDeal {
    id: string;
    product_id: string;
    flash_price: number;
    max_qty: number;
    sold_count: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    priority: number;
    created_at: string;
    updated_at: string;
    /** Joined from products */
    product?: {
        id: string;
        name: string;
        slug: string;
        price: number;
        compare_at_price: number | null;
        images: string[];
        stock: number;
        section: string;
    };
}

export interface FlashDealFormData {
    product_id: string;
    flash_price: number;
    max_qty: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    priority: number;
}

/* ─── Queries ─── */

/** Obtiene todas las flash deals con datos del producto */
export async function getAllFlashDeals(): Promise<FlashDeal[]> {
    const { data, error } = await supabase
        .from('flash_deals')
        .select(`
            *,
            product:products (
                id, name, slug, price, compare_at_price, images, stock, section
            )
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        if (import.meta.env.DEV) {
            console.error('SUPABASE ERROR in getAllFlashDeals:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }
        throw error;
    }
    return (data ?? []) as FlashDeal[];
}

/** Obtiene solo las flash deals activas y vigentes (para storefront) */
export async function getActiveFlashDeals(): Promise<FlashDeal[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('flash_deals')
        .select(`
            *,
            product:products (
                id, name, slug, price, compare_at_price, images, stock, section
            )
        `)
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('priority', { ascending: false });

    if (error) {
        if (import.meta.env.DEV) {
            console.error('SUPABASE ERROR in getActiveFlashDeals (admin version):', error);
        }
        throw error;
    }
    return (data ?? []) as FlashDeal[];
}

/* ─── Mutations ─── */

export async function createFlashDeal(formData: FlashDealFormData): Promise<FlashDeal> {
    const { data, error } = await supabase
        .from('flash_deals')
        .insert({
            product_id: formData.product_id,
            flash_price: formData.flash_price,
            max_qty: formData.max_qty,
            starts_at: formData.starts_at,
            ends_at: formData.ends_at,
            is_active: formData.is_active,
            priority: formData.priority,
        })
        .select()
        .single();

    if (error) throw error;
    return data as FlashDeal;
}

export async function updateFlashDeal(id: string, formData: Partial<FlashDealFormData>): Promise<FlashDeal> {
    const { data, error } = await supabase
        .from('flash_deals')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as FlashDeal;
}

export async function deleteFlashDeal(id: string): Promise<void> {
    const { error } = await supabase
        .from('flash_deals')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function toggleFlashDealActive(id: string, is_active: boolean): Promise<void> {
    const { error } = await supabase
        .from('flash_deals')
        .update({ is_active })
        .eq('id', id);

    if (error) throw error;
}

/** Incrementa sold_count al confirmar una compra */
export async function incrementFlashDealSold(id: string, qty: number = 1): Promise<void> {
    const { error } = await supabase.rpc('increment_flash_deal_sold', { deal_id: id, qty });
    // Fallback: manual increment via raw SQL if RPC doesn't exist
    if (error) {
        // Read current sold_count first, then increment
        const { data: deal } = await supabase
            .from('flash_deals')
            .select('sold_count')
            .eq('id', id)
            .single();
        const currentCount = deal?.sold_count ?? 0;
        const { error: updateErr } = await supabase
            .from('flash_deals')
            .update({ sold_count: currentCount + qty })
            .eq('id', id);
        if (updateErr) throw updateErr;
    }
}
