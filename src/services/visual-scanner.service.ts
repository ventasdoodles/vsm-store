/**
 * visual-scanner.service - VSM Store
 * 
 * Servicio para el análisis visual de productos y compatibilidad mediante Edge Functions.
 * @module services/visual-scanner.service
 */

import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

export interface VisualScannerAnalysis {
    identified: boolean;
    brand: string | null;
    model: string | null;
    confidence: 'high' | 'medium' | 'low';
    recommended_search_tags: string[];
    reasoning: string;
    is_vape_related: boolean;
}

export interface VisualScannerResult {
    success: boolean;
    message?: string;
    analysis?: VisualScannerAnalysis;
    suggestedProducts?: Partial<Product>[];
}

/**
 * Invoca la función edge visual-compatibility pasando la imagen en base64 y su mimeType.
 */
export async function invokeVisualCompatibilityScanner(
    imageBase64: string,
    mimeType: string
): Promise<VisualScannerResult> {
    const { data, error: invokeError } = await supabase.functions.invoke<VisualScannerResult>('visual-compatibility', {
        body: { 
            imageBase64,
            mimeType 
        }
    });

    if (invokeError) {
        throw new Error(invokeError.message || 'Error al conectar con el motor de visi\u00f3n.');
    }

    if (!data) {
        throw new Error('Respuesta vac\u00eda del motor de visi\u00f3n.');
    }

    return data;
}
