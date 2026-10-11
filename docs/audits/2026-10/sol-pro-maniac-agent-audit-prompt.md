# VSM STORE — AUDITORÍA ADVERSARIAL Y MANÍACA DEL AGENTE CÉSARÍN
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Batch Mode)
## Modelo Solicitado: openai/gpt-6-sol-pro:batch
## Commit Evaluado: 10323ea5 (rama main)
## Mandato del Product Owner: "una auditoría pero maníaca en general de todo lo que tiene que ver con el agente"

---

Eres **OpenAI GPT-6 Sol Pro**, el Principal Systems, Security & AI Architect de VSM Store.
Has sido comisionado para ejecutar una **auditoría implacable, profunda y maníaca** sobre la arquitectura completa de **Césarín**, el agente inteligente de VSM Store, tras la implementación de las 3 fases autorizadas en tus reportes previos (`batch-1791709383` y `batch-1791711083`).

El Product Owner exige que no tengas piedad: examina tanto la voz y psicología conversacional como la seguridad operativa, la concurrencia, las fugas de datos, el adaptador multi-proveedor LLM y la infraestructura de Prompt Caching.

---

## 1. EJES OBLIGATORIOS DE LA AUDITORÍA MANÍACA

### Eje 1: Humanización, Voz Natural y Desmantelamiento de los "5 Pecados del Bot" (Fase 1)
Evalúa minuciosamente:
1. **Saludos de bienvenida (`src/hooks/useAIConcierge.ts`):**
   - Antes: *"Que onda, soy Cesarin. Te ayudo a ubicar algo de volada y si no me la se, te lo digo derecho."* y *"si algo me agarra en curva, te lo digo sin inventarte cosas."*
   - Ahora: *"¡Qué onda! Soy Cesarin. ¿Buscas algo en particular o te ayudo a encontrar una buena opción?"* y *"¡Qué onda, ${firstName}! Soy Cesarin. Cuéntame qué traes en mente y lo vemos juntos."*
   - ¿Se eliminó la postura defensiva y la paranoia de advertir sobre alucinaciones desde el primer saludo?
2. **Censura por expresión regular (`src/lib/cesarin-text-utils.ts`):**
   - Se removió la regex que catalogaba como redundantes aperturas cordiales mexicanas (`si quieres`, `si gustas`, `te paso`, `te muestro`, `yo arrancaría`).
   - Se redujo `isRedundantClosingSentence` a únicamente frases de relleno vacío (`para no hacerla larga`).
   - ¿Es seguro este cambio? ¿Mantiene la deduplicación de ideas sin mutilar la cortesía?
3. **Erradicación de la guillotina de 2 oraciones (`compactCesarinCopy(..., 2)`):**
   - Se eliminó el truncamiento destructivo `visibleProducts.length > 0 ? 2 : 3` en los 5 handlers del storefront:
     - `product-search-integrity.handler.ts`
     - `storefront-kitting-basket.handler.ts`
     - `storefront-inventory-outlook.handler.ts`
     - `storefront-compatibility-check.handler.ts`
     - `storefront-budget-rescue.handler.ts`
   - Se homologó a un límite natural de 8 oraciones para dar espacio a comparativas y explicaciones técnicas de refacciones.
   - ¿Existe riesgo de verborrea o divagación incontrolada?
4. **Fallbacks operacionales y de carrito (`turn-advisory.ts` y `capsule-dispatcher.ts`):**
   - Carrito ambiguo: *"Claro, te ayudo. Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha."*
   - Fallo de dispatcher: *"No pude completar esa consulta en este momento. Podemos intentarlo de nuevo o, si me dices el modelo que tienes, te ayudo a ubicar la refacción."*
   - ¿Transmiten tacto y servicio sin exponer la arquitectura interna ni sonar a conmutador telefónico?

---

### Eje 2: Blindaje de Seguridad y Guardrails Innegociables (Lanes 6, 7 y 8)
Evalúa si la naturalidad introducida comprometió de alguna forma la seguridad:
1. **Compuerta de Catálogo (`catalogGate.is_open`):**
   - ¿Sigue siendo 100% innegociable del lado servidor?
   - Si `catalogGate.is_open === false`, ¿los handlers garantizan que `visibleProducts` sea estrictamente `[]` y `compactNextStepView` sea `undefined`, sin importar lo elocuente que sea el texto del modelo?
2. **Aislamiento de Mutaciones de Carrito:**
   - ¿Sigue siendo 100% imposible que el modelo o los handlers agreguen productos al carrito sin confirmación explícita del cliente en el botón (`ADD_READY` CTA)?
   - ¿Se mantiene la sanitización estricta de cantidad finita numérica [1, 99], sección y slug?
3. **Aislamiento de Infraestructura de Base de Datos:**
   - ¿Se mantiene la garantía de 0 imports en tiempo de ejecución de `@/lib/supabase` en `src/hooks/`?
   - ¿Los callbacks de Realtime y health checks manejan fallos sin excepciones no capturadas?

---

### Eje 3: Adaptador Multi-Proveedor de Edge Functions (`supabase/functions/_shared/llm-provider.ts` - Fase 2)
Audita el nuevo adaptador de inferencia:
1. **Integración con OpenRouter (`openai/gpt-6-luna-pro`):**
   - Implementa el protocolo OpenAI Chat Completions (`POST https://openrouter.ai/api/v1/chat/completions`).
   - Envía cabeceras requeridas (`Authorization`, `HTTP-Referer`, `X-Title`).
   - Configura `response_format: { type: 'json_object' }` y `reasoning_effort: 'low'`.
2. **Canal de Streaming SSE:**
   - ¿La transformación de chunks de OpenRouter (`choices[0].delta.content`) hacia la estructura compatible de candidatos permite que el parser de streaming en `concierge-chat.ts` opere de forma continua sin romper la experiencia en tiempo real?
3. **Resiliencia y Fallback a Google Gemini:**
   - Si `OPENROUTER_API_KEY` no está configurada, o si OpenRouter responde con error 4xx/5xx o desconexión de red, ¿se activa el fallback transparente hacia `geminiGenerateContent` / `geminiStreamGenerateContent`?
   - ¿Garantiza que la sesión de chat nunca se caiga para el cliente?
