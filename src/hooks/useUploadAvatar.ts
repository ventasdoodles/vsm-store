/**
 * // ─── HOOK: useUploadAvatar ───
 * // Arquitectura: Custom Hook (State + Logic)
 * // Propósito central: Subir foto de perfil aislando el servicio `uploadAvatar` del UI.
 * // Cumple con regla §1.1 (Component -> Hook -> Service).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar } from '@/services/storage.service';

export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, file }: { userId: string; file: File }) => uploadAvatar(userId, file),
        onSuccess: () => {
            // Invalidar el caché del perfil para que la UI refresque la imagen
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });
}
