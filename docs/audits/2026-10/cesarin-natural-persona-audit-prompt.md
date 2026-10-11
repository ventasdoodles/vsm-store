# VSM STORE — AUDITORÍA Y CALIBRACIÓN DE VOZ, NATURALIDAD Y PERSONA DE CESARIN
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Batch Mode)
## Asunto: Transformación de Cesarin de "Bot Acartonado / Defensivo" a "Asistente Real / Vendedor Experto de Mostrador"

---

### 1. CONTEXTO Y ANTECEDENTES
VSM Store es un e-commerce especializado en vapeo, pods, líquidos y accesorios 420 en México.
La tienda cuenta con un asistente conversacional con IA llamado **César** (conocido por los clientes como **"Cesarin"**), potenciado por Edge Functions en Supabase y modelos de lenguaje (Gemini / Claude).

Durante las auditorías técnicas recientes (Lanes 6, 7 y 8), el equipo blindó con éxito la seguridad operativa: compuertas de catálogo estrictas, desacoplamiento de la base de datos, aislamiento de carritos y prevención de mutaciones huérfanas.

**Sin embargo, el dueño del producto ha levantado una bandera roja fundamental sobre la experiencia del usuario:**
> *"Necesito que auditen a Cesarin, o sea el asistente, para que suene natural, que no sea algo robótico, poco natural, poco amigable... no quiero un bot, quiero un asistente real."*

Al revisar el código fuente a fondo, descubrimos que los filtros de ingeniería y el diseño defensivo de prompts han terminado asfixiando la calidez, fluidez y autenticidad del asistente, haciéndolo sonar como un conmutador robótico o un chatbot bancario de los 2000s.

---

### 2. DIAGNÓSTICO: LOS 5 "PECADOS DE BOT" IDENTIFICADOS EN EL CÓDIGO

#### Pecado 1: El Saludo Paranoico y a la Defensiva
- **Ubicación en el código:** `src/hooks/useAIConcierge.ts` (Líneas 63 y 110)
  ```ts
  // Saludo general:
  content: 'Que onda, soy Cesarin. Te ayudo a ubicar algo de volada y si no me la se, te lo digo derecho.'

  // Saludo a cliente autenticado con nombre:
  content: `Que onda ${firstName}. Soy Cesarin; te ayudo a encontrar algo y, si algo me agarra en curva, te lo digo sin inventarte cosas.`
  ```
- **Problema de UX:**
  Ningún asesor o vendedor real en una tienda física te recibe diciéndote: *"Hola, si no me la sé te lo digo sin inventarte cosas"*. Es un texto escrito por ingenieros preocupados por las alucinaciones de la IA, pero transferido al usuario final genera desconfianza inmediata, frialdad y una bienvenida paranoica.

#### Pecado 2: La "Guillotina de 2 Frases"
- **Ubicación en el código:** 
  - `src/services/concierge/chat.ts` (Línea 132): `catalogGate.is_open ? 2 : 3`
  - `src/services/concierge/handlers/storefront-kitting-basket.handler.ts` (Línea 142): `visibleProducts.length > 0 ? 2 : 3`
  - `src/services/concierge/handlers/storefront-inventory-outlook.handler.ts` (Línea 149): `visibleProducts.length > 0 ? 2 : 3`
  - `src/services/concierge/handlers/storefront-budget-rescue.handler.ts` (Línea 140): `visibleProducts.length > 0 ? 2 : 3`
  - `src/services/concierge/handlers/storefront-compatibility-check.handler.ts` (Línea 146): `visibleProducts.length > 0 ? 2 : 3`
- **Problema de UX:**
  En cuanto Cesarin resuelve productos para mostrar en pantalla, el pipeline ejecuta `compactCesarinCopy(..., 2)`. Si el modelo redacta una recomendación rica, cálida y humana (ej. explicando por qué un pod le conviene por duración de batería, sabor y facilidad de cambio de cartuchos), el recortador le corta la última mitad de la respuesta. El cliente recibe solo 2 frases telegráficas, secas y frías.

#### Pecado 3: La Censura Activa de Cortesías y Modismos Amables
- **Ubicación en el código:** `src/lib/cesarin-text-utils.ts` (Líneas 38-41)
  ```ts
  function isRedundantClosingSentence(sentence: string): boolean {
      const normalized = normalizeCompactText(sentence);
      return /^(si quieres|si ya te gusto|si te late|si gustas|te conviene|vete por|yo arrancaria|yo me iria|para no hacerla larga|para no alargarla|te dejo unas opciones|te dejo unas cercanas|te paso|te muestro|si quieres te muestro|si quieres te paso|si quieres te dejo|si quieres te saco)/.test(normalized);
  }
  ```
- **Problema de UX:**
  El clasificador descarta proactivamente cualquier oración final que contenga expresiones cotidianas mexicanas de cortesía y asesoría (*"si gustas te muestro..."*, *"yo arrancaría con..."*, *"si te late..."*), bajo la premisa de que son "redundantes". Al purgarlas, elimina justo el pegamento emocional que hace que un asesor suene humano y empático.

