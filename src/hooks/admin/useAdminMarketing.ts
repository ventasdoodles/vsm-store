/**
 * // ─── HOOK: useAdminMarketing ─── [Wave 128 - Hook Unification]
 * // Propósito: Centralizar la gestión de Cupones, Flash Deals y Testimonios.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAllCoupons, 
    createCoupon, 
    updateCoupon, 
    deleteCoupon,
    getAllFlashDeals,
    createFlashDeal,
    updateFlashDeal,
    deleteFlashDeal,
    toggleFlashDealActive,
    suggestFlashDealMagic,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialFeatured,
    toggleTestimonialActive
} from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import { useAdminTactical } from './useAdminTactical';

export function useAdminCoupons() {
    const queryClient = useQueryClient();
    const { success } = useNotification();
    const { triggerSensory } = useAdminTactical();

    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['admin', 'coupons'],
        queryFn: getAllCoupons,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });

    const createMutation = useMutation({
        mutationFn: createCoupon,
        onSuccess: () => {
            invalidate();
            success('Cupón creado', 'El nuevo cupón ya está disponible.');
            triggerSensory('success-major');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ code, data }: { code: string; data: any }) => updateCoupon(code, data),
        onSuccess: () => {
            invalidate();
            success('Cupón actualizado', 'Los cambios se guardaron correctamente.');
            triggerSensory('click-subtle');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCoupon,
        onSuccess: () => {
            invalidate();
            success('Cupón removido', 'El cupón ha sido eliminado/desactivado.');
            triggerSensory('delete-confirm');
        }
    });

    return {
        coupons,
        isLoading,
        createCoupon: (data: any) => createMutation.mutate(data),
        updateCoupon: (code: string, data: any) => updateMutation.mutate({ code, data }),
        deleteCoupon: (id: string) => deleteMutation.mutate(id),
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    };
}

export function useAdminFlashDeals() {
    const queryClient = useQueryClient();
    const { success } = useNotification();
    const { triggerSensory } = useAdminTactical();

    const query = useQuery({
        queryKey: ['admin', 'flash-deals'],
        queryFn: getAllFlashDeals,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'flash-deals'] });

    const saveMutation = useMutation({
        mutationFn: (data: any) => data.id ? updateFlashDeal(data.id, data) : createFlashDeal(data),
        onSuccess: () => { 
            invalidate(); 
            success('Guardado', 'Oferta relámpago actualizada'); 
            triggerSensory('success-major');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteFlashDeal,
        onSuccess: () => { 
            invalidate(); 
            success('Eliminado', 'Oferta eliminada'); 
            triggerSensory('delete-confirm');
        }
    });

    const suggestMutation = useMutation({
        mutationFn: ({ productId, price, stock }: { productId: string, price: number, stock: number }) => 
            suggestFlashDealMagic(productId, price, stock),
        onSuccess: () => { 
            invalidate(); 
            success('Sugerencia', 'Oferta flash sugerida creada exitosamente'); 
            triggerSensory('success-major');
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleFlashDealActive(id, active),
        onSuccess: () => { 
            invalidate(); 
            success('Actualizada', 'Estado de la oferta actualizado'); 
            triggerSensory('click-subtle');
        }
    });

    return {
        deals: query.data ?? [],
        isLoading: query.isLoading,
        saveDeal: (data: any) => saveMutation.mutate(data),
        deleteDeal: (id: string) => deleteMutation.mutate(id),
        toggleActive: (id: string, active: boolean) => toggleActiveMutation.mutate({ id, active }),
        suggestDeal: (productId: string, price: number, stock: number) => 
            suggestMutation.mutateAsync({ productId, price, stock }),
        isMutating: saveMutation.isPending || deleteMutation.isPending || toggleActiveMutation.isPending,
        isSuggesting: suggestMutation.isPending,
        togglingId: toggleActiveMutation.isPending ? toggleActiveMutation.variables?.id : undefined,
        deletingId: deleteMutation.isPending ? deleteMutation.variables : undefined
    };
}

export function useAdminTestimonials() {
    const queryClient = useQueryClient();
    const { success } = useNotification();
    const { triggerSensory } = useAdminTactical();

    const { data: testimonials = [], isLoading } = useQuery({
        queryKey: ['admin', 'testimonials'],
        queryFn: getAllTestimonials,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });

    const createMutation = useMutation({
        mutationFn: createTestimonial,
        onSuccess: () => { 
            invalidate(); 
            success('Éxito', 'Testimonio creado'); 
            triggerSensory('success-major');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateTestimonial(id, data),
        onSuccess: () => { 
            invalidate(); 
            success('Actualizado', 'Testimonio modificado'); 
            triggerSensory('click-subtle');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTestimonial(id),
        onSuccess: () => { 
            invalidate(); 
            success('Eliminado', 'Testimonio borrado'); 
            triggerSensory('delete-confirm');
        }
    });

    const toggleFeaturedMutation = useMutation({
        mutationFn: ({ id, featured }: { id: string; featured: boolean }) => toggleTestimonialFeatured(id, featured),
        onSuccess: () => { 
            invalidate(); 
            success('Destacado', 'Estado del testimonio actualizado'); 
            triggerSensory('click-subtle');
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleTestimonialActive(id, active),
        onSuccess: () => { 
            invalidate(); 
            success('Visibilidad', 'Estado de visibilidad actualizado'); 
            triggerSensory('click-subtle');
        }
    });

    return {
        testimonials,
        isLoading,
        createTestimonial: (data: any) => createMutation.mutate(data),
        updateTestimonial: (id: string, data: any) => updateMutation.mutate({ id, data }),
        deleteTestimonial: (id: string) => deleteMutation.mutate(id),
        toggleFeatured: (id: string, featured: boolean) => toggleFeaturedMutation.mutate({ id, featured }),
        toggleActive: (id: string, active: boolean) => toggleActiveMutation.mutate({ id, active }),
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || toggleFeaturedMutation.isPending || toggleActiveMutation.isPending
    };
}