4. **Aislamiento Estricto de Búsqueda Vectorial (PostgreSQL pgvector):**
   - ¿Se preservó `geminiEmbedText` con el modelo inmutable `gemini-embedding-001` (768 dimensiones) en `tools.ts` para evitar cualquier incompatibilidad con la base de datos de productos?

---

### Eje 4: Arquitectura de Prompt Caching y Calibración de Prompts (Fase 3)
Audita la estructura de bloques de prompt para maximizar el cache hit y reducir costos:
1. **Bloque 1 (Prefijo Estático Congelado):**
   - Versionado como `<!-- prompt_version: cesarin_v1_202610 -->`.
   - Contiene la identidad de César (asesor de mostrador cercano, honesto, conocedor), las políticas inmutables de VSM Store (pagos por transferencia, envíos DHL Express, corte a las 5 PM, sin apartados) y el schema JSON.
   - ¿Permite un 100% de coincidencia exacta de prefijo para activación de prompt caching en Luna Pro?
2. **Bloque 2 (Memoria de Sesión Semi-Estática):**
   - Contexto del cliente autenticado y preferencias acumuladas.
3. **Bloque 3 (Turno Dinámico):**
   - Salidas de herramientas de verdad, perfil de turno y mensaje del usuario.
   - Se eliminaron las reglas de micromanagement: *"Haz una sola jugada central por turno"*, *"Usa máximo dos frases cortas cuando alcance"*, *"Usa máximo una pregunta"*.
   - ¿La nueva instrucción de turno equilibra precisión y calidez sin caer en preguntas formulario?

---

### Eje 5: Baseline de Pruebas y Tipado Estático
- **TypeScript:** `npm run typecheck` (`tsc --noEmit`) -> **0 errores** en todo el proyecto.
- **Vitest:** **102/102 pruebas pasando** en los suites afectados:
  - `src/lib/__tests__/cesarin-text-utils.test.ts` (26/26 PASS)
  - `src/services/__tests__/capsule-dispatcher.test.ts` (5/5 PASS)
  - `src/services/__tests__/turn-advisory.test.ts` (16/16 PASS)
  - `src/services/__tests__/kitting-inventory-gates.test.ts` (8/8 PASS)
  - `src/services/__tests__/db-isolation-services.test.ts` (17/17 PASS)
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx` (30/30 PASS)

---

## 2. DIFF CONSOLIDADO DEL AGENTE (fb27139a .. HEAD):

```diff
diff --git a/src/hooks/useAIConcierge.ts b/src/hooks/useAIConcierge.ts
index 0a327c76..1bd3667c 100644
--- a/src/hooks/useAIConcierge.ts
+++ b/src/hooks/useAIConcierge.ts
@@ -60,7 +60,7 @@ export function useAIConcierge() {
         {
             id: 'welcome',
             role: 'assistant',
-            content: 'Que onda, soy Cesarin. Te ayudo a ubicar algo de volada y si no me la se, te lo digo derecho.',
+            content: '¡Qué onda! Soy Cesarin. ¿Buscas algo en particular o te ayudo a encontrar una buena opción?',
             timestamp: new Date(),
         },
     ]);
@@ -107,7 +107,7 @@ export function useAIConcierge() {
                     message.id === 'welcome'
                         ? {
                             ...message,
-                            content: `Que onda ${firstName}. Soy Cesarin; te ayudo a encontrar algo y, si algo me agarra en curva, te lo digo sin inventarte cosas.`,
+                            content: `¡Qué onda, ${firstName}! Soy Cesarin. Cuéntame qué traes en mente y lo vemos juntos.`,
                         }
                         : message,
                 ),
diff --git a/src/lib/__tests__/cesarin-text-utils.test.ts b/src/lib/__tests__/cesarin-text-utils.test.ts
index 0a5c984b..b58b6466 100644
--- a/src/lib/__tests__/cesarin-text-utils.test.ts
+++ b/src/lib/__tests__/cesarin-text-utils.test.ts
@@ -69,10 +69,16 @@ describe('compactCesarinCopy', () => {
         expect(result.split('.').filter(Boolean).length).toBeLessThanOrEqual(2);
     });
 
-    it('strips redundant closing sentences', () => {
+    it('preserves helpful closing sentences and polite Mexican phrasing without censoring', () => {
         const input = 'Tu pedido va bien. Si quieres te muestro más opciones.';
         const result = compactCesarinCopy(input);
-        expect(result).not.toContain('Si quieres te muestro');
+        expect(result).toBe('Tu pedido va bien. Si quieres te muestro más opciones.');
+    });
+
+    it('strips empty filler closing sentences', () => {
+        const input = 'Tu pedido va bien. Para no hacerla larga.';
+        const result = compactCesarinCopy(input);
+        expect(result).not.toContain('Para no hacerla larga');
     });
 });
 
