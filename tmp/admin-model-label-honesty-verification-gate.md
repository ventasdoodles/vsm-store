# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Admin Model / Label Honesty Verification Gate

## 1. qué cambió
- No cambió el diagnóstico de fondo: el drift accionable sí existe y sigue reducido a esos 2 archivos.
- La verificación fría confirmó que no es un problema amplio de arquitectura ni de wiring.
- Es un problema pequeño de honestidad de modelo/label:
  - uno visible en UI
  - uno persistido como metadata de reporte

## 2. qué quedó validado
- En `src/components/admin/customers/CustomerIntelligencePanel.tsx`, el string visible exacto es:
  - `Motor de Retención Gemini 2.0`
- Esa surface obtiene el análisis estratégico desde:
  - `src/hooks/admin/useAdminCustomers.ts`
  - `src/services/admin/admin-crm.service.ts`
  - function real: `supabase/functions/loyalty-intelligence/index.ts`
- El runtime real actual de esa surface es:
  - `const MODEL = 'gemini-2.5-flash-lite'`
- En `src/components/admin/cesarin/TabQuality.tsx`, el valor exacto persistido es:
  - `judge_model: 'gemini-2.0-flash'`
- Ese valor aparece dos veces y no es sólo mock:
  - se persiste dentro de `judge_eval` al actualizar `ai_simulation_reports`
  - también se usa para actualizar el estado local seleccionado
- El runtime real actual del juez es:
  - `supabase/functions/cesarin-qa-judge/index.ts`
  - `const MODEL = 'gemini-2.5-pro'`
- El fix correcto es:
  - `CustomerIntelligencePanel.tsx`: solo label visible
  - `TabQuality.tsx`: metadata persistida + metadata local
- No hace falta tocar comportamiento.

## 3. qué sigue abierto
- Sigue abierto un residuo menor en las cabeceras de las edge functions:
  - `@model gemini-2.0-flash`
  - pero eso queda fuera del scope de este pase, que es sólo sobre esos 2 archivos foco
- No hay más drift real dentro de estos dos flujos que justifique ampliar la cirugía.

## 4. qué se aprueba
- Se aprueba un parche mínimo y limpio sólo sobre esos 2 archivos.
- No se aprueba tocar hooks, services ni edge functions en esta línea.
- No se aprueba convertir esto en governance amplia ni en refactor.

## 5. cuál es la siguiente jugada exacta
- Ejecutar un micro-pass de `Admin Model / Label Honesty` sólo en:
  - `src/components/admin/customers/CustomerIntelligencePanel.tsx`
  - `src/components/admin/cesarin/TabQuality.tsx`
- Alcance:
  - reemplazar el label visible del panel CRM
  - alinear `judge_model` persistido/local con el runtime real del juez
- Sin tocar nada más.

## A. Exact Patch Map

| file | exact current string/value | exact supporting runtime truth | exact minimal replacement | visible label / metadata / both | risk if untouched |
|---|---|---|---|---|---|
| `src/components/admin/customers/CustomerIntelligencePanel.tsx` | `Motor de Retención Gemini 2.0` | `loyalty-intelligence` usa `const MODEL = 'gemini-2.5-flash-lite'` en `supabase/functions/loyalty-intelligence/index.ts` | `Motor de Retención Gemini 2.5 Flash Lite` | visible label | deja una falsedad factual visible en una surface activa |
| `src/components/admin/cesarin/TabQuality.tsx` | `judge_model: 'gemini-2.0-flash'` | `cesarin-qa-judge` usa `const MODEL = 'gemini-2.5-pro'` en `supabase/functions/cesarin-qa-judge/index.ts` | `judge_model: 'gemini-2.5-pro'` | metadata | sigue persistiendo evidencia de reporte con modelo incorrecto |

## B. Prompt Seed for Antigravity

```md
Run a minimal `Admin Model / Label Honesty` patch only for:
- `src/components/admin/customers/CustomerIntelligencePanel.tsx`
- `src/components/admin/cesarin/TabQuality.tsx`

Required changes:
1. In `CustomerIntelligencePanel.tsx`, replace the visible label `Motor de Retención Gemini 2.0` with the runtime-accurate label `Motor de Retención Gemini 2.5 Flash Lite`.
2. In `TabQuality.tsx`, replace both occurrences of `judge_model: 'gemini-2.0-flash'` with `judge_model: 'gemini-2.5-pro'` so persisted/local report metadata matches the actual `cesarin-qa-judge` runtime.

Constraints:
- no behavior changes
- no refactor
- no architecture changes
- do not expand beyond these two files
- do not touch canon docs or reopen any wave
```
