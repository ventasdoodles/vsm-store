/**
 * useUpdateProfile - VSM Store
 * 
 * Custom hook para la lógica y gestión de UpdateProfile.
 * @module hooks/useUpdateProfile
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/services';

interface UpdateProfileParams {
    userId: string;
    data: {
        full_name?: string;
        phone?: string;
        whatsapp?: string;
        birthdate?: string;
        avatar_url?: string;
    };
}

/**
 * Mutation hook para actualizar el perfil del usuario.
 * Invalida la cache de 'profile' al completar.
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: UpdateProfileParams) =>
            updateProfile(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
