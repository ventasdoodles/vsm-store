# VSM STORE — ARQUITECTURA DE AGENTES OPENAI & OPTIMIZACIÓN LUNA 6 PRO
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Batch Mode)
## Asunto: Dictamen y Blueprint de Migración y Optimización de Cesarin a la Arquitectura de Agentes de OpenAI (GPT-6 Luna Pro)

---

### 1. CONTEXTO Y MISIÓN
El dueño de VSM Store ha ordenado modernizar y optimizar la infraestructura de inteligencia de Cesarin:
1. **Migración a OpenAI GPT-6 Luna Pro (`openai/gpt-6-luna-pro`)** vía OpenRouter.
2. **Aplicación estricta de las mejores prácticas y estándares de la documentación oficial de OpenAI para construcción de agentes:**
   - Arquitectura de agentes (Handoffs vs. God Agent monolítico).
   - Optimización de Prompt Caching (prefijos congelados para aprovechar el costo de \$0.01 USD / 1M tokens de lectura de caché).
   - Calibración de latencia mediante `reasoning_effort` (`none` / `low` para interacción en tiempo real).
   - Structured Outputs con `strict: true` para erradicar fallos de serialización JSON.
   - Prevención de sobrecarga de herramientas (*Tool Overload*) y contexto inflado (*Suitcase of Bricks*).
3. **Convergencia con la voz natural y humana de César:** Garantizar que la optimización técnica potencie la calidez conversacional de un vendedor experto de mostrador mexicano, sin relajar ninguna de las compuertas de seguridad operativa (Lanes 6, 7 y 8).

---

### 2. INVESTIGACIÓN: ESTÁNDARES Y PATRONES DE AGENTES OPENAI

A partir de la documentación oficial del **OpenAI Agents SDK** y guías de ingeniería de OpenAI, se extraen cinco principios arquitectónicos fundamentales para agentes en producción:

#### A. Prompt Caching Determinista (Ahorro del 90% en latencia y costo)
* **Regla de oro de OpenAI:** La caché de prompts se activa automáticamente a partir de 1,024 tokens y requiere coincidencia exacta de prefijo (*exact prefix matching*).
* **Estructuración estricta de 3 bloques:**
  - **Bloque 1 (Prefijo Congelado / 100% Estático):** System Persona de César, reglas operativas de la tienda (políticas fijas de envío/pago DHL y transferencias), definiciones completas de Tools y Esquema JSON de salida (`strict: true`). Este bloque supera los 1,024 tokens y **se mantiene idéntico en todas las peticiones**. En Luna Pro, esto garantiza un costo de lectura de \$0.01 por millón de tokens en lugar de \$0.10.
  - **Bloque 2 (Contexto Semi-estático de Sesión):** Perfil del cliente, compras históricas y nivel de lealtad. Se actualiza solo entre sesiones.
  - **Bloque 3 (Zona Dinámica al Final):** Historial inmediato de los últimos 2-3 turnos, último mensaje del cliente y resultados recientes de herramientas.
  - **Anti-patrón erradicado:** Nunca colocar timestamps volátiles, IDs de turno dinámicos o datos de reloj en el Bloque 1 o 2, ya que invalidan la caché en cada interacción.

#### B. Arquitectura de Especialización con Handoffs vs. "The God Agent"
* **El problema del Agente Monolítico:** Cuando un solo agente tiene 10 o 15 tools (búsqueda, catálogo, stock, tracking, políticas, carritos, cupones), el modelo sufre de degradación por *Tool Overload*, aumenta la latencia de inferencia y tiende a invocar herramientas innecesarias.
* **El patrón OpenAI Handoffs:**
  - **Triage / Concierge Agent (César de Mostrador):** Saluda, escucha, detecta la necesidad, hace preguntas si hace falta y mantiene la empatía humana.
  - **Catalog & Compatibility Specialist:** Sub-agente con acceso exclusivo a búsqueda de productos, stock en tiempo real y compatibilidad de resistencias/pods.
  - **Order & Support Specialist:** Sub-agente con acceso exclusivo a tracking DHL y validación de transferencias.
  - La transferencia (*handoff*) transfiere el estado mínimo útil sin arrastrar "maletas de ladrillos" (*suitcase prompts*).

