/**
 * // ─── HOOK: useWheelConfig ───
 * // Arquitectura: TanStack Query wrapper (datos read-only)
 * // Proposito principal: Obtiene y cachea la configuración de premios de la ruleta
 *    desde Supabase. Componentes consumen este hook; NO importan gamificationService.
 * // Regla / Notas: Sin `any`. Named export. staleTime = 5 min (config no cambia seguido).
 */
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '@/services/gamification.service';
import type { WheelPrize } from '@/services/gamification.service';

export const WHEEL_CONFIG_KEY = ['wheel', 'config'] as const;

/**
 * Hook para obtener la configuración activa de la ruleta.
 * Retorna los premios cacheados desde Supabase.
 */
export function useWheelConfig(): {
    prizes: WheelPrize[];
    isLoading: boolean;
    isError: boolean;
} {
    const { data, isLoading, isError } = useQuery({
        queryKey: [...WHEEL_CONFIG_KEY],
        queryFn: () => gamificationService.getWheelConfig(),
        staleTime: 1000 * 60 * 5, // 5 minutos — la config de la ruleta no cambia frecuente
        retry: 2,
    });

    return {
        prizes: data ?? [],
        isLoading,
        isError,
    };
}
