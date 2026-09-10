# AUDITORÍA Y REMEDIACIÓN ADVERSARIAL: MEGAREADINESS 4 LANES & HARDENING
**Fecha:** 2026-09-10  
**Lanes Implementadas:** 4 Lanes + 1 Lane de Remediación Adversarial  
**Commits Asociados:**
1. `e7ad5069`: feat(security): enforce strict environment validation in edge functions and remove demo keys
2. `7e400b69`: style(ui): eradicate hardcoded hex and inline styles across components
3. `0f080f29`: refactor(concierge): modularize chat service and useAIConcierge hook
4. `27c46b3e`: refactor(types): sanitize as any route casts and strip noisy logs
5. `1c5b3e38`: fix(concierge): enforce no-write smoke contract, harden sse parser, and fix 420 section resolver

---

## 1. Alcance y Objetivos de las 4 Lanes

### Lane 1: Edge Functions Security & Fallback Hardening
- **Objetivo:** Eliminar fallbacks a demo keys / bypasses inseguros y validar variables de entorno obligatorias (`MERCADOPAGO_ACCESS_TOKEN`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- **Archivos Modificados:**
  - `supabase/functions/checkout-submit/index.ts`
  - `supabase/functions/create-payment/index.ts`
  - `supabase/functions/customer-intelligence/index.ts`
  - `supabase/functions/mercadopago-webhook/index.ts`
- **Resultado:** Demostración y fallbacks inseguros eliminados. Retorno estricto de error con headers CORS en branches de fallo.

### Lane 2: CSS & Design System Normalization
- **Objetivo:** Erradicar valores hex arbitrarios (`[#...]`) y estilos inline en componentes del storefront para garantizar uniformidad en tokens de diseño.
- **Archivos Modificados:** 54 archivos en `src/components/`.
- **Resultado:** 0 hex arbitrarios en componentes del storefront. Normalización completa hacia la paleta semántica (`theme-primary`, `theme-secondary`, `vape-*`, `herbal-*`, `accent-primary`).

### Lane 3: Modularización de Módulos Monolíticos (God Modules)
- **Objetivo:** Desacoplar `src/services/concierge/chat.ts` (1,328 líneas) y `src/hooks/useAIConcierge.ts` (899 líneas).
- **Módulos Creados:**
  - `src/services/concierge/remote-client.ts`: Cliente HTTP remoto, resolución de auth token y streaming reader SSE.
  - `src/services/concierge/capsule-dispatcher.ts`: Ejecutor de las 11 cápsulas de cliente.
  - `src/hooks/concierge/useConciergeAudio.ts`: Manejo de grabación de audio, streams y `MediaRecorder`.
  - `src/hooks/concierge/useConciergeSmokeAudit.ts`: Rutinas de auditoría smoke no-write y auto-triggers.
  - `src/hooks/concierge/index.ts`: Barrera de re-exportación limpia.
- **Resultado:** `chat.ts` reducido a 208 líneas (-84%). `useAIConcierge.ts` reducido a 687 líneas (-24%).

### Lane 4: Tipado Estricto de Rutas (Zero-as any) y Sanitización de Logs
- **Objetivo:** Eliminar casteos `as any` en `<Link to={...}>` y llamadas `navigate({ to: ... })`, y limpiar logs de depuración ruidosos.
- **Archivos Modificados:**
  - `src/components/layout/header/UserMenuDropdown.tsx`
  - `src/components/layout/header/HeaderLogo.tsx`
  - `src/components/layout/header/HeaderActions.tsx`
  - `src/components/layout/header/MobileMenu.tsx`
  - `src/components/layout/header/CategoryDropdown.tsx`
  - `src/components/layout/header/MegaMenu.tsx`
  - `src/components/search/SearchBar.tsx`
  - `src/components/search/MobileSearchOverlay.tsx`
  - `src/hooks/useAIConcierge.ts`
  - `src/services/admin/admin-operator-actions.service.ts`
- **Resultado:** Enrutamiento estrictamente tipado mediante `to="/$section/$slug"` con parámetros `{ section, slug }`. Erradicación de `/chat` inexistente a favor de `/buscar?q=...`. Logs de diagnóstico atrapados y acotados a entornos de desarrollo (`import.meta.env.DEV`).

---

## 2. Auditoría Adversarial Independiente y Hallazgos

Se invocó un subagente auditor adversarial con la instrucción de probar activamente fallas de runtime, contratos rotos y regresiones.

### Hallazgos Críticos y de Alta Severidad Reportados:
1. **CRITICAL-01 (No-Write Smoke Bypass):** En `capsule-dispatcher.ts`, 10 de las 11 cápsulas de cliente llamaban a `logAITelemetry` sin verificar `!noWriteSmokeActive`. En `chat.ts`, el path genérico tampoco lo validaba.
2. **HIGH-01 (Fragilidad en Parser SSE):** `remote-client.ts` asumía que `event:` y `data:` llegaban en líneas contiguas dentro del mismo chunk (`lines[i+1]`). En redes móviles lentas o segmentación TCP, esto provocaba pérdida de texto o abortos con `Stream finished without metadata`.
3. **HIGH-02 (Fallo de Resolución de Sección en `SectionSlugResolver`):** Se llamaba a `useSectionFromPath()` sin configuración, cayendo siempre a `'vape'` e ignorando el parámetro `section` de la URL, rompiendo la resolución de categorías en la sección 420.
4. **HIGH-03 (Rutas Muertas a `/product/...`):** En `VisualScannerModal.tsx` y `ProactiveAISuggestions.tsx`, se navegaba a rutas inexistentes `/product/$slug` provocando 404s.
5. **MEDIUM-01 (Fuga de Stack Traces):** `full_error: errorObj.stack` en Edge Functions exponía detalles internos del runtime Deno.
6. **MEDIUM-02 (Inconsistencias en Tokens Tailwind):** `border-border-primary/10` inválido y opacidad en `borderColor.theme` sin marcador `<alpha-value>`.
7. **INFO-01 (Residuos de Archivos):** Existencia de archivo residual `customer-intelligence/index.ts.clean` y líneas en blanco excesivas en `telemetry.ts`.

---

## 3. Remediación Adversarial Aplicada (Commit `1c5b3e38`)

1. **Blindaje de No-Write Smoke:** Declaración de `noWriteSmokeActive` a nivel superior en `dispatchClientCapsule` y envoltura de todas las invocaciones a `logAITelemetry` bajo `if (!noWriteSmokeActive)`. En `chat.ts`, inclusión de `!options?.noWriteSmoke`.
2. **Máquina de Estados en Parser SSE:** Implementación de acumulación de `currentEventType` a través de límites de chunks y vaciado del buffer remanente al finalizar el stream.
3. **Corrección de Sección en `SectionSlugResolver`:** Extracción de `section` directamente de los parámetros de ruta (`useParams({ strict: false })`) con fallback seguro.
4. **Sanitización de Enlaces en Escáner Visual y Sugerencias:** Migración de `/product/...` a `to="/$section/$slug"` con parámetros válidos.
5. **Eliminación de Fugas de Información:** Supresión total de `full_error: errObj.stack` en `customer-intelligence`, `dashboard-intelligence` y `product-intelligence`.
6. **Tokens y Utilidades Tailwind:** Agregado de marcador `<alpha-value>` a `borderColor.theme` y generación de `accentColor` semántico.
7. **Higiene de Archivos:** Eliminación de `index.ts.clean` y formateo de `telemetry.ts`.

---

## 4. Matriz de Evidencia y Verificación

| Verificación | Comando | Resultado | Estado |
| :--- | :--- | :--- | :---: |
| **Monorepo Baseline** | `vsm-gate.mjs --lane repo-baseline` | Clean, `0 0` divergence | ✅ PASS |
| **Canon Gate** | `vsm-gate.mjs --lane canon` | Prompt reliability ok, clean whitespace | ✅ PASS |
| **Tipado Estricto** | `npx tsc --noEmit` | 0 errores TypeScript en todo el repo | ✅ PASS |
| **Concierge Vitest Suite** | `npx vitest run src/services/__tests__/concierge.service*` | 4 archivos, 56 pruebas pasadas | ✅ PASS |
| **Suite Completa de Pruebas** | `npm run test:quick` | 73 archivos, 633 pruebas pasadas | ✅ PASS |
| **Build de Producción** | `npm run build` | Manifest generado, sitemap válido (20 URLs), SW versionado | ✅ PASS |

---

## 5. Veredicto Final

**`ACCEPT`**  
Todas las 4 lanes del MegaReadiness y los hallazgos de la auditoría adversarial fueron plenamente implementados, verificados y blindados sin regresiones.
