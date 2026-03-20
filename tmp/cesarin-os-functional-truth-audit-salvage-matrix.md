# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Cesarin OS Functional Truth Audit / Salvage Matrix

1. **qué cambió**
- Sí apareció un hallazgo funcional real dentro de Cesarin, pero no está en PWA/parity ni en la pantalla blanca.
- El camino crítico storefront de Cesarin **sí existe y está vivo**, pero tiene un quiebre contractual concreto:
  - el backend puede devolver `general_concierge_dialog`
  - el cliente no lo ejecuta
  - eso degrada consultas tipo saludo/chit-chat a un fallback genérico
- También quedó claro que parte de la percepción “Cesarin no funciona” puede venir de **gating/visibility**, no de runtime muerto:
  - si `store_settings` falla o no trae fila, `useStoreSettings()` cae a fallback con `is_ai_assistant_enabled: false`
  - si no existe gate de sesión, `AIConcierge` no monta

2. **qué quedó validado**
- El camino exacto para que Cesarin aparezca en storefront hoy es:
  1. `src/App.tsx` carga `useStoreSettings()`
  2. `settings?.is_ai_assistant_enabled` debe ser `true`
  3. `isPilotAuthorized` debe ser `true` por `?pilot=cesarin` o `sessionStorage`
  4. entonces monta `AIConcierge.tsx`
  5. `useAIConcierge.sendMessage()` llama `concierge.service.ts`
  6. eso invoca `customer-intelligence`
  7. el edge responde texto o handoff a capsule
  8. `ai_analytics` se persiste en segundo plano
- Las piezas storefront → concierge → `customer-intelligence` → `ai_analytics` **sí están vivas**:
  - `src/hooks/useAIConcierge.ts`
  - `src/services/concierge.service.ts`
  - `supabase/functions/customer-intelligence/index.ts`
  - `src/services/admin/admin-pilot-ops.service.ts`
- Cesarin OS tiene valor operativo real hoy en:
  - `src/components/admin/cesarin/TabPilot.tsx`
  - `src/components/admin/cesarin/PilotTelemetry.tsx`
  - `src/components/admin/cesarin/ReviewDrawer.tsx`
  - `src/components/admin/cesarin/TabKnowledge.tsx`
  - `src/components/admin/cesarin/TabPersona.tsx`
  - `src/components/admin/cesarin/TabRules.tsx`
  - `src/components/admin/cesarin/TabSimulator.tsx`
  - `src/components/admin/cesarin/TabQuality.tsx`
- Hay evidencia directa del quiebre funcional:
  - `supabase/functions/customer-intelligence/index.ts` devuelve `requires_client_capsule: true` con `capsule_name: 'general_concierge_dialog'`
  - `src/services/concierge.service.ts` solo maneja:
    - `product_search_integrity`
    - `knowledge_rag_foundation`
    - `cart_operator`
  - no existe implementación cliente para `general_concierge_dialog`
  - `supabase/tests/test_config.ts` incluso la espera como capsule válida para `hola`

3. **qué sigue abierto**
- Sigue abierto si el problema dominante percibido por producto es:
  - gate apagado/no activado
  - o el bug de `general_concierge_dialog`
  - o ambos
- Sigue abierto si conviene endurecer después la visibilidad del estado de gate cuando `store_settings` cae a fallback.
- Sigue abierto el destino de shells parciales:
  - `src/components/admin/cesarin/TabConcepts.tsx` es parcialmente real, pero crear concepto sigue incompleto
  - `src/components/admin/cesarin/TabAnalytics.tsx` es shell estático, no superficie operativa real
- `task.md` no está en el repo auditado, así que esa capa normativa no pudo contrastarse contra archivo real.

4. **qué se aprueba**
- Se aprueba una cirugía funcional pequeña-mediana y bien delimitada:
  - **repair del contrato `general_concierge_dialog`**
- No se aprueba:
  - reabrir A64
  - reabrir Wave 193
  - mezclar esto con branding/copy
  - usar esta auditoría para una poda grande de Cesarin OS

5. **cuál es la siguiente jugada exacta**
- Reparar el handoff de diálogo general entre:
  - `src/services/concierge.service.ts`
  - `supabase/functions/customer-intelligence/index.ts`
- Objetivo:
  - que `general_concierge_dialog` deje de caer en fallback genérico
  - sin tocar gate, parity, PWA ni arquitectura amplia

