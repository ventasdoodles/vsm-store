import { useState } from 'react';
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

export function useVisualScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<VisualScannerResult | null>(null);

    const scanImage = async (file: File) => {
        setIsScanning(true);
        setError(null);
        setResult(null);

        try {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            const { data, error: invokeError } = await supabase.functions.invoke<VisualScannerResult>('visual-compatibility', {
                body: { 
                    imageBase64: base64,
                    mimeType: file.type 
                }
            });

            if (invokeError) {
                throw new Error(invokeError.message || 'Error al conectar con el motor de visión.');
            }

            if (data) {
                setResult(data);
                if (!data.success && data.message) {
                    setError(data.message);
                }
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error desconocido al escanear la imagen.';
            setError(msg);
            console.error('[useVisualScanner]', err);
        } finally {
            setIsScanning(false);
        }
    };

    const resetScanner = () => {
        setIsScanning(false);
        setError(null);
        setResult(null);
    };

    return {
        isScanning,
        error,
        result,
        scanImage,
        resetScanner
    };
}
