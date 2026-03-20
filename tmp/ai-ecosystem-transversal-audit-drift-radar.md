<!--
Generado con:
- Modelo de lenguaje: Codex (GPT-5)
- IDE: Visual Studio Code
-->

# AI Ecosystem Transversal Audit: Drift Radar

## 1. Qué cambió respecto al mapa mental previo

- El ecosistema AI real del repo es más amplio que Cesarin: hay AI operativa en dashboard, CRM, command palette, supplier reorder, inventory oracle y product copy.
- Varias superficies que parecían `AI de adorno` no lo son: `DashboardPulse`, `AdminOracleDashboard`, `AIInsights`, `CustomerIntelligencePanel` y `AdminCommandPalette` sí tienen wiring real.
- El pipeline AI de producto existe, pero es más estrecho de lo que la UI puede sugerir: hoy genera `description`, `short_description` y `tags`; no hay evidencia de enrichment AI real para `specs`, atributos, secciones o tabs.
- El drift colateral principal fuera de marketing no es un colapso runtime: es drift de vocabulario, labels de modelo, honestidad de surfaces y una o dos tabs con madurez inflada.
- `marketing-intelligence` sigue siendo el hallazgo más fuerte, pero ya está dentro del carril activo de Antigravity; lo colateral relevante queda para después.

## 2. Qué quedó validado con evidencia

- `AIConcierge` + capsules + retrieval son backend AI real y afectan storefront.
- `PilotTelemetry` consume `ai_analytics` real; `TabAnalytics` no.
- `product-intelligence` existe y está consumida desde `ProductEditorDrawer`; su output sí impacta storefront y search.
- `DashboardPulse` usa `dashboard-intelligence`; `AdminOracleDashboard` usa `inventory-oracle`; `AIInsights` usa `customer-intelligence`.
- `CustomerIntelligencePanel` usa `customer-narrative`, `loyalty-intelligence`, `customer-intelligence`, `ai_customer_memory` y `customer_intelligence_360`.
- `AdminCommandPalette` usa búsqueda real + NLP real (`parse_admin_intent`) + voz browser.
- `SupplierOrderModal` usa `generate_supplier_copy` real.
- Canon actual confirma:
  - Wave 192 `DONE`
  - Base Build `v112`
  - A64 `DONE`
  - pilot unrestricted
- Drift confirmado de strings/model labels:
  - headers/comentarios siguen diciendo `gemini-2.0-flash` o `Gemini 3.1/1.5`, mientras el runtime real ya usa `gemini-2.5-flash-lite` en varias functions.
- Hallazgo confirmado de honestidad dudosa:
  - `TabAnalytics` sigue anunciando `Wave 162`.

## 3. Qué sigue abierto

- Sigue abierto cuánto valor real tiene `TabAnalytics` como tab separada, pero la evidencia apunta a racionalización, no a rescate.
- Sigue abierto si el pipeline de producto debe alinearse explícitamente con lineamientos Cesarin; hoy no está mal, pero está separado y sin guardrails canónicos visibles.
- Sigue abierto un pase de canon/string governance transversal:
  - labels de modelo
  - copy de UI
  - nombres de features
  - comentarios/header docs en edge functions
- Sigue abierto el boundary `Learning` vs `Rules`; no es bug crítico, pero sí deuda conceptual.
- Sigue abierto decidir si `TabConcepts` debe endurecer honestidad UX antes de crecer.

## 4. Qué apruebas como líneas futuras plausibles

- `AI Canon / String Governance`
- `Admin AI Surface Rationalization`
- `Product AI Pipeline Alignment`
- `Learning-to-Rules Boundary Cleanup`
- `Concepts Honesty / Partial UX Tightening`

## 5. Cuál es la siguiente jugada exacta recomendada

- Dejar que Antigravity cierre `Marketing AI Reality Repair`.
- Después, atacar primero `AI Canon / String Governance`.
- En segunda posición, hacer `Admin AI Surface Rationalization`, empezando por `TabAnalytics` y luego `TabConcepts`.
- En tercera, revisar `Product AI Pipeline Alignment` para compartir criterios con Cesarin sin fusionar arquitecturas.
- Dejar `Learning-to-Rules Boundary Cleanup` como follow-up controlado, no urgente.

## A. AI Surface Inventory

