// Utilidades generales - VSM Store
import clsx, { type ClassValue } from 'clsx';

/**
 * Combina clases CSS condicionalmente (wrapper de clsx)
 * Uso: cn('base-class', condition && 'conditional-class')
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

/**
 * Formatea un precio en pesos mexicanos
 * formatPrice(299.99) → "$299.99"
 */
export function formatPrice(price: number): string {
    if (typeof price !== 'number' || isNaN(price)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
    }).format(price);
}

/**
 * Genera un slug a partir de un texto
 * slugify("Mod Aegis Legend") → "mod-aegis-legend"
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export function formatTimeAgo(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;

    return date.toLocaleDateString();
}
/**
 * Genera la URL de imagen.
 * NOTA: La función de transformación de Supabase (/render/image/) es de PAGO.
 * Por defecto usamos la URL pública estándar ya que optimizamos en el cliente.
 */
export function optimizeImage(
    _url: string | undefined | null,
    _options: { width?: number; height?: number; quality?: number; format?: 'origin' | 'webp' | 'avif' } = {}
): string | undefined {
    if (!_url) return undefined;

    // 1. Manejo de paths relativos o URLs de otros proyectos Supabase
    const currentSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (typeof _url === 'string' && currentSupabaseUrl) {
        const isSupabaseStorage = _url.includes('/storage/v1/object/public/');
        const isRelative = !_url.startsWith('http');

        if (isRelative || isSupabaseStorage) {
            let path = _url;
            if (isSupabaseStorage) {
                // Extraer solo la parte del path después del bucket/
                const parts = _url.split('/public/');
                const bucketAndPath = parts[1];
                if (bucketAndPath) {
                    const firstSlash = bucketAndPath.indexOf('/');
                    path = bucketAndPath.substring(firstSlash + 1);
                }
            }
            // Siempre usamos el bucket 'product-images' que es el estándar definido
            return `${currentSupabaseUrl}/storage/v1/object/public/product-images/${path}`;
        }
    }

    // Solo optimizamos si es un string válido que parece una URL
    if (typeof _url !== 'string' || !_url.startsWith('http')) return _url as string;

    // Supabase Storage render endpoint — redimensiona y convierte a WebP/AVIF on-the-fly
    // NOTA: Requiere plan PRO. Mantener en bypass hasta confirmación de presupuesto.
    const isSupabaseAsset = _url.includes('/storage/v1/object/public/');
    
    if (isSupabaseAsset) {
        // Estructura lista para activación inmediata post-upgrade de plan
        // return _url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${options.width || 800}&quality=${options.quality || 80}`;
        return _url;
    }

    return _url;
    
    /* 
    if (url.includes(supabaseStoragePrefix)) {
        try {
            const renderUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
            const params = new URLSearchParams();
            if (options.width) params.set('width', String(options.width));
            if (options.height) params.set('height', String(options.height));
            if (options.quality) params.set('quality', String(options.quality));
            if (options.format && options.format !== 'origin') params.set('format', options.format);
            const qs = params.toString();
            return qs ? `${renderUrl}?${qs}` : renderUrl;
        } catch {
            return url;
        }
    }
    */

    return _url as string;
}
