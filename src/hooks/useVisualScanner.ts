import { useState } from 'react';
import {
    invokeVisualCompatibilityScanner,
    type VisualScannerResult,
    type VisualScannerAnalysis,
} from '@/services/visual-scanner.service';

export type { VisualScannerResult, VisualScannerAnalysis };

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

            const data = await invokeVisualCompatibilityScanner(base64, file.type);

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
