// Servicio de Rastreo de Envíos - VSM Store
// Llama a la Edge Function `track-shipment` en Supabase, que a su vez consulta la API oficial de DHL.
// Para activar el rastreo real: supabase secrets set DHL_API_KEY=tu_api_key_de_dhl
import { supabase } from '@/lib/supabase';

export interface TrackingEvent {
    id: string;
    date: string;
    status: string;
    location: string;
    isCompleted: boolean;
}

export interface TrackingInfo {
    trackingNumber: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'exception';
    statusText: string;
    estimatedDelivery?: string | null;
    events: TrackingEvent[];
    carrier: string;
}

export async function getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: { trackingNumber: trackingNumber.trim() },
    });

    if (error) {
        // Error de red o la función no está desplegada
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

// ─── Demo data (se usa cuando DHL_API_KEY aún no está configurada) ───────────
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
