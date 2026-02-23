// Servicio de Rastreo de Envíos - VSM Store
// NOTA: Este servicio actualmente usa datos simulados para la interfaz.
// Para conectarlo a DHL real, necesitarás crear una cuenta en DHL Developer Portal,
// obtener un API Key, y preferiblemente crear una Edge Function en Supabase para
// hacer la petición sin exponer tu API Key en el frontend.

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
    estimatedDelivery?: string;
    events: TrackingEvent[];
    carrier: string;
}

export async function getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    // Simulamos el tiempo de respuesta de una API
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Validación básica simulada
            if (trackingNumber.trim().length < 8) {
                reject(new Error('El número de guía parece ser incorrecto. Por favor verifica e intenta de nuevo.'));
                return;
            }

            // Generamos fechas relativas para que el mock siempre parezca reciente
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Respuesta simulada realista basada en la estructura típica de DHL
            resolve({
                trackingNumber: trackingNumber.toUpperCase(),
                carrier: 'DHL Express',
                status: 'in_transit',
                statusText: 'En Tránsito',
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
            });
        }, 1500);
    });
}