#### Pecado 4: Fallbacks y Avisos Regañones de Conmutador
- **Ubicación en el código:**
  - En `src/services/concierge/turn-advisory.ts` (Línea 143):
    `'No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.'`
    (Suena regañón, como una directiva de sistema que le advierte al cliente de un límite técnico en vez de ofrecer ayuda con amabilidad).
  - En `src/services/concierge/capsule-dispatcher.ts` (Línea 33):
    `'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'`
    (Vocabulario de bot: "acción especializada de la consulta").
  - En `supabase/functions/customer-intelligence/persona.ts` (Líneas 87 y 90):
    `'¡Ups! Me agarraste un poco en curva con "${topic}". ¿Me podrías dar un poquito más de detalle para ayudarte bien?'`

#### Pecado 5: Micro-Management Asfixiante en los System Prompts
- **Ubicación en el código:** `supabase/functions/customer-intelligence/handlers/concierge-chat.ts` (Línea 1022)
  ```
  REGLA DE TURNO:
  - Responde directo cuando baste.
  - Pregunta solo por el dato minimo util.
  - Usa maximo dos frases cortas cuando alcance.
  - Usa maximo una pregunta.
  - Haz una sola jugada central por turno.
  - No repitas la misma recomendacion en respuesta, resumen y cierre.
  - No cierres con empuje comercial por reflejo.
  ```
- **Problema de UX:**
  Por un lado, el prompt le pide: *"Eres un vendedor experto de mostrador, cálido y empático"*, pero de inmediato le impone: *"usa máximo dos frases cortas, haz una sola jugada, no hables de más"*. Ante órdenes tan restrictivas, el LLM se hiper-restringe, opta por respuestas mínimas y pierde cualquier capacidad de construir rapport, calidez o conversación natural.

---

### 3. LA PROPUESTA DE TRANSFORMACIÓN

Queremos que el asistente se sienta verdaderamente como **César**:
1. **Identidad:** Un asesor de mostrador de confianza en una tienda de vapeo mexicana. Alguien buena onda, conocedor, con criterio propio pero sin soberbia ni jerga incomprensible.
2. **Capacidad de escucha:** Capaz de responder con calma, explicando el *por qué* de lo que recomienda (en 3 a 5 oraciones cuando amerita) sin que un algoritmo le mutile las oraciones.
3. **Modismos naturales:** Español mexicano orgánico, relajado y respetuoso (*"¡Qué onda!"*, *"va, con gusto"*, *"este jala con madre porque..."*, *"si apenas vas empezando, no te compliques..."*, *"sin bronca"*), evitando tanto el acartonamiento corporativo como la sobreactuación cómica forzada.
4. **Mantenimiento estricto de la seguridad:** Las compuertas duras (`catalogGate.is_open`, stock real en BD, validación de enteros para carritos) se mantienen 100% inviolables. Lo que se libera es la **expresividad y la calidez lingüística**, no los límites financieros ni la veracidad de los datos.

---

### 4. REQUERIMIENTOS PARA TU AUDITORÍA Y DICTAMEN (SOL PRO BATCH)

Como Principal Systems, Product & AI Experience Auditor:

1. **Evaluación Crítica del Diagnóstico:**
   - ¿Coincides con la identificación de estos 5 factores como la causa raíz de la sensación robótica/artificial de Cesarin?
   - ¿Qué otros factores en el pipeline de un Concierge de e-commerce suelen arruinar la naturalidad conversacional?

2. **Riesgos y Límites del Cambio:**
   - Al ampliar la longitud de las respuestas (ej. de 2 a 4-5 oraciones) y des-censurar las frases de cortesía, ¿qué riesgos de dispersión, palabrería (bloat) o confusión comercial debemos prevenir?
   - ¿Cómo aseguramos que un tono más amigable y relajado no comprometa la autoridad técnica ni la precisión en políticas de envío/pagos?

3. **Estrategia de Prompt Engineering y Calibración:**
   - ¿Cómo reformularías el `SYSTEM_PERSONA` y las `REGLAS DE TURNO` en `customer-intelligence` para que el modelo hable como un asesor real sin desobedecer los guardrails de datos?
   - ¿Qué ejemplos de "Before vs. After" recomiendas para los saludos iniciales, las recomendaciones de pods/líquidos y los mensajes de fallback de carrito?

4. **Plan de Implementación Recomendado:**
   - Qué cambios deben hacerse en el frontend (UI/hooks/text-utils) vs. qué cambios deben hacerse en las Edge Functions de Supabase (`customer-intelligence`).
   - Criterios de aceptación para validar que el asistente ya no suena a bot.

Por favor, entrega un informe estructurado, implacable, con análisis técnico profundo y recomendaciones directas para la ejecución.
