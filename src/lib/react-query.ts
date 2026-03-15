// React Query — configuración central
// Exporta el QueryClient singleton con error handling global
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useNotificationsStore } from '@/stores/notifications.store';
import { logError } from '@/services/monitoring.service';

/**
 * Extraer mensaje legible de un error
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // Errores de Supabase suelen tener mensajes descriptivos
        if (error.message.includes('Failed to fetch')) {
            return 'Error de conexión. Verifica tu red.';
        }
        if (error.message.includes('JWT')) {
            return 'Tu sesión expiró. Vuelve a iniciar sesión.';
        }
        return error.message;
    }
    return 'Ocurrió un error inesperado.';
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => {
            // Persistir error en Supabase + Sentry
            logError('react_query', error, {
                queryKey: JSON.stringify(query.queryKey),
            });

            // Solo mostrar toast si la query ya tenía datos antes (refetch fallido)
            if (query.state.data !== undefined) {
                useNotificationsStore.getState().addNotification({
                    type: 'error',
                    title: 'Error de actualización',
                    message: getErrorMessage(error)
                });
            }
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            // Persistir error en Supabase + Sentry
            logError('mutation', error);

            useNotificationsStore.getState().addNotification({
                type: 'error',
                title: 'Error en la operación',
                message: getErrorMessage(error)
            });
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 min default (hooks override per tipo)
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
