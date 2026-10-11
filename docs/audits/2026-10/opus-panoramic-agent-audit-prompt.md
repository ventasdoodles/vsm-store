# VSM STORE — CONSULTA ESTRATÉGICA Y AUDITORÍA PANORÁMICA DE CÉSARÍN
## Evaluador: Anthropic Claude Opus 5.5 (Batch Mode - anthropic/claude-opus-5.5-20260921)
## Commit Evaluado: 10323ea5 (rama main de VSM Store)
## Mandato del Product Owner:
> "neta necesito que tenga todo el contexto todo el panorama... y que diga qué rollo:
> necesito que sea un agente amigable, que sepa del negocio, que suene natural,
> que no solo sea alguien que te ayude a comprar si no que también pueda hablar un poco casual
> sin ser un ChatGPT como tal, si no que sea siempre relacionado al negocio no importa a lo que se dedique.
> Recuerda que esto será un sistema personalizable, ¿vale? Ahorita lo haremos con vapeo y 420:
> o sea todo el conocimiento que el modelo ya tenga de eso está chingón y se inyecta el nuevo o qué rollo?
> Pero bueno, me entiendes..."

---

Eres **Claude Opus 5.5**, Chief AI Architect & Strategic Systems Evaluator.
El dueño del producto de VSM Store te está consultando formalmente en modo Batch para obtener un **diagnóstico integral, panorámico y estratégico** sobre **Césarín**, el agente de IA de la tienda.

El usuario no quiere un análisis superficial ni una plantilla corporativa. Necesita que entiendas su visión de producto, destripes la arquitectura que acabamos de implementar, resuelvas sus dilemas de conocimiento e inyección de datos, y emitas tu dictamen técnico y conceptual sobre el rumbo del agente.

---

# 1. LA VISIÓN DEL PRODUCT OWNER Y EL DILEMA DE NEGOCIO

El dueño del proyecto te plantea 4 interrogantes fundamentales:

### A. La Personalidad: "Amigable, conocedor, casual pero siempre en el mostrador"
- **El problema de los dos extremos:**
  - *Extremo 1 (El bot rígido / conmutador):* El agente que solo dice "Elige una opción", "No puedo ayudarte con eso", "Máximo dos oraciones", y suena como un menú telefónico de banco.
  - *Extremo 2 (El ChatGPT genérico / divagador):* El bot que se pone a filosofar sobre la historia del vapeo, escribe párrafos interminables de enciclopedia o se desvía a hablar de fútbol o recetas de cocina perdiendo por completo el rol de mostrador y la intención comercial.
- **Lo que el usuario quiere:** Un verdadero **asistente de mostrador de barrio/tienda especializada**: amigable, con colmillo comercial relajado, que pueda hablar casual y bromear ligeramente en español mexicano auténtico, pero **siempre conectando la charla con el negocio, los productos y la resolución de dudas del cliente**.
- **Pregunta para ti:** ¿Cuál es la arquitectura de prompt y control de turnos óptima para lograr este balance exacto sin caer en ninguno de los dos extremos?

### B. El Dilema del Conocimiento: Pre-entrenado vs. Inyectado vs. Privado
- El usuario plantea: *"Ahorita lo haremos con vapeo y 420: o sea todo el conocimiento que el modelo ya tenga de eso está chingón y se inyecta el nuevo o qué rollo?"*
- **La disyuntiva técnica:**
  1. Los modelos de lenguaje modernos (GPT-6, Opus, Luna, Gemini) **ya tienen un conocimiento enciclopédico vasto** sobre química, anatomía de atomizadores, leyes de ohm, sales de nicotina vs. base libre, perfiles de terpenos, concentrados, extracciones 420 y hardware.
  2. Sin embargo, ese conocimiento pre-entrenado **no conoce** el catálogo específico que VSM Store tiene en inventario en este segundo, qué coils están en bodega hoy, los precios en pesos mexicanos, ni las políticas de transferencia bancaria y envíos por DHL Express a sucursal ocurre.
  3. Si dejas libre al modelo, alucinará marcas o compatibilidades que la tienda no vende. Si lo atas a solo responder del RAG y le prohíbes hablar de lo que ya sabe, sonará como un buscador robotizado de 1999.
