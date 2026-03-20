# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Cesarin Scenario Coverage / Fallback Taxonomy Audit

1. **qué cambió**
- El mapa de validación quedó más claro: el gap no está en “no hay ningún asset”, sino en que el coverage está **partido en dos**.
- Sí existe una referencia explícita a `general_concierge_dialog`, pero está en el carril de tests de edge/harness, no en el carril de simulación/admin que más probablemente se usa para leer salud funcional de Cesarin.
- Eso significa que la falla actual **podía escapar** del simulator/QA admin aunque existiera una alarma potencial en tests más bajos.

2. **qué quedó validado**
- En `src/__tests__/scenarios/cesarin_scenarios.json` **no** hay escenario explícito para:
  - greeting puro
  - chit-chat puro
  - diálogo general no-producto
- Sí hay cobertura para:
  - policy inquiry
  - product search
  - inventory outlook
  - mixed query con saludo prefijado
  - recomendación comercial de producto
  - degraded timeout UX
- La recomendación sí aparece, pero en clave **product-search**:
  - `¿Me recomiendas un vape barato?`
  - `recomiéndame algo frutal`
  - `quiero algo suave y rico`
- `general_concierge_dialog` **sí está representado** en assets de validación, pero sólo en:
  - `supabase/tests/test_config.ts`
  - consumido por `supabase/tests/test_sommelier.ts`
  - con el golden query `hola`
- `scripts/simulate_cesarin.ts` y `TabQuality.tsx` **no** modelan de forma explícita una taxonomía de falla por:
  - capsule contract mismatch
  - fallback genérico por contrato roto
  - no-results
  - backend/tool failure
- El simulator CLI valida:
  - intent
  - required tools
  - forbidden tools
  - latency
  - handoff básico
- Pero no valida de forma explícita:
  - `expected_capsule`
  - `capsule_name`
  - clase de fallback
  - que una consulta general termine en `general_concierge_dialog`

3. **qué sigue abierto**
- Sigue abierto si `supabase/tests/test_sommelier.ts` forma parte real del loop operativo que el equipo ejecuta con frecuencia; por archivo-truth existe, pero este pase no demuestra su uso rutinario.
- Sigue abierto si el carril admin/simulator debe seguir siendo el cockpit principal de confianza si no cubre el tipo de falla que acaba de aparecer.
- Sigue abierto un refinamiento de taxonomía para distinguir en reportes:
  - parse failure
  - contract mismatch
  - no-results fallback
  - backend/tool failure

4. **qué se aprueba**
- Se aprueba una línea futura **pequeña y no colisionante**, pero **después** de que termine la reparación funcional actual:
  - ampliar coverage de simulator/admin para `general_concierge_dialog`
  - y endurecer la taxonomía mínima de fallback en assets de validación
- No se aprueba tocar ahora:
  - `src/services/concierge.service.ts`
  - `supabase/functions/customer-intelligence/index.ts`
- Tampoco se aprueba una expansión grande del framework de testing; el gap es más quirúrgico.

5. **cuál es la siguiente jugada exacta**
- Esperar a que cierre el repair actual de Antigravity.
- Después, ejecutar un follow-up pequeño en assets de validación:
  - `src/__tests__/scenarios/cesarin_scenarios.json`
  - `scripts/simulate_cesarin.ts`
  - opcionalmente `src/components/admin/cesarin/TabQuality.tsx` sólo si hace falta exponer mejor la clase de falla ya persistida
- Objetivo:
  - agregar al menos 1 escenario explícito de greeting/general dialogue
  - y clasificar contract mismatch distinto de fallback genérico

### A. Coverage Gap Map
| asset/file | missing scenario or weak coverage | why it matters | severity | confidence |
|---|---|---|---|---|
| `src/__tests__/scenarios/cesarin_scenarios.json` | no pure greeting scenario | el bug actual vive exactamente en ese carril | alto | alto |
| `src/__tests__/scenarios/cesarin_scenarios.json` | no chit-chat / non-product concierge dialogue scenario | deja fuera el contrato `general_concierge_dialog` del simulator principal | alto | alto |
| `scripts/simulate_cesarin.ts` | does not assert `expected_capsule` / `capsule_name` | un contract mismatch puede pasar como respuesta “válida” si el intent no colapsa | alto | alto |
| `scripts/simulate_cesarin.ts` | fallback failure reasons too coarse | no distingue mismatch de contrato vs no-results vs tool/backend error | medio-alto | alto |
| `src/components/admin/cesarin/TabQuality.tsx` | report UI summarizes pass/non-pass, but not fallback class taxonomy | dificulta leer exactamente por qué falló una ruta | medio | medio-alto |
| `supabase/tests/test_config.ts` + `supabase/tests/test_sommelier.ts` | greeting coverage exists only here | si este harness no corre rutinariamente, el admin-facing validation no lo verá | medio | medio |

### B. Fallback Taxonomy Notes
- `current fallback class`
  - `Unexpected intent`
  - `Missing required tool`
  - `Latency warning`
  - generic error / execution error
- `ambiguity problem`
  - no separa cuando el intent fue correcto pero el `capsule_name` fue incorrecto
  - no separa fallback legítimo por no-results de fallback por contrato roto
  - no separa fallo de backend/tool de degradación UX controlada
- `recommended distinction`
  - `INTENT_PARSE_FAILURE`
  - `CAPSULE_CONTRACT_MISMATCH`
  - `NO_RESULTS_FALLBACK`
  - `BACKEND_OR_TOOL_FAILURE`
  - `DEGRADED_TIMEOUT_UX`

### C. Prompt Seed for Antigravity
```md
After the current Cesarin functional repair is merged, run a small `Cesarin Scenario Coverage / Fallback Taxonomy` follow-up only on validation assets.

Scope:
- `src/__tests__/scenarios/cesarin_scenarios.json`
- `scripts/simulate_cesarin.ts`
- optionally `src/components/admin/cesarin/TabQuality.tsx` only if needed to expose existing persisted failure classes more clearly

Goals:
1. add at least one explicit greeting / general-dialogue scenario that expects the `general_concierge_dialog` path
2. ensure the simulator validates expected capsule routing, not only intent/tool presence
3. distinguish fallback classes at minimum:
   - intent parse failure
   - capsule contract mismatch
   - no-results fallback
   - backend/tool failure

Constraints:
- do not touch the current runtime repair files
- no refactor of the whole testing framework
- keep it small and validation-focused
```
