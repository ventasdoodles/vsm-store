import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const headCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
// Extract the comprehensive diff of the agent implementation:
const agentDiff = execSync('git diff fb27139a HEAD -- src/ supabase/functions/_shared/llm-provider.ts supabase/functions/customer-intelligence/', {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

const prompt = `# VSM STORE — AUDITORÍA ADVERSARIAL Y MANÍACA DEL AGENTE CÉSARÍN
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Batch Mode)
## Modelo Solicitado: openai/gpt-6-sol-pro:batch
## Commit Evaluado: ${headCommit} (rama main)
## Mandato del Product Owner: "una auditoría pero maníaca en general de todo lo que tiene que ver con el agente"

---

Eres **OpenAI GPT-6 Sol Pro**, el Principal Systems, Security & AI Architect de VSM Store.
Has sido comisionado para ejecutar una **auditoría implacable, profunda y maníaca** sobre la arquitectura completa de **Césarín**, el agente inteligente de VSM Store, tras la implementación de las 3 fases autorizadas en tus reportes previos (\`batch-1791709383\` y \`batch-1791711083\`).

El Product Owner exige que no tengas piedad: examina tanto la voz y psicología conversacional como la seguridad operativa, la concurrencia, las fugas de datos, el adaptador multi-proveedor LLM y la infraestructura de Prompt Caching.

---

## 1. EJES OBLIGATORIOS DE LA AUDITORÍA MANÍACA

### Eje 1: Humanización, Voz Natural y Desmantelamiento de los "5 Pecados del Bot" (Fase 1)
Evalúa minuciosamente:
1. **Saludos de bienvenida (\`src/hooks/useAIConcierge.ts\`):**
   - Antes: *"Que onda, soy Cesarin. Te ayudo a ubicar algo de volada y si no me la se, te lo digo derecho."* y *"si algo me agarra en curva, te lo digo sin inventarte cosas."*
   - Ahora: *"¡Qué onda! Soy Cesarin. ¿Buscas algo en particular o te ayudo a encontrar una buena opción?"* y *"¡Qué onda, \${firstName}! Soy Cesarin. Cuéntame qué traes en mente y lo vemos juntos."*
   - ¿Se eliminó la postura defensiva y la paranoia de advertir sobre alucinaciones desde el primer saludo?
2. **Censura por expresión regular (\`src/lib/cesarin-text-utils.ts\`):**
   - Se removió la regex que catalogaba como redundantes aperturas cordiales mexicanas (\`si quieres\`, \`si gustas\`, \`te paso\`, \`te muestro\`, \`yo arrancaría\`).
   - Se redujo \`isRedundantClosingSentence\` a únicamente frases de relleno vacío (\`para no hacerla larga\`).
   - ¿Es seguro este cambio? ¿Mantiene la deduplicación de ideas sin mutilar la cortesía?
3. **Erradicación de la guillotina de 2 oraciones (\`compactCesarinCopy(..., 2)\`):**
   - Se eliminó el truncamiento destructivo \`visibleProducts.length > 0 ? 2 : 3\` en los 5 handlers del storefront:
     - \`product-search-integrity.handler.ts\`
     - \`storefront-kitting-basket.handler.ts\`
     - \`storefront-inventory-outlook.handler.ts\`
     - \`storefront-compatibility-check.handler.ts\`
     - \`storefront-budget-rescue.handler.ts\`
   - Se homologó a un límite natural de 8 oraciones para dar espacio a comparativas y explicaciones técnicas de refacciones.
   - ¿Existe riesgo de verborrea o divagación incontrolada?
4. **Fallbacks operacionales y de carrito (\`turn-advisory.ts\` y \`capsule-dispatcher.ts\`):**
   - Carrito ambiguo: *"Claro, te ayudo. Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha."*
   - Fallo de dispatcher: *"No pude completar esa consulta en este momento. Podemos intentarlo de nuevo o, si me dices el modelo que tienes, te ayudo a ubicar la refacción."*
   - ¿Transmiten tacto y servicio sin exponer la arquitectura interna ni sonar a conmutador telefónico?

---

### Eje 2: Blindaje de Seguridad y Guardrails Innegociables (Lanes 6, 7 y 8)
Evalúa si la naturalidad introducida comprometió de alguna forma la seguridad:
1. **Compuerta de Catálogo (\`catalogGate.is_open\`):**
   - ¿Sigue siendo 100% innegociable del lado servidor?
   - Si \`catalogGate.is_open === false\`, ¿los handlers garantizan que \`visibleProducts\` sea estrictamente \`[]\` y \`compactNextStepView\` sea \`undefined\`, sin importar lo elocuente que sea el texto del modelo?
2. **Aislamiento de Mutaciones de Carrito:**
   - ¿Sigue siendo 100% imposible que el modelo o los handlers agreguen productos al carrito sin confirmación explícita del cliente en el botón (\`ADD_READY\` CTA)?
   - ¿Se mantiene la sanitización estricta de cantidad finita numérica [1, 99], sección y slug?
3. **Aislamiento de Infraestructura de Base de Datos:**
   - ¿Se mantiene la garantía de 0 imports en tiempo de ejecución de \`@/lib/supabase\` en \`src/hooks/\`?
   - ¿Los callbacks de Realtime y health checks manejan fallos sin excepciones no capturadas?

---

### Eje 3: Adaptador Multi-Proveedor de Edge Functions (\`supabase/functions/_shared/llm-provider.ts\` - Fase 2)
Audita el nuevo adaptador de inferencia:
1. **Integración con OpenRouter (\`openai/gpt-6-luna-pro\`):**
   - Implementa el protocolo OpenAI Chat Completions (\`POST https://openrouter.ai/api/v1/chat/completions\`).
   - Envía cabeceras requeridas (\`Authorization\`, \`HTTP-Referer\`, \`X-Title\`).
   - Configura \`response_format: { type: 'json_object' }\` y \`reasoning_effort: 'low'\`.
2. **Canal de Streaming SSE:**
   - ¿La transformación de chunks de OpenRouter (\`choices[0].delta.content\`) hacia la estructura compatible de candidatos permite que el parser de streaming en \`concierge-chat.ts\` opere de forma continua sin romper la experiencia en tiempo real?
3. **Resiliencia y Fallback a Google Gemini:**
   - Si \`OPENROUTER_API_KEY\` no está configurada, o si OpenRouter responde con error 4xx/5xx o desconexión de red, ¿se activa el fallback transparente hacia \`geminiGenerateContent\` / \`geminiStreamGenerateContent\`?
   - ¿Garantiza que la sesión de chat nunca se caiga para el cliente?
4. **Aislamiento Estricto de Búsqueda Vectorial (PostgreSQL pgvector):**
   - ¿Se preservó \`geminiEmbedText\` con el modelo inmutable \`gemini-embedding-001\` (768 dimensiones) en \`tools.ts\` para evitar cualquier incompatibilidad con la base de datos de productos?

---

### Eje 4: Arquitectura de Prompt Caching y Calibración de Prompts (Fase 3)
Audita la estructura de bloques de prompt para maximizar el cache hit y reducir costos:
1. **Bloque 1 (Prefijo Estático Congelado):**
   - Versionado como \`<!-- prompt_version: cesarin_v1_202610 -->\`.
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
- **TypeScript:** \`npm run typecheck\` (\`tsc --noEmit\`) -> **0 errores** en todo el proyecto.
- **Vitest:** **102/102 pruebas pasando** en los suites afectados:
  - \`src/lib/__tests__/cesarin-text-utils.test.ts\` (26/26 PASS)
  - \`src/services/__tests__/capsule-dispatcher.test.ts\` (5/5 PASS)
  - \`src/services/__tests__/turn-advisory.test.ts\` (16/16 PASS)
  - \`src/services/__tests__/kitting-inventory-gates.test.ts\` (8/8 PASS)
  - \`src/services/__tests__/db-isolation-services.test.ts\` (17/17 PASS)
  - \`src/components/ui/ai/__tests__/AIConcierge.test.tsx\` (30/30 PASS)

---

## 2. DIFF CONSOLIDADO DEL AGENTE (fb27139a .. HEAD):

\`\`\`diff
${agentDiff}
\`\`\`

---

## 3. ESTRUCTURA REQUERIDA DE TU DICTAMEN

Por favor emite tu dictamen en Markdown profesional estructurado:
1. **Dictamen Ejecutivo Global:** Veredicto formal (\`ACCEPT\`, \`REJECT\` o \`ACCEPT WITH RESIDUAL RISK\`) con justificación de alto nivel.
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
`;

const targetPath = path.resolve('docs/audits/2026-10/sol-pro-maniac-agent-audit-prompt.md');
fs.writeFileSync(targetPath, prompt, 'utf8');
console.log(`Maniac agent audit prompt written successfully to: ${targetPath} (${prompt.length} bytes)`);
