# AUDITORIA EXPERTA — VSM PWA Store
**Fecha:** 2026-03-20
**Auditor:** Claude Code (Sonnet 4.6)
**Scope:** Código fuente real — src/, supabase/functions/, stores, services, components/admin

---

## RESUMEN EJECUTIVO

| Severidad     | Cantidad | Estado  |
|---------------|----------|---------|
| CRITICO       | 5        | ❌ Pendiente |
| ALTO          | 7        | ❌ Pendiente |
| MEDIO         | 8        | ❌ Pendiente |
| ARQUITECTURA  | 4        | ❌ Pendiente |
| **TOTAL**     | **24**   |         |

> **Prioridad absoluta:** Rotar TODAS las API keys del `.env` inmediatamente.
> Si el repo fue clonado o tuvo visibilidad pública en algún momento, las keys ya están comprometidas.

---

## CRITICOS

### C-01 — Secretos expuestos en `.env` (en historial git)
- **Archivos:** `.env`
- **Riesgo:** Compromiso total de base de datos, autenticación y servicios AI
- **Detalle:** Supabase Service Role Key, Gemini API Key y Supabase Anon Key en texto plano. El historial git retiene estos valores aunque se borren del archivo actual.
- **Fix:**
  1. Rotar TODAS las keys hoy en Supabase Dashboard y Google AI Studio
  2. Agregar `.env` a `.gitignore`
  3. Usar variables de entorno del hosting (Vercel/Netlify env vars, GitHub Secrets)
  4. Nunca commitear secrets — usar `.env.example` con valores placeholder

---

### C-02 — `Promise.all()` sin manejo de errores parciales en bulk ops
- **Archivo:** `src/services/admin/admin-products.service.ts` líneas 201-210
- **Riesgo:** Estado de DB inconsistente. Admin cree que todo se guardó cuando solo se guardó parcialmente.
- **Detalle:** `bulkUpdateProducts()` actualiza productos en un loop. Si el producto #25 de 50 falla, los primeros 24 ya fueron commiteados a la DB sin posibilidad de rollback. El error lanzado no indica cuáles fallaron.
- **Fix:**
  ```ts
  // Cambiar Promise.all por Promise.allSettled
  const results = await Promise.allSettled(updates);
  const failed = results
    .map((r, i) => ({ result: r, product: products[i] }))
    .filter(({ result }) => result.status === 'rejected');

  if (failed.length > 0) {
    return { success: false, failedIds: failed.map(f => f.product.id), errors: failed };
  }
  ```

---

### C-03 — Race condition en validación del carrito
- **Archivo:** `src/stores/cart.store.ts` líneas 153-229
- **Riesgo:** Overselling. Cliente puede agregar más unidades de las disponibles.
- **Detalle:** `validateCart()` lee stock local → hace query a DB → actualiza estado. Si el usuario agrega/quita items durante la query async, la validación opera sobre stock stale. Con órdenes concurrentes de múltiples usuarios el problema es peor.
- **Fix:**
  1. Implementar validación de stock final en el servidor antes de crear la orden (nunca confiar solo en el cliente)
  2. Usar `AbortController` para cancelar validaciones desactualizadas
  3. Agregar triggers en Supabase que rechacen órdenes si `stock < cantidad_solicitada`

---

### C-04 — Sin transacciones en batch updates de productos
- **Archivo:** `src/services/admin/admin-products.service.ts` líneas 196-217
- **Riesgo:** Base de datos en estado inconsistente después de un fallo parcial. Sin rollback posible desde el cliente.
- **Detalle:** 50 productos se actualizan uno a uno con awaits individuales. Un fallo en el producto #25 deja #1-24 ya guardados con los nuevos valores y #25-50 con los valores viejos.
- **Fix:**
  ```sql
  -- Crear RPC en Supabase que maneje todo en una transacción
  CREATE OR REPLACE FUNCTION bulk_update_products(updates jsonb[])
  RETURNS void AS $$
  BEGIN
    -- todas las actualizaciones en un solo bloque transaccional
    -- si falla cualquiera, hace rollback de todas
  END;
  $$ LANGUAGE plpgsql;
  ```

---

### C-05 — Generación de cupones con `Math.random()` — inseguro
- **Archivo:** `src/services/admin/admin-coupons.service.ts` líneas 95-119
- **Riesgo:** Cupones brute-forceables. Pérdida de ingresos por uso no autorizado.
- **Detalle:** `Math.random()` no es criptográficamente seguro. Los prefijos hardcodeados (`BIENVENIDO`, `VUELVE`, `LIQUIDA`) reducen el espacio de búsqueda. Un atacante puede generar y probar combinaciones en O(n).
- **Fix:**
  ```ts
  // Reemplazar Math.random() con:
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const code = Array.from(array, b => b.toString(36)).join('').toUpperCase().slice(0, 12);
  // Sin prefijos predecibles
  ```

