# Contra-auditoría del commit `f4391fed`

**Veredicto formal: REJECT.**

El parche corrige varios defectos reales, pero **no demuestra que haya restaurado el invariante de catalog gate** y elimina condiciones que antes restringían la exposición de `next_step_view`. Además, el CTA de carrito puede quedar habilitado con datos de ruta incompletos. Son problemas de comportamiento, no de estilo; los resultados de typecheck y Vitest aportados no los descartan.

Mi evaluación se limita al diff y a los resultados de pruebas comunicados: no he ejecutado el repositorio ni inspeccionado el código no incluido.

## Scorecard de los 10 hallazgos

| Hallazgo | Estado | Evaluación |
|---|---|---|
| **1. L6-C1 — Prototype pollution en dispatcher** | **Remediado** | La lista tipada, el mapa congelado y `hasOwnProperty.call` impiden despachar propiedades heredadas como `constructor` o `toString`. `CAPSULE_NAMES` no está congelada en runtime, pero no se usa como mecanismo de autorización: el control efectivo es el mapa. Faltan pruebas adversariales explícitas. |
| **2. L6-C2 — Aislamiento de fallos y señales laxas** | **Parcial** | El `await handler(...)` queda dentro de `try/catch` y las desreferencias de señales modificadas usan `?.kind`. Las promesas de telemetría tienen `.catch()`. No obstante, una excepción **síncrona** de `logAITelemetry(...)` no la absorbe ese `.catch()` y hará caer el handler al fallback. La lectura de `no_write_smoke` ocurre fuera del `try`. Más importante: el fallback reutiliza `params.data.message`, texto no validado procedente de la respuesta que condujo al despacho fallido, en vez de garantizar una respuesta fija y segura. |
| **3. L6-C4 — Ciclo circular** | **Remediado en los imports mostrados** | Los handlers pasan a importar tipos desde `dispatch.types.ts` mediante `import type`; el ciclo directo con `capsule-dispatcher.ts` desaparece. |
| **4. L6-C3/C5 — Catalog gate y retorno** | **No remediado satisfactoriamente** | Se conservan productos resueltos y se construyen vistas compactas, pero en *kitting* desaparecen `shouldShowCatalogSurfaces` y `renderHint === 'SHOW'` de la condición de `next_step_view`; en *inventory* desaparecen `visibleProducts.length > 0`, la condición de señal y `renderHint === 'SHOW'`. La nueva condición acepta `surfaceKind === 'ACTIONABLE' || hasMaterialNextStepAction` sin comprobar allí `catalogGate.is_open`. No hay base en este diff para afirmar que Stage 4 impide todos los estados peligrosos. |
| **5. L7-C1 — Aserción de no mutación del carrito** | **Remediado puntualmente** | Se restaura `expect(addItemMock).not.toHaveBeenCalled()` en el caso de UI indicado. No equivale a probar todos los caminos que emiten `ADD_TO_CART`. |
| **6. L7-C3/C4 — Pureza, cantidad y rutas** | **Parcial** | La conversión devuelve objetos nuevos, actualiza correctamente su llamada en el hook y limita la cantidad entera a `[1, 99]`. Deriva sección y slug si existen en la propuesta; **si no existen**, sigue emitiendo un CTA `ADD_TO_CART` con `section: 'catalogo'` y `slug: ''`. El diff no acredita que esas rutas sean válidas ni que el ID, variante y cantidad se validen contra un producto resoluble antes de ofrecer la acción. |
| **7. L7-C5 — Heurística y entradas grandes** | **Remediado con limitaciones funcionales** | El recorte a 2.000 caracteres y los límites de palabra eliminan los dos ejemplos de colisión aportados. Las listas de palabras no cubren todas las flexiones: por ejemplo, `rastreando` o `recomendación` quedan fuera. Esto es deuda de clasificación, no evidencia por sí sola de ReDoS. |
| **8. L8-C1/C2/C3 — Realtime y concurrencia** | **Mayormente remediado** | `disposed` se consulta antes y después del enriquecimiento, el tópico se individualiza y el efecto de suscripción deja de depender de la identidad del callback. El `useRef` preserva el callback más reciente. La prueba modificada comprueba el prefijo del tópico, **no** dos tópicos distintos ni la ausencia de callbacks tras `unsubscribe` mientras hay una consulta pendiente. |
| **9. L8 — Timeout y causa del scanner** | **Mayormente remediado** | El scanner conserva la causa. El heartbeat establece un temporizador de 5 s y pasa la señal a PostgREST: es una implementación válida de cancelación, aunque la duración efectiva depende de que la operación respete `abortSignal`; no es una garantía independiente de tiempo máximo. Faltan pruebas de aborto y limpieza del temporizador. |
| **10. L8 — Test arquitectónico de hooks** | **Parcial** | El test detecta dos imports estáticos concretos en archivos `.ts`/`.tsx` **directamente** bajo `src/hooks`. No recorre `src/hooks/**` recursivamente y permite otras formas de acceso directo, por ejemplo imports relativos, `import(...)` o reexports. No acredita «cero imports de Supabase» en todo el árbol. |

## Bloqueantes

**1. Se debilitó el control de presentación de acciones de catálogo.** En `storefront-kitting-basket.handler.ts` y `storefront-inventory-outlook.handler.ts`, el diff sustituye condiciones que exigían visibilidad y `renderHint === 'SHOW'` por una condición basada únicamente en la naturaleza o presencia de una acción. Incluso si `buildCesarinActionableNextStepView` suele producir resultados seguros, esa propiedad no está impuesta en estos handlers. Debe restituirse una condición explícita coherente con `catalogGate`, productos verificados, señal aplicable y `renderHint`, y probar los casos de gate cerrado y cero productos.

**2. El CTA de carrito puede ser accionable sin ruta completa.** `convertCartOperatorToAdvisoryCta` siempre crea `ADD_READY` para un ID no vacío, aun cuando faltan sección y slug. Sustituirlos por `'catalogo'` y `''` no es derivación dinámica válida. Ante datos insuficientes debe producir una vista no accionable —o resolver y verificar el producto antes de construirla—. La aserción de que un clic concreto no llama a `addItemMock` no cubre este caso.

**3. El fallback del dispatcher no es inequívocamente seguro.** Tras fallar un handler, presentar `params.data.message` puede mostrar como respuesta fiable el texto de la misma salida que no se consiguió procesar. Para fallos de cápsulas, use un mensaje fijo de error recuperable; no reutilice texto no validado como confirmación de una operación.

## Condiciones para una nueva revisión

1. Añadir pruebas de `catalog_gate` cerrado, `renderHint: 'HIDE'`, cero productos y acciones generadas para *kitting* e *inventory*, verificando tanto `suggestedProducts` como `capsule_contract.next_step_view`.
2. Probar propuestas `ADD` sin slug/sección, con ID o variante no resolubles y con cantidades límite; exigir ausencia de CTA accionable hasta su validación.
3. Probar dispatcher con nombres heredados, handler que rechaza, telemetría que rechaza **y** que lanza síncronamente, y salida `data.message` engañosa.
4. Probar dos suscripciones simultáneas y un enriquecimiento que termina después de `unsubscribe`; hacer recursivo el guard arquitectónico de hooks.

**Conclusión:** typecheck limpio y las suites comunicadas en verde respaldan las rutas cubiertas, pero no compensan la eliminación observable de condiciones de seguridad ni verifican los estados límite anteriores. No aprobaría este commit para cerrar el dictamen **REJECT**.