- **Pregunta para ti:** ¿Cómo orquestar la frontera entre:
  - (1) **El conocimiento de dominio general del LLM** (pedagogía de vapeo/420, explicaciones de funcionamiento, diferencias de ohmiaje, efectos de perfiles),
  - (2) **La verdad dura del catálogo privado** (stock, precios, variantes existentes vía PostgreSQL pgvector y SQL),
  - (3) **Las políticas operativas del negocio** (envíos, pagos, garantías)?
  ¿Cómo se inyecta o se restringe el conocimiento para que el agente brille educando y recomendando sin inventar stock ni salirse de catálogo?

### C. Sistema White-Label y Personalizable (Multi-Vertical)
- El usuario subraya: *"recuerda que esto será un sistema personalizable, no importa a lo que se dedique... ahorita es vapeo y 420, pero será un sistema para cualquier negocio"*.
- **La meta:** Convertir esta arquitectura en una plataforma que mañana pueda desplegarse para una tienda de café de especialidad, refacciones automotrices, suplementos deportivos o electrónica.
- **Pregunta para ti:** ¿Cómo separar limpiamente el **Core Inmutable del Agente** (motor de streaming, guardrails de carrito, máquina de estados de turnos, aislamiento de DB, adapters LLM) de la **Capa de Personalización de Vertical** (ontología de productos, matriz de compatibilidad, persona y tono cultural de la marca)?

---

# 2. EL PANORAMA COMPLETO: QUÉ SE HA HECHO HASTA HOY

Se acaban de ejecutar 3 fases de transformación y un ciclo de remediación en el commit `10323ea5`:

### 1. Frontend & UX Conversacional:
- **Saludos amables en `src/hooks/useAIConcierge.ts`:** Se reemplazó el saludo paranoico (*"si no me la sé te lo digo sin inventarte cosas"*) por bienvenidas cálidas (*"¡Qué onda! Soy Cesarin. ¿Buscas algo en particular o te ayudo a encontrar una buena opción?"*).
- **Text Utils en `src/lib/cesarin-text-utils.ts`:** Se eliminó la regex que censuraba aperturas de cortesía mexicana como *"si quieres te muestro"*, *"si gustas te paso"*, *"yo arrancaría"*, preservando la amabilidad natural.
- **Fin del recorte destructivo:** En los 5 handlers de storefront (`product-search-integrity`, `storefront-kitting-basket`, `storefront-inventory-outlook`, `storefront-compatibility-check`, `storefront-budget-rescue`), se sustituyó el recorte forzado de 2 oraciones (`compactCesarinCopy(..., 2)`) por un límite natural de 8 oraciones para que Césarín pueda explicar comparativas y compatibilidades.
- **Fallbacks empáticos en `turn-advisory.ts` y `capsule-dispatcher.ts`:** Si el carrito es ambiguo o una herramienta falla, Césarín explica con tacto (*"Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha"*).

### 2. Guardrails Innegociables de Seguridad (Lanes 6, 7 y 8):
- **Catalog Gate:** `catalogGate.is_open` es obligatorio del lado servidor. Si el catálogo está cerrado, `visibleProducts = []` y `compactNextStepView = undefined`.
- **Aislamiento de Carrito:** Cero mutaciones automáticas de carrito en background. Césarín solo propone un CTA consultivo (`ADD_READY`) que exige que el cliente presione el botón para agregar. Sanitización estricta de cantidad [1, 99], sección y slug.
- **Aislamiento de DB en Hooks:** 0 imports en tiempo de ejecución de `@/lib/supabase` en `src/hooks/`. Realtime y health checks aislados en servicios dedicados con timeouts incondicionales.

### 3. Edge Functions & Adaptador Multi-Proveedor (`supabase/functions/_shared/llm-provider.ts`):
- Adaptador para OpenRouter con modelo `openai/gpt-6-luna-pro` (o configurable vía `CONCIERGE_LLM_MODEL`).
- Soporte de streaming SSE con transformación de chunks de OpenRouter hacia la estructura compatible de candidatos.
- Fallback automático hacia Google Gemini (`geminiGenerateContent` / `geminiStreamGenerateContent`) si no hay API key o si la red/HTTP falla.
- Búsqueda vectorial en PostgreSQL pgvector preservada de forma aislada e inmutable en `gemini-embedding-001` (768 dimensiones) en `tools.ts`.

### 4. Prompt Caching en Edge Functions:
- `persona.ts` y `concierge-chat.ts` organizados en 3 bloques de prompt:
  - Bloque 1: Prefijo Estático Congelado versionado (`cesarin_v1_202610`) con identidad, políticas de VSM Store y schema JSON.
  - Bloque 2: Contexto semi-estático de sesión del cliente.
  - Bloque 3: Turno dinámico con tools de catálogo, perfil de turno y mensaje del usuario.
