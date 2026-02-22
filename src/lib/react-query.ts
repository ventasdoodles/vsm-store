// React Query — configuración central
// Exporta el QueryClient singleton con error handling global
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Extraer mensaje legible de un error
 */
function getErrorMessage(error: unknown): string {
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
            // Solo mostrar toast si la query ya tenía datos antes (refetch fallido)
            // o si no tiene datos y el componente no maneja su propio estado de error
            if (query.state.data !== undefined) {
                toast.error(`Error actualizando datos: ${getErrorMessage(error)}`, {
                    id: 'query-error', // Evitar toast duplicados
                    duration: 4000,
                });
            }
            // Queries sin datos previos: el componente maneja isError directamente
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            toast.error(getErrorMessage(error), {
                id: 'mutation-error',
                duration: 4000,
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
