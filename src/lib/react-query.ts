// React Query â€” configuraciÃ³n central
// Exporta el QueryClient singleton con error handling global
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useNotificationsStore } from '@/stores/notifications.store';
import { logError } from '@/services';

/**
 * Extraer mensaje legible de un error
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // Errores de Supabase suelen tener mensajes descriptivos
        if (error.message.includes('Failed to fetch')) {
            return 'Error de conexiÃ³n. Verifica tu red.';
        }
        if (error.message.includes('JWT')) {
            return 'Tu sesiÃ³n expirÃ³. Vuelve a iniciar sesiÃ³n.';
        }
        if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            return 'Límite de IA alcanzado. Por favor, espera unos segundos o intenta más tarde (Cuota excedida).';
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

            // Solo mostrar toast si la query ya tenÃ­a datos antes (refetch fallido)
            if (query.state.data !== undefined) {
                useNotificationsStore.getState().addNotification({
                    type: 'error',
                    title: 'Error de actualizaciÃ³n',
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
                title: 'Error en la operaciÃ³n',
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

