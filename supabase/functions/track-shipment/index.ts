// Supabase Edge Function: track-shipment
// Proxy seguro para la API de DHL Shipment Tracking
// Docs: https://developer.dhl.com/api-reference/shipment-tracking

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // Preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { trackingNumber } = await req.json();

        if (!trackingNumber || typeof trackingNumber !== 'string') {
            return new Response(
                JSON.stringify({ error: 'trackingNumber es requerido' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // La API Key de DHL se guarda como secreto en Supabase:
        // supabase secrets set DHL_API_KEY=tu_api_key
        const DHL_API_KEY = Deno.env.get('DHL_API_KEY');

        if (!DHL_API_KEY) {
            // Sin API key → retornamos error claro para que el frontend lo maneje
            return new Response(
                JSON.stringify({ error: 'DHL_API_KEY no configurada', code: 'NOT_CONFIGURED' }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Llamada a la API oficial de DHL
        const dhlRes = await fetch(
            `https://api.dhl.com/track/shipments?trackingNumber=${encodeURIComponent(trackingNumber)}&language=es`,
            {
                headers: {
                    'DHL-API-Key': DHL_API_KEY,
                    'Accept': 'application/json',
                },
            }
        );

        if (!dhlRes.ok) {
            if (dhlRes.status === 404) {
                return new Response(
                    JSON.stringify({ error: 'Número de guía no encontrado. Verifica que sea correcto.', code: 'NOT_FOUND' }),
                    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            const errorBody = await dhlRes.text();
            throw new Error(`DHL API error ${dhlRes.status}: ${errorBody}`);
        }

        const dhlData = await dhlRes.json();

        // Transformamos la respuesta de DHL al formato que usa nuestra UI
        const shipment = dhlData.shipments?.[0];

        if (!shipment) {
            return new Response(
                JSON.stringify({ error: 'No se encontraron datos para este número de guía.', code: 'NOT_FOUND' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Mapear status de DHL a nuestros estados locales
        const dhlStatusCode = shipment.status?.statusCode ?? '';
        let status: 'pending' | 'in_transit' | 'delivered' | 'exception';
        if (dhlStatusCode === 'delivered') {
            status = 'delivered';
        } else if (['transit', 'out-for-delivery'].includes(dhlStatusCode)) {
            status = 'in_transit';
        } else if (['failure', 'return-to-sender'].includes(dhlStatusCode)) {
            status = 'exception';
        } else {
            status = 'pending';
        }

        const STATUS_TEXT: Record<string, string> = {
            pending: 'Pendiente',
            in_transit: 'En Tránsito',
            delivered: 'Entregado',
            exception: 'Problema con el Envío',
        };

        // Transformar eventos en el formato de nuestra UI
        const events = (shipment.events ?? []).map((ev: any, i: number) => ({
            id: String(i),
            date: ev.timestamp ?? new Date().toISOString(),
            status: ev.description ?? 'Actualización del envío',
            location: [ev.location?.address?.addressLocality, ev.location?.address?.countryCode]
                .filter(Boolean)
                .join(', ') || 'En tránsito',
            isCompleted: true,
        }));

        const result = {
            trackingNumber: shipment.id ?? trackingNumber.toUpperCase(),
            carrier: 'DHL Express',
            status,
            statusText: STATUS_TEXT[status],
            estimatedDelivery: shipment.estimatedTimeOfDelivery ?? null,
            events,
        };

        return new Response(
            JSON.stringify(result),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err: any) {
        console.error('[track-shipment] Error:', err);
        return new Response(
            JSON.stringify({ error: 'Error interno. Intenta nuevamente.', code: 'SERVER_ERROR' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
