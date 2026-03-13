import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PulseMetrics {
    todaySales: number;
    activeOrders: number;
    inventoryAlerts: number;
    status: 'optimal' | 'busy' | 'alert';
}

/**
 * useAdminPulse Hook [Wave 60 - Quantum Administration]
 * 
 * Centralizes business intelligence logic. Polls real-time metrics from Supabase
 * for orders, sales, and inventory, deriving a global "System Status".
 * 
 * This hook is the source of truth for:
 * 1. AdminPulse floating pill (Metrics)
 * 2. AnimatedAtmosphere background (Status-based colors)
 */
export function useAdminPulse() {
    const [metrics, setMetrics] = useState<PulseMetrics>({
        todaySales: 0,
        activeOrders: 0,
        inventoryAlerts: 0,
        status: 'optimal'
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchPulse = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Sales Today
            const { data: sales } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', today.toISOString())
                .not('status', 'eq', 'cancelled');

            // 2. Pending Orders
            const { count: pending } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['pending', 'processing', 'shipped']);

            // 3. Low Stock Alerts
            const { count: lowStock } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .lt('stock', 5)
                .eq('is_active', true);

            const totalSales = sales?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0;

            setMetrics({
                todaySales: totalSales,
                activeOrders: pending || 0,
                inventoryAlerts: lowStock || 0,
                status: (lowStock || 0) > 0 ? 'alert' : (pending || 0) > 10 ? 'busy' : 'optimal'
            });
            setIsLoading(false);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Pulse logic failed:', error);
            }
        }
    };

    useEffect(() => {
        fetchPulse();
        const interval = setInterval(fetchPulse, 60000); // Poll every 1 minute
        return () => clearInterval(interval);
    }, []);

    return { metrics, isLoading, refetch: fetchPulse };
}
