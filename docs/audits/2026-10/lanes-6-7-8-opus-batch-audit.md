# Auditoría técnica: Lanes 6, 7 y 8 (VSM Store)

**Alcance real:** solo el diff entregado. No tuve acceso a los archivos completos (`helpers.ts`, `telemetry.ts`, `ai-capsule-orchestrator.service.ts`, el cuerpo completo de `useAIConcierge.ts`, `AIConcierge.tsx`). Los números de línea se derivan de los encabezados de hunk y son aproximados (≈). Marco cada hallazgo con su origen:

- **[INTRODUCIDO]**: lo crea este patch.
- **[HEREDADO]**: el patch lo traslada sin corregirlo.
- **[EMPEORADO]**: existía, pero el patch lo agrava.

---

## 1. Resumen ejecutivo y diagnóstico global

El patch es una **redistribución de código, no una reducción de complejidad**.

**Lane 6:** el God Object de ≈1.050 líneas se fragmentó en 11 archivos que suman **≈1.180 líneas**. Es decir, más código que antes. El pipeline central y el payload de telemetría (≈40 campos) están copiados 11 veces. Además:

- El despacho por diccionario introduce un **bug de resolución por prototipo** que el `if/else` con `===` no tenía.
- No existe **ningún** aislamiento de fallos.
- Se crea un **ciclo de imports** dispatcher ↔ handlers.

**Lane 7:** `turn-advisory.ts` no es puro. Una función muta su argumento y otra depende del reloj. El tipo `capsule_contract` **retrocedió de `Record<string, unknown>` a `Record<string, any>`**. Lo más grave: el patch **elimina la aserción `expect(addItemMock).not.toHaveBeenCalled()`**, que era precisamente la guarda del invariante "el Concierge nunca muta el carrito sin confirmación". Las funciones que el brief menciona (`detectCartActionIntent`, `extractUserPreferencesFromTurn`, `determineAdvisoryCallToAction`) **no existen** en el patch.

**Lane 8:** el aislamiento se cumple a nivel de imports en 4 hooks, con dos huecos:

- El ciclo de vida realtime conserva los defectos previos: callback tras desmontaje, tópico fijo compartido y churn de canal por dependencia inestable.
- Los servicios degradan los errores: se pierde el contexto HTTP de `FunctionsHttpError`, no hay timeouts y `Promise<boolean>` nunca devuelve `false`.

Nada impide la regresión: no hay regla de lint ni test arquitectónico.

**Higiene de entrega:**

- El diff llegó en **UTF‑16LE con BOM** (típico de un `>` en PowerShell), así que `git apply` lo rechaza.
- Cada handler nuevo empieza con bytes espurios antes de `import` (`� W%%import …`).
- `orders.service.ts` mantiene y agrega mojibake en comentarios (`§1.2` → `,%�1.2`; `través`/`función` corruptos).

**Veredicto anticipado: `REJECT`.** El detalle está en la sección 6.

---

## 2. Lane 6: Strategy Pattern y handlers

### 2.1 Hallazgos críticos / severos

#### L6‑C1 [INTRODUCIDO]: el despacho resuelve claves heredadas de `Object.prototype`

`handlers/index.ts` ≈L15:

```ts
export const capsuleHandlers: Record<string, CapsuleHandlerFn> = { 'product_search_integrity': …, … };
```

`capsule-dispatcher.ts` ≈L37‑42:

```ts
const handler = capsuleHandlers[params.data.capsule_name];
if (handler) { return handler(params, noWriteSmokeActive); }
```

`capsuleHandlers` es un literal plano y `data` es `Record<string, any>`. Su `capsule_name` viene de la respuesta del edge/LLM y puede manipularse con prompt injection sobre el routing. Resultados posibles:

| `capsule_name` | `handler` | Efecto |
|---|---|---|
| `'constructor'` | `Object` (truthy) | `Object(params)` devuelve **el propio `params`**. El dispatcher retorna `{data, query, history, customerProfile, …}` como si fuera un `ClientCapsuleDispatchResult`. |
| `'toString'` | `Object.prototype.toString` | Con `this` undefined devuelve `"[object Undefined]"`, un string como resultado. |
| `'__proto__'` | `Object.prototype` (no invocable) | `TypeError: handler is not a function`, que sube sin capturar. |
| `'hasOwnProperty'`, `'valueOf'` | métodos con `this` undefined | `TypeError`. |

La cadena previa de `if (data.capsule_name === '…')` era inmune a esto. Además, el tipo `Record<string, CapsuleHandlerFn>` le dice a TypeScript que *toda* clave existe. Sin `noUncheckedIndexedAccess`, el `if (handler)` es semánticamente "siempre verdadero" para el compilador y no protege nada.

**Corrección:** usar claves cerradas, objeto congelado y lookup por propiedad propia.

```ts
export const CAPSULE_NAMES = ['product_search_integrity', /* … */ 'cart_operator'] as const;
export type CapsuleName = typeof CAPSULE_NAMES[number];
export const capsuleHandlers = Object.freeze({ … } satisfies Record<CapsuleName, CapsuleHandlerFn>);

function isCapsuleName(v: unknown): v is CapsuleName {
  return typeof v === 'string' && Object.hasOwn(capsuleHandlers, v);
}
```

`satisfies` además obliga a la exhaustividad: si se agrega una cápsula, falla la compilación hasta registrar su handler.

#### L6‑C2 [HEREDADO, pero contradice el objetivo declarado]: cero aislamiento de fallos

Ningún handler ni el dispatcher tiene `try/catch`. Solo `getProductsByIds(...).catch(() => [])` y `resolveStorefrontAttachmentOffers(...).catch(() => null)` están protegidos. Lo que sí rompe el turno:

