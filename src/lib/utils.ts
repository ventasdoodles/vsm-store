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