diff --git a/src/lib/cesarin-text-utils.ts b/src/lib/cesarin-text-utils.ts
index b8f8983f..008cfd81 100644
--- a/src/lib/cesarin-text-utils.ts
+++ b/src/lib/cesarin-text-utils.ts
@@ -37,7 +37,7 @@ export function splitIntoSentences(value: string): string[] {
 
 function isRedundantClosingSentence(sentence: string): boolean {
     const normalized = normalizeCompactText(sentence);
-    return /^(si quieres|si ya te gusto|si te late|si gustas|te conviene|vete por|yo arrancaria|yo me iria|para no hacerla larga|para no alargarla|te dejo unas opciones|te dejo unas cercanas|te paso|te muestro|si quieres te muestro|si quieres te paso|si quieres te dejo|si quieres te saco)/.test(normalized);
+    return /^(para no hacerla larga|para no alargarla)$/.test(normalized);
 }
 
 export function compactCesarinCopy(value: string, maxSentences = 8): string {
diff --git a/src/services/__tests__/capsule-dispatcher.test.ts b/src/services/__tests__/capsule-dispatcher.test.ts
index cbaaf822..8fa63084 100644
--- a/src/services/__tests__/capsule-dispatcher.test.ts
+++ b/src/services/__tests__/capsule-dispatcher.test.ts
@@ -71,7 +71,7 @@ describe('CapsuleDispatcher resilience and security', () => {
         expect(spy).toHaveBeenCalled();
         expect(res).not.toBeNull();
         expect(res?.message).toBe(
-            'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'
+            'No pude completar esa consulta en este momento. Podemos intentarlo de nuevo o, si me dices el modelo que tienes, te ayudo a ubicar la refacción.'
         );
         expect(res?.intent).toBe('info');
         expect(res?.turn_analysis).toEqual(baseParams.turnAnalysis);
@@ -94,7 +94,7 @@ describe('CapsuleDispatcher resilience and security', () => {
         const res = await dispatchClientCapsule(malformedParams as any);
         expect(res).not.toBeNull();
         expect(res?.message).toBe(
-            'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'
+            'No pude completar esa consulta en este momento. Podemos intentarlo de nuevo o, si me dices el modelo que tienes, te ayudo a ubicar la refacción.'
         );
     });
 });
diff --git a/src/services/__tests__/turn-advisory.test.ts b/src/services/__tests__/turn-advisory.test.ts
index d6ab9ef2..3acbdbeb 100644
--- a/src/services/__tests__/turn-advisory.test.ts
+++ b/src/services/__tests__/turn-advisory.test.ts
@@ -127,7 +127,7 @@ describe('turn-advisory service', () => {
             expect(resultSlug.intent).toBe('info');
             expect(resultSlug.capsule_contract?.next_step_view).toEqual({
                 family: 'KEEP_EXPLORING',
-                guidance: 'Dime el producto exacto o abre la ficha de producto para agregarlo al carrito.',
+                guidance: 'Dime cuál es o selecciónala desde su ficha para no agregar la equivocada.',
                 surfaceKind: 'INFORMATIONAL',
                 primaryAction: null,
                 secondaryAction: null,
@@ -223,7 +223,7 @@ describe('turn-advisory service', () => {
             const result = convertCartOperatorToAdvisoryCta(message);
 
             expect(result.intent).toBe('info');
-            expect(result.content).toBe('No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.');
+            expect(result.content).toBe('Claro, te ayudo. Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha.');
         });
 
         it('general fallback neutralizes any pre-existing ADD_TO_CART action in next_step_view', () => {
diff --git a/src/services/concierge/capsule-dispatcher.ts b/src/services/concierge/capsule-dispatcher.ts
index 5c0de464..cc8918fa 100644
--- a/src/services/concierge/capsule-dispatcher.ts
+++ b/src/services/concierge/capsule-dispatcher.ts
@@ -28,7 +28,7 @@ export async function dispatchClientCapsule(
     } catch (error) {
         console.error('[CapsuleDispatcher] Handler or dispatch failure:', error);
         return {
-            message: 'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.',
+            message: 'No pude completar esa consulta en este momento. Podemos intentarlo de nuevo o, si me dices el modelo que tienes, te ayudo a ubicar la refacción.',
             intent: 'info',
             turn_analysis: params.turnAnalysis,
             catalog_gate: params.catalogGate,
diff --git a/src/services/concierge/handlers/product-search-integrity.handler.ts b/src/services/concierge/handlers/product-search-integrity.handler.ts
index 5b189bb6..69cc83d7 100644
--- a/src/services/concierge/handlers/product-search-integrity.handler.ts
+++ b/src/services/concierge/handlers/product-search-integrity.handler.ts
@@ -101,7 +101,7 @@ export const handleProductSearchIntegrity = async (
     }
     capsuleContract.attachment_offer = attachmentOffer ?? undefined;
     const productSearchMessageSeed = actionableConversation.message || adaptiveConversation.message || capsuleContract.customer_response_draft || '';
-    const compactBaseMessage = compactCesarinCopy(productSearchMessageSeed, 2);
+    const compactBaseMessage = compactCesarinCopy(productSearchMessageSeed, 8);
     const compactNextStepGuidance = compactCesarinCopy(actionableConversation.nextStep.guidance, 1);
     const renderableNextStepGuidance = compactNextStepGuidance
         && isMeaningfullyDistinct(compactBaseMessage, compactNextStepGuidance)
diff --git a/src/services/concierge/handlers/storefront-budget-rescue.handler.ts b/src/services/concierge/handlers/storefront-budget-rescue.handler.ts
index 170bd341..362d09cc 100644
--- a/src/services/concierge/handlers/storefront-budget-rescue.handler.ts
+++ b/src/services/concierge/handlers/storefront-budget-rescue.handler.ts
@@ -59,7 +59,7 @@ export const handleStorefrontBudgetRescue = async (
     });
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
     const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
     const renderableNextStepGuidance = compactNextStepGuidance
@@ -133,11 +133,11 @@ export const handleStorefrontBudgetRescue = async (
             turnAnalysis: budgetTurnAnalysis,
             sourceContext,
         }),
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
 
     return {
-        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
+        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', 8),
         suggestedProducts: visibleProducts,
         intent: 'recommendation',
         turn_analysis: budgetTurnAnalysis,
diff --git a/src/services/concierge/handlers/storefront-compatibility-check.handler.ts b/src/services/concierge/handlers/storefront-compatibility-check.handler.ts
index e0ab9c7f..51ae054e 100644
--- a/src/services/concierge/handlers/storefront-compatibility-check.handler.ts
+++ b/src/services/concierge/handlers/storefront-compatibility-check.handler.ts
@@ -64,7 +64,7 @@ export const handleStorefrontCompatibilityCheck = async (
 
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
     const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
     const renderableNextStepGuidance = compactNextStepGuidance
@@ -139,11 +139,11 @@ export const handleStorefrontCompatibilityCheck = async (
             turnAnalysis: compatibilityTurnAnalysis,
             sourceContext,
         }),
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
 
     return {
-        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
+        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', 8),
         suggestedProducts: visibleProducts,
         intent: 'info',
         turn_analysis: compatibilityTurnAnalysis,
diff --git a/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts b/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
index c06f38e8..d578d20f 100644
--- a/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
+++ b/src/services/concierge/handlers/storefront-inventory-outlook.handler.ts
@@ -63,7 +63,7 @@ export const handleStorefrontInventoryOutlook = async (
 
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
     const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
     const renderableNextStepGuidance = compactNextStepGuidance
@@ -142,11 +142,11 @@ export const handleStorefrontInventoryOutlook = async (
             turnAnalysis: inventoryTurnAnalysis,
             sourceContext,
         }),
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
 
     return {
-        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
+        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', 8),
         suggestedProducts: visibleProducts,
         intent: 'info',
         turn_analysis: inventoryTurnAnalysis,
diff --git a/src/services/concierge/handlers/storefront-kitting-basket.handler.ts b/src/services/concierge/handlers/storefront-kitting-basket.handler.ts
index af396aad..d0ef53f6 100644
--- a/src/services/concierge/handlers/storefront-kitting-basket.handler.ts
+++ b/src/services/concierge/handlers/storefront-kitting-basket.handler.ts
@@ -60,7 +60,7 @@ export const handleStorefrontKittingBasket = async (
     });
     const compactBaseMessage = compactCesarinCopy(
         adaptiveConversation.message || capsuleContract.customer_response_draft || '',
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
     const compactNextStepGuidance = compactCesarinCopy(adaptiveConversation.nextStep.guidance, 1);
     const renderableNextStepGuidance = compactNextStepGuidance
@@ -135,11 +135,11 @@ export const handleStorefrontKittingBasket = async (
             turnAnalysis: kitTurnAnalysis,
             sourceContext,
         }),
-        visibleProducts.length > 0 ? 2 : 3,
+        8,
     );
 
     return {
-        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', visibleProducts.length > 0 ? 2 : 3),
+        message: compactCesarinCopy(finalMessage || capsuleContract.customer_response_draft || '', 8),
         suggestedProducts: visibleProducts,
         intent: 'recommendation',
         turn_analysis: kitTurnAnalysis,
diff --git a/src/services/concierge/turn-advisory.ts b/src/services/concierge/turn-advisory.ts
index 9cfaa888..7551515e 100644
--- a/src/services/concierge/turn-advisory.ts
+++ b/src/services/concierge/turn-advisory.ts
@@ -58,12 +58,12 @@ export function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMess
             return {
                 ...message,
                 intent: 'info',
-                content: 'No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.',
+                content: 'Claro, te ayudo. Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha.',
                 capsule_contract: {
                     ...contract,
                     next_step_view: {
                         family: 'KEEP_EXPLORING',
-                        guidance: 'Dime el producto exacto o abre la ficha de producto para agregarlo al carrito.',
+                        guidance: 'Dime cuál es o selecciónala desde su ficha para no agregar la equivocada.',
                         surfaceKind: 'INFORMATIONAL',
                         primaryAction: null,
                         secondaryAction: null,
@@ -128,7 +128,7 @@ export function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMess
             ...message.capsule_contract,
             next_step_view: {
                 family: 'KEEP_EXPLORING',
-                guidance: 'Dime el producto exacto o abre la ficha de producto para agregarlo al carrito.',
+                guidance: 'Dime cuál es o selecciónala desde su ficha para no agregar la equivocada.',
                 surfaceKind: 'INFORMATIONAL',
                 primaryAction: null,
                 secondaryAction: null,
@@ -140,7 +140,7 @@ export function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMess
     return {
         ...message,
         intent: 'info',
-        content: 'No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.',
+        content: 'Claro, te ayudo. Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha.',
         capsule_contract: sanitizedContract,
     };
 }
diff --git a/supabase/functions/_shared/llm-provider.ts b/supabase/functions/_shared/llm-provider.ts
new file mode 100644
index 00000000..7bd6bdc4
--- /dev/null
+++ b/supabase/functions/_shared/llm-provider.ts
@@ -0,0 +1,344 @@
+/**
+ * llm-provider.ts
+ *
+ * Multi-provider LLM Adapter for VSM Store Edge Functions.
+ * 
+ * Supports:
+ * - Primary: OpenRouter Chat Completions (openai/gpt-6-luna-pro)
+ *   - Compatible with OpenAI Chat Completions protocol
+ *   - Native prompt caching prefix support
+ *   - reasoning_effort: 'low' for snappy concierge responses
+ *   - Streaming SSE transformation into unified format
+ * - Resilient Fallback: Google Gemini API (gemini-api.ts)
+ *   - Automatically activates if OPENROUTER_API_KEY is missing or on 4xx/5xx/network errors
+ * - Isolated Embeddings:
+ *   - Embeddings ALWAYS use geminiEmbedText with gemini-embedding-001 (768 dimensions)
+ *     to preserve PostgreSQL pgvector index compatibility.
+ */
+
+import {
+  geminiGenerateContent,
+  geminiStreamGenerateContent,
+  geminiEmbedText,
+  GEMINI_EMBEDDING_MODEL,
+  GEMINI_EMBEDDING_DIMENSIONALITY,
+} from './gemini-api.ts';
+
+export { geminiEmbedText, GEMINI_EMBEDDING_MODEL, GEMINI_EMBEDDING_DIMENSIONALITY };
+
+const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
+export const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-6-luna-pro';
+
+export interface LlmChatMessage {
+  role: 'system' | 'user' | 'assistant';
+  content: string;
+}
+
+export interface LlmCompletionOptions {
+  systemPrompt: string;
+  userPrompt: string;
+  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
+  temperature?: number;
+  reasoningEffort?: 'low' | 'medium' | 'high';
+  signal?: AbortSignal;
+  geminiFallback: {
+    apiKey: string;
+    model: string;
+    body: Record<string, unknown>;
+  };
+}
+
+export interface LlmProviderTelemetryMetadata {
+  provider: 'openrouter' | 'gemini';
+  model: string;
+  prompt_tokens?: number;
+  completion_tokens?: number;
+  total_tokens?: number;
+  cached_tokens?: number;
+  cache_hit?: boolean;
+  latency_ms: number;
+}
+
+/**
+ * Returns true if an OpenRouter API key is configured in the environment.
+ */
+export function isOpenRouterConfigured(): boolean {
+  const key = Deno.env.get('OPENROUTER_API_KEY');
+  return typeof key === 'string' && key.trim().length > 0;
+}
+
+/**
+ * Resolves the active model to request from OpenRouter.
+ */
+export function getOpenRouterModel(): string {
+  return Deno.env.get('CONCIERGE_LLM_MODEL')?.trim() || DEFAULT_OPENROUTER_MODEL;
+}
+
+/**
+ * Executes a non-streaming LLM completion with automatic fallback to Gemini.
+ */
+export async function generateLlmCompletion(
+  options: LlmCompletionOptions,
+): Promise<{
+  response: Response;
+  data: Record<string, unknown>;
+  rawText: string;
+  telemetry: LlmProviderTelemetryMetadata;
+}> {
+  const startTime = Date.now();
+  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')?.trim();
+
+  if (openRouterKey) {
+    const model = getOpenRouterModel();
+    const messages: LlmChatMessage[] = [
+      { role: 'system', content: options.systemPrompt },
+      ...(options.history || []).map((h) => ({
+        role: h.role,
+        content: h.content,
+      })),
+      { role: 'user', content: options.userPrompt },
+    ];
+
+    try {
+      const openRouterRes = await fetch(OPENROUTER_API_URL, {
+        method: 'POST',
+        headers: {
+          'Content-Type': 'application/json',
+          'Authorization': `Bearer ${openRouterKey}`,
+          'HTTP-Referer': 'https://vsmstore.com',
+          'X-Title': 'VSM Store Concierge Cesarin',
+        },
+        body: JSON.stringify({
+          model,
+          messages,
+          temperature: options.temperature ?? 0.4,
+          response_format: { type: 'json_object' },
+          reasoning_effort: options.reasoningEffort ?? 'low',
+        }),
+        signal: options.signal,
+      });
+
+      if (openRouterRes.ok) {
+        const result = await openRouterRes.json();
+        const rawContent = result.choices?.[0]?.message?.content || '{}';
+        const cachedTokens = result.usage?.prompt_tokens_details?.cached_tokens ?? 0;
+        const latencyMs = Date.now() - startTime;
+
+        // Wrap in Gemini-compatible candidate shape for downstream consumers
+        const normalizedData: Record<string, unknown> = {
+          candidates: [
+            {
+              content: {
+                parts: [{ text: rawContent }],
+              },
+            },
+          ],
+          usageMetadata: {
+            promptTokenCount: result.usage?.prompt_tokens ?? 0,
+            candidatesTokenCount: result.usage?.completion_tokens ?? 0,
+            totalTokenCount: result.usage?.total_tokens ?? 0,
+            cachedContentTokenCount: cachedTokens,
+          },
+          provider: 'openrouter',
+          model: result.model || model,
+        };
+
+        return {
+          response: openRouterRes,
+          data: normalizedData,
+          rawText: rawContent,
+          telemetry: {
+            provider: 'openrouter',
+            model: result.model || model,
+            prompt_tokens: result.usage?.prompt_tokens,
+            completion_tokens: result.usage?.completion_tokens,
+            total_tokens: result.usage?.total_tokens,
+            cached_tokens: cachedTokens,
+            cache_hit: cachedTokens > 0,
+            latency_ms: latencyMs,
+          },
+        };
+      }
+
+      console.warn(JSON.stringify({
+        event: 'openrouter_fallback_trigger',
+        status: openRouterRes.status,
+        message: 'OpenRouter non-OK response, falling back to Gemini',
+        timestamp: new Date().toISOString(),
+      }));
+    } catch (err: unknown) {
+      if (err instanceof Error && err.name === 'AbortError') {
+        throw err;
+      }
+      console.warn(JSON.stringify({
+        event: 'openrouter_network_fallback',
+        error: err instanceof Error ? err.message : String(err),
+        timestamp: new Date().toISOString(),
+      }));
+    }
+  }
+
+  // ═══ FALLBACK: GOOGLE GEMINI ═══
+  const geminiRes = await geminiGenerateContent({
+    apiKey: options.geminiFallback.apiKey,
+    model: options.geminiFallback.model,
+    body: options.geminiFallback.body as any,
+    signal: options.signal,
+  });
+
+  const latencyMs = Date.now() - startTime;
+  let geminiData: Record<string, unknown> = {};
+  let rawText = '{}';
+
+  if (geminiRes.ok) {
+    geminiData = await geminiRes.json();
+    rawText = (geminiData as any)?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
+  }
+
+  return {
+    response: geminiRes,
+    data: geminiData,
+    rawText,
+    telemetry: {
+      provider: 'gemini',
+      model: options.geminiFallback.model,
+      prompt_tokens: (geminiData as any)?.usageMetadata?.promptTokenCount,
+      completion_tokens: (geminiData as any)?.usageMetadata?.candidatesTokenCount,
+      total_tokens: (geminiData as any)?.usageMetadata?.totalTokenCount,
+      cached_tokens: (geminiData as any)?.usageMetadata?.cachedContentTokenCount ?? 0,
+      cache_hit: ((geminiData as any)?.usageMetadata?.cachedContentTokenCount ?? 0) > 0,
+      latency_ms: latencyMs,
+    },
+  };
+}
+
+/**
+ * Executes a streaming LLM completion with automatic fallback to Gemini.
+ * Returns a Response whose body is an SSE stream emitting Gemini-compatible candidate chunks
+ * so the downstream reader handles incremental "text" events without changes.
+ */
+export async function streamLlmCompletion(
+  options: LlmCompletionOptions,
+): Promise<Response> {
+  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')?.trim();
+
+  if (openRouterKey) {
+    const model = getOpenRouterModel();
+    const messages: LlmChatMessage[] = [
+      { role: 'system', content: options.systemPrompt },
+      ...(options.history || []).map((h) => ({
+        role: h.role,
+        content: h.content,
+      })),
+      { role: 'user', content: options.userPrompt },
+    ];
+
+    try {
+      const openRouterStreamRes = await fetch(OPENROUTER_API_URL, {
+        method: 'POST',
+        headers: {
+          'Content-Type': 'application/json',
+          'Authorization': `Bearer ${openRouterKey}`,
+          'HTTP-Referer': 'https://vsmstore.com',
+          'X-Title': 'VSM Store Concierge Cesarin',
+        },
+        body: JSON.stringify({
+          model,
+          messages,
+          temperature: options.temperature ?? 0.4,
+          response_format: { type: 'json_object' },
+          reasoning_effort: options.reasoningEffort ?? 'low',
+          stream: true,
+        }),
+        signal: options.signal,
+      });
+
+      if (openRouterStreamRes.ok && openRouterStreamRes.body) {
+        // Transform OpenRouter SSE chunks into Gemini-candidate SSE chunks
+        const { readable, writable } = new TransformStream();
+        const writer = writable.getWriter();
+        const encoder = new TextEncoder();
+        const reader = openRouterStreamRes.body.getReader();
+        const decoder = new TextDecoder();
+
+        (async () => {
+          let buffer = '';
+          try {
+            while (true) {
+              const { value, done } = await reader.read();
+              if (done) break;
+              buffer += decoder.decode(value, { stream: true });
+              const lines = buffer.split('\n');
+              buffer = lines.pop() ?? '';
+
+              for (const line of lines) {
+                const trimmed = line.trim();
+                if (!trimmed || !trimmed.startsWith('data:')) continue;
+                if (trimmed === 'data: [DONE]') continue;
+
+                try {
+                  const dataStr = trimmed.slice(5).trim();
+                  const parsed = JSON.parse(dataStr);
+                  const delta = parsed.choices?.[0]?.delta?.content;
+                  if (typeof delta === 'string') {
+                    // Emit Gemini-compatible SSE line
+                    const geminiCompatChunk = {
+                      candidates: [
+                        {
+                          content: {
+                            parts: [{ text: delta }],
+                          },
+                        },
+                      ],
+                    };
+                    await writer.write(
+                      encoder.encode(`data: ${JSON.stringify(geminiCompatChunk)}\n\n`),
+                    );
+                  }
+                } catch {
+                  // Non-JSON line or keep-alive; ignore
+                }
+              }
+            }
+            await writer.close();
+          } catch (err) {
+            await writer.abort(err);
+          }
+        })();
+
+        return new Response(readable, {
+          status: 200,
+          headers: {
+            'Content-Type': 'text/event-stream',
+            'X-VSM-LLM-Provider': 'openrouter',
+            'X-VSM-LLM-Model': model,
+          },
+        });
+      }
+
+      console.warn(JSON.stringify({
+        event: 'openrouter_stream_fallback',
+        status: openRouterStreamRes.status,
+        message: 'OpenRouter stream non-OK response, falling back to Gemini',
+        timestamp: new Date().toISOString(),
+      }));
+    } catch (err: unknown) {
+      if (err instanceof Error && err.name === 'AbortError') {
+        throw err;
+      }
+      console.warn(JSON.stringify({
+        event: 'openrouter_stream_network_fallback',
+        error: err instanceof Error ? err.message : String(err),
+        timestamp: new Date().toISOString(),
+      }));
+    }
+  }
+
+  // ═══ FALLBACK: GOOGLE GEMINI SSE ═══
+  return geminiStreamGenerateContent({
+    apiKey: options.geminiFallback.apiKey,
+    model: options.geminiFallback.model,
+    body: options.geminiFallback.body as any,
+    signal: options.signal,
+  });
+}
diff --git a/supabase/functions/customer-intelligence/handlers/concierge-chat.ts b/supabase/functions/customer-intelligence/handlers/concierge-chat.ts
index 77a2fdef..49cfc44f 100644
--- a/supabase/functions/customer-intelligence/handlers/concierge-chat.ts
+++ b/supabase/functions/customer-intelligence/handlers/concierge-chat.ts
@@ -36,6 +36,10 @@ import {
     geminiStreamGenerateContent,
     getGeminiRuntimePolicy,
 } from '../../_shared/gemini-api.ts'
+import {
+    generateLlmCompletion,
+    streamLlmCompletion,
+} from '../../_shared/llm-provider.ts'
 
 import { SYSTEM_PERSONA, VSM_OPERATIONAL_RULES, RESPONSE_FORMAT_RULES, RESPONSE_SHAPE_RULES, buildCesarinNonHollowFallbackText, compactCesarinResponseText } from '../persona.ts'
 import { buildDegradedPolicyInquiryFallback } from '../policy-degraded-fallback.ts'
@@ -1019,7 +1023,7 @@ export async function handleConciergeChat(
                 `PRIORIDAD: ${turnProfile.turn_priority.join(' > ')}`,
                 `DECISION DEL TURNO: ${turnProfile.current_turn_decision}`,
                 `FOCO: ${turnProfile.turn_focus}`,
-                `REGLA DE TURNO:\n- Responde directo cuando baste.\n- Pregunta solo por el dato minimo util.\n- Resuelve primero el intent principal del turno actual.\n- Si hay intents secundarios, dejalos como cola natural y no los mezcles todos en una sola salida.\n- Si el cliente cambio de carril, sigue el carril del turno actual y no la inercia del historial.\n- Si no hubo verdad real de catalogo, politica, tracking, compatibilidad o contexto web publico util, no inventes.\n- Haz una sola jugada central por turno.\n- Usa maximo dos frases cortas cuando alcance.\n- Usa maximo una pregunta.\n- No repitas la misma recomendacion en respuesta, resumen y cierre.\n- No cierres con empuje comercial por reflejo.`,
+                `REGLA DE TURNO:\n- Responde directo cuando baste.\n- Da a cada respuesta el espacio que necesite: breve para algo sencillo y más explicativa para una comparación, compatibilidad o decisión con matices.\n- Resuelve primero el intent principal del turno actual con datos confirmados.\n- Si hay intents secundarios, déjalos como cola natural y no los mezcles todos en una sola salida.\n- Si el cliente cambió de carril, sigue el carril del turno actual y no la inercia del historial.\n- Si no hubo verdad real de catálogo, política, tracking, compatibilidad o contexto web público útil, no inventes.\n- Prioriza una recomendación principal clara; si el cliente pide comparar, explica la diferencia que sí cambia la decisión.\n- Pregunta únicamente el dato que realmente impida avanzar.\n- No repitas la misma recomendación en respuesta, resumen y cierre.\n- No cierres con empuje comercial por reflejo.`,
                 `--- CATALOG GATE ---\nABIERTO: ${catalogGate.is_open ? 'SI' : 'NO'}\nRAZON: ${catalogGate.reason}\nREGLA DE CATALOGO:\n- Si el gate esta cerrado, no muestres tarjetas, recuperacion aproximada ni siguiente paso de producto.\n- Si el gate esta abierto, puedes usar catalogo solo para resolver mejor el turno actual.`,
                 `CLIENTE: "${query || 'Audio Context'}"`
             ];
@@ -1416,7 +1420,15 @@ export async function handleConciergeChat(
                         
                         let streamRes: Response;
                         if (!shouldShortCircuitClarification) {
-                            streamRes = await geminiStreamGenerateContent({ ...geminiOptions, signal: controller.signal });
+                            streamRes = await streamLlmCompletion({
+                                systemPrompt: sommelierSystemPrompt,
+                                userPrompt: sommelierUserPromptBlocks.filter(Boolean).join('\n\n'),
+                                history: Array.isArray(history) ? history.slice(-6) : [],
+                                temperature: 0.4,
+                                reasoningEffort: 'low',
+                                signal: controller.signal,
+                                geminiFallback: geminiOptions,
+                            });
                         } else {
                             streamRes = new Response('');
                         }
@@ -1496,19 +1508,26 @@ export async function handleConciergeChat(
                     try {
                         const controller = new AbortController();
                         const timeoutId = setTimeout(() => controller.abort(), 25000);
-                        sommelierResponse = await geminiGenerateContent({ ...geminiOptions, signal: controller.signal });
+                        const completion = await generateLlmCompletion({
+                            systemPrompt: sommelierSystemPrompt,
+                            userPrompt: sommelierUserPromptBlocks.filter(Boolean).join('\n\n'),
+                            history: Array.isArray(history) ? history.slice(-6) : [],
+                            temperature: 0.4,
+                            reasoningEffort: 'low',
+                            signal: controller.signal,
+                            geminiFallback: geminiOptions,
+                        });
                         clearTimeout(timeoutId);
+                        sommelierResponse = completion.response;
+                        sommelierResult = completion.data;
+                        rawText = completion.rawText;
 
                         if (sommelierResponse.status === 429) {
                             sommelier_gemini_error = 'Sommelier rate limit (429)';
                         } else if (sommelierResponse.status >= 500) {
                             sommelier_gemini_error = `Sommelier server error (${sommelierResponse.status})`;
                         } else if (!sommelierResponse.ok) {
-                            sommelierResult = await sommelierResponse.json();
-                            sommelier_gemini_error = sommelierResult.error?.message || `HTTP ${sommelierResponse.status}`;
-                        } else {
-                            sommelierResult = await sommelierResponse.json();
-                            rawText = sommelierResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
+                            sommelier_gemini_error = (sommelierResult as any)?.error?.message || `HTTP ${sommelierResponse.status}`;
                         }
                     } catch (e: unknown) {
                         const msg = e instanceof Error ? e.message : String(e);
diff --git a/supabase/functions/customer-intelligence/persona.ts b/supabase/functions/customer-intelligence/persona.ts
index 6f08c33e..483704be 100644
--- a/supabase/functions/customer-intelligence/persona.ts
+++ b/supabase/functions/customer-intelligence/persona.ts
@@ -3,58 +3,53 @@
  * Stage 2: Natural, empathetic, WOW-factor concierge.
  */
 
-export const SYSTEM_PERSONA = `
-IDENTIDAD
-Eres Cesar, el asistente estrella de la tienda de VSM Store. Te dicen Cesarin.
-Tu personalidad es humana, cálida, empática y sumamente útil. Buscas dar un efecto "WOW" por lo bien que entiendes al cliente.
-Suenas como un vendedor experto de total confianza: cercano, sereno, muy inteligente y dispuesto a escuchar.
-Hablas con naturalidad y seguridad. No eres un robot, eres el mejor concierge posible.
-Si algo te agarra en curva, lo dices claro pero siempre ofreces una salida útil y amable.
-Hablas español mexicano ligero, de forma muy natural (por ejemplo, usando "qué onda", "va", "claro", "listo", pero sin exagerar ni hacer show).
-Muestra calidez. Puedes usar frases amables como "Si gustas te muestro...", "Con gusto te ayudo con eso...", o "Cualquier cosa me dices".
-Nunca suenes como un bot disciplinado. Eres genuino y servicial.
-`;
+export const PROMPT_VERSION = 'cesarin_v1_202610';
 
-export const VSM_OPERATIONAL_RULES = `
-VERDAD Y LIMITES
-- Usa solo productos, politicas, stock, tracking y acciones que el sistema realmente te muestre.
-- Si un producto no aparece en el catalogo real, no existe para esta conversacion.
-- No inventes marcas, compatibilidades, disponibilidad ni promesas que no puedas cumplir.
-- Si algo no esta confirmado, dilo amablemente.
+export const SYSTEM_PERSONA = `<!-- prompt_version: ${PROMPT_VERSION} -->
+IDENTIDAD
+Eres César (“Cesarin”), asesor de mostrador de VSM Store. Hablas en español
+mexicano natural: cercano, claro y respetuoso. Conoces la categoría, escuchas
+lo que pide la persona y explicas tu criterio sin sonar a guion ni exagerar
+modismos. No te presentas como humano ni afirmas haber hecho acciones que no hiciste.
 
-MEMORIA
-- Tienes memoria de las preferencias del cliente. Úsala para hacerlo sentir especial y escuchado.
-- Lo que el cliente diga hoy manda sobre cualquier senal pasada.
-- Si retomas contexto reciente, hazlo de forma cálida ("Por cierto, veo que te gusta la menta...").
+CÓMO AYUDAS
+Responde primero a la intención del cliente. Cuando recomiendes, di qué opción
+encaja mejor y por qué, usando solo información confirmada. Si hay una diferencia
+importante entre opciones, explícala con sencillez. Pregunta únicamente por el
+dato que realmente impida avanzar; si puedes ayudar sin preguntar, hazlo.
 
-CAPACIDADES
-- Responde directo cuando baste.
-- Si necesitas un dato para ayudarlo mejor, hazle una pregunta clara y amable.
-- Si la salida mas honesta es WhatsApp para soporte humano, ofrécelo con gusto ("Si prefieres, te paso a un asesor por WhatsApp para que te atienda personalmente...").
+Da a cada respuesta el espacio que necesite: breve para algo sencillo y más
+explicativa para una comparación, compatibilidad o decisión con matices.
+Evita repeticiones, cierres de venta automáticos y muletillas. Puedes usar
+expresiones mexicanas naturales cuando encajen; no las fuerces.
 
-RESPUESTA
-- Estructura tus respuestas de manera conversacional y fluida.
-- Si el cliente duda, primero baja friccion con empatía y luego orienta con seguridad.
-- Si recomiendas algo, da una razon concreta y humana (ej. "Te recomiendo este porque tira muy buen vapor y la batería dura todo el día").
-- Si toca cerrar, hazlo natural. Despídete bien o deja la puerta abierta ("Cualquier duda, aquí sigo").
+FRONTERA DE DATOS Y ACCIONES
+El catálogo, disponibilidad, precio, compatibilidad y políticas se rigen por
+los datos y validaciones autorizados para este turno. No completes huecos con
+suposiciones. No prometas apartados, cambios de carrito, descuentos, entregas
+ni confirmaciones de pago sin el resultado correspondiente de la herramienta
+autorizada. Si falta un dato, dilo con naturalidad y ofrece el siguiente paso
+que sí puedes realizar.
 
-NEGOCIO REAL
-- Pagos: solo transferencia o deposito bancario.
-- Envios: DHL Express a sucursal ocurre.
-- Tiempos: pedidos salen el mismo dia si se paga antes de las 5 PM, hora central de Mexico.
-- Inventario: no hay apartados y cambia rapido.
+Si una opción no está habilitada por el catálogo o las reglas operativas, no la
+recomiendes ni la presentes como disponible. Mantén las restricciones de edad,
+cumplimiento y comunicación comercial aplicables.
+`;
 
-REGLAS DE DECISIÓN
-- Si el cliente pide algo para dejar de fumar, prioriza opciones reales de inicio como pods o perfiles tabaco/mentol si el sistema las muestra.
-- Si una coincidencia es aproximada, dilo como aproximacion.
-- Si algo esta agotado, dilo antes de sugerir alternativas reales.
-- En disponibilidad o inventario, di primero el estado actual.
+export const VSM_OPERATIONAL_RULES = `
+POLÍTICAS OPERATIVAS DE VSM STORE:
+- Pagos: únicamente transferencia o depósito bancario.
+- Envíos: DHL Express a sucursal ocurre en todo México.
+- Tiempos: pedidos confirmados y pagados antes de las 5:00 PM (hora CDMX) se despachan el mismo día hábil.
+- Inventario: inventario dinámico en mostrador; no se realizan apartados sin comprobante.
+- Garantías y Soporte: atención directa por WhatsApp para seguimiento posventa.
+- Catálogo: si el catálogo no contiene un producto o variante, trátalo como no disponible hoy.
 `;
 
 export const RESPONSE_FORMAT_RULES = `
 Tu respuesta DEBE ser un objeto JSON válido con la siguiente estructura:
 {
-  "text": "Tu respuesta conversacional y empática al cliente.",
+  "text": "Tu respuesta conversacional, natural y empática al cliente.",
   "intent": "El intent principal detectado",
   "products": [],
   "recommended_products": [],
@@ -64,15 +59,15 @@ Tu respuesta DEBE ser un objeto JSON válido con la siguiente estructura:
 `;
 
 export const RESPONSE_SHAPE_RULES = `
-- Responde de forma completa pero conversacional.
-- No te limites artificialmente. Usa las oraciones que necesites para sonar cálido y claro.
-- Si tienes que dar instrucciones, usa listas o pasos claros.
+- Responde de forma completa y conversacional, adaptando la longitud a la complejidad del turno.
+- No te limites artificialmente a dos frases ni a una fórmula rígida.
+- Si recomiendas, explica la razón concreta con datos confirmados.
+- Si comparas, marca la diferencia que sí cambia la decisión.
 `;
 
 export function compactCesarinResponseText(input: string): string {
     const normalized = (input || '').replace(/\s+/g, ' ').trim();
     if (!normalized) return '';
-    // Deprecated anti-bloat regexes removed for natural flow.
     return normalized;
 }
 
@@ -84,8 +79,8 @@ export function buildCesarinNonHollowFallbackText(input: {
     
     if (query) {
         const topic = query.length > 90 ? `${query.slice(0, 87).trim()}...` : query;
-        return `¡Ups! Me agarraste un poco en curva con "${topic}". ¿Me podrías dar un poquito más de detalle para ayudarte bien?`;
+        return `No pude completar esa consulta sobre "${topic}" en este momento. Podemos intentarlo de nuevo o, si me dices qué modelo tienes, te oriento con gusto.`;
     }
 
-    return '¡Ups! Me perdí un poco. ¿Me dices si buscas algún producto, información de envío o ayuda con tu pedido para orientarte mejor?';
+    return 'No pude procesar tu consulta en este momento. ¿Me dices si buscas algún producto, información de envío o ayuda con tu pedido para orientarte mejor?';
 }

```

---

## 3. ESTRUCTURA REQUERIDA DE TU DICTAMEN

Por favor emite tu dictamen en Markdown profesional estructurado:
1. **Dictamen Ejecutivo Global:** Veredicto formal (`ACCEPT`, `REJECT` o `ACCEPT WITH RESIDUAL RISK`) con justificación de alto nivel.
2. **Evaluación Maníaca por Ejes:**
   - Eje 1 (Voz, Calidez y Eliminación de los 5 Pecados).
   - Eje 2 (Seguridad, Catalog Gate y Carrito).
   - Eje 3 (Multi-Provider Adapter y Fallback Gemini).
   - Eje 4 (Prompt Caching y Estructura de Prompts).
3. **Análisis de Casos de Borde y Riesgos Potenciales:**
   - Qué podría salir mal en producción bajo carga extrema, red inestable o respuestas atípicas de Luna Pro.
4. **Scorecard Numérico (1 al 10):**
   - Naturalidad Conversacional
   - Integridad Operativa y Seguridad
   - Arquitectura y Resiliencia del LLM Adapter
   - Eficiencia de Costo y Cacheability
5. **Recomendaciones Operativas para Producción.**
