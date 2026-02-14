# Configuración de Mercado Pago

## 1. Crear cuenta de vendedor

- Registrarse en <https://www.mercadopago.com.mx>
- Verificar identidad

## 2. Obtener credenciales

- Ir a: <https://www.mercadopago.com.mx/developers/panel/app>
- Crear aplicación "VSM Store"
- Copiar:
  - Public Key (para frontend)
  - Access Token (para backend)

## 3. Configurar Variables de Entorno

### Frontend (.env.local)

```bash
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Backend (Supabase)

Ir a Supabase Dashboard -> Settings -> Edge Functions -> Secrets y agregar:

```
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SUPABASE_URL=[Tu URL de Supabase]
SUPABASE_SERVICE_ROLE_KEY=[Tu Service Role Key]
FRONTEND_URL=https://vsm-store.pages.dev
```

## 4. Configurar Webhook

- URL: `https://[TU_PROJECT_ID].supabase.co/functions/v1/mercadopago-webhook`
- Eventos: `payment`
- En: <https://www.mercadopago.com.mx/developers/panel/webhooks>

## 5. Testing

- Usar tarjetas de prueba: <https://www.mercadopago.com.mx/developers/es/docs/shopify/additional-content/your-integrations/test/cards>
- Aprobar: 5031 7557 3453 0604, CVV: 123, Exp: 11/25
- Rechazar: 5031 4332 1540 6351

## 6. Producción

- Reemplazar credenciales TEST por PROD
- Actualizar webhook URL
- Probar con tarjeta real (monto bajo)