- **Rechazos de `execute*Capsule`:** cualquier fallo se propaga hasta `useAIConcierge`.
- **Desreferencias sin optional chaining sobre señales del contrato:**
  - `capsuleContract.inventory_outlook_signal.kind` (inventory, en 4 sitios)
  - `.order_tracking_signal.kind` (order-tracking)
  - `.warranty_triage_signal.kind` (warranty)
  - `.loyalty_status_signal.kind` (loyalty)
  - `.checkout_readiness_signal.kind` (checkout)

  Si el orquestador devuelve un contrato `FAILED` sin la señal poblada, se produce un **`TypeError` síncrono al construir el objeto de telemetría**.
- **Orden de ejecución:** la telemetría se construye *antes* que el mensaje. Un fallo en un campo de observabilidad mata la respuesta al usuario. La prioridad está invertida.
- **`void logAITelemetry(...)`:** `void` no captura rechazos. Si `logAITelemetry` no traga internamente sus errores (no visible en el diff), cada fallo genera un `unhandledrejection`. **Hay que verificarlo.**

**Corrección mínima en el dispatcher:**

```ts
try {
  return await handler(params, noWriteSmokeActive);
} catch (err) {
  reportHandlerFailure(name, err); // telemetría propia, nunca lanza
  return buildSafeFallbackResult(params); // mensaje neutro + intent 'info'
}
```

Y la telemetría debe envolverse en un `safeLog` que nunca lance ni rechace.

#### L6‑C3 [HEREDADO, ahora visible]: bypass inconsistente del `catalogGate`

Los handlers aplican el gate de forma distinta:

| Handler | Respeta `catalogGate.is_open` |
|---|---|
| `storefront-kitting-basket.handler.ts` | Sí: `visibleProducts = shouldShowCatalogSurfaces ? kitProducts : []` |
| `storefront-budget-rescue.handler.ts` | Sí: `visibleProducts = shouldShowCatalogSurfaces ? cheaperProducts : []` |
| `product-search-integrity.handler.ts` | Sí |
| `storefront-compatibility-check.handler.ts` | **No**: `const visibleProducts = compatibilityProducts;` |
| `storefront-inventory-outlook.handler.ts` | **No**: `const visibleProducts = inventoryProducts;` |

En compatibility e inventory, con el gate cerrado, se devuelven `suggestedProducts` y se escriben en `capsule_contract.resolved_products`. En un e-commerce de vapeo, si el gate modela verificación de edad o restricción regulatoria (el nombre lo sugiere; **confirmar**), esto es un **riesgo de cumplimiento**, no un detalle de UX. El refactor era la oportunidad de unificarlo y no se hizo.

#### L6‑C4 [INTRODUCIDO]: ciclo de imports dispatcher ↔ handlers

```
capsule-dispatcher.ts  → import { capsuleHandlers } from './handlers'
handlers/index.ts      → import { DispatchClientCapsuleParams, … } from '../capsule-dispatcher'
handlers/*.handler.ts  → import { DispatchClientCapsuleParams, … } from '../capsule-dispatcher'
```

Son imports **de valor**, sin `import type`, de símbolos que solo son interfaces.

- **Con esbuild/Vite:** se eliden y el ciclo no existe en runtime.
- **Con `verbatimModuleSyntax: true`:** es error TS1484.
- **Con `preserveValueImports`, Jest/ts-jest sin elisión, o si alguien agrega una constante al dispatcher:** el ciclo se materializa y `capsuleHandlers` puede leerse en TDZ.

`madge` o `import/no-cycle` lo marcarán. **Corrección:** mover `DispatchClientCapsuleParams`, `ClientCapsuleDispatchResult` y `CapsuleHandlerFn` a `concierge/dispatch.types.ts` e importar con `import type`.

#### L6‑C5 [HEREDADO]: mutación del contrato devuelto por el orquestador

Todos los handlers hacen:

```ts
(capsuleContract as Record<string, any>).resolved_products = visibleProducts;
(capsuleContract as Record<string, any>).turn_analysis = …;
(capsuleContract as Record<string, any>).catalog_gate = catalogGate;
```

Y `product-search-integrity` además hace `capsuleContract.resolved_products = actionableConversation.visibleProducts`.

Si el orquestador devuelve objetos compartidos, el handler corrompe resultados de turnos posteriores. Esto aplica si el contrato sale de memoización, del módulo `./cache` (exportado en `concierge/index.ts`) o de un fixture estático en tests. "Despacho inmutable" es falso: **el diccionario no está congelado y cada estrategia muta su entrada**.

### 2.2 Hallazgos medios / deuda técnica

#### L6‑M1: duplicación masiva; la Strategy solo es nominal

Budget, kitting, compatibility e inventory ejecutan el mismo pipeline de 9 pasos:

`getProductsByIds` → `commercialMove` → override de `turnAnalysis` → `buildCesarinActionableNextStepView` → `compactBase` / `compactGuidance` / `renderableGuidance` / `hasMaterialNextStepAction` → `compactNextStepView` → mutación del contrato → `logAITelemetry` → `mergeConversationalPrefix` / `compactCesarinCopy`.

Lo único que varía son ≈5 parámetros: la función `commercialMove`, el `adaptiveMode`, `primary_intent`/`turn_focus`, el criterio de `zero_results` y si aplica gate. Loyalty, warranty y order-tracking son **casi idénticos byte a byte**.

**Corrección:** un "template method" o una factoría que reciba esa configuración.

