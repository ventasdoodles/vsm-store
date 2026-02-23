# Activar Rastreo Real de DHL

## Estado Actual
La página `/rastreo` ya está lista. Muestra datos de **demostración** hasta que configures tu API Key.

---

## Paso 1: Obtener tu API Key de DHL

1. Ve a **[developer.dhl.com](https://developer.dhl.com)** y crea una cuenta gratuita.
2. Una vez dentro, crea una nueva app y suscríbete a la API **"Shipment Tracking"** (es gratuita para volúmenes normales).
3. Copia tu **API Key** (se ve como: `abcdefgh1234567890abcdef12345678`).

---

## Paso 2: Guardar el secreto en Supabase

Ejecuta este comando en tu terminal (requiere tener el CLI de Supabase instalado y estar logueado):

```bash
supabase secrets set DHL_API_KEY=TU_API_KEY_AQUI
```

---

## Paso 3: Desplegar la Edge Function

```bash
supabase functions deploy track-shipment
```

---

## Paso 4: Verificar

Ve a `https://tutienda.pages.dev/rastreo`, ingresa un número de guía real de DHL y el rastreo aparecerá con datos reales sin el banner de "Modo demostración".

---

## ¿Cómo funciona la arquitectura?

```
Usuario (browser)
    ↓ POST { trackingNumber }
supabase/functions/track-shipment   ← Edge Function (secreto guardado aquí)
    ↓  GET ?trackingNumber=...
DHL Shipment Tracking API
    ↓  JSON con eventos
Edge Function (mapea al formato de VSM Store)
    ↓  TrackingInfo
src/pages/TrackOrder.tsx   ← Renderiza el timeline
```

Así tu API Key **nunca** queda expuesta en el frontend ni en el repositorio de GitHub.