---

## ALTOS

### H-01 — Memory leak en `useAIConcierge`
- **Archivo:** `src/hooks/useAIConcierge.ts` (alrededor de línea 68)
- **Riesgo:** Memory leak. `setState` disparado después de unmount del componente.
- **Detalle:** El timeout del race condition no se limpia si la request tiene éxito primero. React mostrará warnings de "state update on unmounted component".
- **Fix:**
  ```ts
  const timeoutRef = useRef<NodeJS.Timeout>();

  try {
    timeoutRef.current = setTimeout(() => setError('timeout'), 30000);
    const result = await fetchData();
    // éxito
  } finally {
    clearTimeout(timeoutRef.current);
  }

  // En cleanup del useEffect:
  return () => clearTimeout(timeoutRef.current);
  ```

---

### H-02 — Múltiples `as any` casts en componentes admin
- **Archivo:** `src/pages/admin/AdminCesarinOS.tsx` líneas 359, 538-541
- **Riesgo:** Crashes en runtime cuando las propiedades esperadas no existen.
- **Detalle:** `(reviewInteraction as any).id` — si `reviewInteraction` es null o tiene un shape diferente, crash inmediato. TypeScript no puede ayudar porque el cast lo deshabilita.
- **Fix:**
  ```ts
  // Definir interfaces explícitas
  interface ReviewInteraction {
    id: string;
    // ...
  }

  // Validar antes de usar
  function isReviewInteraction(val: unknown): val is ReviewInteraction {
    return typeof val === 'object' && val !== null && 'id' in val;
  }
  ```

---

### H-03 — `JSON.parse()` sin try/catch
- **Archivos:**
  - `src/components/cart/CheckoutForm.tsx` línea 139
  - `src/stores/cart.store.ts` línea 285
  - `src/components/search/SearchBar.tsx` línea 110
- **Riesgo:** App completamente inutilizable si localStorage está corrupto o fue editado manualmente.
- **Fix:**
  ```ts
  function safeJsonParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      console.warn('[storage] corrupted value, using fallback');
      return fallback;
    }
  }
  ```

---

### H-04 — N+1 queries en admin dashboard
- **Archivos:** `src/components/admin/cesarin/TabQuality.tsx` líneas 32-42, `src/services/admin/admin-dashboard.service.ts`
- **Riesgo:** Timeout / OOM en producción con datos reales. Admin se vuelve inutilizable.
- **Detalle:** El Quality tab carga todos los simulation reports sin LIMIT ni paginación. A medida que crece la DB, la query mata la UI.
- **Fix:**
  1. Agregar `.limit(50).range(offset, offset + 49)` a todas las queries
  2. Paginación o infinite scroll en la UI
  3. Índices en columnas frecuentemente filtradas (`created_at`, `status`, `customer_id`)

---

### H-05 — Sin Error Boundaries en tabs admin
- **Archivos:** `src/components/admin/cesarin/TabAnalytics.tsx`, `src/components/admin/cesarin/TabQuality.tsx`, `src/components/admin/customers/CustomerIntelligencePanel.tsx`
- **Riesgo:** Un fallo en cualquier servicio tira todo el admin dashboard.
- **Fix:**
  ```tsx
  // Envolver cada tab crítico:
  <ErrorBoundary fallback={<TabErrorFallback tabName="Analytics" />}>
    <TabAnalytics />
  </ErrorBoundary>
  ```

---

### H-06 — Stock validado solo en cliente
- **Archivo:** `src/stores/cart.store.ts` líneas 80-81, 127-128
- **Riesgo:** Overselling con órdenes concurrentes.
- **Detalle:** La validación de stock usa `product.stock` del estado del frontend. Con múltiples usuarios comprando el mismo producto simultáneamente, todos ven stock disponible y todos completan la compra.
- **Fix:**
  1. Trigger en Supabase: `CHECK (stock >= 0)` en tabla products
  2. Validar stock en RPC server-side antes de confirmar orden
  3. La UI solo muestra estimados — el servidor es la fuente de verdad

---

