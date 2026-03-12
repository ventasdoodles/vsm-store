/**
 * // ─── COMPONENTE: AVATAR UPLOAD ───
 * // Propósito: Gestión de carga y visualización de avatar.
 * // Arquitectura: Pure UI component. Lógica delegada a storage.service.ts (§1.1).
 * // Estilo: Custom Circle Inset con feedback dinámico.
 */
import React, { useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { useUploadAvatar } from '@/hooks/useUploadAvatar';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
    currentUrl?: string | null;
    userId: string;
    onUploadSuccess: (url: string) => void;
}

export function AvatarUpload({ currentUrl, userId, onUploadSuccess }: AvatarUploadProps) {
    const { mutateAsync: uploadAvatarAsync, isPending: isUploading } = useUploadAvatar();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const notify = useNotification();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validaciones básicas
        if (!file.type.startsWith('image/')) {
            notify.error('Archivo inválido', 'Por favor selecciona una imagen');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            notify.error('Archivo muy grande', 'El tamaño máximo es de 2MB');
            return;
        }

        try {
            const publicUrl = await uploadAvatarAsync({ userId, file });
            onUploadSuccess(publicUrl);
            notify.success('Éxito', 'Foto de perfil actualizada');
        } catch (err) {
            const error = err as Error;
            console.error('Error uploading avatar:', error);
            notify.error('Error', error.message || 'No se pudo subir la imagen');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className={cn(
                    "relative flex h-32 w-32 items-center justify-center rounded-3xl overflow-hidden",
                    "bg-white/[0.02] border border-white/5 shadow-2xl transition-all duration-700 backdrop-blur-3xl",
                    "group-hover:border-accent-primary/50 group-hover:shadow-accent-primary/10"
                )}>
                    {currentUrl ? (
                        <img
                            src={currentUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-1 opacity-40">
                            <User className="h-10 w-10 text-theme-tertiary" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-theme-tertiary">Sin foto</span>
                        </div>
                    )}

                    {/* Overlay al subir / hover */}
                    <button
                        type="button"
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center transition-all duration-500",
                            "bg-black/0 group-hover:bg-black/60",
                            isUploading ? "bg-black/60 opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                    >
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        ) : (
                            <>
                                <Camera className="h-6 w-6 text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">Cambiar</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <p className="text-[10px] font-medium text-theme-tertiary uppercase tracking-widest opacity-60">
                JPG, PNG o WEBP. Máx 2MB.
            </p>
        </div>
    );
}