```ts
const handleStorefrontBudgetRescue = createCatalogCapsuleHandler({
  execute: executeStorefrontBudgetRescueCapsule,
  respectsCatalogGate: true,
  resolveMove: (c, n) => …,
  resolveAdaptiveMode: (c) => …,
  turnOverride: { primary_intent: 'BUDGET_RESCUE', turn_focus: 'budget' },
  zeroResults: (c) => c.match_strategy === 'NO_GOOD_TRADE_DOWN',
  intent: 'recommendation',
});
```

Y `buildCapsuleTelemetry(params, contract, overrides)` debe centralizar los ≈30 campos comunes (`analyst_intent`, `guardrail_overrides`, `injected_tools`, `routing_path`, `turn_*`, `catalog_gate_*`, `source_context_present`, `capsule_*`).

#### L6‑M2: inconsistencias semánticas copiadas sin revisar

| Handler | Inconsistencia |
|---|---|
| kitting | Telemetría `detected_intent: 'search'`, pero devuelve `intent: 'recommendation'`. La analítica queda corrupta. |
| kitting | `compactBaseMessage` usa `2` fijo; el mensaje final usa `shouldShowCatalogSurfaces ? 2 : 3`. Compara distinción contra un texto que no es el mostrado. |
| kitting / budget / inventory | `mergeConversationalPrefix(adaptiveConversation.message \|\| capsuleContract.customer_response_draft, …)` puede pasar `undefined`. compatibility sí añade `\|\| ''`. |
| cart-operator | Telemetría `'cart_operation'`, retorno `intent: 'search'`. Mensaje hardcodeado `'Actualizando tu carrito...'` que contradice la política advisory de Lane 7 ("No voy a mover tu carrito automáticamente"). |
| cart-operator, knowledge | Omiten `retrieval_source` / `capsule_retrieval_source`. El esquema de telemetría es heterogéneo. |
| knowledge | `zero_results: false` hardcodeado, aunque `match_strategy === 'NO_MATCH'` exista. |
| checkout | No fija `commercial_move`, pero hereda el del turno previo por el spread `...turnAnalysis`. |
| todos | `response_latency_ms` se mide antes de componer el mensaje: subestima la latencia real del handler. |
| budget / compat / inventory / kitting | `extractTelemetryNextStepTruth(compactNextStepView)` se invoca **dos veces** por handler. Product-search lo cachea en `telemetryNextStep`. |

#### L6‑M3: contratos de retorno laxos

- **`Promise<ClientCapsuleDispatchResult | null>`:** ningún handler retorna `null`. El `| null` solo debilita al consumidor.
- **`DispatchClientCapsuleParams.data: Record<string, any>`:** todo lo que se lee de `data` es `any`, incluidos `tool_args`, `debug?.guardrail_telemetry?.*`, `memory_context`, `conversational_prefix`, `no_write_smoke` y `capsule_name`.
- **`ClientCapsuleDispatchResult.capsule_contract?: Record<string, any>`.**

No hay `as any` literal, pero **`as Record<string, any>` aparece ≈35 veces**, y es funcionalmente lo mismo. El brief pregunta por casts encubiertos: los hay, a escala industrial.

#### L6‑M4: higiene

- Desestructuración manual en una línea con dobles espacios: `const data = params.data; const query = params.query;  const customerProfile = …`. No pasó por Prettier/ESLint. Debería ser `const { data, query, … } = params;`.
- Indentación rota en `knowledge-rag-foundation.handler.ts` ≈L14 (`const prefixedKnowledgeMessage` con indentación extra).
- Líneas en blanco finales múltiples en todos los handlers.
- **Bytes espurios al inicio de los 12 archivos nuevos de `handlers/`** (`� W%%import`). Si es un BOM UTF‑8, tsc/esbuild lo toleran, pero es inconsistente con el repo. Si es otro byte, **rompe la compilación**. Verificar con `head -c 4 src/services/concierge/handlers/*.ts | xxd`.
- Un `capsule_name` desconocido devuelve `null` en silencio. No hay telemetría de "cápsula no registrada", así que una divergencia entre edge y cliente queda invisible.

### 2.3 Rendimiento y tipado

- **O(1):** sí, lookup por hash. Pero con 11 ramas la ganancia de rendimiento es irrelevante; el valor real era mantenibilidad, y no se obtuvo (L6‑M1).
- **Inmutabilidad:** no. El objeto exportado es mutable (`capsuleHandlers.foo = …` es legal) y los handlers mutan su entrada.
- **Efectos en React:** los handlers no tocan estado de React directamente. El riesgo indirecto es L6‑C5: si el `capsule_contract` mutado termina en estado de React y luego se re-muta, se rompen las garantías de identidad referencial de `memo`/`useMemo`.

---

## 3. Lane 7: heurísticas y desacoplamiento del Concierge

### 3.1 Dominio, ReDoS y pureza

#### L7‑C1 [INTRODUCIDO]: se eliminó la guarda de "no auto-add" en el test de UI

`src/components/ui/ai/__tests__/AIConcierge.test.tsx` ≈L1599:

```diff
-                 expect(addItemMock).not.toHaveBeenCalled();
-                 expect(navigateMock).toHaveBeenCalledWith(expect.objectContaining({ to: '/vape/waka-pod' }));
+                 expect(navigateMock).toHaveBeenCalledWith(expect.objectContaining({ to: '/$section/$slug', params: {...} }));
```

El objetivo declarado de `convertCartOperatorToAdvisoryCta` es garantizar que el carrito nunca se mute sin confirmación explícita. Este patch **borra la única aserción de UI que lo verificaba** en el flujo "Elegir opción de Waka Pod".

Además, los cambios de navegación (`/$section/$slug` con `params`) implican un cambio en `AIConcierge.tsx` que **no está en el diff**. O el patch está incompleto, o los tests se reescribieron para seguir un cambio de comportamiento no auditado. **Bloqueante.**

