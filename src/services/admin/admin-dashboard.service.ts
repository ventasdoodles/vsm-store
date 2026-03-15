/**
 * // ─── ADMIN DASHBOARD SERVICE ───
 * // Proposito: Motor de analiticas y metricas para el panel administrativo.
 * // Arquitectura: Service Layer (§1.1) - Consolidacion de queries complejas.
 * // Regla / Notas: Selectores explicitos (§1.2), cero select(*), tipado fuerte.
 */
import { supabase } from '@/lib/supabase';
import type { OrderItem, AdminOrder } from './admin-orders.service';

/** Interface para el pulso del sistema */
export interface PulseMetrics {
    todaySales: number;
    activeOrders: number;
    inventoryAlerts: number;
    status: 'optimal' | 'busy' | 'alert';
}

/** Interface para estadísticas del dashboard */
export interface DailySales {
    date: string;
    total: number;
    count: number;
}

export interface TopProduct {
    name: string;
    sold: number;
    revenue: number;
}

export interface DashboardStats {
    todaySales: number;
    pendingOrders: number;
    lowStockProducts: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    salesLast7Days: DailySales[];
    topProducts: TopProduct[];
}

/** Selectores explicitos para integridad de datos (§1.2) */
const DASHBOARD_ORDERS_SELECT = 'id, total, created_at, status, items';
const RECENT_ORDERS_SELECT = `
    id, created_at, status, total, payment_method, tracking_notes, customer_id, shipping_address_id,
    customer_profiles:customer_id(full_name, phone),
    shipping_address:addresses!shipping_address_id(full_name, phone)
`;

/**
 * Obtiene métricas en tiempo real para el indicador "System Pulse".
 * @architecture Service Layer (§1.1)
 * @policy Explicit Selectors §1.2
 */
export async function getPulseMetrics(): Promise<PulseMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Ventas del día (optimizada)
    const { data: sales } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', today.toISOString())
        .not('status', 'eq', 'cancelado');

    // 2. Pedidos en curso
    const { count: pending } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pendiente', 'confirmado', 'preparando', 'en_camino']);

    // 3. Alertas de stock bajo
    const { count: lowStock } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .lt('stock', 5)
        .eq('is_active', true);

    const todaySales = sales?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    return {
        todaySales,
        activeOrders: pending || 0,
        inventoryAlerts: lowStock || 0,
        status: (lowStock || 0) > 0 ? 'alert' : (pending || 0) > 10 ? 'busy' : 'optimal'
    };
}

/**
 * Obtiene estadísticas generales del dashboard.
 */
export async function getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(start.getDate() - 6); // Default 7 days
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ventas del día
    const { todaySales } = await getPulseMetrics();

    // Pedidos pendientes
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pendiente', 'confirmado', 'preparando', 'en_camino']);

    // Productos con stock bajo (< 5)
    const { count: lowStockProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('stock', 5);

    // Total clientes
    const { count: totalCustomers } = await supabase
        .from('customer_profiles')
        .select('id', { count: 'exact', head: true });

    // Total productos activos
    const { count: totalProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

    // Total pedidos
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });

    // Ventas en Rango (Chart)
    const { data: rangeOrders } = await supabase
        .from('orders')
        .select(DASHBOARD_ORDERS_SELECT)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .not('status', 'eq', 'cancelado');

    // Group by day using a loop from start to end
    const dayMap = new Map<string, { total: number; count: number }>();
    const loopDate = new Date(start);
    while (loopDate <= end) {
        dayMap.set(loopDate.toISOString().slice(0, 10), { total: 0, count: 0 });
        loopDate.setDate(loopDate.getDate() + 1);
    }
    for (const o of rangeOrders ?? []) {
        const day = o.created_at?.slice(0, 10);
        if (day && dayMap.has(day)) {
            const entry = dayMap.get(day)!;
            entry.total += o.total || 0;
            entry.count += 1;
        }
    }
    const salesLast7Days: DailySales[] = Array.from(dayMap.entries()).map(
        ([date, { total, count }]) => ({ date, total, count })
    );

    // Top 5 productos by revenue (in range)
    const { data: ordersInRange } = await supabase
        .from('orders')
        .select('items')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .not('status', 'eq', 'cancelado');

    const productMap = new Map<string, { sold: number; revenue: number }>();
    for (const order of ordersInRange ?? []) {
        const items = (order.items as OrderItem[]) ?? [];
        for (const item of items) {
            const name = item.name || item.product_name || 'Sin nombre';
            const existing = productMap.get(name) ?? { sold: 0, revenue: 0 };
            existing.sold += item.quantity || 0;
            existing.revenue += (item.price || 0) * (item.quantity || 0);
            productMap.set(name, existing);
        }
    }
    const topProducts: TopProduct[] = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return {
        todaySales,
        pendingOrders: pendingOrders ?? 0,
        lowStockProducts: lowStockProducts ?? 0,
        totalCustomers: totalCustomers ?? 0,
        totalProducts: totalProducts ?? 0,
        totalOrders: totalOrders ?? 0,
        salesLast7Days,
        topProducts,
    };
}

/**
 * Obtiene el listado de pedidos recientes para el dashboard.
 * @policy Explicit Selectors §1.2
 */
export async function getRecentOrders(limit = 10): Promise<AdminOrder[]> {
    const { data, error } = await supabase
        .from('orders')
        .select(RECENT_ORDERS_SELECT)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    // Map joined data into flat AdminOrder fields to resolve name properly
    return (data ?? []).map((row) => {
        // Enforce types safely in case they come as objects or arrays
        const cpArray = Array.isArray(row.customer_profiles) ? row.customer_profiles[0] : row.customer_profiles;
        const saArray = Array.isArray(row.shipping_address) ? row.shipping_address[0] : row.shipping_address;

        const cp = cpArray as { full_name?: string; phone?: string } | null;
        const sa = saArray as { full_name?: string; phone?: string } | null;

        return {
            ...row,
            customer_profiles: undefined,
            shipping_address: undefined, // remove nested objects
            customer_name: cp?.full_name || sa?.full_name || 'Sin nombre',
            customer_phone: cp?.phone || sa?.phone || null,
        } as AdminOrder;
    });
}

/**
 * AI Dashboard Intelligence — "Pulse Tracker"
 * Genera una narrativa sobre el estado de salud del negocio.
 */
export async function getDashboardPulse(stats: DashboardStats): Promise<{ narrative: string; anomalies: string[]; health_score: number }> {
    try {
        // DIAGNOSTIC RAW FETCH
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-intelligence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ stats, action: 'get_pulse' })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('DIAGNOSTIC - AI Error Body:', JSON.stringify(errorBody, null, 2));
            throw new Error(errorBody.error || 'AI Edge Function Error');
        }

        const data = await response.json();
        return {
            narrative: data.narrative || 'No se pudo generar una narrativa en este momento.',
            anomalies: data.anomalies || [],
            health_score: data.health_score ?? 100
        };
    } catch (error: unknown) {
        if (import.meta.env.DEV) {
            console.error('Error getting dashboard pulse:', error);
        }
        throw error;
    }
}

/**
 * Obtiene productos con stock bajo para el panel de Oracle.
 */
export async function getOracleLowStockProducts(limit = 5): Promise<{ id: string; name: string; stock: number; section?: string; slug?: string }[]> {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, section, slug')
        .eq('is_active', true)
        .lt('stock', 10)
        .order('stock', { ascending: true })
        .limit(limit);

    if (error) throw error;
    return data || [];
}