| Superficie | Archivos clave | Tipo real | Evidencia | Riesgo | Recomendación |
|---|---|---|---|---|---|
| Storefront concierge | `concierge.service.ts`, `ai-capsule-orchestrator.service.ts` | REAL BACKEND AI | functions + capsules + retrieval vivos | ALTO | KEEP + HARDEN |
| `TabKnowledge` | `TabKnowledge.tsx`, `knowledge-ingestor` | REAL BACKEND AI | safe-edit + sync + store knowledge | ALTO | KEEP + HARDEN |
| `PilotTelemetry` | `PilotTelemetry.tsx`, `admin-pilot-ops.service.ts` | REAL BACKEND AI | lee `ai_analytics` real | MEDIO | KEEP |
| `TabAnalytics` | `TabAnalytics.tsx` | HONESTIDAD DUDOSA | hardcoded, `Wave 162`, sin wiring | MEDIO | DEPRECATE CANDIDATE |
| Product copy AI | `ProductEditorDrawer.tsx`, `admin-products.service.ts`, `product-intelligence` | REAL BACKEND AI | genera `description`, `short_description`, `tags` | ALTO | KEEP; ALIGN WITH CESARIN RULES |
| Dashboard Pulse | `DashboardPulse.tsx`, `admin-dashboard.service.ts`, `dashboard-intelligence` | REAL BACKEND AI | fetch on-demand real | MEDIO | KEEP + HARDEN |
| Oracle dashboard | `AdminOracleDashboard.tsx`, `inventory.service.ts`, `inventory-oracle` | REAL BACKEND AI | predicción real de stock | MEDIO | KEEP |
| CRM intelligence panel | `CustomerIntelligencePanel.tsx`, `admin-crm.service.ts` | HÍBRIDO | mezcla reglas locales + functions AI + memory | ALTO | KEEP + HARDEN |
| Command palette | `AdminCommandPalette.tsx`, `admin-nlp.service.ts` | HÍBRIDO | search real + NLP AI + voz local | MEDIO | KEEP |
| Supplier reorder copy | `SupplierOrderModal.tsx`, `admin-nlp.service.ts` | REAL BACKEND AI | `generate_supplier_copy` | BAJO | KEEP |
| `TabLearning` | `TabLearning.tsx` | HÍBRIDO | lee telemetry real, empuja a rules | MEDIO | MERGE candidate |
| `TabRules` | `TabRules.tsx` | HEURÍSTICA LOCAL / REGLAS | gobernanza persistida, no AI inferencing | BAJO | KEEP + HARDEN |
| `TabConcepts` | `TabConcepts.tsx` | HÍBRIDO | graph real + UX parcial | MEDIO | REDESIGN |
| Coupons AI | `CouponForm.tsx`, `admin-coupons.service.ts` | POSIBLE DRIFT | invoca `marketing-intelligence` ausente | ALTO | Fuera de este carril; dejar a Marketing AI Reality Repair |
| Flash deals AI | `FlashDealEditor.tsx`, `admin-marketing.service.ts` | HÍBRIDO | fallback local si falla AI | ALTO | Fuera de este carril; dejar a Marketing AI Reality Repair |

## B. Repo vs Canon Drift Map

### Drift confirmado

- Labels/model headers en varias edge functions siguen mencionando `gemini-2.0-flash` mientras el código usa `gemini-2.5-flash-lite`.
- `AIInsights.tsx` muestra `Efficiency: Gemini 3.1 Flash Lite` y badges internos `FLASH LITE 1.5`; eso no coincide limpiamente con el stack canónico de marzo 2026.
- `TabQuality.tsx` persiste `judge_model: 'gemini-2.0-flash'` mientras el canon lista `cesarin-qa-judge` bajo el stack especializado actual.
- `TabAnalytics.tsx` promete una wave vieja (`162`) y compite con surfaces operativas reales.

### Drift probable

- El pipeline `product-intelligence` está separado de lineamientos Cesarin; no hay contradicción canónica dura, pero sí falta de alineación explícita.
- `DashboardPulse` y `AIInsights` usan naming de `AI executive / flash lite` con copys que pueden sobrerrepresentar precisión semántica respecto a lo que validan.

### Falso positivo descartado

- `DashboardPulse` no es humo: sí llama backend real.
- `AdminOracleDashboard` no es heurística local: sí llama `inventory-oracle`.
- `AdminCommandPalette` no es sólo UX premium: sí usa NLP real.
- El pipeline de copy de producto no está muerto: sí existe y sí impacta storefront.

## C. Recommendation Matrix

| Línea futura | Motivo | Evidencia | Tamaño de cirugía | Riesgo | Dependencia | Cuándo |
|---|---|---|---|---|---|---|
| AI Canon / String Governance | Reducir naming drift y labels engañosos | drift confirmado en functions/UI | Pequeña-mediana | Bajo | ninguna | Después de marketing |
| Admin AI Surface Rationalization | Bajar confusión operativa | `TabAnalytics`, `TabConcepts`, solapes admin | Mediana | Medio | idealmente después de string governance | Después de marketing |
| Product AI Pipeline Alignment | Alinear copy AI con criterios Cesarin | pipeline vivo pero standalone | Mediana | Medio | útil tras governance | Después de marketing |
| Learning-to-Rules Boundary Cleanup | Claridad mental del operador | `TabLearning` rebota a `TabRules` | Pequeña-mediana | Bajo-medio | puede esperar | Después de rationalization |
| Concepts Honesty Pass | Evitar madurez falsa | `Nuevo Concepto` placeholder + UX parcial | Pequeña | Bajo | ninguna | Después de rationalization |

## D. Prompt Seeds

- `AI Canon / String Governance`

```md
Audita y corrige drift entre labels de modelo, copy de UI y nombres documentados en canon. Scope: dashboard AI, quality judge, analytics labels y edge function headers. No tocar runtime behavior salvo microajustes de honestidad.
```

- `Admin AI Surface Rationalization`

```md
Racionaliza superficies AI admin sin tocar concierge, pilot/PWA parity ni launcher admin-only. Prioriza `TabAnalytics`, `TabConcepts`, y cualquier surface que sobreprometa IA o duplique telemetry real.
```

- `Product AI Pipeline Alignment`

```md
Revisa `product-intelligence` y su consumo en admin products para alinear tono, seguridad comercial y criterios de calidad con el ecosistema Cesarin, sin fusionar arquitecturas ni mover la feature dentro de Cesarin.
```

- `Learning-to-Rules Boundary Cleanup`

```md
Aclara el boundary entre `TabLearning` y `TabRules`: detección vs gobernanza. Busca el ajuste mínimo de naming/flow/CTA que reduzca confusión sin rehacer Cesarin OS.
```

## Veredicto final obligatorio

`HAY DRIFT COLATERAL Y CONVIENE PRIORIZARLO DESPUÉS DE MARKETING`
