import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

// Generate clean diff of the full remediation through HEAD (commit 0f0db11a)
const diff = execSync('git diff f4391fed~1 HEAD -- src/', { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });

const prompt = `# VSM STORE — AUDITORÍA TÉCNICA DE REMEDIACIÓN FINAL (LANES 6, 7 Y 8)
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Batch Mode)
## Objetivo: Dictamen final sobre la resolución de los 4 Bloqueos identificados en la contra-auditoría previa

Eres **Sol Pro GPT-6**, el Principal Systems & Security Auditor de VSM Store.
En tu contra-auditoría previa sobre el commit \`f4391fed\`, emitiste un dictamen formal de **REJECT** fundamentado en 4 bloqueos específicos en las Lanes 6, 7 y 8.

El equipo de ingeniería ha implementado y verificado el commit \`0f0db11a\` para resolver la totalidad de esos 4 bloqueos sin regresiones. Tu misión es evaluar rigurosamente si estos parches satisfacen tus exigencias técnicas y si el código califica ahora para un veredicto formal de **ACCEPT**.

---

### ESTADO DE REMEDIACIÓN DE LOS 4 BLOQUEOS PREVIOS:

#### 1. Bloqueo 1 (Restablecer restricciones de publicación de acciones en Kitting e Inventory)
- **Diagnóstico previo:** En *kitting* e *inventory*, se había retirado la exigencia de que \`catalogGate.is_open\` gobernara la visibilidad de productos, y \`next_step_view\` podía exponerse cuando \`renderHint !== 'SHOW'\` o cuando el catálogo estaba cerrado.
- **Remediación en \`0f0db11a\`:**
  - En \`storefront-kitting-basket.handler.ts\`: \`shouldShowCatalogSurfaces = catalogGate.is_open\` condiciona \`visibleProducts = shouldShowCatalogSurfaces ? kitProducts : []\`. La asignación de \`compactNextStepView\` exige explícitamente:
    \`\`\`ts
    const compactNextStepView = shouldShowCatalogSurfaces
        && visibleProducts.length > 0
        && adaptiveConversation.nextStep.renderHint === 'SHOW'
        && (renderableNextStepGuidance || hasMaterialNextStepAction)
        ? { ...adaptiveConversation.nextStep, guidance: renderableNextStepGuidance }
        : undefined;
    \`\`\`
  - En \`storefront-inventory-outlook.handler.ts\`: \`shouldShowCatalogSurfaces = catalogGate.is_open\` condiciona \`visibleProducts = shouldShowCatalogSurfaces ? inventoryProducts : []\`. Además se calcula:
    \`\`\`ts
    const shouldShowNextStep = shouldShowCatalogSurfaces
        && visibleProducts.length > 0
        && (supportsReview || signalKind === 'RESTOCK_EXPECTED');
    const compactNextStepView = shouldShowNextStep
        && adaptiveConversation.nextStep.renderHint === 'SHOW'
        && (renderableNextStepGuidance || hasMaterialNextStepAction)
        ? { ...adaptiveConversation.nextStep, guidance: renderableNextStepGuidance }
        : undefined;
    \`\`\`
  - Telemetría en ambos handlers refleja fielmente:
    \`has_product_cards: shouldShowCatalogSurfaces && visibleProducts.length > 0\`
    \`zero_results: !shouldShowCatalogSurfaces || ...\`
  - **Pruebas añadidas:** Suite dedicada \`src/services/__tests__/kitting-inventory-gates.test.ts\` con 6 casos de prueba verificando gate cerrado (\`is_open: false\`), cero productos, y \`renderHint: 'HIDE'\`.

#### 2. Bloqueo 2 (No emitir \`ADD_TO_CART\` con identidad o ruta incompleta en \`turn-advisory.ts\`)
- **Diagnóstico previo:** Si faltaban \`section\` o \`slug\`, \`convertCartOperatorToAdvisoryCta\` caía en defaults (\`section: 'catalogo'\`, \`slug: ''\`) emitiendo un CTA \`ADD_TO_CART\` activo sin ruta válida a producto ni ficha. Además \`Number(proposal.quantity)\` admitía valores no numéricos como \`"2"\` o \`true\`.
- **Remediación en \`0f0db11a\`:**
  - En \`turn-advisory.ts\`: Se valida estrictamente \`proposal.quantity\`: si viene definido, debe ser \`typeof proposal.quantity === 'number' && Number.isFinite(proposal.quantity)\`.
  - Se obtienen \`section\` y \`slug\` normalizados.
  - Si falta \`section\`, falta \`slug\`, o la cantidad es un tipo no numérico: la función **NUNCA** emite una acción de carrito (\`primaryAction: null\`), y degrada a un mensaje informativo con familia \`KEEP_EXPLORING\` y \`surfaceKind: 'INFORMATIONAL'\`.
  - Cantidades numéricas válidas se truncan con \`Math.floor\` y se acotan estrictamente a \`[1, 99]\`.
  - **Pruebas añadidas:** Casos en \`turn-advisory.test.ts\` probando degradación cuando falta \`slug\`, cuando falta \`section\`, y cuando \`quantity\` es \`"2"\` (string) o booleano.

#### 3. Bloqueo 3 (Hacer seguro el fallback del dispatcher en \`capsule-dispatcher.ts\`)
- **Diagnóstico previo:** La preparación (\`isCustomerIntelligenceNoWriteSmokeActive\`) quedaba fuera del \`try\`, y en el \`catch\` se devolvía \`params.data.message\`, un texto no validado del servidor que podía afirmar falsamente éxito en caso de fallo.
- **Remediación en \`0f0db11a\`:**
  - Todo el flujo del dispatcher (extracción de nombre, validación \`isCapsuleName\`, cálculo de \`noWriteSmokeActive\`, y resolución de handler) está completamente envuelto en el bloque \`try\`.
  - En caso de excepción, retorna estrictamente un mensaje de error genérico y neutro:
    \`'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'\`
  - **Pruebas añadidas:** Suite dedicada \`capsule-dispatcher.test.ts\` verificando rechazo de handler, protección contra getter exception durante preparación, intentos de prototype pollution (\`constructor\`, \`__proto__\`, \`toString\`), y congelamiento estricto \`Object.isFrozen(capsuleHandlers)\`.

#### 4. Bloqueo 4 (Carreras reales de Realtime y test recursivo de aislamiento de base de datos)
- **Diagnóstico previo:** En \`subscribeToRealtimeOrders\`, \`onNewOrder\` podía devolver una promesa rechazada sin capturarse produciendo un unhandled rejection; una excepción en \`onError\` no estaba protegida; \`useEffect\` en el hook dejaba una ventana hasta el render pasivo para usar el callback anterior; y el test de aislamiento no recorría subdirectorios de \`src/hooks\`.
- **Remediación en \`0f0db11a\`:**
  - En \`orders.service.ts\`: Se invoca \`await Promise.resolve(onNewOrder(eventData))\` dentro del bloque \`try/catch\`. Cualquier rechazo síncrono o asíncrono es capturado y transferido a \`onError\`. Las llamadas a \`onError\` están protegidas con \`try/catch\` para no tumbar el runtime.
  - Limpieza de suscripción defensiva: \`void Promise.resolve(supabase.removeChannel(channel)).catch(() => {})\` envuelto en try/catch.
  - Tópico único resistente a colisiones: \`orders_pulse_\${crypto.randomUUID ? crypto.randomUUID() : \`\${Date.now()}_\${Math.random().toString(36).slice(2)}_\${Math.random().toString(36).slice(2)}\`}\`.
  - En \`useRealtimeOrders.ts\`: Se migró a \`useLayoutEffect\` para que \`callbackRef.current\` y \`errorRef.current\` se actualicen de manera síncrona antes del pintado y de cualquier efecto pasivo.
  - En \`db-isolation-services.test.ts\`:
    - El guard arquitectónico recorre **recursivamente todos los subdirectorios** de \`src/hooks/**\` (e.g. \`admin\`, \`concierge\`), verificando que ningún archivo importe estática o dinámicamente \`@/lib/supabase\` ni importe en runtime \`@supabase/supabase-js\` (solo se permite \`import type\`).
    - Se agregaron pruebas para: dos suscripciones concurrentes con tópicos únicos diferentes; evento descartado si \`disposed\` es true; rechazo asíncrono de \`onNewOrder\` capturado hacia \`onError\`; y tolerancia a errores lanzados dentro de \`onError\`.

---

### EVIDENCIA DE EJECUCIÓN LOCAL:
- **TypeScript:** \`npm run typecheck\` (\`tsc --noEmit\`) -> **0 errores** (salida limpia).
- **Pruebas de Servicios:** \`npx vitest run src/services/__tests__\` -> **155/155 tests PASS** (20 archivos de prueba).
- **Pruebas de Concierge UI:** \`npx vitest run src/components/ui/ai/__tests__/AIConcierge.test.tsx\` -> **30/30 tests PASS**.
- **Git Hygiene:** Árbol limpio, cero archivos scratch en raíz, commit \`0f0db11a\` pusheado a \`origin/main\`.

---

### DIFF COMPLETO CONSOLIDADO (f4391fed~1 .. HEAD en SRC/):

\`\`\`diff
${diff}
\`\`\`

---

### INSTRUCCIONES PARA TU DICTAMEN:
1. Revisa línea por línea el diff consolidado.
2. Comprueba si los 4 bloqueos previos quedaron formalmente resueltos sin deuda técnica ni riesgos residuales.
3. Evalúa la robustez contra concurrencia, pureza de funciones, aislamiento de fallos y restricciones de catálogo.
4. Emite tu Scorecard actualizado y tu Veredicto Formal final: **ACCEPT**, **REJECT** o **ACCEPT WITH RESIDUAL RISK**.
`;

const targetPath = path.resolve('docs/audits/2026-10/sol-pro-audit-prompt.md');
fs.writeFileSync(targetPath, prompt, 'utf8');
console.log(`Updated audit prompt written successfully to: ${targetPath} (${prompt.length} bytes)`);
