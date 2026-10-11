# VSM STORE — AUDITORÍA TÉCNICA DE REMEDIACIÓN FINAL (LANES 6, 7 Y 8)
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Batch Mode)
## Objetivo: Dictamen final definitivo sobre la resolución completa de los 4 Bloqueos y los 3 Riesgos Residuales

Eres **Sol Pro GPT-6**, el Principal Systems & Security Auditor de VSM Store.
En tu evaluación previa sobre el commit `0f0db11a`, emitiste un dictamen de **ACCEPT WITH RESIDUAL RISK** confirmando:
> "El diff aportado corrige los cuatro fallos concretos que motivaron el REJECT anterior. No veo en él una razón para mantener aquel rechazo."

Sin embargo, identificaste 3 riesgos residuales concretos para alcanzar el **ACCEPT formal sin reservas**:
1. El guard arquitectónico de imports en `db-isolation-services.test.ts` no detectaba subrutas como `import('@/lib/supabase/index')` o `import { x } from '@/lib/supabase/index'`.
2. El timeout de `checkBackendHealth` dependía únicamente de `AbortSignal` y carecía de garantía y test si la consulta se congelaba sin liquidar la promesa al abortar.
3. Se requería evidencia explícita de test para la cantidad booleana en `turn-advisory.test.ts`.

El equipo de ingeniería ha implementado en el commit `fb27139a` la resolución integral y rigurosa de estos 3 puntos, complementando los 4 bloqueos originales. Tu misión es evaluar si la remediación actual satisface tus exigencias y amerita el veredicto definitivo de **ACCEPT**.

---

### ESTADO DE REMEDIACIÓN DE LOS 4 BLOQUEOS ORIGINALES:

#### 1. Bloqueo 1 (Restablecer restricciones de publicación de acciones en Kitting e Inventory)
- **Implementación:**
  - En `storefront-kitting-basket.handler.ts`: `shouldShowCatalogSurfaces = catalogGate.is_open` condiciona `visibleProducts = shouldShowCatalogSurfaces ? kitProducts : []`.
  - La asignación de `compactNextStepView` exige explícitamente:
    ```ts
    const compactNextStepView = shouldShowCatalogSurfaces
        && visibleProducts.length > 0
        && adaptiveConversation.nextStep.renderHint === 'SHOW'
        && (renderableNextStepGuidance || hasMaterialNextStepAction)
        ? { ...adaptiveConversation.nextStep, guidance: renderableNextStepGuidance }
        : undefined;
    ```
  - En `storefront-inventory-outlook.handler.ts`: `shouldShowCatalogSurfaces = catalogGate.is_open` condiciona `visibleProducts = shouldShowCatalogSurfaces ? inventoryProducts : []`. Además:
    ```ts
    const shouldShowNextStep = shouldShowCatalogSurfaces
        && visibleProducts.length > 0
        && (supportsReview || signalKind === 'RESTOCK_EXPECTED');
    const compactNextStepView = shouldShowNextStep
        && adaptiveConversation.nextStep.renderHint === 'SHOW'
        && (renderableNextStepGuidance || hasMaterialNextStepAction)
        ? { ...adaptiveConversation.nextStep, guidance: renderableNextStepGuidance }
        : undefined;
    ```
  - Telemetría en ambos handlers deriva estrictamente:
    `zero_results: visibleProducts.length === 0 || !shouldShowCatalogSurfaces || ...`
  - **Pruebas añadidas (`kitting-inventory-gates.test.ts`):** 8 casos de prueba, incluyendo explícitamente:
    - Gate cerrado (`is_open: false`) -> productos vacíos y next_step_view undefined.
    - `renderHint: 'HIDE'` con productos existentes -> next_step_view undefined.
    - Gate abierto (`is_open: true`) pero 0 productos resueltos -> `zero_results: true` emitido a `logAITelemetry` y next_step_view undefined.

#### 2. Bloqueo 2 (No emitir `ADD_TO_CART` con identidad o ruta incompleta en `turn-advisory.ts`)
- **Implementación:**
  - En `turn-advisory.ts`: Se valida estrictamente `proposal.quantity`: si viene definido, debe ser `typeof proposal.quantity === 'number' && Number.isFinite(proposal.quantity)`.
  - Si falta `section`, falta `slug`, o la cantidad es un tipo no numérico (string, booleano, null, NaN): la función **NUNCA** emite una acción de carrito (`primaryAction: null`), y degrada a un mensaje informativo con familia `KEEP_EXPLORING` y `surfaceKind: 'INFORMATIONAL'`.
  - El fallback general de la función sanitiza proactivamente `capsule_contract.next_step_view` neutralizando cualquier acción residual a `primaryAction: null`.
  - Cantidades numéricas válidas se truncan con `Math.floor` y se acotan estrictamente a `[1, 99]`.
  - **Pruebas añadidas (`turn-advisory.test.ts`):** 16 casos de prueba, incluyendo:
    - Degradación con `slug` faltante.
    - Degradación con `section` faltante.
    - Degradación con `quantity` string (`"2"`).
    - Degradación con `quantity` booleana (`true`).
    - Neutralización del fallback general ante acciones previas obsoletas.

#### 3. Bloqueo 3 (Hacer seguro el fallback del dispatcher en `capsule-dispatcher.ts`)
- **Implementación:**
  - Todo el flujo del dispatcher (extracción de nombre, validación `isCapsuleName`, cálculo de `noWriteSmokeActive`, y resolución de handler) está completamente envuelto en el bloque `try`.
  - En caso de excepción, retorna estrictamente un mensaje de error genérico y neutro sin fugar `params.data.message`.
  - **Pruebas añadidas (`capsule-dispatcher.test.ts`):** 5 casos verificando rechazo de handler, protección contra getter exception durante preparación, prototype pollution (`constructor`, `__proto__`, `toString`), y congelamiento estricto `Object.isFrozen(capsuleHandlers)`.

#### 4. Bloqueo 4 (Carreras reales de Realtime y test recursivo de aislamiento de base de datos)
- **Implementación:**
  - En `orders.service.ts`: `await Promise.resolve(onNewOrder(eventData))` dentro del bloque `try/catch`. Cualquier rechazo es capturado y transferido a `onError`.
  - Las invocaciones a `onError` están protegidas con `await Promise.resolve(onError(error)).catch(...)` (para cambios postgres) y `void Promise.resolve(onError(...)).catch(...)` (para errores de canal), garantizando cero excepciones no controladas.
  - Tópico único resistente a colisiones: `orders_pulse_${crypto.randomUUID ? crypto.randomUUID() : ...}`.
  - En `useRealtimeOrders.ts`: Se utiliza `useLayoutEffect` para sincronizar callbacks antes de cualquier efecto pasivo.

---

### RESOLUCIÓN DE LOS 3 RIESGOS RESIDUALES IDENTIFICADOS:

#### Residual 1: Exhaustividad del Guard Arquitectónico de Imports
- **Implementación en `db-isolation-services.test.ts`:**
  - Regexes actualizadas para abarcar cualquier subruta: `(?:/[^'"]*)?` tanto en imports estáticos, dinámicos, side-effect, require y re-exports.
  - Cubre patrones como:
    - `import '@/lib/supabase/index'`
    - `import('@/lib/supabase/index')`
    - `import { supabase } from '@/lib/supabase/index'`
    - `import { createClient } from '@supabase/supabase-js/dist/main'`
    - `export { supabase } from '@/lib/supabase/index'`
  - Se añadieron todas estas combinaciones como fixtures sintéticos explícitos en el test, verificando 100% de detección.
  - El escaneo recursivo en `src/hooks/**` confirma cero violaciones en todo el directorio de hooks.

#### Residual 2: Garantía de Timeout Incondicional en `checkBackendHealth`
- **Implementación en `settings.service.ts`:**
  - Se estructuró con `Promise.race([queryPromise, timeoutPromise])`.
  - Incluso si el driver de base de datos o la red se congelan y la promesa de la consulta nunca se resuelve (aún habiendo emitido `controller.abort()`), el temporizador de `timeoutPromise` rechaza incondicionalmente a los `timeoutMs` (5000ms por defecto).
  - **Prueba añadida en `db-isolation-services.test.ts`:** Caso que simula una consulta que devuelve una promesa que nunca se liquida (`new Promise(() => {})`), demostrando que `checkBackendHealth(50)` rechaza exactamente con el error de timeout.

#### Residual 3: Caso de Prueba para Cantidad Booleana
- **Implementación en `turn-advisory.test.ts`:**
  - Caso dedicado: `it('degrades to informational KEEP_EXPLORING without ADD_TO_CART when proposal.quantity is boolean')` verificando que `quantity: true as any` degrada a `KEEP_EXPLORING` con `primaryAction: null`.

---

### EVIDENCIA DE EJECUCIÓN LOCAL:
- **TypeScript:** `npm run typecheck` (`tsc --noEmit`) -> **0 errores** (salida limpia).
- **Pruebas de Servicios:**
  - `kitting-inventory-gates.test.ts` -> **8/8 PASS**
  - `turn-advisory.test.ts` -> **16/16 PASS**
  - `capsule-dispatcher.test.ts` -> **5/5 PASS**
  - `db-isolation-services.test.ts` -> **17/17 PASS**
  - Total en suites afectadas: **46/46 PASS**.
- **Pruebas de Concierge UI:** `AIConcierge.test.tsx` -> **30/30 PASS**.
- **Git Hygiene:** Árbol limpio, cero BOM (validado con script binario UTF-8), commit `fb27139a` en `origin/main`.

---

### DIFF COMPLETO CONSOLIDADO (f4391fed~1 .. HEAD en SRC/):