- Eliminación de reglas de micromanagement (*"máximo dos frases"*, *"máximo una pregunta"*).
- Configuración de `reasoning_effort: 'low'` para baja latencia.

---

# 3. EL DICTAMEN PREVIO DE OPENAI SOL PRO BATCH

Hace unos momentos, **OpenAI GPT-6 Sol Pro** en modo Batch procesó este código y emitió su veredicto:
- **Voz y Calidez:** Calificación **8 / 10**. Celebró la naturalidad y la eliminación de los 5 pecados del bot.
- **Veredicto Global:** **`REJECT` para producción inmediata** debido a hallazgos en el adaptador LLM:
  1. *Falla silenciosa en streaming SSE:* Si OpenRouter devuelve HTTP 200 pero el stream se desconecta antes de emitir deltas o envía frames de error SSE, el transformador ignora las líneas y cierra el stream como un 200 vacío.
  2. *Validación síncrona:* Si la respuesta JSON de OpenRouter viene vacía o malformada, se debe validar antes de dar por exitoso el turno para disparar Gemini.
  3. *Eco en fallback de error de `persona.ts`:* Repetir 90 caracteres del query del usuario en un mensaje de error puede repetir datos sensibles.
  4. *Política de apartados en prompt:* Aclarar que no hay apartados bajo ninguna circunstancia.
  5. *Falta de test suite unitario dedicado* para `llm-provider.ts`.

---

# 4. DIFF CONSOLIDADO DEL AGENTE (fb27139a .. HEAD):

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

# 5. REPORTE COMPLETO DE SOL PRO BATCH (PARA TU REFERENCIA):

