# HARD LOCK SYNTHESIS — WAVE 192 BLOCKER RESOLUTION

**1. Files inspected**
- `src/components/admin/AdminGuard.tsx`
- `src/services/admin/admin-auth.service.ts`
- `supabase/functions/knowledge-ingestor/index.ts`
- `supabase/functions/customer-intelligence/index.ts`
- `supabase/functions/embeddings-processor/index.ts`
- `AI_CONTEXT.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`

**2. Root cause of `update_chunk` runtime failure**
The `Unsupported action: update_chunk` error strictly occurred due to deployment drift: the deployed Edge Function did not match the local source code containing the `update_chunk` block. Cuando se redesplegó para arreglarlo, usar `--no-verify-jwt` se determinó como **peligroso** porque el código local invoca `SUPABASE_SERVICE_ROLE_KEY` directamente sin comprobaciones de autenticación manuales. Dado que `supabase.functions.invoke` envía automáticamente el JWT del usuario, la función debe desplegarse **CON** la validación JWT estándar (`verify_jwt: true`) para proteger de forma segura el bypass de service role.

**3. Root cause of empty `product_concepts`**
El estado vacío **NO** es causado por la falta de datos reales. Una ejecución SQL directa con service-role confirmó que la tabla contiene nativamente 15 registros. La causa raíz exacta es una **denegación por RLS (Row Level Security)**.

**4. RLS/admin mismatch status**
- **Mismatch Confirmado:** El componente `AdminGuard` de la interfaz de usuario depende estrictamente de verificar si el ID del usuario existe en la tabla personalizada `admin_users`. Sin embargo, las políticas RLS de la base de datos para `product_concepts` evalúan estrictamente `(((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)`.
- **La Brecha:** No existe ningún mecanismo RPC, trigger o sincronización que inyecte el claim `{"role": "admin"}` dentro de `auth.users.raw_app_meta_data` cuando se crea un `admin_user`. Tanto el administrador original como el administrador actual (`ventasdoodles@gmail.com`) tienen el claim role como `undefined` en su JWT. En consecuencia, pasan la validación visual del AdminGuard pero fallan el chequeo RLS en la capa de PostgREST.

**5. Embedding model drift status**
- **Qué dicta el canon:** `AI_CONTEXT.md` y `STORE_FRONT_AI_PILOT_CONTEXT.md` dictan estrictamente el uso de `gemini-embedding-001` a través de la API `v1beta`. Las funciones Edge `customer-intelligence` y `embeddings-processor` cumplen nativamente con esto.
- **Qué dice el código local:** El nuevo script `knowledge-ingestor/index.ts`, en lugar del canon, utiliza `models/gemini-embedding-2-preview` y solicita explícitamente `outputDimensionality: 3072`.
- **Estado:** Esta discrepancia (drift) sigue sin resolverse y probablemente sea una desviación accidental creada durante la generación de código de la Wave 192 sin consultar la arquitectura canónica. Debe alinearse al estándar de `gemini-embedding-001`.

**6. What changed**
- No se modificó ningún archivo productivo en esta sesión. Únicamente se realizaron operaciones de lectura, consultas de diagnóstico SQL vía MCP con service-role y revisiones de arquitectura.

**7. What remains open**
- La Edge Function `knowledge-ingestor` debe ser alineada a usar `gemini-embedding-001` para coincidir con el canon, y luego ser redesplegada de forma segura habilitando la validación JWT (`verify_jwt: true`).
- La discrepancia de claims RLS que bloquea la lectura de `product_concepts` debe ser solucionada. Se requiere un mecanismo definitivo (por ejemplo, una Edge Function de registro o un Database RPC trigger) para inyectar claims válidos (`{ role: 'admin' }`) de forma segura en `auth.users` para las cuentas listadas en `admin_users`.

**8. Current Wave 192 status**
**IMPLEMENTED / PENDING VALIDATION**. El cierre oficial se encuentra bloqueado estrictamente por la falta de coincidencia en el claim RLS (que invisibiliza los datos para la validación UI) y el "Embedding Model drift" en la Ingestor funcion.
