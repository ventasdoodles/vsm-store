/**
 * // ─── HOOK: useAdminCustomers ─── [Wave 128 - Hook Unification]
 * // Propósito: Centralizar la gestión del CRM administrativo.
 * // Maneja: Listado, Detalle, Inteligencia, Notas, Evidencia y God Mode.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAllCustomers, 
    getAdminCustomerDetails, 
    getCustomerOrders, 
    getCustomerPreferences, 
    getCustomerWishlist, 
    createCustomerWithDetails, 
    updateAdminCustomerNotes, 
    uploadCustomerEvidence, 
    updateCustomerStatus, 
    sendCustomerNotification, 
    suggestCustomerTags,
    getProactiveInsights,
    getCustomerNarrative,
    getStrategicLoyaltyAnalysis,
    type CreateCustomerData
} from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import { useAdminTactical } from './useAdminTactical';

const QUERY_KEY = ['admin', 'customers'] as const;

export function useAdminCustomers() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const { triggerSensory } = useAdminTactical();

    // Queries
    const { data: customers = [], isLoading } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: getAllCustomers,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: CreateCustomerData) => createCustomerWithDetails(data),
        onSuccess: () => {
            invalidate();
            success('Cliente Creado', 'El cliente ha sido registrado exitosamente.');
            triggerSensory('success-major');
        },
        onError: (err: Error) => notifyError('Error al crear cliente', err.message),
    });

    return {
        customers,
        isLoading,
        createCustomer: (data: CreateCustomerData) => createMutation.mutateAsync(data),
        isCreating: createMutation.isPending,
    };
}

/** 
 * Hook para obtener el perfil 360 de un cliente específico.
 */
export function useAdminCustomerDetail(customerId: string | undefined) {
    const queryClient = useQueryClient();
    const { success } = useNotification();
    const { triggerSensory } = useAdminTactical();

    const query = useQuery({
        queryKey: ['admin', 'customer', customerId],
        queryFn: () => customerId ? getAdminCustomerDetails(customerId) : null,
        enabled: !!customerId,
        staleTime: 5 * 60 * 1000,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customerId] });
    };

    // CRM Mutations
    const updateNotesMutation = useMutation({
        mutationFn: (data: { tags?: string[]; custom_fields?: Record<string, string>; notes?: string }) => 
            customerId ? updateAdminCustomerNotes(customerId, data) : Promise.reject('No ID'),
        onSuccess: () => {
            invalidate();
            success('Notas Guardadas', 'Información de CRM actualizada');
            triggerSensory('click-subtle');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ status, end }: { status: 'active' | 'suspended' | 'banned', end?: string | null }) => 
            customerId ? updateCustomerStatus(customerId, status, end) : Promise.reject('No ID'),
        onSuccess: () => {
            invalidate();
            success('Estatus Actualizado', 'El estatus del cliente ha cambiado');
            triggerSensory('click-subtle');
        }
    });

    const uploadEvidenceMutation = useMutation({
        mutationFn: (file: File) => customerId ? uploadCustomerEvidence(customerId, file) : Promise.reject('No ID'),
        onSuccess: () => {
            invalidate();
            success('Archivo Subido', 'Evidencia cargada correctamente');
            triggerSensory('success-major');
        }
    });

    const notifyMutation = useMutation({
        mutationFn: ({ title, message, type }: { title: string, message: string, type: 'info' | 'warning' | 'alert' | 'success' }) => 
            customerId ? sendCustomerNotification(customerId, title, message, type) : Promise.reject('No ID'),
        onSuccess: () => {
            success('Enviado', 'Notificación enviada al cliente');
            triggerSensory('success-major');
        }
    });

    return {
        customer: query.data,
        isLoading: query.isLoading,
        updateNotes: (data: { tags?: string[]; custom_fields?: Record<string, string>; notes?: string }) => updateNotesMutation.mutate(data),
        updateStatus: (status: 'active' | 'suspended' | 'banned', end?: string | null) => updateStatusMutation.mutate({ status, end }),
        uploadEvidence: (file: File) => uploadEvidenceMutation.mutate(file),
        sendNotification: (data: { title: string, message: string, type: 'info' | 'warning' | 'alert' | 'success' }) => notifyMutation.mutate(data),
        
        isUpdatingNotes: updateNotesMutation.isPending,
        isUpdatingStatus: updateStatusMutation.isPending,
        isUploading: uploadEvidenceMutation.isPending,
        isNotifying: notifyMutation.isPending
    };
}

/**
 * Hook para el comportamiento transaccional del cliente.
 */
export function useAdminCustomerIntelligence(customerId: string | undefined) {
    const ordersQuery = useQuery({
        queryKey: ['admin', 'customer', customerId, 'orders'],
        queryFn: () => customerId ? getCustomerOrders(customerId) : [],
        enabled: !!customerId
    });

    const preferencesQuery = useQuery({
        queryKey: ['admin', 'customer', customerId, 'preferences'],
        queryFn: () => customerId ? getCustomerPreferences(customerId) : null,
        enabled: !!customerId
    });

    const wishlistQuery = useQuery({
        queryKey: ['admin', 'customer', customerId, 'wishlist'],
        queryFn: () => customerId ? getCustomerWishlist(customerId) : [],
        enabled: !!customerId
    });

    const aiMutation = useMutation({
        mutationFn: () => customerId ? suggestCustomerTags(customerId) : Promise.reject('No ID'),
    });

    return {
        orders: ordersQuery.data ?? [],
        preferences: preferencesQuery.data,
        wishlist: wishlistQuery.data ?? [],
        isLoading: ordersQuery.isLoading || preferencesQuery.isLoading || wishlistQuery.isLoading,
        suggestTags: () => aiMutation.mutateAsync(),
        isSuggesting: aiMutation.isPending
    };
}

/**
 * Hook para la narrativa del cliente (IA).
 */
export function useAdminCustomerNarrative(customerId: string | undefined) {
    return useQuery({
        queryKey: ['admin', 'customer', customerId, 'ai', 'narrative'],
        queryFn: () => customerId ? getCustomerNarrative(customerId) : null,
        enabled: !!customerId,
        staleTime: 1000 * 60 * 60, // 1 hour - Narratives are stable
        retry: false,
    });
}

/**
 * Hook para el análisis estratégico profundo (IA).
 */
export function useAdminStrategicAnalysis(customerId: string | undefined) {
    return useQuery({
        queryKey: ['admin', 'customer', customerId, 'ai', 'strategic'],
        queryFn: () => customerId ? getStrategicLoyaltyAnalysis(customerId) : null,
        enabled: false, // Manual trigger only
        staleTime: 1000 * 60 * 120, // 2 hours
        retry: false,
    });
}

export function useAdminProactiveInsights() {
    const { success } = useNotification();
    const query = useQuery({
        queryKey: ['admin', 'ai', 'proactive-insights'],
        queryFn: getProactiveInsights,
        staleTime: 1000 * 60 * 30, // 30 min
    });

    return {
        insights: query.data?.insights ?? [],
        isLoading: query.isLoading,
        refetch: () => query.refetch().then(() => success('Actualizado', 'Inteligencia actualizada')),
        isError: query.isError
    };
}