### H-07 — Datos sensibles en `sessionStorage` sin encriptar
- **Archivos:** `src/components/cart/CheckoutForm.tsx` (área de persistencia de datos)
- **Riesgo:** XSS puede leer datos de dirección/checkout. OWASP A02 — Cryptographic Failures.
- **Detalle:** sessionStorage es accesible por cualquier script en la página. Si hay XSS en cualquier parte de la app, los datos de checkout quedan expuestos.
- **Fix:**
  1. No persistir datos de checkout entre sesiones
  2. Si se necesita persistencia, solo guardar datos no sensibles (paso del wizard, no datos personales)
  3. Nunca, bajo ningún concepto, guardar datos de pago en storage del browser

---

## MEDIOS

### M-01 — Delays artificiales en código de producción
- **Archivo:** `src/services/admin/admin-coupons.service.ts` líneas 112, 141
- **Detalle:** `await new Promise(resolve => setTimeout(resolve, 600-800))` para "simular latencia". Frustra la UX real.
- **Fix:** Eliminar completamente. Si se necesita para demos, usar `import.meta.env.DEV` como guard.

---

### M-02 — Cache sin TTL ni límite de tamaño
- **Archivo:** `src/services/concierge.service.ts`
- **Detalle:** `searchCache` es un `Map` que crece indefinidamente. Datos de búsqueda nunca se invalidan. Memory leak progresivo en sesiones largas.
- **Fix:**
  ```ts
  // Cache con TTL simple
  const cache = new Map<string, { data: unknown; expires: number }>();

  function getCached(key: string) {
    const entry = cache.get(key);
    if (!entry || Date.now() > entry.expires) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  }
  ```

---

### M-03 — Respuestas de Edge Functions no validadas con schema
- **Archivo:** `src/services/concierge.service.ts` líneas 120-125
- **Detalle:** `data.message || data.text || fallback` — si Supabase retorna `{ error: "internal server error" }`, el usuario ve el objeto error renderizado como string.
- **Fix:** Zod schema para validar el shape de respuesta antes de usarlo.

---

### M-04 — Modelo AI hardcodeado sin fallback
- **Archivo:** `supabase/functions/customer-intelligence/index.ts` líneas 28-29
- **Detalle:** `gemini-2.5-flash` hardcodeado. Si Google depreca la versión, el sistema rompe silenciosamente.
- **Fix:**
  ```ts
  const AI_CONFIG = {
    primary: 'gemini-2.5-flash',
    fallback: 'gemini-1.5-flash',
  };
  ```

---

### M-05 — `CustomerIntelligencePanel.tsx` — demasiadas responsabilidades (650+ líneas)
- **Archivo:** `src/components/admin/customers/CustomerIntelligencePanel.tsx`
- **Detalle:** Un solo componente maneja: fetching de datos, gestión de estado, integración con AI, rendering de múltiples secciones. Imposible de testear unitariamente.
- **Fix:**
  1. Extraer fetching a `useCustomerIntelligence()` hook
  2. Separar en sub-componentes: `CustomerTimeline`, `CustomerInsights`, `CustomerMemory`
  3. Patrón container/presentational

---

### M-06 — Patrones de error inconsistentes entre servicios
- **Archivos:** Múltiples services en `src/services/admin/`
- **Detalle:** Algunos servicios hacen `throw`, otros retornan `null`, otros retornan `[]`. El código que los llama debe manejar 3 contratos distintos.
- **Fix:**
  ```ts
  // Patrón unificado Result type
  type Result<T> = { ok: true; data: T } | { ok: false; error: string };

  // O usar la librería neverthrow
  ```

---

### M-07 — `useEffect` con dependencias faltantes o incorrectas
- **Archivos:** Múltiples hooks en `src/hooks/`
- **Detalle:** `useCallback` sin deps completas genera stale closures. Mensajes pueden agregarse out-of-order o duplicarse.
- **Fix:** Habilitar y respetar ESLint rule `react-hooks/exhaustive-deps` sin suprimir warnings.

---

### M-08 — 175+ `console.log/warn/error` en producción
- **Archivos:** Distribuidos en todo el codebase
- **Detalle:** Logs de diagnóstico visibles en browser DevTools. Posible info disclosure. Impacto menor en performance.
- **Fix:**
  ```ts
  // Wrapper que solo loguea en desarrollo
  const logger = {
    warn: (msg: string, ...args: unknown[]) => {
      if (import.meta.env.DEV) console.warn(msg, ...args);
    },
  };
  ```

---

## ARQUITECTURA

