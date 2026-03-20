<!--
Generado con:
- Modelo de lenguaje: Codex (GPT-5)
- IDE: Visual Studio Code
-->

# AI Ecosystem Audit Phase 3: Full Admin + Product Content Pipeline

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
- `src/components/admin/cesarin/PilotTelemetry.tsx`
- `src/components/admin/cesarin/PilotParityDiagnostics.tsx`
- `src/components/admin/cesarin/ReviewDrawer.tsx`
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

| Surface | Location | Purpose | Real status |
|---|---|---|---|
| `AIConcierge` / `customer-intelligence` / capsules | storefront + services | Storefront assistant real | Vivo y central |
| Cesarin OS core | `AdminCesarinOS.tsx` + tabs | Operación AI, QA, telemetry, knowledge, concepts | Vivo |
| `TabKnowledge` + `knowledge-ingestor` | Cesarin | Knowledge ops + product AI flags | Vivo |
| `TabPilot` + `PilotTelemetry` + `ReviewDrawer` | Cesarin | Cockpit operativo + human eval | Vivo |
| `TabQuality` | Cesarin | Judge QA sobre simulaciones | Vivo |
| `TabConcepts` | Cesarin | Graph/compatibility ops | Vivo pero parcial |
| `TabAnalytics` | Cesarin | Analytics AI aparente | Decorativo / marginal |
| `DashboardPulse` | Admin dashboard | Narrativa de salud del negocio | Vivo |
| `AdminOracleDashboard` | Admin dashboard | Predicción de stock | Vivo |
| `AIInsights` | Admin dashboard | Proactive insights | Vivo |
| `CustomerIntelligencePanel` | Admin customers | CRM AI, memory, narrative, WhatsApp | Vivo |
| `AdminCommandPalette` + NLP/voice | Admin layout/ui | Navegación + intent parsing + voz | Vivo |
| `ProductEditorDrawer` + `product-intelligence` | Admin products | Product copy generation | Vivo |
| `CouponForm` AI helpers | Admin coupons | Generate / forecast coupon AI | Dudoso / backend faltante |
| `FlashDealEditor` AI helpers | Admin flash deals | Suggested flash deal AI | Parcial / fallback-heavy |
| `SupplierOrderModal` | Admin UI | Supplier reorder copy | Vivo |

## 3. Product AI pipeline audit

### Qué existe realmente

- Generación AI de `description`
- Generación AI de `short_description`
- Generación AI de `tags`
- Persistencia en `products`
- Invocación real desde `ProductEditorDrawer` vía `generateProductCopy()`
- Backend real: `product-intelligence`

### Qué NO quedó evidenciado como pipeline AI real

- generación AI de `specs`
- generación AI de `badges`
- generación AI de `section`
- generación AI de `category`
- generación AI de atributos/variantes
- generación AI de tabs/secciones de producto

### Dónde guarda el output

- `description`
- `short_description`
- `tags`
- campos AI auxiliares: `ai_sales_note`, `ai_is_featured`, `ai_exclude`

### Impacto real

- `description` y `short_description` sí afectan storefront visible.
- `description`, `short_description` y `tags` sí afectan búsqueda/discoverability.
- `ai_is_featured` sí afecta runtime AI/capsules.
- `ai_sales_note` parece más útil para operación/contexto AI que para storefront directo.

### Estado del pipeline

- Vivo y útil.
- Incompleto si se esperaba enrichment estructural completo.
- Hoy es un pipeline de copy/tagging, no de estructuración total del producto.

### Alineación con Cesarin

- Sí conviene `ALIGN WITH CESARIN RULES` en tono, honestidad comercial y guardrails.
- No conviene meterlo dentro de Cesarin por default.
- El prompt actual de `product-intelligence` sigue siendo standalone.

## 4. Admin outside-Cesarin AI audit

### Módulos AI fuera de Cesarin que sí sirven

- `DashboardPulse`
  - Wiring real a `dashboard-intelligence`
  - Sirve como narrativa ejecutiva
- `AdminOracleDashboard`
  - Wiring real a `inventory-oracle`
  - Sirve y además conecta con impacto storefront
- `AIInsights`
  - Wiring real a `customer-intelligence`
  - Sirve como surface de insights proactivos
- `CustomerIntelligencePanel`
  - Wiring real a `customer-narrative`, `loyalty-intelligence`, `customer-intelligence`, `ai_customer_memory`, `customer_intelligence_360`
  - Es de las surfaces AI admin más ricas fuera de Cesarin
- `AdminCommandPalette`
  - Wiring real a búsqueda admin + NLP + voz
  - Sirve
- `SupplierOrderModal`
  - Wiring real a `customer-intelligence`
  - Sirve

### Módulos AI fuera de Cesarin que quedaron dudosos o parciales

- `CouponForm`
  - UX AI existe
  - Invoca `marketing-intelligence`
  - Esa function NO aparece en `supabase/functions`
  - Clasificación: parcial / dudoso / posible drift
- `FlashDealEditor`
  - UX AI existe
  - Invoca `marketing-intelligence`
  - Tiene fallback local si falla
  - Clasificación: usable, pero no AI backend confiable hoy

## 5. Qué quedó validado como uso real

