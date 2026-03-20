# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Cold Gate — Cesarin Anon Visibility / Auth Gating Truth

## 1. What changed

- No hay evidencia en código de que Cesarin esté gated por login.
- El gate real de visibilidad en storefront es dual:
  - flag global
  - autorización de sesión piloto

## 2. What is validated

- Cesarin se monta en `src/App.tsx` únicamente si:
  - `settings?.is_ai_assistant_enabled`
  - `isPilotAuthorized`
- `isPilotAuthorized` depende sólo de:
  - `?pilot=cesarin`
  - `sessionStorage['vsm_storefront_ai_pilot_enabled'] === 'true'`
- `AIConcierge` no está envuelto en `user &&`.
- `useAIConcierge.ts` usa `user/profile` sólo para:
  - personalización del welcome
  - persistencia opcional de preferencias
  - no para habilitar el chat básico
- `PilotParityDiagnostics.tsx` confirma que el diseño vigente es:
  - session-scoped
  - `Enable Pilot Session`
  - `current browser session only`
- `AdminCesarinOS.tsx` sostiene el mismo diseño:
  - kill switch global
  - todavía sujeto al pilot gate
- `useStoreSettings.ts` sí puede ocultar Cesarin si falla la carga de settings:
  - fallback explícito `is_ai_assistant_enabled: false`

## 3. What remains open

- Si usuarios anónimos no ven Cesarin, las causas más probables son:
  - no activaron `?pilot=cesarin`
  - no existe session gate persistido
  - el kill switch global está cerrado
  - el fetch de settings cayó al fallback con `is_ai_assistant_enabled: false`
- Lo abierto es una decisión de producto/política:
  - si el piloto debe seguir siendo session-gated
  - o si debe exponerse más ampliamente a usuarios anónimos

## 4. What is approved

- Aprobado:
  - Cesarin no es authenticated-only por file-truth
  - la falta de filas anon puede explicarse por gating UI/sesión antes del mount
- No aprobado:
  - usar ausencia de telemetría anon como prueba de fallo RLS/write path
- El comportamiento actual se ve intencional, no accidental:
  - dual gate
  - no auth gate

## 5. Exact next move

- `clarify product policy only`
- No abrir lane de auth fix.
- Si producto quiere exposición más amplia a anónimos, eso sería un lane separado de visibility policy, no una corrección de drift de autenticación.
