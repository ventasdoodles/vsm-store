// Servicio de estadísticas de cliente - VSM Store
import { supabase } from '@/lib/supabase';
import type { OrderRecord, OrderItem } from './orders.service';

export interface TopProduct {
    product_id: string;
    name: string;
    image?: string;
    timesBought: number;
    totalSpent: number;
}

export interface MonthlySpending {
    month: string;   // "2026-01"
    label: string;   // "Ene"
    total: number;
}

export interface CustomerStats {
    totalSpent: number;
    totalOrders: number;
    averageTicket: number;
    favoriteCategory: string | null;
    favoriteSection: 'vape' | '420' | null;
    preferredPayment: string | null;
    preferredDelivery: string | null;
}

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ─── Productos más comprados ─────────────────────
export async function getTopProducts(customerId: string, limit = 5): Promise<TopProduct[]> {
    const { data: orders } = await supabase
        .from('orders')
        .select('items')
        .eq('customer_id', customerId)
        .not('status', 'eq', 'cancelled');

    if (!orders || orders.length === 0) return [];

    const productMap = new Map<string, TopProduct>();

    for (const order of orders) {
        const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
        for (const item of items) {
            const existing = productMap.get(item.product_id);
            if (existing) {
                existing.timesBought += item.quantity;
                existing.totalSpent += item.price * item.quantity;
            } else {
                productMap.set(item.product_id, {
                    product_id: item.product_id,
                    name: item.name,
                    image: item.image,
                    timesBought: item.quantity,
                    totalSpent: item.price * item.quantity,
                });
            }
        }
    }

    return Array.from(productMap.values())
        .sort((a, b) => b.timesBought - a.timesBought)
        .slice(0, limit);
}

// ─── Gasto por mes (últimos N meses) ─────────────
export async function getSpendingByMonth(customerId: string, months = 6): Promise<MonthlySpending[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at')
        .eq('customer_id', customerId)
        .not('status', 'eq', 'cancelled')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

    // Generar meses vacíos
    const monthMap = new Map<string, number>();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, 0);
    }

    // Sumar totales
    if (orders) {
        for (const o of orders) {
            const d = new Date(o.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthMap.set(key, (monthMap.get(key) ?? 0) + (o.total ?? 0));
        }
    }

    return Array.from(monthMap.entries()).map(([month, total]) => {
        const parts = month.split('-');
        const monthPart = parts[1] ?? '1';
        const monthIndex = parseInt(monthPart) - 1;
        return {
            month,
            label: MONTH_LABELS[monthIndex] ?? '',
            total: Math.round(total * 100) / 100,
        };
    });
}

// ─── Estadísticas generales del cliente ──────────
export async function getCustomerStats(customerId: string): Promise<CustomerStats> {
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .not('status', 'eq', 'cancelled') as { data: OrderRecord[] | null };

    if (!orders || orders.length === 0) {
        return {
            totalSpent: 0,
            totalOrders: 0,
            averageTicket: 0,
            favoriteCategory: null,
            favoriteSection: null,
            preferredPayment: null,
            preferredDelivery: null,
        };
    }

    const totalSpent = orders.reduce((s, o) => s + (o.total ?? 0), 0);
    const totalOrders = orders.length;
    const averageTicket = Math.round((totalSpent / totalOrders) * 100) / 100;

    // Sección favorita
    const sectionCount: Record<string, number> = {};
    for (const order of orders) {
        const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
        for (const item of items) {
            const sec = item.section ?? 'vape';
            sectionCount[sec] = (sectionCount[sec] ?? 0) + item.quantity;
        }
    }
    const favoriteSection = Object.entries(sectionCount).sort((a, b) => b[1] - a[1])[0]?.[0] as 'vape' | '420' | null ?? null;

    // Método de pago preferido
    const paymentCount: Record<string, number> = {};
    for (const order of orders) {
        const pm = order.payment_method ?? 'cash';
        paymentCount[pm] = (paymentCount[pm] ?? 0) + 1;
    }
    const preferredPayment = Object.entries(paymentCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
        totalSpent,
        totalOrders,
        averageTicket,
        favoriteCategory: null, // Requeriría hacer join con products
        favoriteSection,
        preferredPayment,
        preferredDelivery: null,
    };
}
