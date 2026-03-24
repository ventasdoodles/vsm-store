# CANON / DOC RECONCILIATION: Mercado Pago E2E Stabilization

**STRICT MODE:** 
CANON RECONCILIATION ONLY. NO IMPLEMENTATION AUTHORIZED. NO CODE LOGIC OR DATABASE REWRITES ALLOWED.

**TARGET TOOL:** 
Codex (Auditor Forense / Reconciliador de Canon)

**AUTHORITATIVE CURRENT STATE:**
El flujo de Checkout Pro de Mercado Pago (`create-payment`) y la recepción del IPN local (`mercadopago-webhook`) están 100% operativos y verificados de manera end-to-end con dinero simulado en ambiente Sandbox. El sistema es totalmente capaz de detonar la pasarela y recibir asíncronamente en backend la respuesta remota, mutando el status de Supabase a `status: paid` de forma autónoma (UUID Ocurrencia Exitosa Módulos: `create-payment 200 OK`, `mercadopago-webhook 200 OK update orders`).

**MISSION OBJECTIVE:**
Sellar la deuda documental remanente de la Sesión de Hoy (Resolución de Checkout). Actualizar los documentos canónicos operativos de arquitectura y auditoría para que reflejen fielmente las decisiones de infraestructura de despliegue y configuraciones obligatorias resueltas, materializando el cierre final del Loop "Checkout".

**SCOPE REQUIRED:**
1. Afectar `AUDIT_LOG.md`: Agregar entrada formal para la "MERCADO PAGO CHECKOUT E2E STABILIZATION". Debe indicar claramente:
   - Que se eliminaron los *swallowed errors* de `create-payment` (ahora usa `.select('*')` sin forzar inner joins restrictivos en profiles).
   - Que el Webhook E2E pasa las pruebas confirmadas reales actualizando `mp_payment_id`.
2. Afectar `AI_CONTEXT.md` (y relacionados críticos a discreción del auditor si los detecta):
   - Ratificar que la única vía soportada y autorizada actualmente para hacer deploy de *Edge Functions* de Supabase es vía Pipeline de Integración (GitHub Actions `.github/workflows/deploy-functions.yml`), bypassando las restricciones del OS anfitrión (Falta de Docker).
   - Ratificar en la arquitectura que la función `mercadopago-webhook` requiere imperativamente `verify_jwt = false` en `config.toml` (o banderas equivalentes en CLI) para no bloquear requests externos como los de MP.
3. Ejecutar PUSH del código usando la terminal integrada (Git stage, commit y push).

**CONSTRAINTS:**
- Auditar y documentar SIN realizar rediseños de cero.
- NO alterar dependencias `package.json`, código `.ts` ni esquema de DB.
- NO reabrir incidencias menores o el bug detectado en los puntos de lealtad (eso es deuda técnica separada del core checkout).

**OUTPUT FORMAT:**
- FILES INSPECTED
- FILES MODIFIED
- EXACT CHANGES MADE
- VALIDATION PERFORMED
- RESIDUAL RISK
- COMMIT HASH + MESSAGE
- STATUS

**SUCCESS CONDITION:**
Ambos documentos (`AI_CONTEXT.md` y `AUDIT_LOG.md`) actualizados, sin redundancias ni discrepancias textuales graves, y con el nuevo pipeline formalizado, culminando en un exitoso push a `main`.
