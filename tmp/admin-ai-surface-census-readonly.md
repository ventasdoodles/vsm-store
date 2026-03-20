# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Admin AI Surface Census Read-Only

## 1. qué cambió
- Sí cambió el mapa, pero no hacia una cirugía grande.
- Fuera de los 4 archivos excluidos y fuera de los 3 ya auditados, no apareció un segundo cluster fuerte de “AI falsa”.
- Lo que sí apareció es un cluster más pequeño y más limpio: drift de labels/model names en surfaces admin reales con wiring válido, sobre todo entre CRM y QA.

## 2. qué quedó validado
- El resto del admin no muestra una sobrepromesa masiva comparable a los casos ya detectados antes.
- Estas surfaces siguen siendo sustancialmente honestas porque tienen wiring real:
  - `src/components/admin/dashboard/DashboardPulse.tsx`
  - `src/components/admin/dashboard/AdminOracleDashboard.tsx`
  - `src/components/admin/customers/CustomerIntelligencePanel.tsx`
  - `src/components/admin/ui/SupplierOrderModal.tsx`
  - `src/components/admin/cesarin/PilotParityDiagnostics.tsx`
- La convivencia `v113` global / `v112` táctico sigue justificada por scope y no vi drift material nuevo.
- El branding “Neural” dentro de Cesarin existe en:
  - `src/pages/admin/AdminCesarinOS.tsx`
  - `src/components/admin/cesarin/TabPersona.tsx`
  - `src/components/admin/cesarin/TabRules.tsx`
  - `src/components/admin/cesarin/TabSimulator.tsx`
  - `src/components/admin/cesarin/TabQuality.tsx`
  Pero por sí solo no alcanza para venderlo como issue material; ahí pesa más branding interno que mentira funcional.
- El drift realmente accionable quedó en dos puntos:
  - `src/components/admin/customers/CustomerIntelligencePanel.tsx` muestra `Motor de Retención Gemini 2.0`, mientras su backend estratégico va por `loyalty-intelligence`, cuyo runtime real ya está en `gemini-2.5-flash-lite`.
  - `src/components/admin/cesarin/TabQuality.tsx` persiste `judge_model: 'gemini-2.0-flash'`, mientras `supabase/functions/cesarin-qa-judge/index.ts` usa `gemini-2.5-pro`.

## 3. qué sigue abierto
- Sigue abierto un mini cluster de model-label honesty entre CRM y QA.
- Sigue abierto si `src/components/admin/ui/SupplierOrderModal.tsx` merece ajuste de copy en su footer; hoy lo considero menor porque sí hay wiring Gemini real.
- Sigue abierto `task.md`: no está presente en el repo, así que esa capa normativa no pudo verificarse contra archivo real.

## 4. qué se aprueba
- Se aprueba una cirugía más estrecha que `Admin AI Surface Rationalization`.
- La línea aprobable es:
  - `Admin Model / Label Honesty Pass`
- Debe limitarse a surfaces con wiring real pero labels/version strings rezagadas.
- El foco aprobado es:
  - `src/components/admin/customers/CustomerIntelligencePanel.tsx`
  - `src/components/admin/cesarin/TabQuality.tsx`

## 5. cuál es la siguiente jugada exacta
- Ejecutar un slice mínimo de `Admin Model / Label Honesty Pass` sólo en:
  - `src/components/admin/customers/CustomerIntelligencePanel.tsx`
  - `src/components/admin/cesarin/TabQuality.tsx`
- Alcance:
  - labels visibles de modelo
  - strings de helper/title relacionados con modelo
  - metadata persistida `judge_model` si sólo es nombre rezagado
- Exclusiones:
  - cero cambios de arquitectura
  - cero cambios en los 4 archivos excluidos
  - cero reapertura de A64 o Wave 193

## A. Cluster Map

| cluster name | affected files | issue pattern | severity | confidence | why it matters |
|---|---|---|---|---|---|
| Admin model-label drift | `CustomerIntelligencePanel.tsx`, `TabQuality.tsx` | labels/model strings no alineadas con runtime real | MEDIO | ALTO | genera falsedad factual pequeña pero verificable en surfaces activas |
| Cesarin neural branding | `AdminCesarinOS.tsx`, `TabPersona.tsx`, `TabRules.tsx`, `TabSimulator.tsx`, `TabQuality.tsx` | lenguaje grandilocuente tipo “Neural” | BAJO | MEDIO-ALTO | hoy parece branding interno más que sobrepromesa material |
| Honest AI-backed admin widgets | `DashboardPulse.tsx`, `AdminOracleDashboard.tsx`, `SupplierOrderModal.tsx` | branding AI con wiring real | BAJO | ALTO | no justifica cirugía por sí solo |

## B. Risk Matrix

| issue | severity | confidence | affected surface | recommended lane |
|---|---|---|---|---|
| Stale `Gemini 2.0` label in strategic CRM panel | MEDIO | ALTO | `CustomerIntelligencePanel.tsx` | Admin Model / Label Honesty Pass |
| Stale `judge_model: gemini-2.0-flash` in QA surface metadata | MEDIO | ALTO | `TabQuality.tsx` | Admin Model / Label Honesty Pass |
| Broad Cesarin “Neural” branding may read bigger than literal implementation | BAJO | MEDIO-ALTO | Cesarin tabs/header | no immediate lane |
| Supplier modal promotional Gemini footer may overstate optimization certainty | BAJO | MEDIO | `SupplierOrderModal.tsx` | defer / optional copy pass |
| `task.md` missing from repo despite documentary hierarchy | MEDIO | ALTO | baseline verification layer | doc hygiene follow-up |

## C. Prompt Seed for Antigravity

```md
Run a minimal `Admin Model / Label Honesty Pass` outside the current marketing/product lane. Scope strictly to:
- `src/components/admin/customers/CustomerIntelligencePanel.tsx`
- `src/components/admin/cesarin/TabQuality.tsx`

Goals:
- align visible model/version labels with the actual backend/runtime currently in use
- remove stale `Gemini 2.0` references where runtime has already moved
- keep all existing behavior intact
- no refactor, no architecture changes, no canon edits
- do not touch the 4 excluded files and do not reopen A64/Wave 193
```