### A. Critical Path Truth Map
| surface | file(s) | role in path | current truth | failure risk | confidence |
|---|---|---|---|---|---|
| Storefront AI gate | `src/App.tsx`, `src/hooks/useStoreSettings.ts`, `src/services/settings.service.ts` | visibility precondition | requires global kill switch + session gate | high | high |
| Pilot activation | `src/App.tsx`, `src/components/admin/cesarin/PilotParityDiagnostics.tsx` | session authorization | works via `?pilot=cesarin` or admin session toggle | medium | high |
| Concierge mount/UI | `src/components/ui/ai/AIConcierge.tsx` | user-facing entrypoint | real mounted bubble/chat when gate passes | low | high |
| Concierge hook | `src/hooks/useAIConcierge.ts` | message orchestration | live, handles timeout/error/cart bridge | medium | high |
| Concierge client service | `src/services/concierge.service.ts` | edge invocation + capsule execution | live for 3 capsules; missing `general_concierge_dialog` handling | high | high |
| Edge orchestrator | `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tools.ts` | analyst/sommelier/tool routing | live and telemetry-backed | medium | high |
| Telemetry persistence | `supabase/functions/customer-intelligence/index.ts`, `src/services/admin/admin-pilot-ops.service.ts` | ops truth | `ai_analytics` insertion and cockpit are real | low | high |
| Pilot cockpit | `src/components/admin/cesarin/TabPilot.tsx`, `src/components/admin/cesarin/PilotTelemetry.tsx` | admin observability | real operational surface | low | high |
| Knowledge ops | `src/components/admin/cesarin/TabKnowledge.tsx`, `src/hooks/useAdminKnowledge.ts`, `src/services/admin-knowledge.service.ts` | retrieval/admin tuning | real and connected to `knowledge-ingestor` | low | high |
| Compatibility concepts | `src/components/admin/cesarin/TabConcepts.tsx`, `src/services/admin-compatibility.service.ts` | concept/compatibility management | relations/aliases are real; concept creation incomplete | medium | high |
| Simulator + QA | `src/components/admin/cesarin/TabSimulator.tsx`, `src/components/admin/cesarin/TabQuality.tsx`, `supabase/functions/cesarin-qa-judge/index.ts` | lab + judge loop | real, but internal/lab-facing | low-medium | high |
| Static analytics shell | `src/components/admin/cesarin/TabAnalytics.tsx` | admin tab | not operational truth | low | high |

### B. Salvage Matrix
| surface name | status | why | evidence confidence | whether it affects real product value now |
|---|---|---|---|---|
| Storefront gate path | KEEP | core visibility contract is intentional and documented | high | yes |
| `useStoreSettings` fallback behavior | REPAIR | on fetch failure it silently hides Cesarin via `is_ai_assistant_enabled: false` | high | yes |
| `AIConcierge` UI shell | KEEP | real mounted storefront surface | high | yes |
| `useAIConcierge` | KEEP | live orchestration path | high | yes |
| `concierge.service` capsule bridge | REPAIR | missing `general_concierge_dialog` handling breaks a real intent path | high | yes |
| `customer-intelligence` core | KEEP | main Cesarin brain is alive and instrumented | high | yes |
| `TabPilot` + `PilotTelemetry` | KEEP | real ops cockpit on `ai_analytics` | high | yes |
| `ReviewDrawer` + eval loop | KEEP | human review loop is real | high | yes |
| `TabKnowledge` | KEEP | real operational value tied to retrieval | high | yes |
| `TabPersona` | KEEP | real config editor over `ai_configs` | high | indirect |
| `TabRules` | KEEP | real rule governance over `ai_rules` | high | indirect |
| `TabSimulator` | KEEP | real lab surface for runtime probing | high | indirect |
| `TabQuality` | KEEP | real judge/report surface | high | indirect |
| `TabLearning` | DEFER | useful but secondary, derived from telemetry rather than critical path | medium-high | indirect |
| `TabConcepts` | REDESIGN | partially real, but concept creation flow is incomplete | high | indirect |
| `TabAnalytics` | REMOVE | static shell with no operational truth today | high | no |

### C. Root Cause Buckets
- `gating/visibility`
  - real
  - strongest non-bug explanation for “no aparece Cesarin”
  - kill switch + session gate are both required
  - `useStoreSettings()` fallback can suppress UI silently
- `UI mount`
  - not the current problem by file-truth
  - `AIConcierge` mounts correctly when conditions pass
- `hook/service wiring`
  - real issue found
  - `general_concierge_dialog` is delegated by backend but not executed by client
- `backend/edge`
  - alive, not dead
  - the main issue is contract mismatch with client, not total backend outage
- `telemetry/ops`
  - alive
  - `ai_analytics`, pilot telemetry and evaluation loop are real
- `stale admin shell`
  - exists
  - mainly `TabAnalytics`, plus partial `TabConcepts`
  - not root cause of storefront failure
- `docs/runtime mismatch`
  - not material here
  - docs and runtime still align on dual gate and unrestricted pilot context
- `PWA/cache/deploy state`
  - not supported as current cause
  - user already validated local white-screen root cause was Vite down

### D. Prompt Seed for Antigravity
```md
Run a focused Cesarin functional repair on the general dialogue capsule contract.

Scope strictly to:
- `src/services/concierge.service.ts`
- `supabase/functions/customer-intelligence/index.ts`

Goal:
- fix the real path where `customer-intelligence` returns `requires_client_capsule: true` with `capsule_name: 'general_concierge_dialog'`, but the storefront client does not execute that capsule and falls back to a generic failure-style message.

Constraints:
- no A64/parity/PWA changes
- no marketing/product lane changes
- no Cesarin OS shell redesign
- preserve current gate behavior
- preserve telemetry
- keep the surgery small/medium and behavior-focused only on restoring valid general-dialog flow
```
