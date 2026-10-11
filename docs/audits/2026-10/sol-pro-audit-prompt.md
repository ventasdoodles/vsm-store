# VSM STORE — AUDITORÍA TÉCNICA DE REMEDIACIÓN (LANES 6, 7 Y 8)
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Prompt Caching)
## Objetivo: Validación exhaustiva de parches contra el dictamen REJECT de Claude Opus 5.5

Eres **Sol Pro GPT-6**, el Principal Systems & Security Auditor de VSM Store.
Previamente, el modelo Claude Opus 5.5 emitió un veredicto formal de **REJECT** sobre la refactorización arquitectónica de las Lanes 6, 7 y 8, señalando 10 hallazgos críticos y severos.

El equipo de ingeniería acaba de implementar y desplegar el commit `f4391fed` para remediar la totalidad de los hallazgos. Tu misión es ejecutar una contra-auditoría despiadada, técnica e imparcial sobre este parche.

---

### CONTEXTO DE LOS 10 HALLAZGOS DE OPUS 5.5 QUE SE DEBÍAN RESOLVER:

1. **L6-C1 [Prototype Pollution en Dispatcher]:** Despacho por objeto plano susceptible a `constructor`, `__proto__`, `toString`.
   - *Solución esperada:* Tupla cerrada `CAPSULE_NAMES`, tipo `CapsuleName`, `Object.freeze`, `satisfies Record<CapsuleName, CapsuleHandlerFn>`, verificación estricta `Object.prototype.hasOwnProperty.call`.

2. **L6-C2 [Aislamiento de Fallos & Señales Laxas]:** Cero `try/catch` en el despacho; desreferencias síncronas de `*.signal.kind` que tumban el turno si el orquestador falla; telemetría no protegida.
   - *Solución esperada:* Envoltorio `try/catch` en `dispatchClientCapsule` con respuesta segura de fallback; optional chaining (`?.kind`) en todas las señales de los 11 handlers; llamadas a telemetría protegidas con `.catch()`.

3. **L6-C4 [Ciclo de Dependencias Circular]:** `capsule-dispatcher.ts` importaba `handlers`, y todos los handlers importaban interfaces de `capsule-dispatcher.ts`.
   - *Solución esperada:* Extracción limpia a `src/services/concierge/dispatch.types.ts` e imports con `import type`.

4. **L6-C3 / L6-C5 [Catalog Gate & Contratos de Retorno]:** Gating de productos y preservación de `next_step_view`.
   - *Solución esperada:* Compatibilidad e inventario preservan sus productos resueltos con `next_step_view` compacto verificado en Stage 4.

5. **L7-C1 [Invariante de Seguridad del Carrito]:** Se había eliminado la aserción `expect(addItemMock).not.toHaveBeenCalled()` en los tests de UI.
   - *Solución esperada:* Restauración de la aserción estricta en `AIConcierge.test.tsx`.

6. **L7-C3 & L7-C4 [Pureza, Clamping de Cantidad y Rutas Dinámicas]:** `convertCartOperatorToAdvisoryCta` mutaba argumentos, aceptaba cantidades 0 o desmedidas, y hardcodeaba `section: 'vape'` y `slug: ''`.
   - *Solución esperada:* Función completamente pura (retorna nuevo objeto sin mutación); `Math.floor` antes de validar; acotado a [1, 99]; derivación dinámica de sección y slug.

7. **L7-C5 [Heurística de Turnos & ReDoS / Substring Collisions]:** `isCurrentTurnClearlyNonSearch` daba falsos negativos con subcadenas (ej. 'pod' en 'podrías') y no truncaba inputs grandes.
   - *Solución esperada:* Límites de palabra (\b), raíces léxicas y truncamiento a 2,000 chars.

8. **L8-C1, L8-C2, L8-C3 [Ciclo de Vida Realtime & Concurrencia]:** Callbacks ejecutados tras unmount, tópico fijo `public:orders_pulse` con colisión de canales, y churn de suscripción por `[onNewOrder]`.
   - *Solución esperada:* Flag `disposed` en el servicio de realtime; tópico único con UUID (`orders_pulse_${uuid}`); estabilización de callback con `useRef` y deps `[]` en el hook.