#### L7‑C2 [INTRODUCIDO]: regresión de tipado de `unknown` a `any`

- **Antes** (en `useAIConcierge.ts`): `type ConciergeAssistantMessage = ConciergeMessage & { capsule_contract?: Record<string, unknown> }`.
- **Ahora** (en `turn-advisory.ts` L3): `capsule_contract?: Record<string, any>`.

Con `unknown`, `contract?.mutation_proposal?.type` no compilaría sin narrowing. El cambio a `any` es la forma de "hacer que compile". Dentro de `convertCartOperatorToAdvisoryCta`, `proposal.resolved_product_id`, `proposal.quantity`, `proposal.product_ref` y `proposal.resolved_variant_id` quedan sin ninguna comprobación de tipo. Los `typeof` existen para el id y el ref, pero **no para `resolved_variant_id`**: cualquier valor truthy se convierte en `variantToken.id`.

**Corrección:** un schema (Zod/Valibot) o un type guard explícito.

```ts
type AddMutationProposal = { type: 'ADD'; resolved_product_id: string; product_ref?: string; quantity?: number; resolved_variant_id?: string };
function isAddProposal(p: unknown): p is AddMutationProposal { … }
```

#### L7‑C3: `turn-advisory.ts` no es puro

| Función | Pureza | Problema |
|---|---|---|
| `convertCartOperatorToAdvisoryCta` (≈L11‑56) | **Impura** | Retorna `void` y **muta `message`**: `intent`, `content` y `capsule_contract`. Si el llamador pasa un objeto que ya vive en el estado de React (`messages`), se rompe la inmutabilidad y React puede no re-renderizar o mostrar un estado intermedio. Debe ser `(m) => ConciergeAssistantMessage`. |
| `computeUpdatedConciergePreferences` (≈L98‑129) | **Impura** | `new Date().toISOString()` la hace no determinista. Hay que inyectar `now: Date` o `clock`. |
| `isCurrentTurnClearlyNonSearch` | Pura | Ver los errores semánticos más abajo. |
| `extractTurnAnalysis`, `uniqueStringList` | Puras | — |

No hay dependencias de React: el único import es `import type` de `./types`. Ese punto se cumple.

#### L7‑C4: valores hardcodeados con impacto funcional en el CTA

En `convertCartOperatorToAdvisoryCta`:

```ts
product: { id, name: productName, slug: '', section: 'vape' },
variantToken: … ? { id: proposal.resolved_variant_id, name: 'Variante' } : null,
```

- **`section: 'vape'`:** un producto herbal, accesorio o refacción recibe una sección falsa. Ahora que la navegación es `'/$section/$slug'` con params, un "ver ficha" desde este CTA navega a `/vape/` con **slug vacío**, que es una ruta inválida.
- **`name: 'Variante'`:** la UI del botón y del carrito muestra un literal genérico en lugar del nombre real de la variante.
- **`quantity`:** `Number.isFinite(q) && q > 0 ? Math.floor(q) : 1` **no tiene tope**. Un LLM que proponga `quantity: 1e6` genera "Agregar 1000000 x …" y, tras un clic, un add masivo. También: `0.5` → `Math.floor` → `0`. La guarda `> 0` se evalúa antes del `floor`, así que **se aceptan cantidades 0**. Esto es un bug real: `quantity: 0.5` produce `quantity: 0`.
- **`productName`:** sale de `product_ref` (texto LLM) sin límite de longitud. React escapa, así que no hay XSS, pero sí permite spoofing de etiqueta o desbordes de layout.

#### L7‑C5: `isCurrentTurnClearlyNonSearch`: ReDoS no, falsos negativos sí

**ReDoS:** ambas regex son alternancias de literales sin cuantificadores anidados ni grupos repetidos. El backtracking está acotado a O(n·k), así que **no hay ReDoS**. Tampoco hay flag `/g`, por lo que no hay bugs de estado `lastIndex`.

**Coste con entradas gigantes:** `normalize('NFD')`, `replace` y `toLowerCase` crean **3 copias completas** del input. No hay tope de longitud. Hay que truncar (`content.slice(0, 2_000)`) antes de normalizar. Además, las regex literales se recrean en cada llamada; conviene subirlas a constantes de módulo (es menor).

**Errores semánticos:** no hay límites de palabra (`\b`), así que se hacen matches por subcadena.

| Entrada | Esperado | Real | Causa |
|---|---|---|---|
| "¿Podrías rastrear mi pedido?" | `true` | **`false`** | `pod` hace match dentro de "**pod**rías" en la regex negativa. |
| "¿Puedo cancelar? No **pod**emos esperar" | `true` | `false` | `pod` en "podemos". |
| "Quiero ver el estado de mi envío" | `true` | `false` | `quiero ver` en la negativa. |
| "Necesito ordenar mis ideas, busco un kit" | `false` | `false` | Correcto por accidente: `orden` matchea "ordenar". |
| "¿Es compatible con mi Caliburn?" | ambiguo | `true` | Choca con la cápsula `storefront_compatibility_check`, que **sí** muestra productos. |

**Corrección:** usar tokens con límite de palabra sobre texto normalizado (`/\b(envio|pedido|…)\b/`) y raíces explícitas (`/\bpods?\b/`, `/\bkits?\b/`). Lo ideal es delegar en `turn_analysis.primary_intent` del servidor y dejar la heurística solo como fallback.

#### L7‑M1: `computeUpdatedConciergePreferences`: persistencia sin límites