- `AIConcierge` y su stack runtime
- `knowledge-ingestor` / retrieval / embeddings / capsules
- `PilotTelemetry`, `ReviewDrawer`, QA loop, simulator
- Product copy AI para descripciones y tags
- Dashboard AI: pulse, oracle, proactive insights
- CRM AI: narrative, strategic analysis, WhatsApp copy, customer memory
- Admin NLP/voice command palette
- Supplier reorder copy AI

## 6. Qué quedó validado como redundante / huérfano / dudoso

- `TabAnalytics`: redundante/decorativa frente a `PilotTelemetry`
- `CouponForm` AI helpers: dudosos/rotos por dependencia a `marketing-intelligence` inexistente
- `FlashDealEditor` AI suggestion: dudosa como `AI real` porque depende de backend ausente y cae a fallback
- `TabConcepts`: no huérfana, pero sí parcial; comunica más madurez de la que entrega
- `DashboardPulse`, `AIInsights`, `TabQuality`: útiles, pero con riesgo de drift por strings/model labels hardcodeadas
- No hay evidencia de pipeline AI vivo para specs/attributes/category enrichment

## 7. Cesarin alignment opportunities

### Dónde sí conviene alinear

- `product-intelligence` con criterios de tono/comercial honesty/guardrails
- labels de modelos y stack en dashboard/QA/admin surfaces
- supplier copy / WhatsApp copy con lineamientos de tono y seguridad

### Dónde NO conviene mezclar

- dashboard pulse/oracle con Cesarin OS
- CRM AI estratégico con Cesarin runtime core
- command palette NLP con Cesarin brain architecture

### Riesgos de centralizar de más

- convertir Cesarin en monolito dueño de toda IA del admin
- mezclar AI operativa de storefront con tooling administrativo heterogéneo

### Recomendación fría

- compartir reglas y criterios
- no fusionar arquitecturas sin necesidad

## 8. Recommendation matrix

| Surface / Module | Label | Motivo |
|---|---|---|
| `AIConcierge` + runtime capsules | KEEP + HARDEN | Core AI real del producto |
| `TabKnowledge` + retrieval stack | KEEP + HARDEN | Impacto directo en runtime/storefront |
| `PilotTelemetry` + human eval loop | KEEP | Telemetría operativa real |
| `TabQuality` | KEEP + HARDEN | QA real, pero con riesgo de drift en hardcodes |
| `ProductEditorDrawer` + `product-intelligence` | KEEP | Pipeline vivo y útil para contenido |
| Product copy prompt/rules | ALIGN WITH CESARIN RULES | Conviene alinear criterios sin fusionar arquitecturas |
| `CustomerIntelligencePanel` | KEEP + HARDEN | CRM AI real y valioso |
| `DashboardPulse` | KEEP + HARDEN | Sirve, pero con riesgo de strings/model drift |
| `AdminOracleDashboard` | KEEP | Wiring real y también impacto storefront |
| `AIInsights` | KEEP + HARDEN | Wiring real, pero riesgo de drift/overclaim |
| `AdminCommandPalette` NLP/voz | KEEP | Tooling útil y realmente conectado |
| `SupplierOrderModal` | KEEP | AI utilitaria concreta y localizada |
| `TabLearning` + `TabRules` | MERGE | Candidato futuro por boundary confuso |
| `TabConcepts` | REDESIGN | Valor real, pero parcial e incompleta en UX |
| `TabAnalytics` | DEPRECATE CANDIDATE | Decorativa y compite con surfaces reales |
| Coupons AI via `marketing-intelligence` | REDESIGN | UI existe, backend faltante |
| Flash Deals AI via `marketing-intelligence` | KEEP + HARDEN | Mantener feature, pero sincerar/rehacer backend AI |
| Edge functions AI no auditadas en consumo real | REMOVE ONLY IF EXPLICITLY APPROVED | No hay evidencia suficiente para eliminarlas |

## 9. Next-line candidates + prompt seeds

### 1. Admin AI Surface Rationalization

- Impacto: alto
- Riesgo: bajo-medio

```md
Objetivo: racionalizar superficies AI admin sin tocar concierge, retrieval ni el carril actual de parity.
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
Objetivo: auditar y alinear el pipeline de `product-intelligence` con criterios canónicos de tono, seguridad y calidad del ecosistema Cesarin, sin moverlo dentro de Cesarin.
Scope:
- prompt actual
- output fields reales (`description`, `short_description`, `tags`)
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
No tocar otros dominios.
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
- La principal deuda no es `demasiada IA`, sino mezcla de:
  - superficies admin muy maduras junto a otras decorativas
  - pipelines reales junto a carriles AI incompletos
  - riesgo de drift canónico en strings/model labels
- Hallazgo más fuerte fuera de Cesarin:
  - el carril AI de marketing para cupones/flash deals no está limpio; depende de una function ausente.
- Hallazgo más fuerte en contenido:
  - el pipeline AI de producto sí existe, pero hoy es copy/tagging, no enrichment estructural completo.
- Resumen frío:
  - defender el core
  - alinear criterios
  - racionalizar la periferia
  - reparar el marketing AI incompleto antes de venderlo como ecosistema coherente
