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
 * Optimiza una URL de imagen de Supabase Storage
 * Reemplaza /object/public/ con /render/image/public/ y agrega parámetros.
 * 
 * @param url URL original de la imagen
 * @param options Opciones de transformación (width, height, quality, format)
 */
export function optimizeImage(
    url: string | undefined | null,
    options: { width?: number; height?: number; quality?: number; format?: 'origin' | 'webp' | 'avif' } = {}
): string | undefined {
    if (!url) return undefined;
    if (!url.includes('supabase.co/storage/v1/object/public/')) return url;

    const { width, height, quality = 80, format = 'origin' } = options;

    // Cambiar endpoint a render
    let optimizedUrl = url.replace('/object/public/', '/render/image/public/');

    // Construir query params
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    if (quality) params.append('quality', quality.toString());
    if (format !== 'origin') params.append('format', format);
    params.append('resize', 'contain'); // Default resize mode

    return `${optimizedUrl}?${params.toString()}`;
}
