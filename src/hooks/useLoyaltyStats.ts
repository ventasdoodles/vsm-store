import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface LoyaltyStatsData {
    puntos_hoy: number;
    ultimo_canje: {
        created_at?: string;
        full_name?: string;
        points?: number;
    } | null;
    top_usuarios: Array<{
        id: string;
        full_name: string;
        balance: number;
    }>;
}

export function useLoyaltyStats() {
    return useQuery({
        queryKey: ['loyaltyStats'],
        queryFn: async (): Promise<LoyaltyStatsData> => {
            const { data, error } = await supabase.rpc('get_admin_loyalty_stats');
            
            if (error) {
                console.error("Error fetching loyalty stats (RPC may be missing):", error);
                // Return fallback if the RPC hasn't been executed on the DB yet
                return {
                    puntos_hoy: 0,
                    ultimo_canje: null,
                    top_usuarios: []
                };
            }
            
            return data as LoyaltyStatsData;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