- **`interests: [...(currentPrefs?.interests || []), displayContent].slice(-5)`:**
  - Persiste el **texto completo del turno** sin truncar ni sanitizar en el JSONB del perfil, cinco veces. Esto implica crecimiento no acotado del documento y **posible PII** (direcciones, teléfonos que el usuario escriba) almacenada como "interés".
  - No deduplica, aunque `uniqueStringList` está en el mismo archivo.
  - Si `interests` está corrupto en la base (un string), el spread produce caracteres sueltos. Si es un objeto, lanza `TypeError: not iterable`.
- **`lowered.includes('vape')`:** "vaporizador" no hace match y "vapeador" sí. La heurística de tema son dos literales hardcodeados.
- **Tipos:** `lastIntent: string` y parámetros `Record<string, any>`, así que el retorno se infiere como `any` en los campos propagados.

#### L7‑M2: `uniqueStringList` no normaliza antes de deduplicar

`['a', ' a', 'a ']` devuelve los tres. Filtra con `trim()` pero deduplica sin `trim()`.

### 3.2 Evaluación de `useAIConcierge.ts`

- **Lo extraído es poco:** cuatro helpers y el cálculo de preferencias, ≈90 líneas. El hook sigue mezclando estado de UI (`isOpen`, `messages`), timeouts (`AI_CONCIERGE_SLOW_RESPONSE_MS`, `REQUEST_TIMEOUT_MS`), hápticos (`triggerHaptic([10,30,10])`), contexto táctico (`useTacticalUI`), auth, gate de catálogo y **persistencia remota de preferencias**.
- **Escritura en la ruta crítica del turno:** `await conciergeService.updatePreferences(user.id, newPrefs, newIAContext)` se ejecuta **dentro del flujo de respuesta**. Añade latencia de red al cierre del turno y acopla los errores: si falla la escritura de preferencias, el comportamiento depende de un `try` que no es visible en el diff. Debería ser fire-and-forget con captura explícita, o pasar por `useMutation`.
- **Tres rutas de import para el mismo dominio:** `@/services`, `@/services/concierge` y `@/services/concierge.service`. Además, `concierge/index.ts` añade `export * from './turn-advisory'`. Con `export *` en cascada, cualquier colisión de nombres (por ejemplo, otro `ConciergeAssistantMessage` o `uniqueStringList`) se vuelve **ambigua y se excluye en silencio** del barrel ESM.
- **Re-renders:** el diff no permite evaluar `useCallback`/`useMemo` del hook. `computeUpdatedConciergePreferences` crea objetos nuevos por turno, lo cual está bien porque solo se envían a red. No detecto recreación problemática en lo visible.

### 3.3 Suite `turn-advisory.test.ts`

Son pruebas de camino feliz. Hay 9 casos y ninguno de borde real.

| Función | Cubierto | Faltante crítico |
|---|---|---|
| `convertCartOperatorToAdvisoryCta` | ADD feliz y REMOVE | `quantity` 0, 0.5, negativa, NaN, string, 1e9; `product_ref` vacío o solo espacios; sin `resolved_variant_id`; `resolved_product_id` vacío; `capsule_contract` ausente. El fallback no verifica que `capsule_contract` quede intacto. |
| `isCurrentTurnClearlyNonSearch` | 7 frases | **Ninguna con tildes** ("envío", "garantía", "política"), cuando la normalización NFD es la razón de ser de la función. No hay casos con "podrías", ni string vacío, ni mayúsculas, ni emojis, ni input de 1 MB con límite de tiempo. |
| `extractTurnAnalysis` | 3 casos | Usa `as any`. No cubre `turn_analysis: null` con fallback presente. |
| `uniqueStringList` | 1 caso | Duplicados con espacios (L7‑M2). |
| `computeUpdatedConciergePreferences` | 1 caso | `herbal`; prefs `undefined`/`null`; `interests` no-array; `last_update` sin `vi.useFakeTimers()`; preservación de claves existentes. |

Además, el literal de prueba `'¿Cual es…'` aparece en el patch como `',%%Cual…'`. Si el archivo fuente contiene esa mojibake, el test pasa igual, porque el keyword es "envio", y **oculta la corrupción**.

---

## 4. Lane 8: aislamiento de DB y ciclo de vida realtime

### 4.1 Concurrencia y canales realtime

`orders.service.ts`, `subscribeToRealtimeOrders` ≈L172‑208:

#### L8‑C1 [HEREDADO]: callback ejecutado tras desmontaje

```ts
async (payload) => {
  const eventData = await getOrderNotificationDetails(newOrder.id); // await en vuelo
  if (eventData) onNewOrder(eventData);                              // sin chequeo de vida
}
```

Si el componente se desmonta durante el `await`, `onNewOrder` se ejecuta igual. Las consecuencias son toasts de "social proof" tras navegar, `setState` sobre árboles desmontados y retención del closure (y de todo lo que capture) hasta que resuelva la query. `removeChannel` no cancela promesas en vuelo.

```ts
let disposed = false;
// … if (!disposed && eventData) onNewOrder(eventData);
return () => { disposed = true; void supabase.removeChannel(channel).catch(reportError); };
```

#### L8‑C2 [HEREDADO]: tópico fijo `'public:orders_pulse'` compartido entre consumidores

El comportamiento depende de la versión de `@supabase/realtime-js`:

- **Versiones que deduplican por tópico** (`channel()` devuelve el existente): dos montajes concurrentes comparten la misma instancia. Ocurre en StrictMode (mount, unmount, mount) o con dos componentes que usen el hook. El primer `removeChannel` **mata la suscripción del otro consumidor** y sus eventos se pierden en silencio. Además, el segundo `.on('postgres_changes', …)` sobre un canal ya unido es ignorado o rechazado.
- **Versiones sin deduplicación:** se crean canales duplicados con el mismo tópico en el mismo socket. Un join y un leave en vuelo producen una carrera.