### A-01 — Estado disperso en 4 sistemas distintos
- **Riesgo:** Bugs de sincronización. Fuentes de verdad contradictorias.
- **Detalle:** El estado de la app vive en: Zustand stores, React Context, `sessionStorage`, `localStorage`. No hay una fuente única de verdad clara.
- **Fix:**
  - Zustand para todo el estado persistente de la app
  - React Context solo para estado UI no persistente (theme, modales abiertos)
  - Eliminar uso directo de sessionStorage/localStorage fuera de los stores

---

### A-02 — Componentes acoplados directamente a servicios
- **Riesgo:** Imposible hacer testing. Imposible cambiar implementación sin tocar componentes.
- **Detalle:** Los componentes importan y llaman directamente a funciones de servicio. Sin capa de abstracción.
- **Fix:**
  1. Custom hooks como única interfaz entre componentes y servicios
  2. Usar React Query de forma consistente (ya está en el proyecto pero no se usa uniformemente)

---

### A-03 — Zero integration tests para flujos críticos
- **Riesgo:** Regresiones van directo a producción.
- **Detalle:** Solo se ven unit tests de `useVoiceSearch`. Sin coverage de: checkout completo, validación de carrito, bulk updates admin, flujo de cupones.
- **Fix:**
  ```
  tests/
    integration/
      checkout.test.tsx     # flujo completo de compra
      cart-validation.test.tsx
      admin-bulk-update.test.tsx
  ```
  Usar Vitest + React Testing Library + Supabase local para tests de integración.

---

### A-04 — Sin code splitting para rutas admin
- **Riesgo:** Bundle inicial más grande del necesario. Código admin se descarga para todos los usuarios.
- **Fix:**
  ```ts
  // Lazy loading para rutas admin
  const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
  const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));

  // Configurar Vite para split de chunks vendor
  // vite.config.ts → build.rollupOptions.output.manualChunks
  ```

---

## CHECKLIST DE ACCION

### HOY
- [ ] Rotar Supabase Service Role Key
- [ ] Rotar Supabase Anon Key
- [ ] Rotar Gemini API Key
- [ ] Agregar `.env` a `.gitignore`
- [ ] Verificar si el repo tuvo visibilidad pública (si sí, asumir keys comprometidas)

### ESTA SEMANA
- [ ] `Promise.allSettled()` en `bulkUpdateProducts()`
- [ ] `JSON.parse()` con try/catch en CheckoutForm, cart.store, SearchBar
- [ ] Error Boundaries en TabAnalytics, TabQuality, CustomerIntelligencePanel
- [ ] Eliminar delays artificiales en admin-coupons.service.ts
- [ ] Reemplazar `Math.random()` con `crypto.getRandomValues()` en cupones
- [ ] Validación de stock server-side antes de crear orden

### ESTE MES
- [ ] Zod schemas para todas las respuestas de Edge Functions
- [ ] Resolver race condition en cart validation (AbortController)
- [ ] RPC transaccional en Supabase para bulk updates
- [ ] Paginación en todas las queries admin sin límite
- [ ] Cache con TTL para `searchCache`
- [ ] Consolidar manejo de errores (Result type pattern)
- [ ] Code splitting con React.lazy para rutas admin
- [ ] Tests de integración para checkout y cart

### LARGO PLAZO
- [ ] Consolidar estado en Zustand (eliminar uso directo de sessionStorage)
- [ ] Refactorizar CustomerIntelligencePanel en componentes pequeños
- [ ] Logging centralizado con Sentry (reemplazar console.*)
- [ ] ESLint `react-hooks/exhaustive-deps` sin supresiones
- [ ] Configuración centralizada para modelos AI con fallbacks

---

## ARCHIVOS MAS CRITICOS A REVISAR

| Archivo | Issues | Prioridad |
|---------|--------|-----------|
| `src/services/admin/admin-products.service.ts` | C-02, C-04 | CRITICO |
| `src/stores/cart.store.ts` | C-03, H-06 | CRITICO |
| `src/services/admin/admin-coupons.service.ts` | C-05, M-01 | CRITICO |
| `src/services/concierge.service.ts` | M-02, M-03, H-07 | ALTO |
| `src/components/admin/customers/CustomerIntelligencePanel.tsx` | H-05, M-05 | ALTO |
| `src/pages/admin/AdminCesarinOS.tsx` | H-02 | ALTO |
| `src/hooks/useAIConcierge.ts` | H-01, M-07 | ALTO |
| `supabase/functions/customer-intelligence/index.ts` | M-04 | MEDIO |

---

*Generado por Claude Code — auditoría de código estático sobre archivos reales del proyecto.*
*No se realizaron cambios. Solo análisis.*
