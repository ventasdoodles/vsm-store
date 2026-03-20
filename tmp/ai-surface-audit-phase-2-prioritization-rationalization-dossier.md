<!--
Generado con:
- Modelo de lenguaje: Codex (GPT-5)
- IDE: Visual Studio Code
-->

# AI Surface Audit Phase 2: Prioritization + Rationalization Dossier

## 1. Files inspected

- `src/pages/admin/AdminCesarinOS.tsx`
- `src/components/admin/cesarin/TabAnalytics.tsx`
- `src/components/admin/cesarin/TabConcepts.tsx`
- `src/components/admin/cesarin/TabLearning.tsx`
- `src/components/admin/cesarin/TabRules.tsx`
- `src/components/admin/cesarin/TabQuality.tsx`
- `src/components/admin/cesarin/PilotTelemetry.tsx`
- `src/components/admin/products/ProductEditorDrawer.tsx`
- `src/services/admin/admin-products.service.ts`
- `src/services/concierge.service.ts`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`

## 2. Priority ranking

### Top 3 a racionalizar

1. `TabAnalytics` -> mayor desalineación entre percepción y utilidad real.
2. `TabLearning` vs `TabRules` -> mayor solape operativo/mental para el operador.
3. `TabConcepts` -> valor real, pero con madurez presentada por encima de lo implementado.

### Top 3 a proteger y no tocar

1. `AIConcierge` + `concierge.service.ts` -> core runtime real.
2. `TabKnowledge` / `knowledge-ingestor` -> impacto directo en retrieval y contexto AI.
3. `PilotTelemetry` + human eval loop -> observabilidad operativa real desde `ai_analytics`.

## 3. Qué quedó validado como valioso y no tocaría

- `PilotTelemetry` es la telemetría real. Lo dice su propia UI y su wiring a `ai_analytics`; no compite por adorno, sirve para operación.
- `TabKnowledge` y el knowledge pipeline sí afectan runtime/storefront; no son backoffice ornamental.
- `AIConcierge` y el stack `customer-intelligence` / capsules / retrieval sí mueven producto real.
- Product AI copy sí genera valor real porque `ProductEditorDrawer.tsx` llena `description`, `short_description` y `tags`, y esos campos sí alimentan storefront/search.
- `TabQuality` tiene valor real de QA; no tocaría el módulo de fondo, aunque sí merece higiene puntual.
- `TabPilot` como consolidación de parity + telemetry + runbook sí tiene sentido y no parece humo.

## 4. Qué quedó validado como confuso / redundante / periférico

- `TabAnalytics` es el caso más claro: hoy es marginal/decorativa. Sus KPIs y visuales son estáticos y hasta mencionan `Wave 162`, mientras la telemetría real vive en `PilotTelemetry`.
- `TabLearning` y `TabRules` no son idénticas, pero hoy el salto entre `insight detectado` y `gobernanza persistida` está partido en dos tabs con lenguaje grandilocuente; eso sí puede confundir.
- `TabConcepts` sí funciona en lectura/edición relacional, pero el botón `Nuevo Concepto` sigue en placeholder. Eso comunica una suite más madura de lo que realmente entrega.
- `TabQuality` mezcla valor real con señales parcialmente rígidas: `judge_model: 'gemini-2.0-flash'` hardcodeado y algunas métricas/resúmenes presentadas como si fueran siempre confiables.
- El riesgo de drift canónico sigue vivo en strings de modelo/stack repartidos entre docs y UI.

## 5. Operator confusion map

- `TabAnalytics` compite con `PilotTelemetry`.
  - Confusión: ambos parecen `analytics`, pero sólo uno consume señales reales.
  - Resultado: el operador puede abrir la tab equivocada y sacar conclusiones de una superficie decorativa.
- `TabLearning` compite con `TabRules`.
  - `Learning` detecta casos y empuja a crear reglas.
  - `Rules` gobierna reglas reales.
  - El problema parece más de boundary/UX/naming que de arquitectura pura.
- `TabConcepts` compite consigo misma en expectativa.
  - La tabla y relaciones sí son operativas.
  - La acción primaria `Nuevo Concepto` no lo es.
  - Resultado: madurez falsa.
- `TabQuality` puede confundir señal real con narrativa demasiado cerrada.
  - Sirve para QA real.
  - Pero presenta algunas constantes y microcopys como si fueran verdad canónica estable.

## 6. Riesgos de complejidad innecesaria

- Mantener dos superficies de `analytics` cuando sólo una está cableada a datos reales.
- Fragmentar el loop `telemetry insight -> regla` entre `Learning` y `Rules` sin una delimitación fuerte.
- Presentar módulos parcialmente implementados con lenguaje de suite enterprise cerrada.
- Repetir strings de modelos/pipeline en UI y código sin una fuente única.
- Añadir más surfaces AI admin antes de podar o racionalizar las existentes.

## 7. Recommendation matrix

| Surface | Label | Problema real | Evidencia | Impacto | Recomendación |
|---|---|---|---|---|---|
| `TabAnalytics` | DEPRECATE CANDIDATE | UI estática compitiendo con telemetría real | KPIs hardcodeados, copy `Wave 162`, sin query/service | Confunde al operador | Demote/hide después del carril actual; no merece seguir como `analytics` principal |
| `PilotTelemetry` | KEEP + HARDEN | Es la fuente real y debería quedar inequívoca | Wiring directo a `ai_analytics` | Alto | Protegerla como cockpit operativo y evitar duplicados |
| `TabConcepts` | REDESIGN | Lo central funciona, pero la creación está incompleta | carga relaciones/aliases, pero `Nuevo Concepto` es placeholder | Medio-alto | Mantener, pero rediseñar honestidad UX antes de ampliar scope |
| `TabLearning` | KEEP + HARDEN | Valor real, boundary difuso con `Rules` | lee `ai_analytics`, CTA manda a `Rules` | Medio | Mantener por ahora; mejorar naming/flow |
| `TabRules` | KEEP + HARDEN | Control real, pero aislado del contexto que lo alimenta | CRUD real sobre `ai_rules` | Alto | Mantener; aclarar mejor que es `gobernanza persistida` |
| `TabLearning` + `TabRules` | MERGE CANDIDATE | Solape mental más que técnico | `onCreateRule` ya rebota entre tabs | Medio | Siguiente línea futura plausible: convergerlas |
| `TabQuality` | KEEP + HARDEN | QA real con riesgo de drift en strings/config rígida | `cesarin-qa-judge` real, `judge_model` fijo | Alto | No tocar el fondo; sí revisar hardcodes más adelante |
| Product AI copy | KEEP | Sí impacta producto visible y search | `generateProductCopy`, `description`, `short_description`, `tags` | Alto | Mantener; no mezclarlo con limpieza admin superficial |

## 8. Next-line candidates

### 1. Admin AI Surface Rationalization

- Pros: limpia confusión operativa sin tocar core runtime.
- Contras: puede dispersarse si intenta rehacer demasiados tabs a la vez.

### 2. Learning-to-Rules Boundary Cleanup

- Pros: alto valor con superficie controlada; ataca una confusión concreta.
- Contras: requiere criterio de UX y naming, no sólo cableado.

### 3. AI Canon/String Governance

- Pros: reduce drift futuro de modelos, labels y expected stack.
- Contras: menos visible para producto; fácil subestimarla aunque evita mentiras diagnósticas.

## 9. Prompt seeds para Antigravity

### Admin AI Surface Rationalization

```md
Objetivo: racionalizar superficies AI admin sin tocar runtime core, retrieval, concierge ni el carril actual de parity.
Scope estricto:
- auditar y ajustar sólo `TabAnalytics`, `TabLearning`, `TabRules`, `TabConcepts`
- no tocar `AIConcierge`, `TabKnowledge`, `PilotTelemetry`, `TabPilot`
Prioridades:
1. decidir si `TabAnalytics` debe quedar demoted/hidden o claramente marcada como no operativa
2. hacer más honesta `TabConcepts` sin refactor grande
3. reducir confusión entre `TabLearning` y `TabRules`
No crear módulos top-level nuevos.
No hacer giant rewrite.
Entrega: diff mínimo + justificación por cada ajuste.
```

### Learning-to-Rules Boundary Cleanup

```md
Objetivo: clarificar la separación operativa entre `TabLearning` y `TabRules` sin fusionarlas todavía.
Responder:
- qué copy/naming/CTA cambia para que el operador entienda `detección` vs `gobernanza`
- qué ajuste mínimo reduce el salto mental entre tabs
Restricciones:
- no reescribir Cesarin OS
- no tocar telemetry core
- no mover lógica de backend
- cambios pequeños, locales y reversibles
```

### AI Canon/String Governance

```md
Objetivo: detectar strings AI hardcodeadas con riesgo de drift entre UI, código y canon.
Scope:
- labels de stack esperado
- judge model strings
- modelos/embeddings visibles en surfaces admin
- cualquier expected/diagnostic surface
No tocar auth, policies, schema ni runtime behavior.
No vender cierre total; sólo centralización o normalización mínima si vale la pena.
```

## 10. Veredicto final del estado actual del ecosistema AI admin

- El ecosistema AI admin no está pasado de rosca en su core; donde de verdad importa, sí está justificado.
- La deuda principal está en racionalización de superficies, no en capacidad AI.
- `TabAnalytics` es hoy el mejor candidato real a poda controlada.
- `TabConcepts` merece honestidad de producto antes que expansión.
- `TabLearning` y `TabRules` merecen una línea futura específica de boundary cleanup.
- La siguiente línea estratégica con mejor relación valor/riesgo, una vez libre el carril actual, es racionalización controlada de surfaces AI admin, no más features AI.