**Corrección:** usar tópico único por suscripción (`` `orders_pulse:${crypto.randomUUID()}` ``) o un singleton con contador de referencias en el servicio. **Fijar y documentar la versión de supabase-js.**

#### L8‑C3 [HEREDADO]: churn de canal por dependencia inestable

`useRealtimeOrders` usa `useEffect(…, [onNewOrder])`. Cualquier consumidor que pase una lambda inline provoca **teardown y resubscribe en cada render**. Eso genera tormentas de join/leave contra Realtime, ventanas sin suscripción en las que se pierden INSERTs y acumulación de canales en estado `leaving`.

**Corrección:** patrón de ref para el callback más reciente y efecto con dependencias `[]`.

```ts
const cbRef = useRef(onNewOrder);
useLayoutEffect(() => { cbRef.current = onNewOrder; });
useEffect(() => subscribeToRealtimeOrders((o) => cbRef.current(o)), []);
```

#### L8‑C4 [HEREDADO, crítico de seguridad, verificar]: exposición de filas de `orders`

Una suscripción `postgres_changes` INSERT sobre `public.orders` desde el cliente público entrega `payload.new` con **la fila completa** si la RLS lo permite al rol del suscriptor. Para una notificación de "social proof" en storefront hay dos posibilidades:

- **(a) Anon puede leer `orders`:** se filtran datos de clientes (nombre, dirección, ítems, total). Es una fuga de PII.
- **(b) No puede:** la feature no funciona para anónimos.

El patch no cambia esto, pero ahora está encapsulado en un servicio que parece "seguro". **Recomendación:** usar un canal broadcast emitido por un trigger o edge con payload mínimo anonimizado, o una vista o tabla `order_pulse` sin PII.

#### L8‑M1: errores y estados del canal

- Solo se maneja `CHANNEL_ERROR`. `TIMED_OUT` y `CLOSED` se ignoran. No hay backoff ni señal de estado expuesta al hook.
- El parámetro `onError` existe en el servicio, pero **`useRealtimeOrders` no lo pasa**. La UI nunca sabe que el realtime cayó; solo hay `console.error`.
- **N+1 sin control:** cada INSERT dispara una query de enriquecimiento. Una ráfaga de pedidos genera una ráfaga de queries concurrentes, y la entrega puede desordenarse porque las promesas resuelven en orden arbitrario. No hay cola, debounce ni límite.
- `payload.new as { id?: string } | undefined` es un cast manual. Hay que usar `RealtimePostgresInsertPayload<Tables<'orders'>>`.

### 4.2 Resiliencia de servicios ante caídas de red

**`checkBackendHealth`** (`settings.service.ts` ≈L146‑157):

- **`Promise<boolean>` que nunca devuelve `false`:** retorna `true` o lanza. Debe ser `Promise<void>` o devolver un resultado discriminado `{ ok: true } | { ok: false, reason }`.
- **Sin timeout ni `AbortSignal`:** si la red se cuelga (no falla), el heartbeat queda pendiente indefinidamente y `useEmergencyMode` **nunca entra en emergencia**, justo en el escenario para el que existe. Hay que usar `.abortSignal(AbortSignal.timeout(5_000))` de PostgREST.
- **`count: 'exact', head: true`:** ejecuta `count(*)` completo con evaluación de RLS. No es "ligero" como afirma el JSDoc, y `.limit(1)` no acota el conteo. Para un ping basta `select('id').limit(1)`, o `count: 'planned'`.
- **Falso positivo de caída:** una denegación de RLS o un error de permisos sobre `categories` se interpreta como backend caído.
- **Regresión de observabilidad:** se eliminó `console.error('[HealthCheck] Supabase error:', error)` del hook y el servicio no registra nada.

**`invokeVisualCompatibilityScanner`** (`visual-scanner.service.ts` ≈L29‑51):

- **Se pierde el contexto HTTP:** `throw new Error(invokeError.message || …)` descarta el tipo (`FunctionsHttpError` / `FunctionsRelayError` / `FunctionsFetchError`) y `invokeError.context` (la `Response` con status y body). El mensaje genérico ("Edge Function returned a non-2xx status code") llega tal cual a la UI. Como mínimo: `new Error(msg, { cause: invokeError })` y mapear 413/429/5xx a mensajes de usuario.
- **[INTRODUCIDO] Cambio de comportamiento no declarado:** antes, `data == null` sin error terminaba en silencio (`if (data) setResult(data)`). Ahora lanza `'Respuesta vacía…'`. El `if (data)` del hook quedó como **rama muerta**.
- **`success: false` no se trata como error:** se devuelve como dato válido y la UI depende de que el hook lo interprete.
- **Sin validación ni límites:**
  - El tamaño del base64 no se valida en el servicio.
  - No hay timeout ni `AbortController`, así que desmontar durante el escaneo produce `setState` tardío.
  - La respuesta del edge no se valida contra un schema; el genérico `<VisualScannerResult>` es solo una afirmación de tipo.
- **Contrato ambiguo:** el test pasa `'data:image/png;base64,abc'` con prefijo data-URL. No queda definido si el edge espera o no el prefijo.

**`getAppliedReferral`** (`loyalty.service.ts` ≈L280‑291):

- **`maybeSingle()` lanza PGRST116 si hay más de una fila.** Sin un `UNIQUE(referred_id)` en `referrals` (no verificable aquí), un duplicado rompe la UI de lealtad.
- **`AppliedReferral` está escrito a mano** (`status: string`) en lugar de derivarse de `Tables<'referrals'>`. Si el cliente Supabase no tiene el genérico `Database`, `data` es `any` y se devuelve sin validar. Si lo tiene y el esquema dice `referrer_id: string | null`, la interfaz miente.
- **`useLoyalty.ts` hace `import * as loyaltyService from '@/services'`:** importa el barrel completo con nombre engañoso, acopla el hook a todo el barrel y en algunos bundlers perjudica el tree-shaking. Debe importar `@/services/loyalty.service`.
- **`customerId!`** en el hook está protegido por `enabled`, pero es un non-null assertion que conviene eliminar con un `queryFn` que valide.