```diff
diff --git a/src/components/ui/ai/__tests__/AIConcierge.test.tsx b/src/components/ui/ai/__tests__/AIConcierge.test.tsx
index d787edb0..0fa6899c 100644
--- a/src/components/ui/ai/__tests__/AIConcierge.test.tsx
+++ b/src/components/ui/ai/__tests__/AIConcierge.test.tsx
@@ -1599,6 +1599,7 @@ describe('AIConcierge Stage 1 storefront recovery controls', () => {
 
         fireEvent.click(screen.getByText('Elegir opcion de Waka Pod'));
 
+        expect(addItemMock).not.toHaveBeenCalled();
         expect(navigateMock).toHaveBeenCalledWith(
             expect.objectContaining({
                 to: '/$section/$slug',
diff --git a/src/hooks/useAIConcierge.ts b/src/hooks/useAIConcierge.ts
index ad2ea70c..0a327c76 100644
--- a/src/hooks/useAIConcierge.ts
+++ b/src/hooks/useAIConcierge.ts
@@ -261,7 +261,7 @@ export function useAIConcierge() {
                 clearRequestTimers();
                 setIsSlowResponse(false);
 
-                const assistantMsg: ConciergeAssistantMessage = {
+                let assistantMsg: ConciergeAssistantMessage = {
                     id: assistantMessageId,
                     role: 'assistant',
                     content: response.message,
@@ -302,7 +302,7 @@ export function useAIConcierge() {
                 }
 
                 if (assistantMsg.capsule_contract && assistantMsg.capsule_contract.capsule_name === 'cart_operator') {
-                    convertCartOperatorToAdvisoryCta(assistantMsg);
+                    assistantMsg = convertCartOperatorToAdvisoryCta(assistantMsg);
                 }
 
                 setMessages((prev) => {
diff --git a/src/hooks/useRealtimeOrders.ts b/src/hooks/useRealtimeOrders.ts
index 1032763d..a994957b 100644
--- a/src/hooks/useRealtimeOrders.ts
+++ b/src/hooks/useRealtimeOrders.ts
@@ -3,21 +3,37 @@
  * // Arquitectura: Independent Infrastructure Lego (Lego Master)
  * // Proposito principal: Escucha cambios en 'orders' via Supabase Realtime para Social Proof (Social Pulse).
  * // Regla / Notas: Desacoplado de infraestructura (§1.1). Delega el enriquecimiento de datos al servicio.
+ * // Resiliencia: Utiliza useRef para estabilizar callbacks y evitar reconexiones/churn innecesarios.
  */
 
-import { useEffect } from 'react';
+import { useEffect, useLayoutEffect, useRef } from 'react';
 import { subscribeToRealtimeOrders } from '@/services/orders.service';
 import type { RealtimeOrderEvent } from '@/types/order';
 
 /**
  * Escucha la creación de nuevos pedidos en tiempo real.
  * @param onNewOrder Callback que recibe el evento enriquecido del pedido.
+ * @param onError Callback opcional para gestionar errores de conexión realtime.
  */
-export function useRealtimeOrders(onNewOrder: (order: RealtimeOrderEvent) => void) {
+export function useRealtimeOrders(
+    onNewOrder: (order: RealtimeOrderEvent) => void,
+    onError?: (err: unknown) => void
+) {
+    const callbackRef = useRef(onNewOrder);
+    const errorRef = useRef(onError);
+
+    useLayoutEffect(() => {
+        callbackRef.current = onNewOrder;
+        errorRef.current = onError;
+    });
+
     useEffect(() => {
-        const unsubscribe = subscribeToRealtimeOrders(onNewOrder);
+        const unsubscribe = subscribeToRealtimeOrders(
+            (order) => callbackRef.current?.(order),
+            (err) => errorRef.current?.(err)
+        );
         return () => {
             unsubscribe();
         };
-    }, [onNewOrder]);
+    }, []);
 }
diff --git a/src/services/__tests__/capsule-dispatcher.test.ts b/src/services/__tests__/capsule-dispatcher.test.ts
new file mode 100644
index 00000000..cbaaf822
--- /dev/null
+++ b/src/services/__tests__/capsule-dispatcher.test.ts
@@ -0,0 +1,100 @@
+import { describe, it, expect, vi } from 'vitest';
+import { dispatchClientCapsule } from '@/services/concierge/capsule-dispatcher';
+import { capsuleHandlers } from '@/services/concierge/handlers';
+import * as orchestrator from '@/services/ai-capsule-orchestrator.service';
+import type { DispatchClientCapsuleParams } from '@/services/concierge/dispatch.types';
+
+describe('CapsuleDispatcher resilience and security', () => {
+    const baseParams: DispatchClientCapsuleParams = {
+        data: {
+            capsule_name: 'product_search_integrity',
+            message: 'Server unvalidated message that must never leak on failure',
+        },
+        query: 'test query',
+        history: [],
+        catalogGate: {
+            is_open: true,
+            reason: 'explicit_product_request',
+            primary_intent: 'search',
+            explicit_product_request: true,
+            search_leading: true,
+            needs_clarification: false,
+        },
+        turnAnalysis: {
+            turn_priority: 'primary',
+            primary_intent: 'search',
+            secondary_intents: [],
+            commercial_move: 'KEEP_EXPLORING',
+            turn_focus: 'catalog',
+            current_turn_decision: 'USE_CAPABILITY',
+        },
+        invokeStart: Date.now(),
+        effectiveTelemetrySessionId: 'sess-123',
+    };
+
+    it('returns null and does not execute for prototype pollution attempts', async () => {
+        const protoNames = ['constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty'];
+        for (const badName of protoNames) {
+            const res = await dispatchClientCapsule({
+                ...baseParams,
+                data: { capsule_name: badName },
+            });
+            expect(res).toBeNull();
+        }
+    });
+
+    it('returns null for unknown capsule names', async () => {
+        const res = await dispatchClientCapsule({
+            ...baseParams,
+            data: { capsule_name: 'non_existent_special_capsule' },
+        });
+        expect(res).toBeNull();
+    });
+
+    it('verifies that the capsule handlers registry is strictly frozen against prototype pollution or tampering', () => {
+        expect(Object.isFrozen(capsuleHandlers)).toBe(true);
+    });
+
+    it('safely catches handler exceptions and returns neutral error fallback without leaking data.message', async () => {
+        const spy = vi.spyOn(orchestrator, 'executeProductSearchCapsule').mockRejectedValueOnce(
+            new Error('Boom! Internal handler fault')
+        );
+
+        const res = await dispatchClientCapsule({
+            ...baseParams,
+            data: {
+                capsule_name: 'product_search_integrity',
+                message: '¡Felicidades, se agregó al carrito con éxito!', // potentially deceptive success message
+            },
+        });
+
+        expect(spy).toHaveBeenCalled();
+        expect(res).not.toBeNull();
+        expect(res?.message).toBe(
+            'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'
+        );
+        expect(res?.intent).toBe('info');
+        expect(res?.turn_analysis).toEqual(baseParams.turnAnalysis);
+        expect(res?.catalog_gate).toEqual(baseParams.catalogGate);
+
+        spy.mockRestore();
+    });
+
+    it('safely handles exceptions thrown during preparation (e.g. malformed params)', async () => {
+        const malformedParams = {
+            ...baseParams,
+            data: {
+                capsule_name: 'product_search_integrity',
+                get no_write_smoke() {
+                    throw new Error('Preparation getter fault');
+                },
+            },
+        };
+
+        const res = await dispatchClientCapsule(malformedParams as any);
+        expect(res).not.toBeNull();
+        expect(res?.message).toBe(
+            'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'
+        );
+    });
+});
diff --git a/src/services/__tests__/db-isolation-services.test.ts b/src/services/__tests__/db-isolation-services.test.ts
index f4566ff0..c9cc801b 100644
--- a/src/services/__tests__/db-isolation-services.test.ts
+++ b/src/services/__tests__/db-isolation-services.test.ts
@@ -1,5 +1,7 @@
 // @vitest-environment node
 import { describe, expect, it, vi, beforeEach } from 'vitest';
+import fs from 'node:fs';
+import path from 'node:path';
 
 const fromMock = vi.hoisted(() => vi.fn());
 const channelMock = vi.hoisted(() => vi.fn());
@@ -24,7 +26,88 @@ import { invokeVisualCompatibilityScanner } from '@/services/visual-scanner.serv
 
 describe('Database isolation services', () => {
     beforeEach(() => {
-        vi.clearAllMocks();
+        vi.resetAllMocks();
+        removeChannelMock.mockResolvedValue('ok');
+    });
+
+    describe('Architectural Hook Isolation Guard', () => {
+        function detectIllegalSupabaseImports(content: string): string[] {
+            const violations: string[] = [];
+            // 1. Side-effect imports: import '@/lib/supabase' or import '@supabase/supabase-js' (including subpaths like /index)
+            if (/import\s+['"][^'"]*(?:@\/lib\/supabase|@supabase\/supabase-js)(?:\/[^'"]*)?['"]/.test(content)) {
+                violations.push('Side-effect import of supabase');
+            }
+            // 2. Dynamic imports: import('@/lib/supabase') or import('@supabase/supabase-js') (including subpaths like /index)
+            if (/import\s*\(\s*['"][^'"]*(?:@\/lib\/supabase|@supabase\/supabase-js)(?:\/[^'"]*)?['"]\s*\)/.test(content)) {
+                violations.push('Dynamic import of supabase');
+            }
+            // 3. Static runtime imports from @/lib/supabase or relative to supabase (including subpaths like /index)
+            if (/import\s+(?!type\b)[^'"]*from\s+['"][^'"]*lib\/supabase(?:\/[^'"]*)?['"]/.test(content)) {
+                violations.push('Static runtime import from lib/supabase');
+            }
+            // 4. Static runtime imports from @supabase/supabase-js (including subpaths)
+            if (/import\s+(?!type\b)[^'"]*from\s+['"]@supabase\/supabase-js(?:\/[^'"]*)?['"]/.test(content)) {
+                violations.push('Static runtime import from @supabase/supabase-js');
+            }
+            // 5. CJS require: require('@/lib/supabase') or require('@supabase/...')
+            if (/require\s*\(\s*['"][^'"]*supabase[^'"]*['"]\s*\)/.test(content)) {
+                violations.push('require of supabase');
+            }
+            // 6. Re-exports: export ... from '...supabase...' (unless export type)
+            if (/export\s+(?!type\b)[^'"]*from\s+['"][^'"]*supabase[^'"]*['"]/.test(content)) {
+                violations.push('Runtime re-export of supabase');
+            }
+            return violations;
+        }
+
+        it('exhaustively catches side-effect, dynamic, static runtime, require, and re-export imports in synthetic fixtures', () => {
+            expect(detectIllegalSupabaseImports("import '@/lib/supabase';")).toContain('Side-effect import of supabase');
+            expect(detectIllegalSupabaseImports("import '@/lib/supabase/index';")).toContain('Side-effect import of supabase');
+            expect(detectIllegalSupabaseImports("import '@supabase/supabase-js';")).toContain('Side-effect import of supabase');
+            expect(detectIllegalSupabaseImports("const sb = await import('@supabase/supabase-js');")).toContain('Dynamic import of supabase');
+            expect(detectIllegalSupabaseImports("const sb = await import('@/lib/supabase');")).toContain('Dynamic import of supabase');
+            expect(detectIllegalSupabaseImports("const sb = await import('@/lib/supabase/index');")).toContain('Dynamic import of supabase');
+            expect(detectIllegalSupabaseImports("import { supabase } from '@/lib/supabase';")).toContain('Static runtime import from lib/supabase');
+            expect(detectIllegalSupabaseImports("import { supabase } from '@/lib/supabase/index';")).toContain('Static runtime import from lib/supabase');
+            expect(detectIllegalSupabaseImports("import { createClient } from '@supabase/supabase-js';")).toContain('Static runtime import from @supabase/supabase-js');
+            expect(detectIllegalSupabaseImports("import { createClient } from '@supabase/supabase-js/dist/main';")).toContain('Static runtime import from @supabase/supabase-js');
+            expect(detectIllegalSupabaseImports("const sb = require('@/lib/supabase');")).toContain('require of supabase');
+            expect(detectIllegalSupabaseImports("export { supabase } from '@/lib/supabase';")).toContain('Runtime re-export of supabase');
+            expect(detectIllegalSupabaseImports("export { supabase } from '@/lib/supabase/index';")).toContain('Runtime re-export of supabase');
+
+            // Must allow valid type-only imports and local variable names
+            expect(detectIllegalSupabaseImports("import type { User } from '@supabase/supabase-js';")).toEqual([]);
+            expect(detectIllegalSupabaseImports("const supabaseError = err as { code?: string };")).toEqual([]);
+        });
+
+        it('ensures zero hooks in src/hooks/** directly import @/lib/supabase or runtime @supabase/supabase-js', () => {
+            const hooksRoot = path.resolve(process.cwd(), 'src/hooks');
+
+            function getHookFiles(dir: string): string[] {
+                const entries = fs.readdirSync(dir, { withFileTypes: true });
+                const files: string[] = [];
+                for (const entry of entries) {
+                    const fullPath = path.join(dir, entry.name);
+                    if (entry.isDirectory()) {
+                        if (entry.name !== '__tests__') {
+                            files.push(...getHookFiles(fullPath));
+                        }
+                    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
+                        files.push(fullPath);
+                    }
+                }
+                return files;
+            }
+
+            const hookFiles = getHookFiles(hooksRoot);
+            expect(hookFiles.length).toBeGreaterThan(5);
+
+            for (const filePath of hookFiles) {
+                const content = fs.readFileSync(filePath, 'utf8');
+                const violations = detectIllegalSupabaseImports(content);
+                expect(violations, `Illegal supabase import in ${filePath}`).toEqual([]);
+            }
+        });
     });
 
     describe('getAppliedReferral', () => {
@@ -45,6 +128,19 @@ describe('Database isolation services', () => {
             expect(result).toEqual({ referrer_id: 'ref-1', status: 'completed' });
         });
 
+        it('returns null when no referral exists', async () => {
+            const maybeSingleMock = vi.fn().mockResolvedValue({
+                data: null,
+                error: null,
+            });
+            const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
+            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
+            fromMock.mockReturnValue({ select: selectMock });
+
+            const result = await getAppliedReferral('customer-non-existent');
+            expect(result).toBeNull();
+        });
+
         it('throws error if supabase query fails', async () => {
             const maybeSingleMock = vi.fn().mockResolvedValue({
                 data: null,
@@ -59,39 +155,52 @@ describe('Database isolation services', () => {
     });
 
     describe('checkBackendHealth', () => {
-        it('performs a lightweight count query on categories', async () => {
-            const limitMock = vi.fn().mockResolvedValue({ error: null });
+        it('performs a lightweight ping query on categories with abortSignal', async () => {
+            const abortSignalMock = vi.fn().mockResolvedValue({ error: null });
+            const limitMock = vi.fn().mockReturnValue({ abortSignal: abortSignalMock });
             const selectMock = vi.fn().mockReturnValue({ limit: limitMock });
             fromMock.mockReturnValue({ select: selectMock });
 
             const result = await checkBackendHealth();
 
             expect(fromMock).toHaveBeenCalledWith('categories');
-            expect(selectMock).toHaveBeenCalledWith('id', { count: 'exact', head: true });
+            expect(selectMock).toHaveBeenCalledWith('id');
             expect(limitMock).toHaveBeenCalledWith(1);
             expect(result).toBe(true);
         });
 
         it('throws if categories heartbeat returns an error', async () => {
-            const limitMock = vi.fn().mockResolvedValue({ error: new Error('Connection refused') });
+            const abortSignalMock = vi.fn().mockResolvedValue({ error: new Error('Connection refused') });
+            const limitMock = vi.fn().mockReturnValue({ abortSignal: abortSignalMock });
             const selectMock = vi.fn().mockReturnValue({ limit: limitMock });
             fromMock.mockReturnValue({ select: selectMock });
 
             await expect(checkBackendHealth()).rejects.toThrow('Connection refused');
         });
+
+        it('times out and aborts if query promise hangs and never resolves', async () => {
+            // Promise that never settles
+            const hangingAbortSignalMock = vi.fn().mockImplementation(() => new Promise(() => {}));
+            const limitMock = vi.fn().mockReturnValue({ abortSignal: hangingAbortSignalMock });
+            const selectMock = vi.fn().mockReturnValue({ limit: limitMock });
+            fromMock.mockReturnValue({ select: selectMock });
+
+            await expect(checkBackendHealth(50)).rejects.toThrow('Database ping timed out after 50ms');
+        });
     });
 
     describe('subscribeToRealtimeOrders', () => {
-        it('registers a realtime channel and returns an unsubscribe function', () => {
+        it('registers a unique realtime channel and returns an unsubscribe function that sets disposed flag', () => {
             const channelInstance: any = {};
             channelInstance.on = vi.fn().mockReturnValue(channelInstance);
             channelInstance.subscribe = vi.fn().mockReturnValue(channelInstance);
             channelMock.mockReturnValue(channelInstance);
+            removeChannelMock.mockResolvedValue('ok');
 
             const onNewOrder = vi.fn();
             const unsubscribe = subscribeToRealtimeOrders(onNewOrder);
 
-            expect(channelMock).toHaveBeenCalledWith('public:orders_pulse');
+            expect(channelMock).toHaveBeenCalledWith(expect.stringMatching(/^orders_pulse_/));
             expect(channelInstance.on).toHaveBeenCalledWith(
                 'postgres_changes',
                 { event: 'INSERT', schema: 'public', table: 'orders' },
@@ -102,6 +211,176 @@ describe('Database isolation services', () => {
             unsubscribe();
             expect(removeChannelMock).toHaveBeenCalledWith(channelInstance);
         });
+
+        it('generates unique channel topics across two concurrent subscriptions', () => {
+            const channelInstance: any = {
+                on: vi.fn().mockReturnThis(),
+                subscribe: vi.fn().mockReturnThis(),
+            };
+            channelMock.mockReturnValue(channelInstance);
+
+            const unsub1 = subscribeToRealtimeOrders(vi.fn());
+            const unsub2 = subscribeToRealtimeOrders(vi.fn());
+
+            const topic1 = channelMock.mock.calls[0]?.[0];
+            const topic2 = channelMock.mock.calls[1]?.[0];
+
+            expect(topic1).toMatch(/^orders_pulse_/);
+            expect(topic2).toMatch(/^orders_pulse_/);
+            expect(topic1).not.toBe(topic2);
+
+            unsub1();
+            unsub2();
+        });
+
+        it('handles postgres_changes event, ignores events after disposed is true', async () => {
+            let changeHandler: (payload: any) => Promise<void> = () => Promise.resolve();
+            const channelInstance: any = {
+                on: vi.fn().mockImplementation((_event, _filter, callback) => {
+                    changeHandler = callback;
+                    return channelInstance;
+                }),
+                subscribe: vi.fn().mockReturnThis(),
+            };
+            channelMock.mockReturnValue(channelInstance);
+            removeChannelMock.mockResolvedValue('ok');
+
+            const singleMock = vi.fn().mockResolvedValue({
+                data: {
+                    id: 'ord-123',
+                    items: [{ name: 'Vape Kit', image: 'img.png' }],
+                    customer_profiles: { full_name: 'Juan Perez' },
+                    shipping_address: { city: 'Guadalajara' },
+                },
+                error: null,
+            });
+            const eqMock = vi.fn().mockReturnValue({ single: singleMock });
+            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
+            fromMock.mockReturnValue({ select: selectMock });
+
+            const onNewOrder = vi.fn();
+            const unsubscribe = subscribeToRealtimeOrders(onNewOrder);
+
+            // Trigger event while active
+            await changeHandler({ new: { id: 'ord-123' } });
+            expect(onNewOrder).toHaveBeenCalledWith({
+                id: 'ord-123',
+                customer_name: 'Juan Perez',
+                city: 'Guadalajara',
+                product_name: 'Vape Kit',
+                product_image: 'img.png',
+            });
+
+            // Now unsubscribe
+            unsubscribe();
+            onNewOrder.mockClear();
+
+            // Trigger event after disposed
+            await changeHandler({ new: { id: 'ord-123' } });
+            expect(onNewOrder).not.toHaveBeenCalled();
+        });
+
+        it('catches async rejections from onNewOrder and routes to onError without unhandled rejection', async () => {
+            let changeHandler: (payload: any) => Promise<void> = () => Promise.resolve();
+            const channelInstance: any = {
+                on: vi.fn().mockImplementation((_event, _filter, callback) => {
+                    changeHandler = callback;
+                    return channelInstance;
+                }),
+                subscribe: vi.fn().mockReturnThis(),
+            };
+            channelMock.mockReturnValue(channelInstance);
+
+            const singleMock = vi.fn().mockResolvedValue({
+                data: {
+                    id: 'ord-123',
+                    items: [{ name: 'Vape Kit', image: 'img.png' }],
+                    customer_profiles: { full_name: 'Juan' },
+                    shipping_address: { city: 'CDMX' },
+                },
+                error: null,
+            });
+            const eqMock = vi.fn().mockReturnValue({ single: singleMock });
+            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
+            fromMock.mockReturnValue({ select: selectMock });
+
+            const asyncError = new Error('Async consumer failed');
+            const onNewOrder = vi.fn().mockRejectedValue(asyncError);
+            const onError = vi.fn();
+
+            subscribeToRealtimeOrders(onNewOrder, onError);
+
+            await changeHandler({ new: { id: 'ord-123' } });
+
+            expect(onError).toHaveBeenCalledWith(asyncError);
+        });
+
+        it('catches errors inside onError without throwing unhandled exceptions', async () => {
+            let changeHandler: (payload: any) => Promise<void> = () => Promise.resolve();
+            const channelInstance: any = {
+                on: vi.fn().mockImplementation((_event, _filter, callback) => {
+                    changeHandler = callback;
+                    return channelInstance;
+                }),
+                subscribe: vi.fn().mockReturnThis(),
+            };
+            channelMock.mockReturnValue(channelInstance);
+
+            const singleMock = vi.fn().mockRejectedValue(new Error('DB fetch error'));
+            const eqMock = vi.fn().mockReturnValue({ single: singleMock });
+            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
+            fromMock.mockReturnValue({ select: selectMock });
+
+            const throwingOnError = vi.fn().mockImplementation(() => {
+                throw new Error('Crash in onError');
+            });
+
+            subscribeToRealtimeOrders(vi.fn(), throwingOnError);
+
+            await expect(changeHandler({ new: { id: 'ord-123' } })).resolves.not.toThrow();
+            expect(throwingOnError).toHaveBeenCalled();
+        });
+
+        it('catches and suppresses async rejections from onError in postgres_changes route', async () => {
+            let changeHandler: (payload: any) => Promise<void> = () => Promise.resolve();
+            const channelInstance: any = {
+                on: vi.fn().mockImplementation((_event, _filter, callback) => {
+                    changeHandler = callback;
+                    return channelInstance;
+                }),
+                subscribe: vi.fn().mockReturnThis(),
+            };
+            channelMock.mockReturnValue(channelInstance);
+
+            const singleMock = vi.fn().mockRejectedValue(new Error('DB fetch error'));
+            const eqMock = vi.fn().mockReturnValue({ single: singleMock });
+            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
+            fromMock.mockReturnValue({ select: selectMock });
+
+            const asyncRejectingOnError = vi.fn().mockRejectedValue(new Error('Async onError rejected'));
+            subscribeToRealtimeOrders(vi.fn(), asyncRejectingOnError);
+
+            await expect(changeHandler({ new: { id: 'ord-123' } })).resolves.not.toThrow();
+            expect(asyncRejectingOnError).toHaveBeenCalled();
+        });
+
+        it('catches and suppresses async rejections from onError in status error route', async () => {
+            let statusHandler: (status: string) => void = () => {};
+            const channelInstance: any = {
+                on: vi.fn().mockReturnThis(),
+                subscribe: vi.fn().mockImplementation((callback) => {
+                    statusHandler = callback;
+                    return channelInstance;
+                }),
+            };
+            channelMock.mockReturnValue(channelInstance);
+
+            const asyncRejectingOnError = vi.fn().mockRejectedValue(new Error('Async status onError rejected'));
+            subscribeToRealtimeOrders(vi.fn(), asyncRejectingOnError);
+
+            expect(() => statusHandler('CHANNEL_ERROR')).not.toThrow();
+            expect(asyncRejectingOnError).toHaveBeenCalled();
+        });
     });
 
     describe('invokeVisualCompatibilityScanner', () => {
@@ -135,15 +414,20 @@ describe('Database isolation services', () => {
             expect(result).toEqual(mockResponse);
         });
 
-        it('throws on edge function invocation error', async () => {
+        it('throws with preserved cause on edge function invocation error', async () => {
+            const invokeErr = { message: 'Function timeout', status: 504 };
             functionsInvokeMock.mockResolvedValue({
                 data: null,
-                error: { message: 'Function timeout' },
+                error: invokeErr,
             });
 
-            await expect(
-                invokeVisualCompatibilityScanner('data:image/png;base64,abc', 'image/png')
-            ).rejects.toThrow('Function timeout');
+            try {
+                await invokeVisualCompatibilityScanner('data:image/png;base64,abc', 'image/png');
+                expect.fail('Should have thrown');
+            } catch (err: any) {
+                expect(err.message).toBe('Function timeout');
+                expect(err.cause).toBe(invokeErr);
+            }
         });
     });
 });
diff --git a/src/services/__tests__/kitting-inventory-gates.test.ts b/src/services/__tests__/kitting-inventory-gates.test.ts
new file mode 100644
index 00000000..db8d98b1
--- /dev/null
+++ b/src/services/__tests__/kitting-inventory-gates.test.ts
@@ -0,0 +1,290 @@
+import { describe, it, expect, vi, beforeEach } from 'vitest';
+import { handleStorefrontKittingBasket } from '@/services/concierge/handlers/storefront-kitting-basket.handler';
+import { handleStorefrontInventoryOutlook } from '@/services/concierge/handlers/storefront-inventory-outlook.handler';
+import * as orchestrator from '@/services/ai-capsule-orchestrator.service';
+import * as productsService from '@/services/products.service';
+import * as stage5 from '@/lib/cesarin-stage5';
+import { logAITelemetry } from '@/services/concierge/telemetry';
+import type { DispatchClientCapsuleParams } from '@/services/concierge/dispatch.types';
+
+vi.mock('@/services/concierge/telemetry', () => ({
+    logAITelemetry: vi.fn().mockResolvedValue(undefined),
+}));
+
+describe('Kitting and Inventory Action Publishing Gates (Blocker 1)', () => {
+    const mockProduct = {
+        id: 'prod-1',
+        name: 'Vape Pod Kit',
+        slug: 'vape-pod-kit',
+        price: 500,
+        section: 'vape',
+    } as any;
+
+    const openCatalogGate = {
+        is_open: true,
+        reason: 'explicit_product_request' as const,
+        primary_intent: 'search',
+        explicit_product_request: true,
+        search_leading: true,
+        needs_clarification: false,
+    };
+
+    const closedCatalogGate = {
+        is_open: false,
+        reason: 'non_catalog_lane' as const,
+        primary_intent: 'support',
+        explicit_product_request: false,
+        search_leading: false,
+        needs_clarification: false,
+    };
+
+    const baseParams: DispatchClientCapsuleParams = {
+        data: { tool_args: { query: 'test' } },
+        query: 'test query',
+        history: [],
+        catalogGate: openCatalogGate,
+        turnAnalysis: {
+            turn_priority: 'primary',
+            primary_intent: 'search',
+            secondary_intents: [],
+            commercial_move: 'KEEP_EXPLORING',
+            turn_focus: 'catalog',
+            current_turn_decision: 'USE_CAPABILITY',
+        },
+        invokeStart: Date.now(),
+        effectiveTelemetrySessionId: 'sess-123',
+    };
+
+    beforeEach(() => {
+        vi.clearAllMocks();
+        vi.spyOn(productsService, 'getProductsByIds').mockResolvedValue([mockProduct]);
+    });
+
+    describe('handleStorefrontKittingBasket', () => {
+        it('suppresses next_step_view and visible products when catalog gate is closed', async () => {
+            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'FULL_KIT',
+                resolved_products: [{ id: 'prod-1' } as any],
+                customer_response_draft: 'Aquí está tu kit',
+            } as any);
+
+            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
+                message: 'Aquí está tu kit',
+                nextStep: {
+                    family: 'ADD_READY',
+                    surfaceKind: 'ACTIONABLE',
+                    renderHint: 'SHOW',
+                    guidance: 'Confirmar kit',
+                    primaryAction: { kind: 'ADD_TO_CART', label: 'Agregar', product: mockProduct, quantity: 1 },
+                    secondaryAction: null,
+                    assistAction: null,
+                },
+            } as any);
+
+            const result = await handleStorefrontKittingBasket(
+                {
+                    ...baseParams,
+                    catalogGate: closedCatalogGate,
+                },
+                false
+            );
+
+            expect(result?.suggestedProducts).toEqual([]);
+            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
+        });
+
+        it('suppresses next_step_view when renderHint is HIDE even if gate is open and products exist', async () => {
+            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'FULL_KIT',
+                resolved_products: [{ id: 'prod-1' } as any],
+                customer_response_draft: 'Aquí está tu kit',
+            } as any);
+
+            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
+                message: 'Aquí está tu kit',
+                nextStep: {
+                    family: 'ADD_READY',
+                    surfaceKind: 'ACTIONABLE',
+                    renderHint: 'HIDE',
+                    guidance: 'Confirmar kit',
+                    primaryAction: { kind: 'ADD_TO_CART', label: 'Agregar', product: mockProduct, quantity: 1 },
+                    secondaryAction: null,
+                    assistAction: null,
+                },
+            } as any);
+
+            const result = await handleStorefrontKittingBasket(baseParams, false);
+
+            expect(result?.suggestedProducts).toHaveLength(1);
+            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
+        });
+
+        it('publishes next_step_view when gate is open, products exist, and renderHint is SHOW', async () => {
+            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'FULL_KIT',
+                resolved_products: [{ id: 'prod-1' } as any],
+                customer_response_draft: 'Aquí está tu kit',
+            } as any);
+
+            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
+                message: 'Aquí está tu kit',
+                nextStep: {
+                    family: 'ADD_READY',
+                    surfaceKind: 'ACTIONABLE',
+                    renderHint: 'SHOW',
+                    guidance: 'Confirmar kit',
+                    primaryAction: { kind: 'ADD_TO_CART', label: 'Agregar', product: mockProduct, quantity: 1 },
+                    secondaryAction: null,
+                    assistAction: null,
+                },
+            } as any);
+
+            const result = await handleStorefrontKittingBasket(baseParams, false);
+
+            expect(result?.suggestedProducts).toHaveLength(1);
+            expect(result?.capsule_contract?.next_step_view).toBeDefined();
+            expect(result?.capsule_contract?.next_step_view?.family).toBe('ADD_READY');
+        });
+
+        it('suppresses next_step_view and emits zero_results: true when gate is open but 0 products resolved', async () => {
+            vi.spyOn(productsService, 'getProductsByIds').mockResolvedValue([]);
+            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'FULL_KIT',
+                resolved_products: [{ id: 'prod-non-existent' } as any],
+                customer_response_draft: 'Kit no disponible',
+            } as any);
+
+            const result = await handleStorefrontKittingBasket(baseParams, false);
+
+            expect(result?.suggestedProducts).toEqual([]);
+            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
+            expect(logAITelemetry).toHaveBeenCalledWith(
+                expect.objectContaining({
+                    zero_results: true,
+                    product_card_count: 0,
+                    has_product_cards: false,
+                    catalog_gate_open: true,
+                })
+            );
+        });
+    });
+
+    describe('handleStorefrontInventoryOutlook', () => {
+        it('suppresses next_step_view and visible products when catalog gate is closed', async () => {
+            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'EXACT_MATCH',
+                inventory_outlook_signal: { kind: 'IN_STOCK_ONLINE' },
+                resolved_products: [{ id: 'prod-1' } as any],
+                customer_response_draft: 'Producto disponible',
+            } as any);
+
+            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
+                message: 'Producto disponible',
+                nextStep: {
+                    family: 'REVIEW_ONE',
+                    surfaceKind: 'ACTIONABLE',
+                    renderHint: 'SHOW',
+                    guidance: 'Ver disponibilidad',
+                    primaryAction: { kind: 'SELECT_OPTION', label: 'Ver', product: mockProduct },
+                    secondaryAction: null,
+                    assistAction: null,
+                },
+            } as any);
+
+            const result = await handleStorefrontInventoryOutlook(
+                {
+                    ...baseParams,
+                    catalogGate: closedCatalogGate,
+                },
+                false
+            );
+
+            expect(result?.suggestedProducts).toEqual([]);
+            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
+        });
+
+        it('suppresses next_step_view when renderHint is HIDE even if gate is open and product is in stock', async () => {
+            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'EXACT_MATCH',
+                inventory_outlook_signal: { kind: 'IN_STOCK_ONLINE' },
+                resolved_products: [{ id: 'prod-1' } as any],
+                customer_response_draft: 'Producto disponible',
+            } as any);
+
+            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
+                message: 'Producto disponible',
+                nextStep: {
+                    family: 'REVIEW_ONE',
+                    surfaceKind: 'ACTIONABLE',
+                    renderHint: 'HIDE',
+                    guidance: 'Ver disponibilidad',
+                    primaryAction: { kind: 'SELECT_OPTION', label: 'Ver', product: mockProduct },
+                    secondaryAction: null,
+                    assistAction: null,
+                },
+            } as any);
+
+            const result = await handleStorefrontInventoryOutlook(baseParams, false);
+
+            expect(result?.suggestedProducts).toHaveLength(1);
+            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
+        });
+
+        it('suppresses next_step_view when stock signal is not reviewable/restock (e.g. OUT_OF_STOCK)', async () => {
+            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'EXACT_MATCH',
+                inventory_outlook_signal: { kind: 'OUT_OF_STOCK' as any },
+                resolved_products: [{ id: 'prod-1' } as any],
+                customer_response_draft: 'Agotado',
+            } as any);
+
+            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
+                message: 'Agotado',
+                nextStep: {
+                    family: 'KEEP_EXPLORING',
+                    surfaceKind: 'INFORMATIONAL',
+                    renderHint: 'SHOW',
+                    guidance: 'Explorar otras opciones',
+                    primaryAction: null,
+                    secondaryAction: null,
+                    assistAction: null,
+                },
+            } as any);
+
+            const result = await handleStorefrontInventoryOutlook(baseParams, false);
+
+            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
+        });
+
+        it('suppresses next_step_view and emits zero_results: true when gate is open but 0 products resolved', async () => {
+            vi.spyOn(productsService, 'getProductsByIds').mockResolvedValue([]);
+            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
+                execution_status: 'SUCCESS',
+                match_strategy: 'EXACT_MATCH',
+                inventory_outlook_signal: { kind: 'IN_STOCK_ONLINE' },
+                resolved_products: [{ id: 'prod-non-existent' } as any],
+                customer_response_draft: 'Producto no disponible',
+            } as any);
+
+            const result = await handleStorefrontInventoryOutlook(baseParams, false);
+
+            expect(result?.suggestedProducts).toEqual([]);
+            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
+            expect(logAITelemetry).toHaveBeenCalledWith(
+                expect.objectContaining({
+                    zero_results: true,
+                    product_card_count: 0,
+                    has_product_cards: false,
+                    catalog_gate_open: true,
+                })
+            );
+        });
+    });
+});
diff --git a/src/services/__tests__/turn-advisory.test.ts b/src/services/__tests__/turn-advisory.test.ts
index 871e3470..d6ab9ef2 100644
--- a/src/services/__tests__/turn-advisory.test.ts
+++ b/src/services/__tests__/turn-advisory.test.ts
@@ -10,8 +10,8 @@ import {
 
 describe('turn-advisory service', () => {
     describe('convertCartOperatorToAdvisoryCta', () => {
-        it('converts an EXACT_MUTATION_PROPOSED ADD proposal into an actionable ADD_READY CTA', () => {
-            const message: ConciergeAssistantMessage = {
+        it('purely converts an EXACT_MUTATION_PROPOSED ADD proposal without mutating input message', () => {
+            const originalMessage: ConciergeAssistantMessage = {
                 id: '1',
                 role: 'assistant',
                 content: 'Original message',
@@ -24,17 +24,25 @@ describe('turn-advisory service', () => {
                         product_ref: 'Caliburn G3',
                         quantity: 2,
                         resolved_variant_id: 'var-456',
+                        variant_name: 'Negro Mate',
+                        section: 'vape',
+                        slug: 'caliburn-g3',
                     },
                 },
             };
 
-            convertCartOperatorToAdvisoryCta(message);
+            const result = convertCartOperatorToAdvisoryCta(originalMessage);
+
+            // Verify immutability
+            expect(originalMessage.content).toBe('Original message');
+            expect(originalMessage.intent).toBeUndefined();
 
-            expect(message.intent).toBe('search');
-            expect(message.content).toContain('solo se agrega si tu confirmas');
-            expect(message.capsule_contract?.next_step_view).toEqual({
+            // Verify transformed result
+            expect(result.intent).toBe('search');
+            expect(result.content).toContain('solo se agrega si tú confirmas con el botón');
+            expect(result.capsule_contract?.next_step_view).toEqual({
                 family: 'ADD_READY',
-                guidance: 'Si Caliburn G3 es el correcto, confirmalo desde el boton para agregarlo al carrito.',
+                guidance: 'Si Caliburn G3 es el correcto, confírmalo desde el botón para agregarlo al carrito.',
                 surfaceKind: 'ACTIONABLE',
                 primaryAction: {
                     kind: 'ADD_TO_CART',
@@ -42,18 +50,160 @@ describe('turn-advisory service', () => {
                     product: {
                         id: 'prod-123',
                         name: 'Caliburn G3',
-                        slug: '',
+                        slug: 'caliburn-g3',
                         section: 'vape',
                     },
                     quantity: 2,
                     variantToken: {
                         id: 'var-456',
-                        name: 'Variante',
+                        name: 'Negro Mate',
+                    },
+                },
+                secondaryAction: null,
+                assistAction: null,
+            });
+        });
+
+        it('strictly clamps quantities: floor(0.5) falls back to 1, <=0 falls back to 1, and 1e6 clamps to 99', () => {
+            const makeMsg = (quantity: number): ConciergeAssistantMessage => ({
+                id: 'q-test',
+                role: 'assistant',
+                content: '',
+                timestamp: new Date(),
+                capsule_contract: {
+                    match_strategy: 'EXACT_MUTATION_PROPOSED',
+                    mutation_proposal: {
+                        type: 'ADD',
+                        resolved_product_id: 'prod-1',
+                        product_ref: 'Pod',
+                        quantity,
+                        section: 'vape',
+                        slug: 'pod-test',
+                    },
+                },
+            });
+
+            // 0.5 must not become 0
+            const res05 = convertCartOperatorToAdvisoryCta(makeMsg(0.5));
+            const action05 = (res05.capsule_contract?.next_step_view as any)?.primaryAction;
+            expect(action05.quantity).toBe(1);
+
+            // 0 must fall back to 1
+            const res0 = convertCartOperatorToAdvisoryCta(makeMsg(0));
+            const action0 = (res0.capsule_contract?.next_step_view as any)?.primaryAction;
+            expect(action0.quantity).toBe(1);
+
+            // negative must fall back to 1
+            const resNeg = convertCartOperatorToAdvisoryCta(makeMsg(-5));
+            const actionNeg = (resNeg.capsule_contract?.next_step_view as any)?.primaryAction;
+            expect(actionNeg.quantity).toBe(1);
+
+            // 1e6 must clamp to 99
+            const resMax = convertCartOperatorToAdvisoryCta(makeMsg(1_000_000));
+            const actionMax = (resMax.capsule_contract?.next_step_view as any)?.primaryAction;
+            expect(actionMax.quantity).toBe(99);
+        });
+
+        it('degrades to informational KEEP_EXPLORING without ADD_TO_CART when section or slug is missing or empty', () => {
+            const missingSlugMsg: ConciergeAssistantMessage = {
+                id: 'no-slug',
+                role: 'assistant',
+                content: 'Original',
+                timestamp: new Date(),
+                capsule_contract: {
+                    match_strategy: 'EXACT_MUTATION_PROPOSED',
+                    mutation_proposal: {
+                        type: 'ADD',
+                        resolved_product_id: 'prod-1',
+                        product_ref: 'Pod',
+                        quantity: 1,
+                        section: 'vape',
+                        slug: '',
                     },
                 },
+            };
+
+            const resultSlug = convertCartOperatorToAdvisoryCta(missingSlugMsg);
+            expect(resultSlug.intent).toBe('info');
+            expect(resultSlug.capsule_contract?.next_step_view).toEqual({
+                family: 'KEEP_EXPLORING',
+                guidance: 'Dime el producto exacto o abre la ficha de producto para agregarlo al carrito.',
+                surfaceKind: 'INFORMATIONAL',
+                primaryAction: null,
                 secondaryAction: null,
                 assistAction: null,
             });
+
+            const missingSectionMsg: ConciergeAssistantMessage = {
+                id: 'no-section',
+                role: 'assistant',
+                content: 'Original',
+                timestamp: new Date(),
+                capsule_contract: {
+                    match_strategy: 'EXACT_MUTATION_PROPOSED',
+                    mutation_proposal: {
+                        type: 'ADD',
+                        resolved_product_id: 'prod-1',
+                        product_ref: 'Pod',
+                        quantity: 1,
+                        slug: 'pod-test',
+                    },
+                },
+            };
+
+            const resultSection = convertCartOperatorToAdvisoryCta(missingSectionMsg);
+            expect(resultSection.intent).toBe('info');
+            expect(resultSection.capsule_contract?.next_step_view?.primaryAction).toBeNull();
+        });
+
+        it('degrades to informational KEEP_EXPLORING without ADD_TO_CART when proposal.quantity is non-numeric', () => {
+            const stringQtyMsg: ConciergeAssistantMessage = {
+                id: 'str-qty',
+                role: 'assistant',
+                content: 'Original',
+                timestamp: new Date(),
+                capsule_contract: {
+                    match_strategy: 'EXACT_MUTATION_PROPOSED',
+                    mutation_proposal: {
+                        type: 'ADD',
+                        resolved_product_id: 'prod-1',
+                        product_ref: 'Pod',
+                        quantity: '2' as any,
+                        section: 'vape',
+                        slug: 'pod-test',
+                    },
+                },
+            };
+
+            const result = convertCartOperatorToAdvisoryCta(stringQtyMsg);
+            expect(result.intent).toBe('info');
+            expect(result.capsule_contract?.next_step_view?.surfaceKind).toBe('INFORMATIONAL');
+            expect(result.capsule_contract?.next_step_view?.primaryAction).toBeNull();
+        });
+
+        it('degrades to informational KEEP_EXPLORING without ADD_TO_CART when proposal.quantity is boolean', () => {
+            const boolQtyMsg: ConciergeAssistantMessage = {
+                id: 'bool-qty',
+                role: 'assistant',
+                content: 'Original',
+                timestamp: new Date(),
+                capsule_contract: {
+                    match_strategy: 'EXACT_MUTATION_PROPOSED',
+                    mutation_proposal: {
+                        type: 'ADD',
+                        resolved_product_id: 'prod-1',
+                        product_ref: 'Pod',
+                        quantity: true as any,
+                        section: 'vape',
+                        slug: 'pod-test',
+                    },
+                },
+            };
+
+            const result = convertCartOperatorToAdvisoryCta(boolQtyMsg);
+            expect(result.intent).toBe('info');
+            expect(result.capsule_contract?.next_step_view?.surfaceKind).toBe('INFORMATIONAL');
+            expect(result.capsule_contract?.next_step_view?.primaryAction).toBeNull();
         });
 
         it('falls back to informational message when proposal is not an exact ADD mutation', () => {
@@ -70,25 +220,67 @@ describe('turn-advisory service', () => {
                 },
             };
 
-            convertCartOperatorToAdvisoryCta(message);
+            const result = convertCartOperatorToAdvisoryCta(message);
 
-            expect(message.intent).toBe('info');
-            expect(message.content).toBe('No voy a mover tu carrito automaticamente. Dime el producto exacto o abre la ficha para confirmarlo.');
+            expect(result.intent).toBe('info');
+            expect(result.content).toBe('No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.');
+        });
+
+        it('general fallback neutralizes any pre-existing ADD_TO_CART action in next_step_view', () => {
+            const messageWithStaleAction: ConciergeAssistantMessage = {
+                id: 'stale-cta',
+                role: 'assistant',
+                content: 'Previous action proposal',
+                timestamp: new Date(),
+                capsule_contract: {
+                    match_strategy: 'EXPLORE',
+                    mutation_proposal: {
+                        type: 'REMOVE',
+                    },
+                    next_step_view: {
+                        family: 'ADD_READY',
+                        surfaceKind: 'ACTIONABLE',
+                        primaryAction: {
+                            kind: 'ADD_TO_CART',
+                            label: 'Agregar',
+                            product: { id: 'old-1', name: 'Old', slug: 'old', section: 'vape' },
+                            quantity: 1,
+                        },
+                    },
+                },
+            };
+
+            const result = convertCartOperatorToAdvisoryCta(messageWithStaleAction);
+
+            expect(result.intent).toBe('info');
+            expect(result.capsule_contract?.next_step_view?.surfaceKind).toBe('INFORMATIONAL');
+            expect(result.capsule_contract?.next_step_view?.primaryAction).toBeNull();
         });
     });
 
     describe('isCurrentTurnClearlyNonSearch', () => {
-        it('identifies shipping and tracking questions as clearly non-search', () => {
-            expect(isCurrentTurnClearlyNonSearch('¿Cual es el estatus de mi envio?')).toBe(true);
+        it('identifies shipping, warranty, and tracking questions as clearly non-search with accents and diacritics', () => {
+            expect(isCurrentTurnClearlyNonSearch('¿Cuál es el estatus de mi envío?')).toBe(true);
             expect(isCurrentTurnClearlyNonSearch('rastreo de mi pedido por favor')).toBe(true);
             expect(isCurrentTurnClearlyNonSearch('necesito mi factura')).toBe(true);
-            expect(isCurrentTurnClearlyNonSearch('politica de garantia')).toBe(true);
+            expect(isCurrentTurnClearlyNonSearch('política de garantía y devolución')).toBe(true);
+        });
+
+        it('correctly handles word boundaries without substring false negatives ("podrías", "podemos")', () => {
+            expect(isCurrentTurnClearlyNonSearch('¿Podrías rastrear mi pedido?')).toBe(true);
+            expect(isCurrentTurnClearlyNonSearch('¿Puedo cancelar? No podemos esperar el envío')).toBe(true);
         });
 
         it('does not classify queries mentioning search/product keywords as non-search', () => {
             expect(isCurrentTurnClearlyNonSearch('busco un vape')).toBe(false);
             expect(isCurrentTurnClearlyNonSearch('quiero ver opciones de pod')).toBe(false);
-            expect(isCurrentTurnClearlyNonSearch('recomiendame un liquido')).toBe(false);
+            expect(isCurrentTurnClearlyNonSearch('recomiéndame un líquido')).toBe(false);
+            expect(isCurrentTurnClearlyNonSearch('busco un kit de inicio')).toBe(false);
+        });
+
+        it('safely handles empty strings and huge inputs', () => {
+            expect(isCurrentTurnClearlyNonSearch('')).toBe(false);
+            expect(isCurrentTurnClearlyNonSearch('a'.repeat(5000))).toBe(false);
         });
     });
 
@@ -109,25 +301,27 @@ describe('turn-advisory service', () => {
     });
 
     describe('uniqueStringList', () => {
-        it('deduplicates and removes empty or whitespace-only strings', () => {
-            expect(uniqueStringList(['a', 'b', 'a', '', '   ', 'c'])).toEqual(['a', 'b', 'c']);
+        it('deduplicates and normalizes strings with leading/trailing whitespace', () => {
+            expect(uniqueStringList(['a', ' a', 'a ', '', '   ', 'b'])).toEqual(['a', 'b']);
         });
     });
 
     describe('computeUpdatedConciergePreferences', () => {
-        it('updates preferences with visual theme hint and limits interests to 5', () => {
+        it('updates preferences with visual theme hint and accepts deterministic now timestamp', () => {
             const currentPrefs = {
                 interests: ['pod', 'salt', 'liquid', 'kit', 'mesh'],
             };
             const currentContext = {
                 last_intent: 'info',
             };
+            const fixedTime = new Date('2026-10-11T12:00:00.000Z');
 
             const result = computeUpdatedConciergePreferences(
                 currentPrefs,
                 currentContext,
                 'me interesa un vape recargable',
-                'recommendation'
+                'recommendation',
+                fixedTime
             );
 
             expect(result.newPrefs.visual_theme_hint).toBe('vape');
@@ -135,6 +329,7 @@ describe('turn-advisory service', () => {
             expect(result.newPrefs.interests[4]).toBe('me interesa un vape recargable');
             expect(result.newIAContext.last_intent).toBe('recommendation');
             expect(result.newIAContext.last_query).toBe('me interesa un vape recargable');
+            expect(result.newIAContext.last_update).toBe('2026-10-11T12:00:00.000Z');
         });
     });
 });
diff --git a/src/services/concierge/capsule-dispatcher.ts b/src/services/concierge/capsule-dispatcher.ts
index fcbffffd..5c0de464 100644
--- a/src/services/concierge/capsule-dispatcher.ts
+++ b/src/services/concierge/capsule-dispatcher.ts
@@ -1,45 +1,38 @@
-import type { CustomerProfile } from '@/types/customer';
 import { isCustomerIntelligenceNoWriteSmokeActive } from '@/lib/customer-intelligence-no-write-smoke';
-import { capsuleHandlers } from './handlers';
+import { capsuleHandlers, isCapsuleName } from './handlers';
 import type {
-    ConciergeCatalogGate,
-    ConciergeMessage,
-    ConciergeSourceContext,
-    ConciergeTurnAnalysis,
-} from './types';
-import type { Product } from '@/types/product';
-import type { InternalResolvedProduct } from '@/types/ai-capsule';
+    DispatchClientCapsuleParams,
+    ClientCapsuleDispatchResult,
+} from './dispatch.types';
 
-export interface DispatchClientCapsuleParams {
-    data: Record<string, any>;
-    query: string;
-    history: { role: 'user' | 'assistant'; content: string }[];
-    customerProfile?: CustomerProfile;
-    catalogGate: ConciergeCatalogGate;
-    turnAnalysis: ConciergeTurnAnalysis;
-    sourceContext?: ConciergeSourceContext;
-    invokeStart: number;
-    effectiveTelemetrySessionId: string | null;
-}
+export type {
+    DispatchClientCapsuleParams,
+    ClientCapsuleDispatchResult,
+    CapsuleName,
+} from './dispatch.types';
 
-export interface ClientCapsuleDispatchResult {
-    message: string;
-    suggestedProducts?: (Product | InternalResolvedProduct)[];
-    intent?: ConciergeMessage['intent'];
-    turn_analysis?: ConciergeTurnAnalysis;
-    catalog_gate?: ConciergeCatalogGate;
-    source_context?: ConciergeSourceContext;
-    action?: ConciergeMessage['action'];
-    capsule_contract?: Record<string, any>;
-}
+export async function dispatchClientCapsule(
+    params: DispatchClientCapsuleParams
+): Promise<ClientCapsuleDispatchResult | null> {
+    try {
+        const capsuleName = params.data?.capsule_name;
 
-export async function dispatchClientCapsule(params: DispatchClientCapsuleParams): Promise<ClientCapsuleDispatchResult | null> {
-    const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive(params.data.no_write_smoke);
-    const handler = capsuleHandlers[params.data.capsule_name];
+        if (!isCapsuleName(capsuleName)) {
+            return null;
+        }
 
-    if (handler) {
-        return handler(params, noWriteSmokeActive);
-    }
+        const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive(params.data?.no_write_smoke);
+        const handler = capsuleHandlers[capsuleName];
 
-    return null;
+        return await handler(params, noWriteSmokeActive);
+    } catch (error) {
+        console.error('[CapsuleDispatcher] Handler or dispatch failure:', error);
+        return {
+            message: 'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.',
+            intent: 'info',
+            turn_analysis: params.turnAnalysis,
+            catalog_gate: params.catalogGate,
+            source_context: params.sourceContext,
+        };
+    }
 }
diff --git a/src/services/concierge/dispatch.types.ts b/src/services/concierge/dispatch.types.ts
new file mode 100644
index 00000000..c5896bc6
--- /dev/null
+++ b/src/services/concierge/dispatch.types.ts
@@ -0,0 +1,53 @@
+import type { CustomerProfile } from '@/types/customer';
+import type { Product } from '@/types/product';
+import type { InternalResolvedProduct } from '@/types/ai-capsule';
+import type {
+    ConciergeCatalogGate,
+    ConciergeMessage,
+    ConciergeSourceContext,
+    ConciergeTurnAnalysis,
+} from './types';
+
+export interface DispatchClientCapsuleParams {
+    data: Record<string, any>;
+    query: string;
+    history: { role: 'user' | 'assistant'; content: string }[];
+    customerProfile?: CustomerProfile;
+    catalogGate: ConciergeCatalogGate;
+    turnAnalysis: ConciergeTurnAnalysis;
+    sourceContext?: ConciergeSourceContext;
+    invokeStart: number;
+    effectiveTelemetrySessionId: string | null;
+}
+
+export interface ClientCapsuleDispatchResult {
+    message: string;
+    suggestedProducts?: (Product | InternalResolvedProduct)[];
+    intent?: ConciergeMessage['intent'];
+    turn_analysis?: ConciergeTurnAnalysis;
+    catalog_gate?: ConciergeCatalogGate;
+    source_context?: ConciergeSourceContext;
+    action?: ConciergeMessage['action'];
+    capsule_contract?: Record<string, any>;
+}
+
+export type CapsuleHandlerFn = (
+    params: DispatchClientCapsuleParams,
+    noWriteSmokeActive: boolean
+) => Promise<ClientCapsuleDispatchResult | null>;
+
+export const CAPSULE_NAMES = Object.freeze([
+    'product_search_integrity',
+    'storefront_kitting_basket',
+    'storefront_budget_rescue',
+    'storefront_compatibility_check',
+    'knowledge_rag_foundation',
+    'storefront_inventory_outlook',
+    'authenticated_order_tracking',
+    'authenticated_warranty_triage',
+    'authenticated_loyalty_status',
+    'storefront_checkout_readiness',
+    'cart_operator',
+] as const);
+
+export type CapsuleName = (typeof CAPSULE_NAMES)[number];
diff --git a/src/services/concierge/handlers/authenticated-loyalty-status.handler.ts b/src/services/concierge/handlers/authenticated-loyalty-status.handler.ts
index a74166a8..715ff18d 100644
--- a/src/services/concierge/handlers/authenticated-loyalty-status.handler.ts
+++ b/src/services/concierge/handlers/authenticated-loyalty-status.handler.ts
@@ -1,17 +1,27 @@
-﻿import { executeAuthenticatedLoyaltyStatusCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeAuthenticatedLoyaltyStatusCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { logAITelemetry } from '../telemetry';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleAuthenticatedLoyaltyStatus = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query;  const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeAuthenticatedLoyaltyStatusCapsule(data.tool_args, {
         customerId: customerProfile?.id ?? null,
     });
+    const signalKind = capsuleContract.loyalty_status_signal?.kind;
     const prefixedLoyaltyMessage = mergeConversationalPrefix(
         capsuleContract.customer_response_draft ?? '',
         getEffectiveConversationalPrefix({
@@ -22,45 +32,48 @@ export const handleAuthenticatedLoyaltyStatus = async (
         }),
         3,
     );
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'info',
-        routed_capsule: 'authenticated_loyalty_status',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: false,
-        product_card_count: 0,
-        zero_results: capsuleContract.loyalty_status_signal.kind === 'AUTH_REQUIRED'
-            || capsuleContract.loyalty_status_signal.kind === 'NO_LOYALTY_DATA',
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: turnAnalysis.primary_intent,
-        turn_secondary_intents: turnAnalysis.secondary_intents,
-        turn_priority: turnAnalysis.turn_priority,
-        current_turn_decision: turnAnalysis.current_turn_decision,
-        turn_focus: turnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: null,
-        assist_action_present: false,
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'info',
+            routed_capsule: 'authenticated_loyalty_status',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: false,
+            product_card_count: 0,
+            zero_results: signalKind === 'AUTH_REQUIRED' || signalKind === 'NO_LOYALTY_DATA',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: turnAnalysis.primary_intent,
+            turn_secondary_intents: turnAnalysis.secondary_intents,
+            turn_priority: turnAnalysis.turn_priority,
+            current_turn_decision: turnAnalysis.current_turn_decision,
+            turn_focus: turnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: null,
+            assist_action_present: false,
+            source_context_present: Boolean(sourceContext),
+        }).catch((err) => console.error('[Telemetry] Failed to log loyalty status:', err));
+    }
+
     (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
+
     return {
-        message: prefixedLoyaltyMessage || capsuleContract.customer_response_draft,
+        message: prefixedLoyaltyMessage,
         intent: 'info',
         turn_analysis: turnAnalysis,
         catalog_gate: catalogGate,
@@ -68,5 +81,3 @@ export const handleAuthenticatedLoyaltyStatus = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/authenticated-order-tracking.handler.ts b/src/services/concierge/handlers/authenticated-order-tracking.handler.ts
index 2597e7f8..f961131c 100644
--- a/src/services/concierge/handlers/authenticated-order-tracking.handler.ts
+++ b/src/services/concierge/handlers/authenticated-order-tracking.handler.ts
@@ -1,15 +1,24 @@
-﻿import { executeAuthenticatedOrderTrackingCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeAuthenticatedOrderTrackingCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { deriveOrderTrackingBridgeAction } from '../helpers';
 import { logAITelemetry } from '../telemetry';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleAuthenticatedOrderTracking = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query;  const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeAuthenticatedOrderTrackingCapsule(data.tool_args, {
         customerId: customerProfile?.id ?? null,
     });
@@ -24,44 +33,49 @@ export const handleAuthenticatedOrderTracking = async (
         }),
         3,
     );
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'support',
-        routed_capsule: 'authenticated_order_tracking',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: false,
-        product_card_count: 0,
-        zero_results: capsuleContract.order_tracking_signal.kind !== 'FOUND',
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: turnAnalysis.primary_intent,
-        turn_secondary_intents: turnAnalysis.secondary_intents,
-        turn_priority: turnAnalysis.turn_priority,
-        current_turn_decision: turnAnalysis.current_turn_decision,
-        turn_focus: turnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: null,
-        assist_action_present: Boolean(action),
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'support',
+            routed_capsule: 'authenticated_order_tracking',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: false,
+            product_card_count: 0,
+            zero_results: capsuleContract.order_tracking_signal?.kind !== 'FOUND',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: turnAnalysis.primary_intent,
+            turn_secondary_intents: turnAnalysis.secondary_intents,
+            turn_priority: turnAnalysis.turn_priority,
+            current_turn_decision: turnAnalysis.current_turn_decision,
+            turn_focus: turnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: null,
+            assist_action_present: Boolean(action),
+            source_context_present: Boolean(sourceContext),
+            retrieval_source: capsuleContract.retrieval_source ?? null,
+        }).catch((err) => console.error('[Telemetry] Failed to log order tracking:', err));
+    }
+
     (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
+
     return {
-        message: prefixedTrackingMessage || capsuleContract.customer_response_draft,
+        message: prefixedTrackingMessage || capsuleContract.customer_response_draft || '',
         intent: 'support',
         turn_analysis: turnAnalysis,
         catalog_gate: catalogGate,
@@ -70,5 +84,3 @@ export const handleAuthenticatedOrderTracking = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/authenticated-warranty-triage.handler.ts b/src/services/concierge/handlers/authenticated-warranty-triage.handler.ts
index c345e458..0daf7f60 100644
--- a/src/services/concierge/handlers/authenticated-warranty-triage.handler.ts
+++ b/src/services/concierge/handlers/authenticated-warranty-triage.handler.ts
@@ -1,17 +1,27 @@
-﻿import { executeAuthenticatedWarrantyTriageCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeAuthenticatedWarrantyTriageCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { logAITelemetry } from '../telemetry';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleAuthenticatedWarrantyTriage = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query;  const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeAuthenticatedWarrantyTriageCapsule(data.tool_args, {
         customerId: customerProfile?.id ?? null,
     });
+    const signalKind = capsuleContract.warranty_triage_signal?.kind;
     const prefixedWarrantyMessage = mergeConversationalPrefix(
         capsuleContract.customer_response_draft ?? '',
         getEffectiveConversationalPrefix({
@@ -22,45 +32,48 @@ export const handleAuthenticatedWarrantyTriage = async (
         }),
         3,
     );
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'support',
-        routed_capsule: 'authenticated_warranty_triage',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: false,
-        product_card_count: 0,
-        zero_results: capsuleContract.warranty_triage_signal.kind === 'NO_RELEVANT_ORDER'
-            || capsuleContract.warranty_triage_signal.kind === 'AUTH_REQUIRED',
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: turnAnalysis.primary_intent,
-        turn_secondary_intents: turnAnalysis.secondary_intents,
-        turn_priority: turnAnalysis.turn_priority,
-        current_turn_decision: turnAnalysis.current_turn_decision,
-        turn_focus: turnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: null,
-        assist_action_present: false,
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'support',
+            routed_capsule: 'authenticated_warranty_triage',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: false,
+            product_card_count: 0,
+            zero_results: signalKind === 'NO_RELEVANT_ORDER' || signalKind === 'AUTH_REQUIRED',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: turnAnalysis.primary_intent,
+            turn_secondary_intents: turnAnalysis.secondary_intents,
+            turn_priority: turnAnalysis.turn_priority,
+            current_turn_decision: turnAnalysis.current_turn_decision,
+            turn_focus: turnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: null,
+            assist_action_present: false,
+            source_context_present: Boolean(sourceContext),
+        }).catch((err) => console.error('[Telemetry] Failed to log warranty triage:', err));
+    }
+
     (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
+
     return {
-        message: prefixedWarrantyMessage || capsuleContract.customer_response_draft,
+        message: prefixedWarrantyMessage,
         intent: 'support',
         turn_analysis: turnAnalysis,
         catalog_gate: catalogGate,
@@ -68,5 +81,3 @@ export const handleAuthenticatedWarrantyTriage = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/cart-operator.handler.ts b/src/services/concierge/handlers/cart-operator.handler.ts
index 2c4d2abe..1b4c160d 100644
--- a/src/services/concierge/handlers/cart-operator.handler.ts
+++ b/src/services/concierge/handlers/cart-operator.handler.ts
@@ -1,68 +1,79 @@
-﻿import { executeCartOperatorCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeCartOperatorCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { logAITelemetry } from '../telemetry';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleCartOperator = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query;  const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeCartOperatorCapsule(data.tool_args);
     const prefixedCartMessage = mergeConversationalPrefix(
-        'Actualizando tu carrito...',
+        'Preparando sugerencia para tu carrito...',
         getEffectiveConversationalPrefix({
-            message: 'Actualizando tu carrito...',
+            message: 'Preparando sugerencia para tu carrito...',
             prefix: data.conversational_prefix,
             turnAnalysis,
             sourceContext,
         }),
         2,
     );
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: null,
-        detected_intent: 'cart_operation',
-        routed_capsule: 'cart_operator',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: false,
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: false,
-        product_card_count: 0,
-        zero_results: false,
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: turnAnalysis.primary_intent,
-        turn_secondary_intents: turnAnalysis.secondary_intents,
-        turn_priority: turnAnalysis.turn_priority,
-        current_turn_decision: turnAnalysis.current_turn_decision,
-        turn_focus: turnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: null,
-        assist_action_present: false,
-        source_context_present: Boolean(sourceContext),
-    });
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: null,
+            detected_intent: 'cart_operation',
+            routed_capsule: 'cart_operator',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: false,
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: false,
+            product_card_count: 0,
+            zero_results: false,
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: turnAnalysis.primary_intent,
+            turn_secondary_intents: turnAnalysis.secondary_intents,
+            turn_priority: turnAnalysis.turn_priority,
+            current_turn_decision: turnAnalysis.current_turn_decision,
+            turn_focus: turnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: null,
+            assist_action_present: false,
+            source_context_present: Boolean(sourceContext),
+        }).catch((err) => console.error('[Telemetry] Failed to log cart operator:', err));
+    }
+
     (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
+
     return {
-        // The UI renderer will intercept this message using ui_render_mode later
         message: prefixedCartMessage,
-        intent: 'search', 
+        intent: 'search',
         turn_analysis: turnAnalysis,
         catalog_gate: catalogGate,
         source_context: sourceContext,
-        capsule_contract: capsuleContract
+        capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/index.ts b/src/services/concierge/handlers/index.ts
index 2fcb3b63..f8c1c809 100644
--- a/src/services/concierge/handlers/index.ts
+++ b/src/services/concierge/handlers/index.ts
@@ -1,4 +1,8 @@
-﻿import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import {
+    CAPSULE_NAMES,
+    type CapsuleHandlerFn,
+    type CapsuleName,
+} from '../dispatch.types';
 import { handleProductSearchIntegrity } from './product-search-integrity.handler';
 import { handleStorefrontKittingBasket } from './storefront-kitting-basket.handler';
 import { handleStorefrontBudgetRescue } from './storefront-budget-rescue.handler';
@@ -11,21 +15,26 @@ import { handleAuthenticatedLoyaltyStatus } from './authenticated-loyalty-status
 import { handleStorefrontCheckoutReadiness } from './storefront-checkout-readiness.handler';
 import { handleCartOperator } from './cart-operator.handler';
 
+export const capsuleHandlers = Object.freeze({
+    product_search_integrity: handleProductSearchIntegrity,
+    storefront_kitting_basket: handleStorefrontKittingBasket,
+    storefront_budget_rescue: handleStorefrontBudgetRescue,
+    storefront_compatibility_check: handleStorefrontCompatibilityCheck,
+    knowledge_rag_foundation: handleKnowledgeRagFoundation,
+    storefront_inventory_outlook: handleStorefrontInventoryOutlook,
+    authenticated_order_tracking: handleAuthenticatedOrderTracking,
+    authenticated_warranty_triage: handleAuthenticatedWarrantyTriage,
+    authenticated_loyalty_status: handleAuthenticatedLoyaltyStatus,
+    storefront_checkout_readiness: handleStorefrontCheckoutReadiness,
+    cart_operator: handleCartOperator,
+} satisfies Record<CapsuleName, CapsuleHandlerFn>);
 
-export type CapsuleHandlerFn = (params: DispatchClientCapsuleParams, noWriteSmokeActive: boolean) => Promise<ClientCapsuleDispatchResult | null>;
-
-export const capsuleHandlers: Record<string, CapsuleHandlerFn> = {
-    'product_search_integrity': handleProductSearchIntegrity,
-    'storefront_kitting_basket': handleStorefrontKittingBasket,
-    'storefront_budget_rescue': handleStorefrontBudgetRescue,
-    'storefront_compatibility_check': handleStorefrontCompatibilityCheck,
-    'knowledge_rag_foundation': handleKnowledgeRagFoundation,
-    'storefront_inventory_outlook': handleStorefrontInventoryOutlook,
-    'authenticated_order_tracking': handleAuthenticatedOrderTracking,
-    'authenticated_warranty_triage': handleAuthenticatedWarrantyTriage,
-    'authenticated_loyalty_status': handleAuthenticatedLoyaltyStatus,
-    'storefront_checkout_readiness': handleStorefrontCheckoutReadiness,
-    'cart_operator': handleCartOperator,
-};
-
+export function isCapsuleName(name: unknown): name is CapsuleName {
+    return (
+        typeof name === 'string'
+        && Object.prototype.hasOwnProperty.call(capsuleHandlers, name)
+        && (CAPSULE_NAMES as readonly string[]).includes(name)
+    );
+}
 
+export type { CapsuleHandlerFn };
diff --git a/src/services/concierge/handlers/knowledge-rag-foundation.handler.ts b/src/services/concierge/handlers/knowledge-rag-foundation.handler.ts
index 828a9bb2..981e656d 100644
--- a/src/services/concierge/handlers/knowledge-rag-foundation.handler.ts
+++ b/src/services/concierge/handlers/knowledge-rag-foundation.handler.ts
@@ -1,71 +1,83 @@
-﻿import { executeKnowledgeCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeKnowledgeCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { logAITelemetry } from '../telemetry';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleKnowledgeRagFoundation = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query;  const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeKnowledgeCapsule(data.tool_args);
-        const prefixedKnowledgeMessage = mergeConversationalPrefix(
-        capsuleContract.ui_render_hint ?? '',
+    const knowledgeText = capsuleContract.ui_render_hint ?? '';
+    const prefixedKnowledgeMessage = mergeConversationalPrefix(
+        knowledgeText,
         getEffectiveConversationalPrefix({
-            message: capsuleContract.ui_render_hint ?? '',
+            message: knowledgeText,
             prefix: data.conversational_prefix,
             turnAnalysis,
             sourceContext,
         }),
         3,
     );
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.ui_render_hint ?? null,
-        detected_intent: 'info',
-        routed_capsule: 'knowledge_rag_foundation',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.match_strategy === 'LOW_CONFIDENCE_FALLBACK' || capsuleContract.match_strategy === 'NO_MATCH',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: false,
-        product_card_count: 0,
-        zero_results: false,
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: turnAnalysis.primary_intent,
-        turn_secondary_intents: turnAnalysis.secondary_intents,
-        turn_priority: turnAnalysis.turn_priority,
-        current_turn_decision: turnAnalysis.current_turn_decision,
-        turn_focus: turnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: null,
-        assist_action_present: false,
-        source_context_present: Boolean(sourceContext),
-    });
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.ui_render_hint ?? null,
+            detected_intent: 'info',
+            routed_capsule: 'knowledge_rag_foundation',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.match_strategy === 'LOW_CONFIDENCE_FALLBACK' || capsuleContract.match_strategy === 'NO_MATCH',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: false,
+            product_card_count: 0,
+            zero_results: capsuleContract.match_strategy === 'NO_MATCH',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: turnAnalysis.primary_intent,
+            turn_secondary_intents: turnAnalysis.secondary_intents,
+            turn_priority: turnAnalysis.turn_priority,
+            current_turn_decision: turnAnalysis.current_turn_decision,
+            turn_focus: turnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: null,
+            assist_action_present: false,
+            source_context_present: Boolean(sourceContext),
+        }).catch((err) => console.error('[Telemetry] Failed to log knowledge RAG:', err));
+    }
+
     (capsuleContract as Record<string, any>).turn_analysis = turnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
     if (noWriteSmokeActive) {
         (capsuleContract as Record<string, any>).no_write_smoke = data.no_write_smoke;
     }
+
     return {
-        message: prefixedKnowledgeMessage || capsuleContract.ui_render_hint,
-        intent: 'info', 
+        message: prefixedKnowledgeMessage,
+        intent: 'info',
         turn_analysis: turnAnalysis,
         catalog_gate: catalogGate,
         source_context: sourceContext,
-        capsule_contract: capsuleContract
+        capsule_contract: capsuleContract,
     };
 };
-
-
-
diff --git a/src/services/concierge/handlers/product-search-integrity.handler.ts b/src/services/concierge/handlers/product-search-integrity.handler.ts
index 0a8523cd..5b189bb6 100644
--- a/src/services/concierge/handlers/product-search-integrity.handler.ts
+++ b/src/services/concierge/handlers/product-search-integrity.handler.ts
@@ -1,4 +1,4 @@
-﻿import { executeProductSearchCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeProductSearchCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { buildCesarinHumanizedSearchMessage } from '@/lib/cesarin-stage1';
 import { rerankCesarinSuggestedProducts } from '@/lib/cesarin-stage3';
 import { buildCesarinAdaptiveConversationView } from '@/lib/cesarin-stage4';
@@ -11,13 +11,23 @@ import type { Product } from '@/types/product';
 import { extractTelemetryNextStepTruth, isSearchLeadingIntent, resolveGroundedProductSearchMessage } from '../helpers';
 import { logAITelemetry } from '../telemetry';
 import type { ConciergeProductSearchMemoryContext, ConciergeTurnAnalysis } from '../types';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleProductSearchIntegrity = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query; const history = params.history; const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
+    const {
+        data,
+        query,
+        history,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
     
     const capsuleContract = await executeProductSearchCapsule(data.tool_args, {
         customerId: customerProfile?.id ?? null,
@@ -149,7 +159,7 @@ export const handleProductSearchIntegrity = async (
         assist_action_present: telemetryNextStep.assist_action_present,
         source_context_present: Boolean(sourceContext),
         retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+    }).catch((err) => console.error('[Telemetry] Failed to log product search:', err));
 
     const effectiveProductSearchPrefix = getEffectiveConversationalPrefix({
         message: productSearchMessageSeed,
diff --git a/src/services/concierge/handlers/storefront-budget-rescue.handler.ts b/src/services/concierge/handlers/storefront-budget-rescue.handler.ts
index 1b6a3933..170bd341 100644
--- a/src/services/concierge/handlers/storefront-budget-rescue.handler.ts
+++ b/src/services/concierge/handlers/storefront-budget-rescue.handler.ts
@@ -1,18 +1,28 @@
-﻿import { executeStorefrontBudgetRescueCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeStorefrontBudgetRescueCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
 import { compactCesarinCopy, getEffectiveConversationalPrefix, isMeaningfullyDistinct, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { getProductsByIds } from '@/services/products.service';
 import { extractTelemetryNextStepTruth } from '../helpers';
 import { logAITelemetry } from '../telemetry';
 import type { ConciergeTurnAnalysis } from '../types';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleStorefrontBudgetRescue = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query; const history = params.history; const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        history,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeStorefrontBudgetRescueCapsule(data.tool_args);
     const cheaperProducts = capsuleContract.resolved_products?.length
         ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
@@ -40,9 +50,7 @@ export const handleStorefrontBudgetRescue = async (
         history,
         preferenceSummary: null,
         matchStrategy: null,
-        adaptiveMode: capsuleContract.match_strategy === 'NO_GOOD_TRADE_DOWN'
-            ? 'EXPLORE_LIGHT'
-            : 'SOFT_REASSURE',
+        adaptiveMode: visibleProducts.length >= 2 ? 'GUIDED_COMPARE' : 'SOFT_REASSURE',
         visibleProducts,
         enrichedProductsById: Object.fromEntries(cheaperProducts.map((product) => [product.id, product])),
         baseMessage: capsuleContract.customer_response_draft ?? '',
@@ -71,46 +79,51 @@ export const handleStorefrontBudgetRescue = async (
             guidance: renderableNextStepGuidance,
         }
         : undefined;
+
     (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
     (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
     (capsuleContract as Record<string, any>).turn_analysis = budgetTurnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
 
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'recommendation',
-        routed_capsule: 'storefront_budget_rescue',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: visibleProducts.length > 0,
-        product_card_count: visibleProducts.length,
-        zero_results: capsuleContract.match_strategy === 'NO_GOOD_TRADE_DOWN',
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: budgetTurnAnalysis.primary_intent,
-        turn_secondary_intents: budgetTurnAnalysis.secondary_intents,
-        turn_priority: budgetTurnAnalysis.turn_priority,
-        current_turn_decision: budgetTurnAnalysis.current_turn_decision,
-        turn_focus: budgetTurnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
-        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+    const nextStepTruth = extractTelemetryNextStepTruth(compactNextStepView);
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'recommendation',
+            routed_capsule: 'storefront_budget_rescue',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: visibleProducts.length > 0,
+            product_card_count: visibleProducts.length,
+            zero_results: capsuleContract.match_strategy === 'NO_GOOD_TRADE_DOWN',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: budgetTurnAnalysis.primary_intent,
+            turn_secondary_intents: budgetTurnAnalysis.secondary_intents,
+            turn_priority: budgetTurnAnalysis.turn_priority,
+            current_turn_decision: budgetTurnAnalysis.current_turn_decision,
+            turn_focus: budgetTurnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: nextStepTruth.next_step_family,
+            assist_action_present: nextStepTruth.assist_action_present,
+            source_context_present: Boolean(sourceContext),
+            retrieval_source: capsuleContract.retrieval_source ?? null,
+        }).catch((err) => console.error('[Telemetry] Failed to log budget rescue:', err));
+    }
 
     const finalMessage = mergeConversationalPrefix(
         adaptiveConversation.message || capsuleContract.customer_response_draft,
@@ -133,5 +146,3 @@ export const handleStorefrontBudgetRescue = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/storefront-checkout-readiness.handler.ts b/src/services/concierge/handlers/storefront-checkout-readiness.handler.ts
index 6d06797f..e115dd7f 100644
--- a/src/services/concierge/handlers/storefront-checkout-readiness.handler.ts
+++ b/src/services/concierge/handlers/storefront-checkout-readiness.handler.ts
@@ -1,26 +1,38 @@
-﻿import { executeStorefrontCheckoutReadinessCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeStorefrontCheckoutReadinessCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { getEffectiveConversationalPrefix, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { deriveCheckoutBridgeAction } from '../helpers';
 import { logAITelemetry } from '../telemetry';
 import type { ConciergeTurnAnalysis } from '../types';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleStorefrontCheckoutReadiness = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query;  const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeStorefrontCheckoutReadinessCapsule(data.tool_args, {
         customerId: customerProfile?.id ?? null,
     });
+    const signalKind = capsuleContract.checkout_readiness_signal?.kind;
     const action = deriveCheckoutBridgeAction(capsuleContract.checkout_readiness_signal);
+
     const checkoutTurnAnalysis: ConciergeTurnAnalysis = {
         ...turnAnalysis,
         primary_intent: 'CHECKOUT_READINESS',
         turn_focus: 'checkout',
         current_turn_decision: 'USE_CAPABILITY',
     };
+
     const prefixedCheckoutMessage = mergeConversationalPrefix(
         capsuleContract.customer_response_draft ?? '',
         getEffectiveConversationalPrefix({
@@ -31,46 +43,51 @@ export const handleStorefrontCheckoutReadiness = async (
         }),
         3,
     );
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'support',
-        routed_capsule: 'storefront_checkout_readiness',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: false,
-        product_card_count: 0,
-        zero_results: capsuleContract.checkout_readiness_signal.kind !== 'READY_TO_CHECKOUT'
-            && capsuleContract.checkout_readiness_signal.kind !== 'PAYMENT_METHOD_INFO'
-            && capsuleContract.checkout_readiness_signal.kind !== 'SHIPPING_INFO_AVAILABLE',
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: checkoutTurnAnalysis.primary_intent,
-        turn_secondary_intents: checkoutTurnAnalysis.secondary_intents,
-        turn_priority: checkoutTurnAnalysis.turn_priority,
-        current_turn_decision: checkoutTurnAnalysis.current_turn_decision,
-        turn_focus: checkoutTurnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: null,
-        assist_action_present: Boolean(action),
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'support',
+            routed_capsule: 'storefront_checkout_readiness',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: false,
+            product_card_count: 0,
+            zero_results: signalKind !== 'READY_TO_CHECKOUT'
+                && signalKind !== 'PAYMENT_METHOD_INFO'
+                && signalKind !== 'SHIPPING_INFO_AVAILABLE',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: checkoutTurnAnalysis.primary_intent,
+            turn_secondary_intents: checkoutTurnAnalysis.secondary_intents,
+            turn_priority: checkoutTurnAnalysis.turn_priority,
+            current_turn_decision: checkoutTurnAnalysis.current_turn_decision,
+            turn_focus: checkoutTurnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: null,
+            assist_action_present: Boolean(action),
+            source_context_present: Boolean(sourceContext),
+            retrieval_source: capsuleContract.retrieval_source ?? null,
+        }).catch((err) => console.error('[Telemetry] Failed to log checkout readiness:', err));
+    }
+
     (capsuleContract as Record<string, any>).turn_analysis = checkoutTurnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
+
     return {
-        message: prefixedCheckoutMessage || capsuleContract.customer_response_draft,
+        message: prefixedCheckoutMessage || capsuleContract.customer_response_draft || '',
         intent: 'support',
         turn_analysis: checkoutTurnAnalysis,
         catalog_gate: catalogGate,
@@ -79,5 +96,3 @@ export const handleStorefrontCheckoutReadiness = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/storefront-compatibility-check.handler.ts b/src/services/concierge/handlers/storefront-compatibility-check.handler.ts
index 6c0c2f37..e0ab9c7f 100644
--- a/src/services/concierge/handlers/storefront-compatibility-check.handler.ts
+++ b/src/services/concierge/handlers/storefront-compatibility-check.handler.ts
@@ -1,24 +1,36 @@
-﻿import { executeStorefrontCompatibilityCheckCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeStorefrontCompatibilityCheckCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
 import { compactCesarinCopy, getEffectiveConversationalPrefix, isMeaningfullyDistinct, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { getProductsByIds } from '@/services/products.service';
 import { extractTelemetryNextStepTruth } from '../helpers';
 import { logAITelemetry } from '../telemetry';
 import type { ConciergeTurnAnalysis } from '../types';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleStorefrontCompatibilityCheck = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query; const history = params.history; const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        history,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeStorefrontCompatibilityCheckCapsule(data.tool_args);
     const compatibilityProducts = capsuleContract.resolved_products?.length
         ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
             .catch(() => [])
         : [];
+
     const visibleProducts = compatibilityProducts;
+
     const commercialMove = capsuleContract.match_strategy === 'COMPATIBLE'
         ? visibleProducts.length >= 2
             ? 'COMPARE_TWO'
@@ -28,6 +40,7 @@ export const handleStorefrontCompatibilityCheck = async (
                 ? 'COMPARE_TWO'
                 : 'REVIEW_ONE'
             : 'KEEP_EXPLORING';
+
     const compatibilityTurnAnalysis: ConciergeTurnAnalysis = {
         ...turnAnalysis,
         commercial_move: commercialMove,
@@ -35,6 +48,7 @@ export const handleStorefrontCompatibilityCheck = async (
         turn_focus: 'compatibility',
         current_turn_decision: 'USE_CAPABILITY',
     };
+
     const adaptiveConversation = buildCesarinActionableNextStepView({
         query,
         history,
@@ -47,6 +61,7 @@ export const handleStorefrontCompatibilityCheck = async (
         turnAnalysis: compatibilityTurnAnalysis,
         commercialMove,
     });
+
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
         visibleProducts.length > 0 ? 2 : 3,
@@ -61,6 +76,7 @@ export const handleStorefrontCompatibilityCheck = async (
         || adaptiveConversation.nextStep.secondaryAction
         || adaptiveConversation.nextStep.assistAction,
     );
+
     const compactNextStepView = visibleProducts.length > 0
         && adaptiveConversation.nextStep.renderHint === 'SHOW'
         && (renderableNextStepGuidance || hasMaterialNextStepAction)
@@ -69,50 +85,54 @@ export const handleStorefrontCompatibilityCheck = async (
             guidance: renderableNextStepGuidance,
         }
         : undefined;
+
     (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
     (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
     (capsuleContract as Record<string, any>).turn_analysis = compatibilityTurnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
 
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'info',
-        routed_capsule: 'storefront_compatibility_check',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: visibleProducts.length > 0,
-        product_card_count: visibleProducts.length,
-        zero_results: capsuleContract.match_strategy === 'NO_GROUNDED_MATCH'
-            || capsuleContract.match_strategy === 'NEEDS_MORE_CONTEXT',
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: compatibilityTurnAnalysis.primary_intent,
-        turn_secondary_intents: compatibilityTurnAnalysis.secondary_intents,
-        turn_priority: compatibilityTurnAnalysis.turn_priority,
-        current_turn_decision: compatibilityTurnAnalysis.current_turn_decision,
-        turn_focus: compatibilityTurnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
-        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+    const nextStepTruth = extractTelemetryNextStepTruth(compactNextStepView);
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'info',
+            routed_capsule: 'storefront_compatibility_check',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: visibleProducts.length > 0,
+            product_card_count: visibleProducts.length,
+            zero_results: visibleProducts.length === 0,
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: compatibilityTurnAnalysis.primary_intent,
+            turn_secondary_intents: compatibilityTurnAnalysis.secondary_intents,
+            turn_priority: compatibilityTurnAnalysis.turn_priority,
+            current_turn_decision: compatibilityTurnAnalysis.current_turn_decision,
+            turn_focus: compatibilityTurnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: nextStepTruth.next_step_family,
+            assist_action_present: nextStepTruth.assist_action_present,
+            source_context_present: Boolean(sourceContext),
+            retrieval_source: capsuleContract.retrieval_source ?? null,
+        }).catch((err) => console.error('[Telemetry] Failed to log compatibility check:', err));
+    }
 
     const finalMessage = mergeConversationalPrefix(
-        adaptiveConversation.message || capsuleContract.customer_response_draft || '',
+        adaptiveConversation.message || capsuleContract.customer_response_draft,
         getEffectiveConversationalPrefix({
             message: adaptiveConversation.message || capsuleContract.customer_response_draft || '',
             prefix: data.conversational_prefix,
@@ -132,5 +152,3 @@ export const handleStorefrontCompatibilityCheck = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts b/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
index d465b78a..c06f38e8 100644
--- a/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
+++ b/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
@@ -1,27 +1,41 @@
-﻿import { executeStorefrontInventoryOutlookCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeStorefrontInventoryOutlookCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
 import { compactCesarinCopy, getEffectiveConversationalPrefix, isMeaningfullyDistinct, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { getProductsByIds } from '@/services/products.service';
 import { extractTelemetryNextStepTruth } from '../helpers';
 import { logAITelemetry } from '../telemetry';
 import type { ConciergeTurnAnalysis } from '../types';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleStorefrontInventoryOutlook = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query; const history = params.history; const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        history,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeStorefrontInventoryOutlookCapsule(data.tool_args);
     const inventoryProducts = capsuleContract.resolved_products?.length
         ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
             .catch(() => [])
         : [];
-    const visibleProducts = inventoryProducts;
-    const supportsReview = capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_ONLINE'
-        || capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_OMNICHANNEL';
+
+    const shouldShowCatalogSurfaces = catalogGate.is_open;
+    const visibleProducts = shouldShowCatalogSurfaces ? inventoryProducts : [];
+
+    const signalKind = capsuleContract.inventory_outlook_signal?.kind;
+    const supportsReview = signalKind === 'IN_STOCK_ONLINE' || signalKind === 'IN_STOCK_OMNICHANNEL';
     const commercialMove = supportsReview ? 'REVIEW_ONE' : 'KEEP_EXPLORING';
+
     const inventoryTurnAnalysis: ConciergeTurnAnalysis = {
         ...turnAnalysis,
         commercial_move: commercialMove,
@@ -29,6 +43,7 @@ export const handleStorefrontInventoryOutlook = async (
         turn_focus: 'inventory',
         current_turn_decision: 'USE_CAPABILITY',
     };
+
     const adaptiveConversation = buildCesarinActionableNextStepView({
         query,
         history,
@@ -36,7 +51,7 @@ export const handleStorefrontInventoryOutlook = async (
         matchStrategy: null,
         adaptiveMode: supportsReview
             ? 'SOFT_REASSURE'
-            : capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED'
+            : signalKind === 'RESTOCK_EXPECTED'
                 ? 'SOFT_REASSURE'
                 : 'EXPLORE_LIGHT',
         visibleProducts,
@@ -45,6 +60,7 @@ export const handleStorefrontInventoryOutlook = async (
         turnAnalysis: inventoryTurnAnalysis,
         commercialMove,
     });
+
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
         visibleProducts.length > 0 ? 2 : 3,
@@ -59,8 +75,11 @@ export const handleStorefrontInventoryOutlook = async (
         || adaptiveConversation.nextStep.secondaryAction
         || adaptiveConversation.nextStep.assistAction,
     );
-    const shouldShowNextStep = visibleProducts.length > 0
-        && (supportsReview || capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED');
+
+    const shouldShowNextStep = shouldShowCatalogSurfaces
+        && visibleProducts.length > 0
+        && (supportsReview || signalKind === 'RESTOCK_EXPECTED');
+
     const compactNextStepView = shouldShowNextStep
         && adaptiveConversation.nextStep.renderHint === 'SHOW'
         && (renderableNextStepGuidance || hasMaterialNextStepAction)
@@ -69,46 +88,51 @@ export const handleStorefrontInventoryOutlook = async (
             guidance: renderableNextStepGuidance,
         }
         : undefined;
+
     (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
-    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
     (capsuleContract as Record<string, any>).turn_analysis = inventoryTurnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
+    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
 
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'info',
-        routed_capsule: 'storefront_inventory_outlook',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.execution_status !== 'SUCCESS',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: visibleProducts.length > 0,
-        product_card_count: visibleProducts.length,
-        zero_results: capsuleContract.inventory_outlook_signal.kind === 'PRODUCT_NOT_FOUND',
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: inventoryTurnAnalysis.primary_intent,
-        turn_secondary_intents: inventoryTurnAnalysis.secondary_intents,
-        turn_priority: inventoryTurnAnalysis.turn_priority,
-        current_turn_decision: inventoryTurnAnalysis.current_turn_decision,
-        turn_focus: inventoryTurnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
-        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+    const nextStepTruth = extractTelemetryNextStepTruth(compactNextStepView);
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'info',
+            routed_capsule: 'storefront_inventory_outlook',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: shouldShowCatalogSurfaces && visibleProducts.length > 0,
+            product_card_count: shouldShowCatalogSurfaces ? visibleProducts.length : 0,
+            zero_results: visibleProducts.length === 0 || !shouldShowCatalogSurfaces || signalKind === 'PRODUCT_NOT_FOUND',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: inventoryTurnAnalysis.primary_intent,
+            turn_secondary_intents: inventoryTurnAnalysis.secondary_intents,
+            turn_priority: inventoryTurnAnalysis.turn_priority,
+            current_turn_decision: inventoryTurnAnalysis.current_turn_decision,
+            turn_focus: inventoryTurnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: nextStepTruth.next_step_family,
+            assist_action_present: nextStepTruth.assist_action_present,
+            source_context_present: Boolean(sourceContext),
+            retrieval_source: capsuleContract.retrieval_source ?? null,
+        }).catch((err) => console.error('[Telemetry] Failed to log inventory outlook:', err));
+    }
 
     const finalMessage = mergeConversationalPrefix(
         adaptiveConversation.message || capsuleContract.customer_response_draft,
@@ -131,5 +155,3 @@ export const handleStorefrontInventoryOutlook = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/storefront-kitting-basket.handler.ts b/src/services/concierge/handlers/storefront-kitting-basket.handler.ts
index ec185950..af396aad 100644
--- a/src/services/concierge/handlers/storefront-kitting-basket.handler.ts
+++ b/src/services/concierge/handlers/storefront-kitting-basket.handler.ts
@@ -1,18 +1,28 @@
-﻿import { executeStorefrontKittingBasketCapsule } from '@/services/ai-capsule-orchestrator.service';
+import { executeStorefrontKittingBasketCapsule } from '@/services/ai-capsule-orchestrator.service';
 import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
 import { compactCesarinCopy, getEffectiveConversationalPrefix, isMeaningfullyDistinct, mergeConversationalPrefix } from '@/lib/cesarin-text-utils';
 import { getProductsByIds } from '@/services/products.service';
 import { extractTelemetryNextStepTruth } from '../helpers';
 import { logAITelemetry } from '../telemetry';
 import type { ConciergeTurnAnalysis } from '../types';
-import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../dispatch.types';
 
 export const handleStorefrontKittingBasket = async (
     params: DispatchClientCapsuleParams,
     noWriteSmokeActive: boolean
 ): Promise<ClientCapsuleDispatchResult | null> => {
-    const data = params.data; const query = params.query; const history = params.history; const customerProfile = params.customerProfile; const catalogGate = params.catalogGate; const turnAnalysis = params.turnAnalysis; const sourceContext = params.sourceContext; const invokeStart = params.invokeStart; const effectiveTelemetrySessionId = params.effectiveTelemetrySessionId;
-    
+    const {
+        data,
+        query,
+        history,
+        customerProfile,
+        catalogGate,
+        turnAnalysis,
+        sourceContext,
+        invokeStart,
+        effectiveTelemetrySessionId,
+    } = params;
+
     const capsuleContract = await executeStorefrontKittingBasketCapsule(data.tool_args);
     const kitProducts = capsuleContract.resolved_products?.length
         ? await getProductsByIds(capsuleContract.resolved_products.map((product) => product.id))
@@ -50,7 +60,7 @@ export const handleStorefrontKittingBasket = async (
     });
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
-        2,
+        visibleProducts.length > 0 ? 2 : 3,
     );
     const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
     const renderableNextStepGuidance = compactNextStepGuidance
@@ -63,6 +73,7 @@ export const handleStorefrontKittingBasket = async (
         || adaptiveConversation.nextStep.assistAction,
     );
     const compactNextStepView = shouldShowCatalogSurfaces
+        && visibleProducts.length > 0
         && adaptiveConversation.nextStep.renderHint === 'SHOW'
         && (renderableNextStepGuidance || hasMaterialNextStepAction)
         ? {
@@ -70,46 +81,51 @@ export const handleStorefrontKittingBasket = async (
             guidance: renderableNextStepGuidance,
         }
         : undefined;
+
     (capsuleContract as Record<string, any>).resolved_products = visibleProducts;
-    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
     (capsuleContract as Record<string, any>).turn_analysis = kitTurnAnalysis;
     (capsuleContract as Record<string, any>).catalog_gate = catalogGate;
+    (capsuleContract as Record<string, any>).next_step_view = compactNextStepView;
 
-    if (!noWriteSmokeActive) void logAITelemetry({
-        session_id: effectiveTelemetrySessionId,
-        customer_id: customerProfile?.id ?? null,
-        query,
-        response_text: capsuleContract.customer_response_draft ?? null,
-        detected_intent: 'search',
-        routed_capsule: 'storefront_kitting_basket',
-        requires_client_capsule: true,
-        capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
-        fallback_used: capsuleContract.match_strategy !== 'FULL_KIT',
-        response_latency_ms: Date.now() - invokeStart,
-        has_product_cards: shouldShowCatalogSurfaces && visibleProducts.length > 0,
-        product_card_count: shouldShowCatalogSurfaces ? visibleProducts.length : 0,
-        zero_results: !shouldShowCatalogSurfaces || visibleProducts.length === 0,
-        error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
-        offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
-        analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
-        guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
-        injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
-        capsule_execution_status: capsuleContract.execution_status ?? null,
-        capsule_match_strategy: capsuleContract.match_strategy ?? null,
-        capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
-        routing_path: data.debug?.routing_path ?? null,
-        turn_primary_intent: kitTurnAnalysis.primary_intent,
-        turn_secondary_intents: kitTurnAnalysis.secondary_intents,
-        turn_priority: kitTurnAnalysis.turn_priority,
-        current_turn_decision: kitTurnAnalysis.current_turn_decision,
-        turn_focus: kitTurnAnalysis.turn_focus ?? null,
-        catalog_gate_open: catalogGate.is_open,
-        catalog_gate_reason: catalogGate.reason,
-        next_step_family: extractTelemetryNextStepTruth(compactNextStepView).next_step_family,
-        assist_action_present: extractTelemetryNextStepTruth(compactNextStepView).assist_action_present,
-        source_context_present: Boolean(sourceContext),
-        retrieval_source: capsuleContract.retrieval_source ?? null,
-    });
+    const nextStepTruth = extractTelemetryNextStepTruth(compactNextStepView);
+
+    if (!noWriteSmokeActive) {
+        void logAITelemetry({
+            session_id: effectiveTelemetrySessionId,
+            customer_id: customerProfile?.id ?? null,
+            query,
+            response_text: capsuleContract.customer_response_draft ?? null,
+            detected_intent: 'recommendation',
+            routed_capsule: 'storefront_kitting_basket',
+            requires_client_capsule: true,
+            capsule_match_success: capsuleContract.execution_status === 'SUCCESS',
+            fallback_used: capsuleContract.execution_status !== 'SUCCESS',
+            response_latency_ms: Date.now() - invokeStart,
+            has_product_cards: shouldShowCatalogSurfaces && visibleProducts.length > 0,
+            product_card_count: shouldShowCatalogSurfaces ? visibleProducts.length : 0,
+            zero_results: visibleProducts.length === 0 || !shouldShowCatalogSurfaces || capsuleContract.match_strategy === 'NO_GROUNDED_KIT',
+            error_type: capsuleContract.execution_status === 'FAILED' ? 'EDGE_ERROR' : null,
+            offered_products: visibleProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
+            analyst_intent: data.debug?.guardrail_telemetry?.analyst_intent ?? null,
+            guardrail_overrides: data.debug?.guardrail_telemetry?.guardrail_overrides ?? [],
+            injected_tools: data.debug?.guardrail_telemetry?.injected_tools ?? [],
+            capsule_execution_status: capsuleContract.execution_status ?? null,
+            capsule_match_strategy: capsuleContract.match_strategy ?? null,
+            capsule_retrieval_source: capsuleContract.retrieval_source ?? null,
+            routing_path: data.debug?.routing_path ?? null,
+            turn_primary_intent: kitTurnAnalysis.primary_intent,
+            turn_secondary_intents: kitTurnAnalysis.secondary_intents,
+            turn_priority: kitTurnAnalysis.turn_priority,
+            current_turn_decision: kitTurnAnalysis.current_turn_decision,
+            turn_focus: kitTurnAnalysis.turn_focus ?? null,
+            catalog_gate_open: catalogGate.is_open,
+            catalog_gate_reason: catalogGate.reason,
+            next_step_family: nextStepTruth.next_step_family,
+            assist_action_present: nextStepTruth.assist_action_present,
+            source_context_present: Boolean(sourceContext),
+            retrieval_source: capsuleContract.retrieval_source ?? null,
+        }).catch((err) => console.error('[Telemetry] Failed to log kitting basket:', err));
+    }
 
     const finalMessage = mergeConversationalPrefix(
         adaptiveConversation.message || capsuleContract.customer_response_draft,
@@ -119,11 +135,11 @@ export const handleStorefrontKittingBasket = async (
             turnAnalysis: kitTurnAnalysis,
             sourceContext,
         }),
-        shouldShowCatalogSurfaces ? 2 : 3,
+        visibleProducts.length > 0 ? 2 : 3,
     );
 
     return {
-        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', shouldShowCatalogSurfaces ? 2 : 3),
+        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
         suggestedProducts: visibleProducts,
         intent: 'recommendation',
         turn_analysis: kitTurnAnalysis,
@@ -132,5 +148,3 @@ export const handleStorefrontKittingBasket = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/turn-advisory.ts b/src/services/concierge/turn-advisory.ts
index 0b40ebb2..9cfaa888 100644
--- a/src/services/concierge/turn-advisory.ts
+++ b/src/services/concierge/turn-advisory.ts
@@ -1,78 +1,168 @@
 import type { ConciergeMessage, ConciergeTurnAnalysis } from './types';
 
 export type ConciergeAssistantMessage = ConciergeMessage & {
-    capsule_contract?: Record<string, any>;
+    capsule_contract?: Record<string, unknown>;
 };
 
+export interface AddMutationProposal {
+    type: 'ADD';
+    resolved_product_id: string;
+    product_ref?: string;
+    quantity?: number;
+    resolved_variant_id?: string;
+    variant_name?: string;
+    section?: string;
+    product_section?: string;
+    slug?: string;
+    product_slug?: string;
+}
+
+function isAddMutationProposal(value: unknown): value is AddMutationProposal {
+    if (!value || typeof value !== 'object') return false;
+    const candidate = value as Record<string, unknown>;
+    return (
+        candidate.type === 'ADD'
+        && typeof candidate.resolved_product_id === 'string'
+        && candidate.resolved_product_id.trim().length > 0
+    );
+}
+
 /**
  * Transforms an automatic cart operator proposal into an advisory CTA that requires
  * explicit user interaction before mutating the cart.
+ * Pure function: returns a new message object without mutating the input message.
  */
-export function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMessage): void {
+export function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMessage): ConciergeAssistantMessage {
     const contract = message.capsule_contract;
     const proposal = contract?.mutation_proposal;
 
     if (
         contract?.match_strategy === 'EXACT_MUTATION_PROPOSED'
-        && proposal?.type === 'ADD'
-        && typeof proposal.resolved_product_id === 'string'
-        && proposal.resolved_product_id.length > 0
+        && isAddMutationProposal(proposal)
     ) {
+        // Validate proposal.quantity strictly as finite number if provided
+        const isQuantityValid = proposal.quantity === undefined
+            || (typeof proposal.quantity === 'number' && Number.isFinite(proposal.quantity));
+
+        const section = typeof (proposal.section ?? proposal.product_section) === 'string'
+            ? String(proposal.section ?? proposal.product_section).trim()
+            : '';
+
+        const slug = typeof (proposal.slug ?? proposal.product_slug) === 'string'
+            ? String(proposal.slug ?? proposal.product_slug).trim()
+            : '';
+
+        // If identity/routing is incomplete, or quantity is non-numeric:
+        // Do NOT emit an actionable ADD_TO_CART CTA with empty routes. Degrade to informational view.
+        if (!section || !slug || !isQuantityValid) {
+            return {
+                ...message,
+                intent: 'info',
+                content: 'No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.',
+                capsule_contract: {
+                    ...contract,
+                    next_step_view: {
+                        family: 'KEEP_EXPLORING',
+                        guidance: 'Dime el producto exacto o abre la ficha de producto para agregarlo al carrito.',
+                        surfaceKind: 'INFORMATIONAL',
+                        primaryAction: null,
+                        secondaryAction: null,
+                        assistAction: null,
+                    },
+                },
+            };
+        }
+
+        const rawQuantity = typeof proposal.quantity === 'number' ? proposal.quantity : 1;
+        const flooredQuantity = Math.floor(rawQuantity);
+        const quantity = flooredQuantity >= 1 ? Math.min(flooredQuantity, 99) : 1;
+
         const productName = typeof proposal.product_ref === 'string' && proposal.product_ref.trim().length > 0
-            ? proposal.product_ref.trim()
+            ? proposal.product_ref.trim().slice(0, 100)
             : 'este producto';
-        const quantity = Number.isFinite(proposal.quantity) && proposal.quantity > 0
-            ? Math.floor(proposal.quantity)
-            : 1;
-
-        message.intent = 'search';
-        message.content = 'Lo puedo preparar para carrito, pero solo se agrega si tu confirmas con el boton.';
-        message.capsule_contract = {
-            ...contract,
-            next_step_view: {
-                family: 'ADD_READY',
-                guidance: `Si ${productName} es el correcto, confirmalo desde el boton para agregarlo al carrito.`,
-                surfaceKind: 'ACTIONABLE',
-                primaryAction: {
-                    kind: 'ADD_TO_CART',
-                    label: quantity > 1 ? `Agregar ${quantity} x ${productName}` : `Agregar ${productName}`,
-                    product: {
-                        id: proposal.resolved_product_id,
-                        name: productName,
-                        slug: '',
-                        section: 'vape',
+
+        const variantId = typeof proposal.resolved_variant_id === 'string' && proposal.resolved_variant_id.trim().length > 0
+            ? proposal.resolved_variant_id.trim()
+            : null;
+
+        const variantName = typeof proposal.variant_name === 'string' && proposal.variant_name.trim().length > 0
+            ? proposal.variant_name.trim()
+            : 'Opción seleccionada';
+
+        return {
+            ...message,
+            intent: 'search',
+            content: 'Lo puedo preparar para carrito, pero solo se agrega si tú confirmas con el botón.',
+            capsule_contract: {
+                ...contract,
+                next_step_view: {
+                    family: 'ADD_READY',
+                    guidance: `Si ${productName} es el correcto, confírmalo desde el botón para agregarlo al carrito.`,
+                    surfaceKind: 'ACTIONABLE',
+                    primaryAction: {
+                        kind: 'ADD_TO_CART',
+                        label: quantity > 1 ? `Agregar ${quantity} x ${productName}` : `Agregar ${productName}`,
+                        product: {
+                            id: proposal.resolved_product_id.trim(),
+                            name: productName,
+                            slug,
+                            section,
+                        },
+                        quantity,
+                        variantToken: variantId
+                            ? {
+                                id: variantId,
+                                name: variantName,
+                            }
+                            : null,
                     },
-                    quantity,
-                    variantToken: proposal.resolved_variant_id
-                        ? {
-                            id: proposal.resolved_variant_id,
-                            name: 'Variante',
-                        }
-                        : null,
+                    secondaryAction: null,
+                    assistAction: null,
                 },
-                secondaryAction: null,
-                assistAction: null,
             },
         };
-        return;
     }
 
-    message.intent = 'info';
-    message.content = 'No voy a mover tu carrito automaticamente. Dime el producto exacto o abre la ficha para confirmarlo.';
+    const sanitizedContract = message.capsule_contract
+        ? {
+            ...message.capsule_contract,
+            next_step_view: {
+                family: 'KEEP_EXPLORING',
+                guidance: 'Dime el producto exacto o abre la ficha de producto para agregarlo al carrito.',
+                surfaceKind: 'INFORMATIONAL',
+                primaryAction: null,
+                secondaryAction: null,
+                assistAction: null,
+            },
+        }
+        : undefined;
+
+    return {
+        ...message,
+        intent: 'info',
+        content: 'No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.',
+        capsule_contract: sanitizedContract,
+    };
 }
 
+const NON_SEARCH_SUPPORT_REGEX = /\b(envio|envios|pedido|pedidos|orden|ordenes|tracking|rastreo|rastrear|politica|politicas|garantia|garantias|reembolso|reembolsos|devolucion|devoluciones|cambio|cambios|cancelar|cancelacion|factura|facturacion|compatible|compatibilidad|postventa|whatsapp|soporte)\b/i;
+
+const DISCOVERY_INTENT_REGEX = /\b(recomienda|recomiendame|recomendar|busco|buscar|opciones|catalogo|vape|vapes|vapeador|vapeadores|pod|pods|kit|kits|cartucho|cartuchos|dispositivo|dispositivos|liquido|liquidos|desechable|desechables)\b/i;
+
 /**
  * Lexical heuristic to determine if a turn is unambiguous support / post-sale / policy inquiry
  * rather than a product discovery search query.
+ * Uses bounded length and word boundary tokens to prevent ReDoS and substring false negatives.
  */
 export function isCurrentTurnClearlyNonSearch(content: string): boolean {
-    const normalized = content
+    if (!content || typeof content !== 'string') return false;
+    const truncated = content.slice(0, 2000);
+    const normalized = truncated
         .normalize('NFD')
         .replace(/[\u0300-\u036f]/g, '')
         .toLowerCase();
 
-    return /(envio|pedido|orden|tracking|rastre|politi|garanti|reembolso|devolu|cambio|cancel|factura|compatible|compatibilidad|postventa|whatsapp|soporte)/.test(normalized)
-        && !/(recomi|busco|quiero ver|opciones|vape|pod|kit|cartucho|dispositivo|liquido|desechable)/.test(normalized);
+    return NON_SEARCH_SUPPORT_REGEX.test(normalized) && !DISCOVERY_INTENT_REGEX.test(normalized);
 }
 
 /**
@@ -90,39 +180,48 @@ export function extractTurnAnalysis(response: {
 }
 
 /**
- * Filters out empty and duplicate strings.
+ * Filters out empty and duplicate strings with pre-trimming normalization.
  */
 export function uniqueStringList(values: string[]): string[] {
-    return [...new Set(values.filter((value) => value.trim().length > 0))];
+    if (!Array.isArray(values)) return [];
+    const trimmed = values
+        .map((v) => (typeof v === 'string' ? v.trim() : ''))
+        .filter((v) => v.length > 0);
+    return [...new Set(trimmed)];
 }
 
 /**
  * Computes updated preferences and AI conversation context when a user interacts with product recommendations.
+ * Allows passing an optional clock/date parameter for deterministic testing.
  */
 export function computeUpdatedConciergePreferences(
     currentPrefs: Record<string, any> | null | undefined,
     currentIAContext: Record<string, any> | null | undefined,
     displayContent: string,
-    lastIntent: string
+    lastIntent: string,
+    now: Date = new Date()
 ) {
-    const loweredContent = displayContent.toLowerCase();
-    const hint = loweredContent.includes('vape')
+    const loweredContent = (typeof displayContent === 'string' ? displayContent : '').toLowerCase();
+    const hint = loweredContent.includes('vape') || loweredContent.includes('vapeador')
         ? 'vape'
         : loweredContent.includes('herbal')
             ? 'herbal'
             : undefined;
 
+    const existingInterests = Array.isArray(currentPrefs?.interests) ? currentPrefs.interests : [];
+    const sanitizedInterest = typeof displayContent === 'string' ? displayContent.trim().slice(0, 150) : '';
+
     const newPrefs = {
         ...currentPrefs,
         visual_theme_hint: hint || currentPrefs?.visual_theme_hint,
-        interests: [...(currentPrefs?.interests || []), displayContent].slice(-5),
+        interests: uniqueStringList([...existingInterests, sanitizedInterest]).slice(-5),
     };
 
     const newIAContext = {
         ...currentIAContext,
         last_intent: lastIntent,
-        last_query: displayContent,
-        last_update: new Date().toISOString(),
+        last_query: sanitizedInterest,
+        last_update: now.toISOString(),
     };
 
     return { newPrefs, newIAContext };
diff --git a/src/services/orders.service.ts b/src/services/orders.service.ts
index c2b9cde7..9ffebd78 100644
--- a/src/services/orders.service.ts
+++ b/src/services/orders.service.ts
@@ -175,37 +175,72 @@ export async function markWhatsAppSent(orderId: string) {
  * Retorna una función de limpieza para desuscribirse.
  */
 export function subscribeToRealtimeOrders(
-    onNewOrder: (order: RealtimeOrderEvent) => void,
-    onError?: (err: unknown) => void
+    onNewOrder: (order: RealtimeOrderEvent) => void | Promise<void>,
+    onError?: (err: unknown) => void | Promise<void>
 ): () => void {
+    let disposed = false;
+    const channelTopic = `orders_pulse_${
+        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
+            ? crypto.randomUUID()
+            : `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`
+    }`;
+
     const channel = supabase
-        .channel('public:orders_pulse')
+        .channel(channelTopic)
         .on(
             'postgres_changes',
             { event: 'INSERT', schema: 'public', table: 'orders' },
             async (payload) => {
+                if (disposed) return;
                 const newOrder = payload.new as { id?: string } | undefined;
                 if (!newOrder?.id) return;
 
                 try {
                     const eventData = await getOrderNotificationDetails(newOrder.id);
-                    if (eventData) {
-                        onNewOrder(eventData);
+                    if (!disposed && eventData) {
+                        await Promise.resolve(onNewOrder(eventData));
                     }
                 } catch (error) {
-                    if (onError) onError(error);
-                    else console.error('[subscribeToRealtimeOrders] Error enriching order event:', error);
+                    if (!disposed) {
+                        try {
+                            if (onError) {
+                                await Promise.resolve(onError(error)).catch((asyncErr) => {
+                                    console.error('[subscribeToRealtimeOrders] Async rejection in onError callback:', asyncErr);
+                                });
+                            } else {
+                                console.error('[subscribeToRealtimeOrders] Error enriching or handling order event:', error);
+                            }
+                        } catch (handlerErr) {
+                            console.error('[subscribeToRealtimeOrders] Error in onError callback:', handlerErr);
+                        }
+                    }
                 }
             }
         )
         .subscribe((status) => {
-            if (status === 'CHANNEL_ERROR') {
-                if (onError) onError(new Error('CHANNEL_ERROR'));
-                else console.error('[subscribeToRealtimeOrders] Realtime connection error');
+            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
+                if (!disposed) {
+                    try {
+                        if (onError) {
+                            void Promise.resolve(onError(new Error(`Realtime status: ${status}`))).catch((asyncErr) => {
+                                console.error('[subscribeToRealtimeOrders] Async rejection in status onError callback:', asyncErr);
+                            });
+                        } else {
+                            console.error(`[subscribeToRealtimeOrders] Realtime connection issue: ${status}`);
+                        }
+                    } catch (handlerErr) {
+                        console.error('[subscribeToRealtimeOrders] Error in status onError handler:', handlerErr);
+                    }
+                }
             }
         });
 
     return () => {
-        supabase.removeChannel(channel);
+        disposed = true;
+        try {
+            void Promise.resolve(supabase.removeChannel(channel)).catch(() => {});
+        } catch {
+            // ignore mock or cleanup errors
+        }
     };
 }
diff --git a/src/services/settings.service.ts b/src/services/settings.service.ts
index 1ec46354..223baf9e 100644
--- a/src/services/settings.service.ts
+++ b/src/services/settings.service.ts
@@ -144,16 +144,44 @@ export async function updateStoreSettings(settings: Partial<StoreSettings>) {
 }
 
 /**
- * Heartbeat check: verifies database availability by pinging a lightweight public table.
+ * Heartbeat check: verifies database availability by pinging a lightweight public table with strict 5s timeout.
+ * Guarantees timely completion via Promise.race even if the underlying database driver fails to settle on abort.
  */
-export async function checkBackendHealth(): Promise<boolean> {
-    const { error } = await supabase
-        .from('categories')
-        .select('id', { count: 'exact', head: true })
-        .limit(1);
-
-    if (error) {
-        throw error;
+export async function checkBackendHealth(timeoutMs: number = 5000): Promise<boolean> {
+    const controller = new AbortController();
+    let timer: ReturnType<typeof setTimeout> | undefined;
+
+    const timeoutPromise = new Promise<never>((_, reject) => {
+        timer = setTimeout(() => {
+            controller.abort();
+            reject(new Error(`[checkBackendHealth] Database ping timed out after ${timeoutMs}ms`));
+        }, timeoutMs);
+    });
+
+    try {
+        const queryPromise = (async () => {
+            const { error } = await supabase
+                .from('categories')
+                .select('id')
+                .limit(1)
+                .abortSignal(controller.signal);
+
+            if (error) {
+                console.error('[checkBackendHealth] Ping returned error:', error);
+                throw error;
+            }
+            return true;
+        })();
+
+        return await Promise.race([queryPromise, timeoutPromise]);
+    } catch (err) {
+        if (controller.signal.aborted) {
+            const timeoutError = new Error(`[checkBackendHealth] Database ping timed out after ${timeoutMs}ms`);
+            console.error(timeoutError.message);
+            throw timeoutError;
+        }
+        throw err;
+    } finally {
+        if (timer) clearTimeout(timer);
     }
-    return true;
 }
diff --git a/src/services/visual-scanner.service.ts b/src/services/visual-scanner.service.ts
index 3190cfa9..cd0ff88b 100644
--- a/src/services/visual-scanner.service.ts
+++ b/src/services/visual-scanner.service.ts
@@ -40,7 +40,9 @@ export async function invokeVisualCompatibilityScanner(
     });
 
     if (invokeError) {
-        throw new Error(invokeError.message || 'Error al conectar con el motor de visi\u00f3n.');
+        const error = new Error(invokeError.message || 'Error al conectar con el motor de visión.');
+        (error as any).cause = invokeError;
+        throw error;
     }
 
     if (!data) {

```

---

### INSTRUCCIONES PARA TU DICTAMEN:
1. Revisa línea por línea el diff consolidado.
2. Comprueba si los 4 bloqueos previos y los 3 riesgos residuales quedaron formalmente resueltos sin deuda técnica.
3. Evalúa la robustez contra concurrencia, pureza de funciones, aislamiento de fallos y restricciones de catálogo.
4. Emite tu Scorecard actualizado y tu Veredicto Formal final: **ACCEPT**, **REJECT** o **ACCEPT WITH RESIDUAL RISK**.
