<!--
Generado con:
- Modelo de lenguaje: Codex (GPT-5)
- IDE: Visual Studio Code
-->

# AI Ecosystem Audit Phase 3: Executive Dossier

## 1. Files inspected

- `src/pages/admin/AdminCesarinOS.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/AdminCoupons.tsx`
- `src/components/admin/cesarin/TabKnowledge.tsx`
- `src/components/admin/cesarin/TabConcepts.tsx`
- `src/components/admin/cesarin/TabLearning.tsx`
- `src/components/admin/cesarin/TabRules.tsx`
- `src/components/admin/cesarin/TabAnalytics.tsx`
- `src/components/admin/cesarin/TabQuality.tsx`
- `src/components/admin/cesarin/TabPilot.tsx`
- `src/components/admin/dashboard/DashboardPulse.tsx`
- `src/components/admin/dashboard/AIInsights.tsx`
- `src/components/admin/dashboard/AdminOracleDashboard.tsx`
- `src/components/admin/customers/CustomerIntelligencePanel.tsx`
- `src/components/admin/coupons/CouponForm.tsx`
- `src/components/admin/flash-deals/FlashDealEditor.tsx`
- `src/components/admin/ui/SupplierOrderModal.tsx`
- `src/components/admin/ui/AdminCommandPalette.tsx`
- `src/components/admin/products/ProductEditorDrawer.tsx`
- `src/services/concierge.service.ts`
- `src/services/ai-capsule-orchestrator.service.ts`
- `src/services/inventory.service.ts`
- `src/services/admin/admin-products.service.ts`
- `src/services/admin/admin-dashboard.service.ts`
- `src/services/admin/admin-crm.service.ts`
- `src/services/admin/admin-coupons.service.ts`
- `src/services/admin/admin-marketing.service.ts`
- `src/services/admin/admin-nlp.service.ts`
- `src/hooks/admin/useAdminDashboard.ts`
- `src/hooks/admin/useAdminCustomers.ts`
- `src/hooks/admin/useAdminMarketing.ts`
- `src/hooks/admin/useVoiceRecorder.ts`
- `supabase/functions/product-intelligence/index.ts`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`

## 2. Full AI surface map

| Surface | Ubicación | Propósito | Estado real |
|---|---|---|---|
| `AIConcierge` + `customer-intelligence` + capsules | storefront/runtime | Asistente AI principal | Vivo y central |
| Cesarin OS core | admin | Operación AI, QA, telemetry, knowledge, concepts | Vivo |
| `TabKnowledge` + `knowledge-ingestor` | Cesarin | Knowledge ops + product AI flags | Vivo |
| `TabPilot` + `PilotTelemetry` + `ReviewDrawer` | Cesarin | Cockpit + human eval | Vivo |
| `TabQuality` | Cesarin | QA con juez | Vivo |
| `TabConcepts` | Cesarin | Graph / compatibility ops | Vivo pero parcial |
| `TabAnalytics` | Cesarin | Analytics AI aparente | Decorativo / marginal |
| `DashboardPulse` | admin dashboard | Narrativa de salud del negocio | Vivo |
| `AdminOracleDashboard` | admin dashboard | Predicción de stock | Vivo |
| `AIInsights` | admin dashboard | Proactive insights | Vivo |
| `CustomerIntelligencePanel` | admin customers | CRM AI / memory / narrative / WhatsApp | Vivo |
| `AdminCommandPalette` + NLP/voz | admin ui | Navegación + intent parsing + voz | Vivo |
| `ProductEditorDrawer` + `product-intelligence` | admin products | Product copy generation | Vivo |
| `CouponForm` AI helpers | admin coupons | Generar / forecast de cupones | Dudoso |
| `FlashDealEditor` AI helpers | admin flash deals | Sugerencias AI de ofertas flash | Parcial |
| `SupplierOrderModal` | admin ui | Copy AI para reorder | Vivo |

## 3. Product AI pipeline audit

### Qué existe realmente

- generación AI de `description`
- generación AI de `short_description`
- generación AI de `tags`
- persistencia del output en `products`
- invocación real desde `ProductEditorDrawer`
- backend real: `product-intelligence`

### Qué NO quedó evidenciado como pipeline AI vivo

- generación AI de `specs`
- generación AI de `badges`
- generación AI de `section`
- generación AI de `category`
- generación AI de atributos/variantes
- generación AI de tabs/secciones de producto

### Dónde se guarda el output

- `products.description`
- `products.short_description`
- `products.tags`
- campos auxiliares: `ai_sales_note`, `ai_is_featured`, `ai_exclude`

### Impacto real

- sí afecta storefront visible por `description` y `short_description`
- sí afecta search/discovery por `description`, `short_description` y `tags`
- sí afecta runtime AI parcialmente por `ai_is_featured`
- `ai_sales_note` parece más útil para operación/contexto AI que para storefront directo

### Estado del pipeline

- pipeline vivo
- útil
- conectado a UX real
- incompleto si el objetivo era enrichment estructural completo

### Alineación con Cesarin

- sí conviene `ALIGN WITH CESARIN RULES` en tono, honestidad comercial y guardrails
- no conviene meterlo dentro de Cesarin por default

## 4. Admin outside-Cesarin AI audit

### Módulos que sí sirven

- `DashboardPulse`
  - wiring real a `dashboard-intelligence`
- `AdminOracleDashboard`
  - wiring real a `inventory-oracle`
- `AIInsights`
  - wiring real a `customer-intelligence`
- `CustomerIntelligencePanel`
  - wiring real a `customer-narrative`, `loyalty-intelligence`, `customer-intelligence`, `ai_customer_memory`
- `AdminCommandPalette`
  - wiring real a búsqueda admin + NLP + voz
- `SupplierOrderModal`
  - wiring real a `customer-intelligence`

### Módulos dudosos o parciales

- `CouponForm`
  - llama `marketing-intelligence`
  - esa function no aparece en `supabase/functions`
  - resultado: surface AI dudosa / parcialmente rota
- `FlashDealEditor`
  - llama `marketing-intelligence`
  - tiene fallback local
  - resultado: usable, pero no AI backend confiable hoy

## 5. Qué quedó validado como uso real

- `AIConcierge` y runtime capsules
- retrieval / embeddings / knowledge ops
- `PilotTelemetry`, simulator, QA loop, human eval
- product copy AI para `description`, `short_description`, `tags`
- dashboard AI: pulse, oracle, proactive insights
- CRM AI: narrative, strategic analysis, WhatsApp copy, memory
- admin NLP/voice command palette
- supplier reorder AI copy

## 6. Qué quedó validado como redundante / huérfano / dudoso

- `TabAnalytics`: redundante/decorativa frente a `PilotTelemetry`
- `CouponForm` AI helpers: dudosos por dependencia a `marketing-intelligence` ausente
- `FlashDealEditor` AI suggestion: dudosa como AI backend real; hoy depende de fallback
- `TabConcepts`: no huérfana, pero sí parcial y con madurez inflada por UX
- `DashboardPulse`, `AIInsights`, `TabQuality`: útiles, pero con riesgo de drift por strings/model labels
- no hay evidencia de pipeline AI real para specs/attributes/category enrichment

## 7. Cesarin alignment opportunities

### Dónde sí conviene alinear

- `product-intelligence` con criterios de tono/calidad/guardrails
- supplier copy y WhatsApp copy con lineamientos de seguridad/comercial honesty
- labels de modelos/stack en dashboard y QA

### Dónde NO conviene mezclar

- dashboard AI con Cesarin OS
- CRM estratégico con brain/runtime de Cesarin
- command palette NLP con arquitectura de capsules

### Riesgos de centralizar de más

- convertir Cesarin en monolito
- mezclar tooling admin heterogéneo con runtime storefront

## 8. Recommendation matrix

| Surface / Module | Label | Motivo |
|---|---|---|
| `AIConcierge` + runtime capsules | KEEP + HARDEN | Core AI real del producto |
| `TabKnowledge` + retrieval stack | KEEP + HARDEN | Impacto directo en runtime/storefront |
| `PilotTelemetry` + human eval loop | KEEP | Telemetría operativa real |
| `TabQuality` | KEEP + HARDEN | QA real con riesgo de drift en hardcodes |
| `ProductEditorDrawer` + `product-intelligence` | KEEP | Pipeline vivo y útil |
| Product copy prompt/rules | ALIGN WITH CESARIN RULES | Conviene alinear criterios sin fusionar arquitecturas |
| `CustomerIntelligencePanel` | KEEP + HARDEN | CRM AI valioso |
| `DashboardPulse` | KEEP + HARDEN | Útil, pero con riesgo de drift |
| `AdminOracleDashboard` | KEEP | Wiring real con impacto útil |
| `AIInsights` | KEEP + HARDEN | Wiring real, riesgo de overclaim/drift |
| `AdminCommandPalette` NLP/voz | KEEP | Tooling útil y conectado |
| `SupplierOrderModal` | KEEP | AI utilitaria concreta |
| `TabLearning` + `TabRules` | MERGE | Candidato futuro por boundary confuso |
| `TabConcepts` | REDESIGN | Valor real, pero parcial |
| `TabAnalytics` | DEPRECATE CANDIDATE | Decorativa y compite con surfaces reales |
| Coupons AI via `marketing-intelligence` | REDESIGN | UI existe, backend faltante |
| Flash Deals AI via `marketing-intelligence` | KEEP + HARDEN | Mantener feature, reparar o sincerar backend |
| Edge functions AI no auditadas aquí | REMOVE ONLY IF EXPLICITLY APPROVED | Sin evidencia suficiente para eliminar |

## 9. Next-line candidates + prompt seeds

### 1. Admin AI Surface Rationalization

- Impacto: alto
- Riesgo: bajo-medio

```md
Objetivo: racionalizar superficies AI admin sin tocar concierge, retrieval, pilot/PWA parity ni launcher admin-only.
Scope:
- `TabAnalytics`
- `TabLearning`
- `TabRules`
- `TabConcepts`
Prioridades:
1. retirar o degradar analytics decorativo
2. hacer honesta la madurez de concepts
3. clarificar boundary learning vs rules
No giant rewrites.
No módulos top-level nuevos.
```

### 2. Product AI Pipeline Alignment

- Impacto: alto
- Riesgo: medio

```md
Objetivo: auditar y alinear `product-intelligence` con criterios canónicos de tono, seguridad y calidad del ecosistema Cesarin, sin moverlo dentro de Cesarin.
Scope:
- prompt actual
- outputs reales (`description`, `short_description`, `tags`)
- uso de `ai_sales_note`, `ai_is_featured`, `ai_exclude`
Responder:
- qué reglas deben compartirse
- qué debe seguir separado
- qué drift canónico existe
```

### 3. Marketing AI Reality Repair

- Impacto: medio-alto
- Riesgo: medio

```md
Objetivo: verificar el estado real del carril AI de cupones y flash deals.
Punto crítico:
- `marketing-intelligence` no está presente en `supabase/functions`
Tarea:
- confirmar si es drift real o feature incompleta
- decidir si se rehace, se demotea o se deja en fallback honesto
No tocar otros dominios ni el carril actual de Antigravity.
```

### 4. AI Canon/String Governance

- Impacto: medio
- Riesgo: bajo

```md
Objetivo: detectar y reducir drift entre canon y strings AI en UI/admin/functions.
Scope:
- model labels
- expected stack labels
- judge model strings
- dashboard AI labels
No tocar auth, schema ni runtime behavior salvo microajuste explícito.
```

## 10. Veredicto final del ecosistema AI completo del proyecto

- El ecosistema AI completo sí tiene núcleo real, útil y justificado en storefront, Cesarin, dashboard, CRM y product content.
- La mayor parte del valor real está viva.
- La deuda principal no es exceso de IA, sino coexistencia de:
  - surfaces maduras y surfaces decorativas
  - pipelines reales y carriles AI incompletos
  - riesgo de drift canónico en strings/model labels
- Hallazgo más fuerte fuera de Cesarin:
  - cupones/flash deals dependen de un backend AI no presente en `supabase/functions`
- Hallazgo más fuerte en contenido:
  - el pipeline AI de producto sí existe, pero hoy es copy/tagging, no enrichment estructural completo
- Resumen frío:
  - defender el core
  - alinear criterios
  - racionalizar la periferia
  - reparar el marketing AI incompleto antes de vender coherencia total del ecosistema
