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