**Propagación general:** los hooks reciben `PostgrestError` y errores crudos de Supabase. Los tipos de infraestructura **siguen filtrándose a la UI**. El aislamiento es de imports, no de contratos de error. Falta una capa `toDomainError()`.

### 4.3 Aislamiento real

- Los 4 hooks tocados ya no importan `@/lib/supabase`. Eso se cumple.
- **No hay mecanismo que impida la regresión:** falta una regla ESLint `no-restricted-imports` para `@/lib/supabase` y `@supabase/*` en `src/hooks/**`, y no hay test arquitectónico.

  ```js
  // .eslintrc
  overrides: [{ files: ['src/hooks/**'], rules: { 'no-restricted-imports': ['error', { paths: ['@/lib/supabase'], patterns: ['@supabase/*'] }] } }]
  ```
- No se puede afirmar que *ningún* hook importe Supabase. El diff solo toca 4, el brief habla de "múltiples" y no hay evidencia de un barrido completo (`rg "@/lib/supabase" src/hooks`).

### 4.4 Suite `db-isolation-services.test.ts`

| Escenario | ¿Cubierto? |
|---|---|
| `getAppliedReferral` con `data: null` (sin referido, el caso más común) | No |
| `getAppliedReferral` con PGRST116 (filas múltiples) | No |
| `checkBackendHealth` con timeout o promesa colgada | No |
| `subscribeToRealtimeOrders`: invocar el callback capturado con payload válido | **No.** El handler `async (payload) => …` nunca se ejecuta. |
| Payload malformado (`new: null`, sin `id`) | No |
| Enriquecimiento que lanza y ruta `onError` | No |
| Callback de `subscribe('CHANNEL_ERROR')` / `'TIMED_OUT'` | No |
| Desuscripción durante enriquecimiento en vuelo (L8‑C1) | No |
| Doble suscripción o StrictMode (L8‑C2) | No |
| `removeChannel` que rechaza | No |
| `invokeVisualCompatibilityScanner` con `data: null` | No |
| `FunctionsHttpError` con `context` | No |
| Hooks con `renderHook` (unmount llama a unsubscribe; error llega a la UI) | **No existe ningún test de hook** |

Problemas adicionales del test:

- `vi.clearAllMocks()` no restablece implementaciones: los `mockReturnValue` de `fromMock` sobreviven entre tests. Hoy no rompe porque cada test reconfigura, pero es frágil. Usar `vi.resetAllMocks()`.
- `const channelInstance: any` usa `any` en tests.
- El nombre "db-isolation" promete verificar aislamiento, pero **ningún test lo verifica**. Debería haber un test estático, por ejemplo con `import.meta.glob('/src/hooks/**/*.ts', { as: 'raw', eager: true })`, que asegure que ningún hook contiene `@/lib/supabase`.

---

## 5. Matriz de riesgos residuales y valores hardcodeados

### 5.1 Riesgos

| ID | Lane | Severidad | Prob. | Origen | Descripción |
|---|---|---|---|---|---|
| L7‑C1 | 7 | **Crítica** | — | INTRODUCIDO | Eliminada la aserción `addItemMock.not.toHaveBeenCalled()`; cambio de UI fuera del diff. |
| L6‑C2 | 6 | **Crítica** | Media | HEREDADO | Sin aislamiento de fallos; `.kind` sobre señales sin optional chaining; telemetría antes que la respuesta. |
| L8‑C4 | 8 | **Crítica\*** | ? | HEREDADO | Posible exposición de filas de `orders` vía realtime (\*depende de RLS). |
| L6‑C3 | 6 | Alta | Alta | HEREDADO | compatibility e inventory ignoran `catalogGate`. |
| L6‑C1 | 6 | Alta | Baja‑Media | INTRODUCIDO | Lookup por prototipo (`constructor`, `toString`, `__proto__`). |
| L7‑C2 | 7 | Alta | — | INTRODUCIDO | `capsule_contract` pasa de `unknown` a `any`. |
| L7‑C4 | 7 | Alta | Media | INTRODUCIDO/HEREDADO | `section:'vape'`, `slug:''`, cantidad sin tope y **cantidad 0 aceptada**. |
| L8‑C1 | 8 | Alta | Alta | HEREDADO | `onNewOrder` tras desmontaje. |
| L8‑C2 | 8 | Alta | Media | HEREDADO | Tópico realtime compartido; pérdida de eventos o canales duplicados. |
| L8‑C3 | 8 | Media | Alta | HEREDADO | Churn de canal por `[onNewOrder]`. |
| L6‑C4 | 6 | Media | Baja | INTRODUCIDO | Ciclo de imports dispatcher ↔ handlers. |
| L6‑C5 | 6 | Media | ? | HEREDADO | Mutación del contrato del orquestador (riesgo si está cacheado). |
| L7‑C5 | 7 | Media | Alta | HEREDADO | Falsos negativos por subcadena ("podrías"). |
| L7‑M1 | 7 | Media | Alta | HEREDADO | Texto crudo y posible PII persistidos como `interests`. |
| L8 health | 8 | Media | Media | HEREDADO | Sin timeout; `count:'exact'`; `Promise<boolean>` engañoso. |
| L8 scanner | 8 | Media | Media | INTRODUCIDO | Pérdida de `FunctionsHttpError.context`; cambio de comportamiento con `data:null`. |
| ENC | — | Media | Alta | INTRODUCIDO | Diff en UTF‑16; bytes espurios al inicio de los handlers; mojibake en `orders.service.ts`. |
| L6‑M1 | 6 | Media | — | EMPEORADO | Duplicación ×11; aumento neto de LOC. |
| L6‑M2 | 6 | Baja‑Media | — | HEREDADO | Telemetría con `intent` inconsistente (kitting, cart-operator). |