9. **L8 Resiliencia de Servicios:** `checkBackendHealth` sin timeout; scanner perdiendo `cause` del error.
   - *Solución esperada:* `AbortSignal.timeout(5000)` en PostgREST query; error `cause` preservado en Visual Scanner.

10. **L8 Test Arquitectónico:** Falta de pruebas de regresión para imports de DB en hooks.
    - *Solución esperada:* Test estático automatizado en `db-isolation-services.test.ts` confirmando 0 imports de Supabase en `src/hooks/**`.

---

### EVIDENCIA DE EJECUCIÓN LOCAL:
- `npm run typecheck` (`tsc --noEmit`): **0 errores** (salida limpia).
- `npx vitest run src/services/__tests__/concierge.service.stage4.test.ts`: **48/48 PASS**.
- `npx vitest run src/services/__tests__`: **138/138 PASS** (18 archivos de prueba en verde).
- `npx vitest run src/components/ui/ai/__tests__/AIConcierge.test.tsx`: **30/30 PASS**.

---

### DIFF COMPLETO DEL COMMIT f4391fed (SRC/):

```diff
commit f4391fed34040edb69b5862785e8531e9105a4d7
Author: ventasdoodles <ventasdoodles@gmail.com>
Date:   Sun Oct 11 01:11:57 2026 -0600

    fix(concierge-remediation): address ruthless Claude Opus 5.5 audit findings across Lanes 6, 7, and 8

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
index 1032763d..df86e5bf 100644
--- a/src/hooks/useRealtimeOrders.ts
+++ b/src/hooks/useRealtimeOrders.ts
@@ -3,21 +3,37 @@
  * // Arquitectura: Independent Infrastructure Lego (Lego Master)
  * // Proposito principal: Escucha cambios en 'orders' via Supabase Realtime para Social Proof (Social Pulse).
  * // Regla / Notas: Desacoplado de infraestructura (§1.1). Delega el enriquecimiento de datos al servicio.
+ * // Resiliencia: Utiliza useRef para estabilizar callbacks y evitar reconexiones/churn innecesarios.
  */
 
-import { useEffect } from 'react';
+import { useEffect, useRef } from 'react';
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
+    useEffect(() => {
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
diff --git a/src/services/__tests__/db-isolation-services.test.ts b/src/services/__tests__/db-isolation-services.test.ts
index f4566ff0..0b4e354a 100644
--- a/src/services/__tests__/db-isolation-services.test.ts
+++ b/src/services/__tests__/db-isolation-services.test.ts
@@ -1,5 +1,7 @@
 // @vitest-environment node
 import { describe, expect, it, vi, beforeEach } from 'vitest';
+import fs from 'node:fs';
+import path from 'node:path';
 
 const fromMock = vi.hoisted(() => vi.fn());
 const channelMock = vi.hoisted(() => vi.fn());
@@ -24,7 +26,20 @@ import { invokeVisualCompatibilityScanner } from '@/services/visual-scanner.serv
 
 describe('Database isolation services', () => {
     beforeEach(() => {
-        vi.clearAllMocks();
+        vi.resetAllMocks();
+    });
+
+    describe('Architectural Hook Isolation Guard', () => {
+        it('ensures zero hooks in src/hooks directly import @/lib/supabase', () => {
+            const hooksDir = path.resolve(process.cwd(), 'src/hooks');
+            const hookFiles = fs.readdirSync(hooksDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
+
+            for (const file of hookFiles) {
+                const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
+                expect(content).not.toMatch(/from ['"]@\/lib\/supabase['"]/);
+                expect(content).not.toMatch(/from ['"]@supabase\/supabase-js['"]/);
+            }
+        });
     });
 
     describe('getAppliedReferral', () => {
@@ -45,6 +60,19 @@ describe('Database isolation services', () => {
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
@@ -59,21 +87,23 @@ describe('Database isolation services', () => {
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
 
@@ -82,16 +112,17 @@ describe('Database isolation services', () => {
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
@@ -135,15 +166,20 @@ describe('Database isolation services', () => {
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
diff --git a/src/services/__tests__/turn-advisory.test.ts b/src/services/__tests__/turn-advisory.test.ts
index 871e3470..f6e33a43 100644
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
@@ -42,13 +50,13 @@ describe('turn-advisory service', () => {
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
                     },
                 },
                 secondaryAction: null,
@@ -56,6 +64,44 @@ describe('turn-advisory service', () => {
             });
         });
 
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
         it('falls back to informational message when proposal is not an exact ADD mutation', () => {
             const message: ConciergeAssistantMessage = {
                 id: '2',
@@ -70,25 +116,36 @@ describe('turn-advisory service', () => {
                 },
             };
 
-            convertCartOperatorToAdvisoryCta(message);
+            const result = convertCartOperatorToAdvisoryCta(message);
 
-            expect(message.intent).toBe('info');
-            expect(message.content).toBe('No voy a mover tu carrito automaticamente. Dime el producto exacto o abre la ficha para confirmarlo.');
+            expect(result.intent).toBe('info');
+            expect(result.content).toBe('No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.');
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
 
@@ -109,25 +166,27 @@ describe('turn-advisory service', () => {
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
@@ -135,6 +194,7 @@ describe('turn-advisory service', () => {
             expect(result.newPrefs.interests[4]).toBe('me interesa un vape recargable');
             expect(result.newIAContext.last_intent).toBe('recommendation');
             expect(result.newIAContext.last_query).toBe('me interesa un vape recargable');
+            expect(result.newIAContext.last_update).toBe('2026-10-11T12:00:00.000Z');
         });
     });
 });
diff --git a/src/services/concierge/capsule-dispatcher.ts b/src/services/concierge/capsule-dispatcher.ts
index fcbffffd..40939d0a 100644
--- a/src/services/concierge/capsule-dispatcher.ts
+++ b/src/services/concierge/capsule-dispatcher.ts
@@ -1,45 +1,40 @@
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
-
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
+export type {
+    DispatchClientCapsuleParams,
+    ClientCapsuleDispatchResult,
+    CapsuleName,
+} from './dispatch.types';
 
-export async function dispatchClientCapsule(params: DispatchClientCapsuleParams): Promise<ClientCapsuleDispatchResult | null> {
-    const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive(params.data.no_write_smoke);
-    const handler = capsuleHandlers[params.data.capsule_name];
+export async function dispatchClientCapsule(
+    params: DispatchClientCapsuleParams
+): Promise<ClientCapsuleDispatchResult | null> {
+    const capsuleName = params.data?.capsule_name;
 
-    if (handler) {
-        return handler(params, noWriteSmokeActive);
+    if (!isCapsuleName(capsuleName)) {
+        return null;
     }
 
-    return null;
+    const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive(params.data?.no_write_smoke);
+    const handler = capsuleHandlers[capsuleName];
+
+    try {
+        return await handler(params, noWriteSmokeActive);
+    } catch (error) {
+        console.error(`[CapsuleDispatcher] Handler failure for capsule "${capsuleName}":`, error);
+        return {
+            message: typeof params.data?.message === 'string' && params.data.message.trim().length > 0
+                ? params.data.message
+                : 'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.',
+            intent: 'info',
+            turn_analysis: params.turnAnalysis,
+            catalog_gate: params.catalogGate,
+            source_context: params.sourceContext,
+        };
+    }
 }
diff --git a/src/services/concierge/dispatch.types.ts b/src/services/concierge/dispatch.types.ts
new file mode 100644
index 00000000..0935775b
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
+export const CAPSULE_NAMES = [
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
+] as const;
+
+export type CapsuleName = typeof CAPSULE_NAMES[number];
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
index 2fcb3b63..4e3374df 100644
--- a/src/services/concierge/handlers/index.ts
+++ b/src/services/concierge/handlers/index.ts
@@ -1,4 +1,7 @@
-﻿import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
+import type {
+    CapsuleHandlerFn,
+    CapsuleName,
+} from '../dispatch.types';
 import { handleProductSearchIntegrity } from './product-search-integrity.handler';
 import { handleStorefrontKittingBasket } from './storefront-kitting-basket.handler';
 import { handleStorefrontBudgetRescue } from './storefront-budget-rescue.handler';
@@ -11,21 +14,22 @@ import { handleAuthenticatedLoyaltyStatus } from './authenticated-loyalty-status
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
+    return typeof name === 'string' && Object.prototype.hasOwnProperty.call(capsuleHandlers, name);
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
index d465b78a..d3cfea05 100644
--- a/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
+++ b/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
@@ -1,27 +1,40 @@
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
+
     const visibleProducts = inventoryProducts;
-    const supportsReview = capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_ONLINE'
-        || capsuleContract.inventory_outlook_signal.kind === 'IN_STOCK_OMNICHANNEL';
+
+    const signalKind = capsuleContract.inventory_outlook_signal?.kind;
+    const supportsReview = signalKind === 'IN_STOCK_ONLINE' || signalKind === 'IN_STOCK_OMNICHANNEL';
     const commercialMove = supportsReview ? 'REVIEW_ONE' : 'KEEP_EXPLORING';
+
     const inventoryTurnAnalysis: ConciergeTurnAnalysis = {
         ...turnAnalysis,
         commercial_move: commercialMove,
@@ -29,6 +42,7 @@ export const handleStorefrontInventoryOutlook = async (
         turn_focus: 'inventory',
         current_turn_decision: 'USE_CAPABILITY',
     };
+
     const adaptiveConversation = buildCesarinActionableNextStepView({
         query,
         history,
@@ -36,7 +50,7 @@ export const handleStorefrontInventoryOutlook = async (
         matchStrategy: null,
         adaptiveMode: supportsReview
             ? 'SOFT_REASSURE'
-            : capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED'
+            : signalKind === 'RESTOCK_EXPECTED'
                 ? 'SOFT_REASSURE'
                 : 'EXPLORE_LIGHT',
         visibleProducts,
@@ -45,6 +59,7 @@ export const handleStorefrontInventoryOutlook = async (
         turnAnalysis: inventoryTurnAnalysis,
         commercialMove,
     });
+
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
         visibleProducts.length > 0 ? 2 : 3,
@@ -59,56 +74,58 @@ export const handleStorefrontInventoryOutlook = async (
         || adaptiveConversation.nextStep.secondaryAction
         || adaptiveConversation.nextStep.assistAction,
     );
-    const shouldShowNextStep = visibleProducts.length > 0
-        && (supportsReview || capsuleContract.inventory_outlook_signal.kind === 'RESTOCK_EXPECTED');
-    const compactNextStepView = shouldShowNextStep
-        && adaptiveConversation.nextStep.renderHint === 'SHOW'
-        && (renderableNextStepGuidance || hasMaterialNextStepAction)
+
+    const compactNextStepView = (adaptiveConversation.nextStep.surfaceKind === 'ACTIONABLE' || hasMaterialNextStepAction)
         ? {
             ...adaptiveConversation.nextStep,
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
+            has_product_cards: visibleProducts.length > 0,
+            product_card_count: visibleProducts.length,
+            zero_results: signalKind === 'PRODUCT_NOT_FOUND',
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
@@ -131,5 +148,3 @@ export const handleStorefrontInventoryOutlook = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/handlers/storefront-kitting-basket.handler.ts b/src/services/concierge/handlers/storefront-kitting-basket.handler.ts
index ec185950..41a6ec02 100644
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
@@ -62,54 +72,57 @@ export const handleStorefrontKittingBasket = async (
         || adaptiveConversation.nextStep.secondaryAction
         || adaptiveConversation.nextStep.assistAction,
     );
-    const compactNextStepView = shouldShowCatalogSurfaces
-        && adaptiveConversation.nextStep.renderHint === 'SHOW'
-        && (renderableNextStepGuidance || hasMaterialNextStepAction)
+    const compactNextStepView = (adaptiveConversation.nextStep.surfaceKind === 'ACTIONABLE' || hasMaterialNextStepAction)
         ? {
             ...adaptiveConversation.nextStep,
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
+            has_product_cards: visibleProducts.length > 0,
+            product_card_count: visibleProducts.length,
+            zero_results: capsuleContract.match_strategy === 'NO_GROUNDED_KIT',
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
@@ -119,11 +132,11 @@ export const handleStorefrontKittingBasket = async (
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
@@ -132,5 +145,3 @@ export const handleStorefrontKittingBasket = async (
         capsule_contract: capsuleContract,
     };
 };
-
-
diff --git a/src/services/concierge/turn-advisory.ts b/src/services/concierge/turn-advisory.ts
index 0b40ebb2..4da6644e 100644
--- a/src/services/concierge/turn-advisory.ts
+++ b/src/services/concierge/turn-advisory.ts
@@ -1,78 +1,132 @@
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
         const productName = typeof proposal.product_ref === 'string' && proposal.product_ref.trim().length > 0
-            ? proposal.product_ref.trim()
+            ? proposal.product_ref.trim().slice(0, 100)
             : 'este producto';
-        const quantity = Number.isFinite(proposal.quantity) && proposal.quantity > 0
-            ? Math.floor(proposal.quantity)
+
+        // Floor first, then validate strictly >= 1 and clamp to max 99
+        const rawQuantity = Number(proposal.quantity);
+        const flooredQuantity = Math.floor(rawQuantity);
+        const quantity = Number.isFinite(flooredQuantity) && flooredQuantity >= 1
+            ? Math.min(flooredQuantity, 99)
             : 1;
 
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
+        const variantId = typeof proposal.resolved_variant_id === 'string' && proposal.resolved_variant_id.trim().length > 0
+            ? proposal.resolved_variant_id.trim()
+            : null;
+
+        const section = typeof (proposal.section ?? proposal.product_section) === 'string'
+            && String(proposal.section ?? proposal.product_section).trim().length > 0
+            ? String(proposal.section ?? proposal.product_section).trim()
+            : 'catalogo';
+
+        const slug = typeof (proposal.slug ?? proposal.product_slug) === 'string'
+            ? String(proposal.slug ?? proposal.product_slug).trim()
+            : '';
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
+    return {
+        ...message,
+        intent: 'info',
+        content: 'No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.',
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
@@ -90,39 +144,48 @@ export function extractTurnAnalysis(response: {
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
index c2b9cde7..09fd7312 100644
--- a/src/services/orders.service.ts
+++ b/src/services/orders.service.ts
@@ -178,34 +178,43 @@ export function subscribeToRealtimeOrders(
     onNewOrder: (order: RealtimeOrderEvent) => void,
     onError?: (err: unknown) => void
 ): () => void {
+    let disposed = false;
+    const channelTopic = `orders_pulse_${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
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
+                    if (!disposed && eventData) {
                         onNewOrder(eventData);
                     }
                 } catch (error) {
-                    if (onError) onError(error);
-                    else console.error('[subscribeToRealtimeOrders] Error enriching order event:', error);
+                    if (!disposed) {
+                        if (onError) onError(error);
+                        else console.error('[subscribeToRealtimeOrders] Error enriching order event:', error);
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
+                    if (onError) onError(new Error(`Realtime status: ${status}`));
+                    else console.error(`[subscribeToRealtimeOrders] Realtime connection issue: ${status}`);
+                }
             }
         });
 
     return () => {
-        supabase.removeChannel(channel);
+        disposed = true;
+        void supabase.removeChannel(channel).catch(() => {});
     };
 }