```markdown
# Auditoría adversarial de Césarín — commit `10323ea5`

**Alcance:** dictamen basado en el diff y los resultados de pruebas declarados en la solicitud. No tuve acceso al repositorio completo, a la configuración desplegada ni a trazas de producción. Por tanto, distingo entre lo que el código mostrado demuestra y las garantías que aún requieren verificación.

## 1. Dictamen ejecutivo global

**Veredicto: `REJECT` para despliegue a producción en su estado actual.**

La Fase 1 mejora de forma convincente la voz de Césarín: deja de disculparse preventivamente, conserva cortesías útiles y permite explicar decisiones técnicas. El rechazo **no** se debe a esa humanización. Se debe principalmente a que el nuevo adaptador LLM presenta rutas de fallo no cubiertas por el fallback prometido —sobre todo después de iniciar un stream— y a que el diff no aporta pruebas suficientes para certificar las garantías absolutas de catálogo, carrito, caché y aislamiento solicitadas.

Esto **no equivale a afirmar que esas barreras estén rotas**. Equivale a no dar por demostrada una propiedad crítica con pruebas que, según el listado presentado, no ejercitan el adaptador ni la integración Edge modificada.

## 2. Evaluación maníaca por ejes

### Eje 1 — Voz, calidez y eliminación de los «5 pecados»

**Balance: favorable, con riesgo controlable de longitud.**

- **Bienvenida:** los dos saludos nuevos retiran la advertencia espontánea sobre equivocarse o inventar. Abren una conversación de servicio sin postura defensiva. «Lo vemos juntos» resulta cercano sin prometer una acción ya realizada.
- **Regex de cierres:** dejar de eliminar expresiones como «si quieres te muestro» corrige una censura excesiva. La nueva regla solo suprime dos cierres vacíos exactos; preserva una oferta que sí puede ser útil. Eso **no demuestra**, por sí solo, deduplicación semántica general: esta depende de las demás funciones y de cómo se componen mensaje y guía.
- **Límite de ocho oraciones:** elimina una guillotina que podía cortar la justificación de una compatibilidad o comparativa. Ocho es un *techo por llamada*, no una instrucción para escribir ocho. Aun así, un flujo que compacte base, guía y mensaje final en etapas puede producir repetición o respuestas largas; faltan pruebas sobre la salida final renderizada, no solo sobre `compactCesarinCopy`.
- **Fallbacks:** el carrito ambiguo suena prudente y servicial; el fallo del dispatcher no revela términos internos. Hay una pequeña fricción de precisión: «veo más de una opción posible» solo es apropiado cuando efectivamente se identificaron varias opciones. Si el mismo texto cubre otras causas de ambigüedad, atribuye al sistema una observación que quizá no hizo.
- **Fallback de `persona.ts`:** citar hasta 90 caracteres de la consulta puede devolver al usuario datos sensibles que escribió y amplificar texto extraño o malicioso en una respuesta de error. No implica por sí mismo una filtración a terceros, pero es innecesario; conviene resumir el tema sin eco literal.

**Conclusión:** el cambio recupera naturalidad sin que el diff muestre una relajación deliberada de las restricciones de verdad.

### Eje 2 — Seguridad, catalog gate, carrito y base de datos

**Balance: garantías críticas no certificables con este material.**

- **`catalogGate.is_open`:** el prompt dice que, con la compuerta cerrada, no se muestren tarjetas ni siguiente paso de producto. Una instrucción al modelo **no constituye una compuerta de servidor**. El diff no muestra la totalidad de las rutas de salida ni una aserción transversal que fuerce `visibleProducts = []` y `compactNextStepView = undefined`. Las pruebas de gates declaradas son una señal positiva, pero no permiten afirmar «100 % innegociable» en todos los handlers y fallbacks.
- **Carrito:** `convertCartOperatorToAdvisoryCta` aparece orientado a neutralizar una acción de carrito ambigua, y sus expectativas de prueba incluyen la neutralización de `ADD_TO_CART`. El diff no muestra el punto de ejecución de `ADD_READY`, la comprobación del clic del cliente ni toda la sanitización de cantidad `[1, 99]`, sección y slug. Por ello, **no puedo certificar imposibilidad absoluta de mutación sin confirmación**; tampoco hay evidencia en este diff de que esta fase haya introducido tal mutación.
- **Aislamiento de Supabase y Realtime:** se declara un suite de aislamiento, pero aquí no aparecen los imports completos de `src/hooks/` ni los callbacks de Realtime y health checks. La garantía de cero imports de runtime y la ausencia de rechazos no capturados requieren inspección o comprobaciones específicas de esos caminos.

**Condición de aceptación:** imponer y probar estas invariantes en el último punto servidor que construye la respuesta o autoriza la acción, independientemente del texto, `intent` o JSON del proveedor.

### Eje 3 — Adaptador OpenRouter, streaming y fallback Gemini

**Balance: integración básica plausible; resiliencia anunciada, incompleta. Es el bloqueo principal.**

**Lo que sí muestra el código:** petición Chat Completions con `Authorization`, `HTTP-Referer`, `X-Title`, `response_format: json_object`, esfuerzo de razonamiento bajo y una transformación de `choices[0].delta.content` a chunks con forma de candidato Gemini. Ante falta de clave o respuesta HTTP no satisfactoria *antes de entregar el stream*, intenta Gemini.

**Hallazgos prioritarios:**

1. **No existe fallback transparente tras comenzar el stream.** En cuanto `streamLlmCompletion` devuelve la `Response` 200 transformada, una desconexión posterior de OpenRouter lleva a `writer.abort(err)`. El consumidor recibe un stream fallido, no uno de Gemini. Reintentar con otro proveedor a mitad de una respuesta tampoco es seguro sin una política explícita para descartar o reconciliar texto parcial.
2. **Los errores SSE pueden convertirse en silencio.** El transformador ignora líneas no JSON y frames JSON sin `choices[0].delta.content`; tampoco verifica una finalización válida. Un evento de error, una respuesta vacía o un stream cortado limpiamente pueden acabar como stream 200 sin contenido útil. Además, el bloque `catch` interno trata cualquier error al procesar un frame como línea ignorable.
3. **El fallback no garantiza continuidad de sesión.** Gemini también puede fallar, devolver un error o exceder el tiempo disponible. Un `AbortError` se relanza deliberadamente —correcto para cancelaciones—, pero contradice una promesa literal de «nunca se cae». En la ruta no streaming, el parseo de JSON y la estructura de `choices` tampoco están validados contra un contrato antes de tratar una respuesta 200 como resultado útil.
4. **Faltan pruebas del contrato real del parser.** El transformador emite deltas como `parts[0].text`; el fragmento presentado no muestra el lector completo de `concierge-chat.ts`. No se puede asegurar continuidad visual sin ensayar chunks partidos entre lecturas, varios eventos por lectura, cierre temprano, errores, `[DONE]` y JSON incompleto con ese lector.
5. **Observabilidad incompleta:** existe metadata de tokens y caché para completions no streaming, pero la ruta streaming retorna únicamente `Response`; en el código mostrado no ofrece métricas equivalentes de uso, latencia, fallo o caché. Los logs de fallback tampoco identifican de forma correlacionable un turno sin comprometer datos personales.
6. **Fallback indiscriminado ante 4xx:** caer a Gemini por cualquier 4xx evita algunos cortes, pero puede ocultar una clave inválida, un modelo mal configurado o un error de formato persistente y elevar costos. Conviene separar fallos transitorios, configuración y solicitudes inválidas.
7. **Embeddings:** el adaptador importa y reexporta `geminiEmbedText` y sus constantes sin sustituirlo por OpenRouter. Eso es compatible con conservar `gemini-embedding-001` y 768 dimensiones, **pero el diff no enseña `tools.ts` ni la definición efectiva de las constantes**. No certifica que cada llamada vectorial siga usando exactamente ese modelo y dimensión.

### Eje 4 — Prompts y prompt caching

**Balance: buena intención estructural; el 100 % de coincidencia y los ahorros no están demostrados.**

- `SYSTEM_PERSONA` tiene marcador de versión y contenido aparentemente estático; separar identidad, políticas y formato de los datos de turno favorece un prefijo reutilizable.
- El código mostrado envía `sommelierSystemPrompt` como mensaje `system`, historial a continuación y `sommelierUserPromptBlocks` como mensaje `user`. **No muestra cómo se ensambla `sommelierSystemPrompt`** ni que las políticas y el schema permanezcan íntegramente en un prefijo idéntico entre solicitudes. Tampoco muestra una frontera implementada de «memoria semi-estática»: el historial anterior al turno puede cambiar en cada llamada.
- Una coincidencia textual del prefijo no garantiza un *cache hit*: cuentan tokenización, umbrales y políticas del proveedor/modelo, enrutamiento y formato efectivo de la petición. `cached_tokens > 0` es una medición útil cuando el proveedor la entrega, no prueba previa de una tasa del 100 %.
- Retirar las órdenes de «dos frases» y «una pregunta» mejora el margen para comparativas. «Pregunta únicamente el dato que realmente impida avanzar» mantiene disciplina sin convertir la conversación en formulario.
- **Revisión de política necesaria:** «no se realizan apartados sin comprobante» puede leerse como que *sí* se hacen apartados con comprobante, mientras el mandato indicado dice «sin apartados». «Se despachan el mismo día hábil» exige validar festivos, confirmación del pago y operación logística. Las políticas estáticas deben ser exactas antes de multiplicarlas mediante caché.

## 3. Casos de borde y riesgos en producción

| Escenario | Posible resultado | Prioridad |
|---|---|---|
| OpenRouter devuelve 200 y corta la conexión tras varios deltas | Respuesta parcial o stream abortado; no hay fallback de mitad de stream | **Alta** |
| OpenRouter envía un evento SSE de error o ningún delta válido | La transformación puede cerrar un stream aparentemente exitoso y vacío | **Alta** |
| OpenRouter falla y Gemini está caído, lento o mal configurado | El fallback también falla; la continuidad no está garantizada | **Alta** |
| Muchos 4xx persistentes bajo carga | Doble tráfico por turno, mayor latencia/costo y ocultamiento de configuración defectuosa | **Alta** |
| Luna Pro devuelve contenido atípico pese a `json_object` | `'{}'` o una estructura inválida puede desplazar el fallo al parser o al fallback conversacional | **Media-alta** |
| El modelo extiende una explicación hasta ocho oraciones y se añade guía separada | Redundancia, coste de tokens y posible saturación móvil | **Media** |
| Cambia la política real sin cambiar el prefijo versionado | Respuestas coherentes pero operativamente falsas, potencialmente repetidas desde caché | **Alta** |

Los **102/102 tests** y el **typecheck sin errores** son la baseline declarada, no una validación independiente. Los suites enumerados no incluyen uno del nuevo `llm-provider.ts` ni pruebas de integración del stream transformado con su consumidor. Además, `tsc --noEmit` del proyecto no demuestra necesariamente que los módulos Deno de Edge estén incluidos en su alcance.

## 4. Scorecard

| Dimensión | Nota / 10 | Motivo |
|---|---:|---|
| Naturalidad conversacional | **8** | Saludos, cortesía y espacio explicativo claramente mejores; falta evaluar salidas completas. |
| Integridad operativa y seguridad | **6** | El diff no evidencia una ruptura, pero tampoco prueba las garantías absolutas exigidas. |
| Arquitectura y resiliencia del adaptador LLM | **4** | Interfaz inicial útil; fallos SSE y fallback posterior a la cabecera sin resolver. |
| Eficiencia de costo y cacheability | **5** | Prefijo estático prometedor; montaje, tasa de aciertos y efecto del doble proveedor sin medir. |

## 5. Recomendaciones operativas para producción

1. **Bloquear el despliegue del adaptador** hasta probar, con el parser real, streams fragmentados, cierre prematuro, frames de error, ausencia de `[DONE]`, deltas vacíos, cancelación y desconexión después del primer token. Definir un resultado explícito para respuesta parcial; no prometer fallback invisible en ese punto.
2. **Añadir validación de respuesta antes de declararla exitosa:** contenido y JSON esperados para completions; estado terminal y errores explícitos para streaming. Establecer timeouts y presupuesto total por turno que incluyan proveedor primario y fallback.
3. **Endurecer la política de fallback:** distinguir 429/5xx/transitorios de errores permanentes de credenciales, modelo o formato; limitar reintentos y registrar provider, motivo, latencia y costo estimado por turno, sin registrar consultas ni claves.
4. **Convertir las barreras en tests de invariantes de extremo a extremo:** gate cerrado implica exactamente cero productos y ningún siguiente paso de producto; ninguna salida del modelo ejecuta carrito; solo el CTA confirmado puede hacerlo y valida cantidad, sección y slug. Incluir fallbacks y respuestas LLM malformadas.
5. **Medir caché, no asumirla:** capturar el prompt ensamblado con datos sensibles redactados o mediante hashes por bloque; comparar prefijos tokenizados y registrar `cached_tokens`, proveedor, modelo, versión de prompt, latencia y coste. Corregir la política de apartados antes de congelar ese prefijo.
6. **Conservar la mejora de voz**, pero probar conversaciones completas —simples, comparativas, ambiguas y fallidas— para detectar afirmaciones no verificadas, preguntas repetidas y respuestas excesivas.

**Decisión final:** aprobar conceptualmente la dirección conversacional; **rechazar la salida a producción del conjunto de fases** hasta cerrar la resiliencia del stream y verificar, en los puntos de ejecución reales, las invariantes operativas declaradas.
```

