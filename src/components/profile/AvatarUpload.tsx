/**
 * AvatarUpload — Componente para subir y gestionar la foto de perfil.
 * 
 * @module AvatarUpload
 * @independent 100% independiente. Maneja subida a Supabase Storage internamente.
 */
import React, { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
    currentUrl?: string | null;
    userId: string;
    onUploadSuccess: (url: string) => void;
}

export function AvatarUpload({ currentUrl, userId, onUploadSuccess }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
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
            setIsUploading(true);

            // 1. Generar nombre de archivo único dentro de la carpeta del usuario
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // 2. Subir a Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 3. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            onUploadSuccess(publicUrl);
            notify.success('Éxito', 'Foto de perfil actualizada');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            notify.error('Error', 'No se pudo subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className={cn(
                    "relative flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden",
                    "bg-theme-secondary/20 vsm-border-subtle shadow-xl transition-all duration-500",
                    "group-hover:vsm-border-accent"
                )}>
                    {currentUrl ? (
                        <img
                            src={currentUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <User className="h-10 w-10 text-theme-tertiary opacity-40" />
                    )}

                    {/* Overlay al subir */}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                    )}

                    {/* Botón flotante de cámara */}
                    <button
                        type="button"
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        className={cn(
                            "absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300",
                            "group-hover:bg-black/40 opacity-0 group-hover:opacity-100",
                            isUploading && "hidden"
                        )}
                    >
                        <Camera className="h-6 w-6 text-white" />
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