diff --git a/src/services/settings.service.ts b/src/services/settings.service.ts
index 1ec46354..f7de1e6b 100644
--- a/src/services/settings.service.ts
+++ b/src/services/settings.service.ts
@@ -144,16 +144,32 @@ export async function updateStoreSettings(settings: Partial<StoreSettings>) {
 }
 
 /**
- * Heartbeat check: verifies database availability by pinging a lightweight public table.
+ * Heartbeat check: verifies database availability by pinging a lightweight public table with strict 5s timeout.
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
+    const timer = setTimeout(() => controller.abort(), timeoutMs);
+
+    try {
+        const { error } = await supabase
+            .from('categories')
+            .select('id')
+            .limit(1)
+            .abortSignal(controller.signal);
+
+        if (error) {
+            console.error('[checkBackendHealth] Ping returned error:', error);
+            throw error;
+        }
+        return true;
+    } catch (err) {
+        if (controller.signal.aborted) {
+            const timeoutError = new Error(`[checkBackendHealth] Database ping timed out after ${timeoutMs}ms`);
+            console.error(timeoutError.message);
+            throw timeoutError;
+        }
+        throw err;
+    } finally {
+        clearTimeout(timer);
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
1. Revisa línea por línea el diff de los 28 archivos modificados.
2. Evalúa si cada uno de los 10 hallazgos fue remediado de raíz o si quedó deuda oculta o side-effects.
3. Evalúa la higiene de código (TypeScript, tipos, inmutabilidad, memory leaks, concurrency).
4. Emite tu Scorecard detallado y tu Veredicto Formal: **ACCEPT**, **REJECT** o **ACCEPT WITH RESIDUAL RISK**.
