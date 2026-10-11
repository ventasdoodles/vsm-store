## Dictamen ejecutivo

**Autorizo la implementación como piloto condicionado, no como migración directa a producción.** La separación entre atención, catálogo y soporte es razonable para Cesarin, pero el plan atribuye garantías a la caché, al modelo y a `strict: true` que no pueden asumirse sin verificar el modelo y la ruta concreta de OpenRouter.

Hay tres correcciones previas indispensables:

1. **Confirmar disponibilidad y capacidades reales** de `openai/gpt-6-luna-pro` en OpenRouter: precio, lectura de caché, `reasoning_effort`, herramientas, JSON Schema estricto y streaming. No puedo validar aquí esa ficha ni las comparativas con Gemini 3.8 Flash o DeepSeek V4 Flash; deben tratarse como hipótesis de compra, no como hechos certificados.
2. **No prometer 100 % de cache hits, TTFT <400 ms ni cero errores de respuesta.** Un prefijo idéntico favorece la caché, pero intervienen la ruta, el modelo, la retención y la implementación del proveedor. `strict: true` ayuda a restringir la forma de una respuesta completada; no evita cortes por límite de tokens, errores de red, rechazos ni errores semánticos.
3. **Mantener las compuertas operativas fuera del modelo.** Cesarin puede proponer texto o solicitar herramientas; nunca debe decidir por sí mismo que hay catálogo abierto, stock confirmado, pago validado o acceso a un carrito.

### Arquitectura y prompt

Empezaría con un **orquestador César** y herramientas de alcance limitado. Introduciría handoffs a especialistas solo donde mejoren una métrica observada —por ejemplo, precisión de compatibilidad o aislamiento de soporte—: cada handoff añade una llamada, latencia y una frontera de estado. No sustituiría un *god agent* por varios agentes que reciben el mismo prompt enorme.

Orden recomendado de entrada:

1. **Prefijo estático versionado:** identidad y pauta de voz —«cálido en el trato, sobrio en los hechos y explícito sobre lo no confirmado»—, jerarquía de instrucciones, prohibición de inventar stock/compatibilidad/pagos, reglas estables y definiciones de herramientas. Mantener también estables su orden, nombres y esquemas.
2. **Contexto de sesión mínimo:** datos necesarios y autorizados del cliente; nunca información de otro cliente ni historiales completos «por si acaso».
3. **Turno dinámico:** resumen de estado, mensajes recientes y resultados de herramientas pertinentes, con el mensaje nuevo al final.

Versionaría el prefijo (`cesarin_prompt_vN`) y mediría **tokens efectivamente leídos de caché**. Evitar fechas e identificadores volátiles en el prefijo, pero también cambios accidentales de serialización, orden de tools o esquema. El umbral y la tarifa de caché deben confirmarse para **esa combinación de modelo y proveedor**. Una coincidencia exacta es una condición útil; no es una garantía de hit del 100 %.

### Motor, costo y latencia

**Luna Pro es candidato, no ganador demostrado.** Con las tarifas aportadas, su atractivo depende de la tasa *real* de caché, los tokens de salida, las llamadas adicionales de herramientas y los percentiles de latencia. Haría una prueba ciega con conversaciones reales anonimizadas frente a los otros candidatos, midiendo calidad factual, conversiones sin afirmaciones indebidas, costo por conversación, TTFT y latencia p50/p95.

Para el despachador recomiendo **`low` como valor inicial, si el modelo/ruta lo admite**. Usaría `none` únicamente tras comprobar que no deteriora clasificación, uso de herramientas o seguimiento de instrucciones; `medium` para compatibilidad compleja. Ni `low` ni `none` garantizan un TTFT concreto.

### Checklist de integridad para las Edge Functions

- **`catalogGate.is_open`:** calcularlo y hacerlo cumplir en el servidor antes de consultar o exponer catálogo. Una respuesta del modelo no puede abrirlo ni invalidarlo.
- **Stock y compatibilidad:** herramientas autorizadas con datos vigentes; revalidación transaccional al crear o modificar pedidos. Mostrar «no confirmado» si falta evidencia. No presentar resultados de búsqueda semántica como disponibilidad.
- **Carritos y pedidos:** identidad y ámbito de tienda derivados de la sesión verificada, no de argumentos redactados por el modelo; RLS, comprobación de propiedad y pruebas de acceso cruzado entre usuarios.
- **Pagos y tracking:** transferencias verificadas por el flujo autorizado, nunca por la interpretación de una captura o mensaje; tracking limitado al pedido al que el cliente tiene derecho.
- **Herramientas:** allowlist por especialista, validación de argumentos, límites de llamadas, timeouts e idempotencia para operaciones con efectos. Tratar resultados de catálogo, documentos y mensajes del cliente como **datos no confiables**, no instrucciones.
- **Salida:** schema estricto si la ruta lo soporta, más validación del lado servidor. Durante streaming, no asumir que fragmentos SSE constituyen JSON válido ni mostrar una acción no validada como definitiva. Manejar explícitamente truncamientos, rechazos y fallos de proveedor.
- **Datos y secretos:** `OPENROUTER_API_KEY` solo en Supabase Secrets; revisar retención, tratamiento de datos personales, registros y política aplicable a productos con restricción de edad. Verificar que `gemini-embedding-001` siga produciendo la dimensionalidad y configuración del índice existente.

### Implementación autorizada, por etapas

1. **Inventario y pruebas de referencia:** documentar el flujo Gemini actual y convertir Lanes 6, 7 y 8 en pruebas automatizadas de regresión, incluidos cierres de catálogo, stock agotado y carritos ajenos.
2. **Prueba de capacidades de OpenRouter:** solicitudes reales para modelo, parámetros, tools, schema estricto, streaming, uso de caché, errores y costos facturados. El protocolo compatible no implica paridad con OpenAI Agents SDK.
3. **Adaptador `_shared/llm-provider.ts`:** selección por configuración, secretos en servidor, timeouts, trazas sin datos sensibles y posibilidad de volver a Gemini. Conservar embeddings como subsistema separado.
4. **Orquestación mínima:** César y herramientas con permisos acotados; añadir especialistas y handoffs cuando los resultados de evaluación justifiquen su costo.
5. **Prompt versionado y salida validada:** prefijo estable, contexto mínimo y esquema probado; retirar `compactCesarinCopy(..., 2)` solo después de confirmar que el frontend puede presentar respuestas más naturales sin ocultar advertencias ni estados.
6. **Shadow traffic y despliegue gradual:** comparar respuestas sin efectos secundarios, luego habilitar porcentajes pequeños con métricas y rollback automático ante fallos de compuertas, serialización, latencia o costo.

**Criterio de aprobación final:** ninguna regresión en Lanes 6–8 ni en aislamiento de carritos; mejora demostrada de calidad conversacional; y costo y latencia medidos —no inferidos de la ficha comercial— dentro de los objetivos de VSM Store.