### 5.2 Valores hardcodeados detectados

| Valor | Ubicación | Riesgo |
|---|---|---|
| `section: 'vape'` | `turn-advisory.ts` `convertCartOperatorToAdvisoryCta` | Sección incorrecta para no-vape; ruta rota. |
| `slug: ''` | ídem | Navegación inválida a `/$section/$slug`. |
| `name: 'Variante'` | ídem | Etiqueta genérica en botón y carrito. |
| Copys sin tilde ("boton", "confirmalo", "automaticamente") | ídem | Calidad de UI; no está i18n-izado. |
| `'vape'`, `'herbal'` | `computeUpdatedConciergePreferences` | Heurística de tema de dos literales. |
| `.slice(-5)` | ídem | Límite mágico. |
| Listas regex de keywords | `isCurrentTurnClearlyNonSearch` | Sin `\b`; no son configurables. |
| `'Actualizando tu carrito...'` | `cart-operator.handler.ts` | Contradice la política advisory. |
| Límites `2`, `3`, `8` de oraciones | todos los handlers de catálogo | Números mágicos dispersos ×11. |
| `'EDGE_ERROR'` | todos los handlers | Taxonomía de errores colapsada a un solo valor. |
| `'public:orders_pulse'` | `orders.service.ts` | Tópico compartido (L8‑C2). |
| `'categories'` | `settings.service.ts` | Heartbeat acoplado a tabla y RLS de negocio. |
| `'visual-compatibility'` | `visual-scanner.service.ts` | Aceptable, pero debería centralizarse en constantes de funciones edge. |

---

## 6. Veredicto formal: **`REJECT`**

**Justificación.** No rechazo por la deuda heredada en sí. Rechazo porque el patch **introduce regresiones verificables** y **declara propiedades que no cumple**:

1. **Introduce un debilitamiento del test del invariante de seguridad del carrito (L7‑C1)** y depende de un cambio en `AIConcierge.tsx` que no se presentó a auditoría. Solo esto ya bloquea el merge.
2. **Introduce una regresión de corrección en el despacho (L6‑C1).** El mecanismo nuevo es menos seguro que el `if/===` que reemplaza.
3. **Introduce una regresión de tipado (L7‑C2)** y un **ciclo de módulos (L6‑C4)**.
4. **Declara aislamiento de fallos, inmutabilidad y desacoplamiento que no existen** (L6‑C2, L6‑C5, L6‑M1). La Strategy es nominal: el God Object se dispersó (shotgun surgery) y creció en LOC.
5. **Las suites de tests de Lane 7 y Lane 8 no ejercitan las rutas de fallo** que el brief exige explícitamente: payload malformado, desuscripción en vuelo, errores de canal y ningún test de hooks.
6. **El artefacto entregado no es aplicable ni verificable** (UTF‑16, bytes espurios en 12 archivos, mojibake).

### Puerta mínima para reconsiderar como `ACCEPT WITH RESIDUAL RISK`

1. Restaurar `expect(addItemMock).not.toHaveBeenCalled()` e incluir el diff de `AIConcierge.tsx`.
2. Hacer el registro de handlers seguro: `Object.freeze`, `satisfies Record<CapsuleName, …>` y `Object.hasOwn`. Agregar `try/catch` en el dispatcher con fallback seguro y una `safeLogTelemetry` que nunca lance.
3. Usar optional chaining o guards en todas las señales `*_signal.kind`. Construir la telemetría **después** del mensaje y de forma no bloqueante.
4. Aplicar `catalogGate` uniformemente en compatibility e inventory, o documentar por escrito por qué no.
5. Mover los tipos de dispatch a `dispatch.types.ts` con `import type`.
6. Restaurar `Record<string, unknown>` más un type guard o schema para `mutation_proposal`. Acotar `quantity` a `[1, MAX]` aplicando el `floor` antes de validar, y eliminar `section:'vape'` y `slug:''`, o deshabilitar el link si faltan datos.
7. En `subscribeToRealtimeOrders`: flag `disposed`, tópico único o singleton con contador de referencias, `removeChannel` con `.catch`. En el hook: patrón de ref para el callback y pasar `onError`.
8. Timeout en `checkBackendHealth` y `cause` preservado en el scanner.
9. Tests:
   - callback realtime con payload válido e inválido, y desmontaje durante el enriquecimiento;
   - casos con tildes y "podrías" en la heurística;
   - `quantity` 0, 0.5 y 1e9;
   - `renderHook` de `useRealtimeOrders` verificando que el unmount llama a unsubscribe;
   - test arquitectónico de imports en `src/hooks/**`.
10. Regenerar el patch en UTF‑8 (`git diff --output=lanes.patch` o `git format-patch`) y eliminar los bytes iniciales espurios de `handlers/*.ts`.

### Riesgo residual que aceptaría temporalmente, con ticket

- La consolidación de la duplicación (L6‑M1) mediante factoría o template.
- La migración de la heurística léxica a `turn_analysis` del servidor.
- La auditoría de RLS sobre `orders` en realtime (L8‑C4). Esta última **no** debe postergarse más allá del siguiente sprint si la feature de social proof está activa para usuarios anónimos.