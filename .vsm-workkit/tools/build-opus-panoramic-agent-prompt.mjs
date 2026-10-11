import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const headCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
// Extract the comprehensive diff of the agent implementation:
const agentDiff = execSync('git diff fb27139a HEAD -- src/ supabase/functions/_shared/llm-provider.ts supabase/functions/customer-intelligence/', {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

// Read the Sol Pro final report
const solProReportPath = path.resolve('docs/audits/2026-10/sol-pro-maniac-agent-final-report.md');
const solProReport = fs.existsSync(solProReportPath)
  ? fs.readFileSync(solProReportPath, 'utf8')
  : 'Reporte de Sol Pro no disponible localmente.';

const prompt = `# VSM STORE — CONSULTA ESTRATÉGICA Y AUDITORÍA PANORÁMICA DE CÉSARÍN
## Evaluador: Anthropic Claude Opus 5.5 (Batch Mode - anthropic/claude-opus-5.5-20260921)
## Commit Evaluado: ${headCommit} (rama main de VSM Store)
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

Se acaban de ejecutar 3 fases de transformación y un ciclo de remediación en el commit \`${headCommit}\`:

### 1. Frontend & UX Conversacional:
- **Saludos amables en \`src/hooks/useAIConcierge.ts\`:** Se reemplazó el saludo paranoico (*"si no me la sé te lo digo sin inventarte cosas"*) por bienvenidas cálidas (*"¡Qué onda! Soy Cesarin. ¿Buscas algo en particular o te ayudo a encontrar una buena opción?"*).
- **Text Utils en \`src/lib/cesarin-text-utils.ts\`:** Se eliminó la regex que censuraba aperturas de cortesía mexicana como *"si quieres te muestro"*, *"si gustas te paso"*, *"yo arrancaría"*, preservando la amabilidad natural.
- **Fin del recorte destructivo:** En los 5 handlers de storefront (\`product-search-integrity\`, \`storefront-kitting-basket\`, \`storefront-inventory-outlook\`, \`storefront-compatibility-check\`, \`storefront-budget-rescue\`), se sustituyó el recorte forzado de 2 oraciones (\`compactCesarinCopy(..., 2)\`) por un límite natural de 8 oraciones para que Césarín pueda explicar comparativas y compatibilidades.
- **Fallbacks empáticos en \`turn-advisory.ts\` y \`capsule-dispatcher.ts\`:** Si el carrito es ambiguo o una herramienta falla, Césarín explica con tacto (*"Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha"*).

### 2. Guardrails Innegociables de Seguridad (Lanes 6, 7 y 8):
- **Catalog Gate:** \`catalogGate.is_open\` es obligatorio del lado servidor. Si el catálogo está cerrado, \`visibleProducts = []\` y \`compactNextStepView = undefined\`.
- **Aislamiento de Carrito:** Cero mutaciones automáticas de carrito en background. Césarín solo propone un CTA consultivo (\`ADD_READY\`) que exige que el cliente presione el botón para agregar. Sanitización estricta de cantidad [1, 99], sección y slug.
- **Aislamiento de DB en Hooks:** 0 imports en tiempo de ejecución de \`@/lib/supabase\` en \`src/hooks/\`. Realtime y health checks aislados en servicios dedicados con timeouts incondicionales.

### 3. Edge Functions & Adaptador Multi-Proveedor (\`supabase/functions/_shared/llm-provider.ts\`):
- Adaptador para OpenRouter con modelo \`openai/gpt-6-luna-pro\` (o configurable vía \`CONCIERGE_LLM_MODEL\`).
- Soporte de streaming SSE con transformación de chunks de OpenRouter hacia la estructura compatible de candidatos.
- Fallback automático hacia Google Gemini (\`geminiGenerateContent\` / \`geminiStreamGenerateContent\`) si no hay API key o si la red/HTTP falla.
- Búsqueda vectorial en PostgreSQL pgvector preservada de forma aislada e inmutable en \`gemini-embedding-001\` (768 dimensiones) en \`tools.ts\`.

### 4. Prompt Caching en Edge Functions:
- \`persona.ts\` y \`concierge-chat.ts\` organizados en 3 bloques de prompt:
  - Bloque 1: Prefijo Estático Congelado versionado (\`cesarin_v1_202610\`) con identidad, políticas de VSM Store y schema JSON.
  - Bloque 2: Contexto semi-estático de sesión del cliente.
  - Bloque 3: Turno dinámico con tools de catálogo, perfil de turno y mensaje del usuario.
- Eliminación de reglas de micromanagement (*"máximo dos frases"*, *"máximo una pregunta"*).
- Configuración de \`reasoning_effort: 'low'\` para baja latencia.

---

# 3. EL DICTAMEN PREVIO DE OPENAI SOL PRO BATCH

Hace unos momentos, **OpenAI GPT-6 Sol Pro** en modo Batch procesó este código y emitió su veredicto:
- **Voz y Calidez:** Calificación **8 / 10**. Celebró la naturalidad y la eliminación de los 5 pecados del bot.
- **Veredicto Global:** **\`REJECT\` para producción inmediata** debido a hallazgos en el adaptador LLM:
  1. *Falla silenciosa en streaming SSE:* Si OpenRouter devuelve HTTP 200 pero el stream se desconecta antes de emitir deltas o envía frames de error SSE, el transformador ignora las líneas y cierra el stream como un 200 vacío.
  2. *Validación síncrona:* Si la respuesta JSON de OpenRouter viene vacía o malformada, se debe validar antes de dar por exitoso el turno para disparar Gemini.
  3. *Eco en fallback de error de \`persona.ts\`:* Repetir 90 caracteres del query del usuario en un mensaje de error puede repetir datos sensibles.
  4. *Política de apartados en prompt:* Aclarar que no hay apartados bajo ninguna circunstancia.
  5. *Falta de test suite unitario dedicado* para \`llm-provider.ts\`.

---

# 4. DIFF CONSOLIDADO DEL AGENTE (fb27139a .. HEAD):

\`\`\`diff
${agentDiff}
\`\`\`

---

# 5. REPORTE COMPLETO DE SOL PRO BATCH (PARA TU REFERENCIA):

\`\`\`markdown
${solProReport}
\`\`\`

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
   - Cómo cerrar de forma definitiva los riesgos de streaming y resiliencia que señaló Sol Pro en \`llm-provider.ts\`.
6. **Veredicto y Próximos Pasos.**
`;

const targetPath = path.resolve('docs/audits/2026-10/opus-panoramic-agent-audit-prompt.md');
fs.writeFileSync(targetPath, prompt, 'utf8');
console.log(`Opus panoramic audit prompt written successfully to: ${targetPath} (${prompt.length} bytes)`);