---

# 6. ESTRUCTURA REQUERIDA DE TU DICTAMEN Y ASESORÍA ESTRATÉGICA

Claude Opus 5.5, entrega un informe profundo, directo, maduro y pragmático abordando:

1. **Visión General y Diagnóstico:**
   - ¿Qué opinas de la evolución de Césarín y de la arquitectura actual?
   - ¿Coincides con el análisis y las alertas técnicas de Sol Pro sobre el streaming y los fallbacks?
2. **La Solución al Dilema del Conocimiento (General vs. Catálogo vs. Políticas):**
   - Cómo estructurar el pipeline cognitivo: ¿Dejamos que el modelo hable de terpenos, ohmios, tipos de resistencias y perfiles de vapor usando su pre-entrenamiento, mientras restringimos estrictamente los productos sugeridos, precios y disponibilidad al catálogo inyectado?
   - Técnicas de Prompt Engineering y "Grounding Híbrido" para lograr que eduque y aconseje como experto sin inventar stock.
3. **El Balance de Personalidad: "Mostrador Cálido sin ser un ChatGPT Aburrido":**
   - Cómo mantener la conversación casual, con chispa y empatía mexicana, pero siempre anclada a resolver la necesidad del cliente y guiar a la compra.
   - Pautas concretas y ejemplos prácticos de cómo Césarín debe responder cuando el usuario saluda, cuando pregunta una curiosidad técnica, cuando duda entre dos opciones, o cuando el producto que busca está agotado.
4. **Diseño de la Plataforma Personalizable (Multi-Vertical / White-Label):**
   - Cómo desacoplar el core del agente para que sirva igual para Vapeo/420 hoy, y mañana para café, suplementos, ropa o electrónica con solo cambiar configuración.
   - Qué módulos deben ser plug-and-play.
5. **Recomendaciones de Implementación Concreta:**
   - Cómo cerrar de forma definitiva los riesgos de streaming y resiliencia que señaló Sol Pro en `llm-provider.ts`.
6. **Veredicto y Próximos Pasos.**
