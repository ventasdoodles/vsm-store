/**
 * // ─── SERVICE: Tracking ───
 * // Arquitectura: Integration Layer (Service)
 * // Proposito principal: Rastreo de envíos vía Supabase Edge Functions (integración DHL).
 * // Regla / Notas: Usa tipos centralizados en `src/types/order.ts`.
 */

import { supabase } from '@/lib/supabase';
import type { TrackingInfo } from '@/types/order';

/**
 * Obtiene la información de rastreo de un paquete.
 * @param trackingNumber Número de guía
 * @returns Información detallada del envío o datos de demo si no está configurado.
 */
export async function getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: { trackingNumber: trackingNumber.trim() },
    });

    if (error) {
        throw new Error('No se pudo conectar con el servicio de rastreo. Intenta de nuevo.');
    }

    // La Edge Function puede retornar un error estructurado
    if (data?.error) {
        if (data.code === 'NOT_CONFIGURED') {
            // API key no configurada — retornamos datos de demostración con aviso
            return _getDemoData(trackingNumber);
        }
        throw new Error(data.error);
    }

    return data as TrackingInfo;
}

/**
 * Genera datos de demostración cuando el carrier no está configurado.
 * @internal
 */
function _getDemoData(trackingNumber: string): TrackingInfo {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return {
        trackingNumber: trackingNumber.toUpperCase(),
        carrier: 'DHL Express',
        status: 'in_transit',
        statusText: 'En Tránsito (Demo)',
        estimatedDelivery: tomorrow.toISOString(),
        events: [
            {
                id: '3',
                date: now.toISOString(),
                status: 'El envío ha salido de las instalaciones de origen y se encuentra en tránsito hacia el destino.',
                location: 'Centro de Distribución, CDMX',
                isCompleted: true
            },
            {
                id: '2',
                date: yesterday.toISOString(),
                status: 'Envío procesado en las instalaciones de origen.',
                location: 'Centro de Distribución, Veracruz',
                isCompleted: true
            },
            {
                id: '1',
                date: twoDaysAgo.toISOString(),
                status: 'Información del envío recibida electrónicamente por DHL.',
                location: 'Xalapa, VER',
                isCompleted: true
            }
        ]
    };
}
