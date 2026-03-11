/**
 * // ─── SERVICIO: admin-wheel.service ───
 * // Arquitectura: Service Layer (Database → Services → Hooks → Components)
 * // Proposito principal: CRUD para wheel_config (segmentos de la ruleta) y
 *    estadísticas de giros desde wheel_attempts. Solo lo usa el admin panel.
 * // Regla / Notas: Sin `any`. Selectores explícitos. Named exports. Sin console.log producción.
 */
import { supabase } from '@/lib/supabase';

/* ─── Tipos ─── */

export interface WheelPrizeAdmin {
    id: string;
    label: string;
    type: 'points' | 'coupon' | 'empty';
    value: { amount?: number; discount?: number; type?: string; code?: string };
    probability: number;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface WheelPrizeFormData {
    label: string;
    type: 'points' | 'coupon' | 'empty';
    value: { amount?: number; discount?: number; code?: string };
    probability: number;
    color: string;
    is_active: boolean;
}

export interface WheelStats {
    totalSpins: number;
    uniqueUsers: number;
    topPrizeLabel: string | null;
    spinsToday: number;
}

/* ─── Helpers ─── */
const SELECT_PRIZE = 'id, label, type, value, probability, color, is_active, created_at' as const;

/* ─── CRUD ─── */

export async function getAllWheelPrizes(): Promise<WheelPrizeAdmin[]> {
    const { data, error } = await supabase
        .from('wheel_config')
        .select(SELECT_PRIZE)
        .order('probability', { ascending: false });
    if (error) throw error;
    return (data ?? []) as WheelPrizeAdmin[];
}

export async function createWheelPrize(formData: WheelPrizeFormData): Promise<void> {
    const { error } = await supabase.from('wheel_config').insert(formData);
    if (error) throw error;
}

export async function updateWheelPrize(id: string, formData: WheelPrizeFormData): Promise<void> {
    const { error } = await supabase.from('wheel_config').update(formData).eq('id', id);
    if (error) throw error;
}

export async function deleteWheelPrize(id: string): Promise<void> {
    const { error } = await supabase.from('wheel_config').delete().eq('id', id);
    if (error) throw error;
}

export async function toggleWheelPrize(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
        .from('wheel_config')
        .update({ is_active: isActive })
        .eq('id', id);
    if (error) throw error;
}

export async function getWheelStats(): Promise<WheelStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('wheel_attempts')
        .select('id, customer_id, prize_id, created_at');
    if (error) throw error;

    const all = data ?? [];
    const spinsToday = all.filter(r => new Date(r.created_at) >= today).length;

    // Contar el prize_id más frecuente
    const prizeCount: Record<string, number> = {};
    for (const r of all) {
        prizeCount[r.prize_id] = (prizeCount[r.prize_id] ?? 0) + 1;
    }

    let topPrizeId: string | null = null;
    let maxCount = 0;
    for (const [pid, count] of Object.entries(prizeCount)) {
        if (count > maxCount) { maxCount = count; topPrizeId = pid; }
    }

    let topPrizeLabel: string | null = null;
    if (topPrizeId) {
        const { data: prize } = await supabase
            .from('wheel_config')
            .select('label')
            .eq('id', topPrizeId)
            .single();
        topPrizeLabel = prize?.label ?? null;
    }

    const uniqueUsers = new Set(all.map(r => r.customer_id)).size;

    return {
        totalSpins: all.length,
        uniqueUsers,
        topPrizeLabel,
        spinsToday,
    };
}
