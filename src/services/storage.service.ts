// Servicio de Storage — VSM Store
// Upload / Delete de imágenes en Supabase Storage
import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/**
 * Sube una imagen al bucket `product-images` y retorna la URL pública.
 */
export async function uploadProductImage(file: File): Promise<string> {
    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Tipo no permitido: ${file.type}. Usa JPG, PNG, WebP o AVIF.`);
    }
    // Validar tamaño
    if (file.size > MAX_SIZE) {
        throw new Error(`Archivo muy grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo 5 MB.`);
    }

    // Generar path único: timestamp_random_filename
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeName = file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40);
    const path = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${safeName}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
    });

    if (error) throw new Error(`Error al subir imagen: ${error.message}`);

    // Obtener URL pública
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Sube un avatar al bucket `avatars` y retorna la URL pública.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
    const AVATAR_BUCKET = 'avatars';
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        throw new Error('Por favor selecciona una imagen válida.');
    }
    
    // Validar tamaño (2MB para avatares)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('La imagen es muy grande. Máximo 2 MB.');
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
    });

    if (error) throw new Error(`Error al subir avatar: ${error.message}`);

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Elimina una imagen del bucket a partir de su URL pública.
 * Solo actúa sobre URLs que pertenecen al bucket `product-images`.
 */
export async function deleteProductImage(publicUrl: string): Promise<void> {
    // Extraer el path del URL público
    // Formato típico: https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) {
        // No es una URL de este bucket, ignorar silenciosamente
        return;
    }
    const path = decodeURIComponent(publicUrl.slice(idx + marker.length));

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
        console.warn('Error al eliminar imagen de storage:', error.message);
    }
}