#### C. Calibración de `reasoning_effort` para E-Commerce en Tiempo Real
* En modelos de la familia GPT-6 (Luna Pro / Sol Pro), OpenAI expone el parámetro `reasoning_effort`.
* **Política de calibración por caso de uso:**
  - `reasoning_effort: "none"` o `"low"`: Para saludos, respuestas directas, recomendaciones de catálogo y seguimiento de conversación general. Esto mantiene el TTFT (*Time to First Token*) por debajo de 400ms para una experiencia ultra fluida en móviles.
  - `reasoning_effort: "medium"`: Reservado exclusivamente para consultas de compatibilidad técnica cruzada compleja (ej. verificar si un tanque de una marca es compatible con un mod de otra mediante pin 510 y rango de watts de las resistencias).

#### D. Structured Outputs con `strict: true`
* Usar `response_format: { type: "json_schema", json_schema: { name: "cesarin_response", strict: true, schema: ... } }`.
* Con `strict: true`, el motor de OpenAI restringe gramaticalmente los logits para que la salida cumpla 100% el esquema JSON de Cesarin (`text`, `intent`, `products`, `next_step_view`), eliminando por completo cualquier posibilidad de error de parseo o respuestas truncadas.

#### E. Streaming WHATWG de Baja Latencia
* Conexión directa mediante Server-Sent Events (`stream: true`), aprovechando el parser WHATWG resistente a fragmentación TCP que ya tenemos en `src/services/concierge/remote-client.ts`.

---

### 3. DISEÑO DE INTEGRACIÓN EN VSM STORE

Actualmente, `supabase/functions/customer-intelligence/` llama directamente a la API de Google Gemini en `_shared/gemini-api.ts`.
El plan de modernización establece:

1. **Nuevo Adaptador Multi-Proveedor en `_shared/llm-provider.ts`:**
   - Soporta nativamente el protocolo OpenAI Chat Completions compatible con OpenRouter (`https://openrouter.ai/api/v1/chat/completions`).
   - Lee `OPENROUTER_API_KEY` y `CONCIERGE_MODEL` (`openai/gpt-6-luna-pro`).
   - Envía los headers recomendados por OpenRouter (`HTTP-Referer`, `X-Title: VSM Store Cesarin`).
   - Implementa Prompt Caching ordenando escrupulosamente los bloques: `system` (estático) -> `assistant/user` (historial) -> `user` (turno actual).
2. **Mantenimiento de Embeddings Locales:**
   - La búsqueda semántica de productos (`search_products`) en PostgreSQL pgvector continuará usando `gemini-embedding-001` (768 dimensiones) para no requerir re-indexar la base de datos de productos existente.
3. **Liberación de la Voz y Personalidad:**
   - Retiro definitivo del corte destructivo `compactCesarinCopy(..., 2)` en el frontend.
   - Adopción de la nueva pauta de voz avalada por Sol Pro: *cálido en el trato, sobrio en los hechos y explícito sobre lo no confirmado*.

---

### 4. REQUERIMIENTOS PARA TU DICTAMEN TÉCNICO (SOL PRO BATCH)

Como Principal Architect y Auditor Senior de OpenAI:

1. **Validación de la Arquitectura de Agente:**
   - ¿Consideras que esta arquitectura basada en el estándar del OpenAI Agents SDK es óptima para el e-commerce de VSM Store?
   - ¿Qué recomendaciones específicas tienes sobre la estructura del System Prompt para garantizar un hit de caché del 100% en las peticiones recurrentes de los clientes?
2. **Evaluación de GPT-6 Luna Pro como Motor Principal:**
   - Evaluando latencia, costo (\$0.10 input / \$0.01 cache read / \$0.50 output) y capacidades de razonamiento, ¿cuál es tu veredicto sobre la idoneidad de Luna Pro frente a alternativas como Gemini 3.8 Flash o DeepSeek V4 Flash?
   - ¿Qué valor de `reasoning_effort` recomiendas como predeterminado para el despachador de Cesarin?
3. **Checklist de Seguridad e Integridad Operativa:**
   - ¿Qué precauciones debemos tomar al migrar de Gemini a la API de OpenAI en las Edge Functions de Supabase para asegurar que `catalogGate.is_open`, la validación de stock y el aislamiento de carritos sigan blindados al 100%?
4. **Veredicto Ejecutivo y Recomendaciones:**
   - Emite tu dictamen técnico y autoriza el plan de implementación paso a paso.
