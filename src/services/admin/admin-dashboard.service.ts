// ─── Admin Dashboard Service ─────────────────────
import { supabase } from '@/lib/supabase';
import type { OrderItem, AdminOrder } from './admin-orders.service';

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
    salesToday: number;
    pendingOrders: number;
    lowStockProducts: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    salesLast7Days: DailySales[];
    topProducts: TopProduct[];
}

export async function getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(start.getDate() - 6); // Default 7 days
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ventas del día
    const { data: todayOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', today.toISOString());

    const salesToday = todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;

    // Pedidos pendientes
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pendiente', 'confirmado', 'preparando']);

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
        .select('total, created_at')
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
        salesToday,
        pendingOrders: pendingOrders ?? 0,
        lowStockProducts: lowStockProducts ?? 0,
        totalCustomers: totalCustomers ?? 0,
        totalProducts: totalProducts ?? 0,
        totalOrders: totalOrders ?? 0,
        salesLast7Days,
        topProducts,
    };
}

export async function getRecentOrders(limit = 10) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data as AdminOrder[]) ?? [];
}
