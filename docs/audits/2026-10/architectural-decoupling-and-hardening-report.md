# VSM STORE - ARCHITECTURAL DECOUPLING, WEBHOOK INGRESS HARDENING, AND EVIDENCE EXPANSION AUDIT REPORT

**Date:** 2026-10-24  
**Author:** Antigravity AI Engineering Worker  
**Audit Context:** Complete codebase analysis for architectural coupling, error vectors, bad practices, and missing verification evidence (`/boost`).  
**Status:** ACCEPTED (Zero Regressions, 100% Green Verification)  

---

## 1. Executive Summary

A panoramic audit of the VSM Store repository was executed following the `.vsm-workkit/` standards. The audit focused on 4 critical pillars:
1. **Architectural Coupling (Acoplamientos):** Direct Supabase imports in presentation and state layers.
2. **Runtime Error Vectors & Anti-Patterns (Errores & Malas Prácticas):** Unhandled rejections, unsafe destructuring, noisy DB exceptions, and SVGO deprecation warnings.
3. **Security Ingress Robustness (Seguridad en Ingress):** Webhook signature verification and edge case parameter parsing.
4. **Verification Gaps (Falta de Evidencia):** Critical services and stores operating without unit test suites.

All identified deficiencies were systematically resolved, accompanied by exhaustive test suites, static architectural enforcement, and zero build warnings.

---

## 2. Findings & Remediations

### 2.1 Architectural Decoupling: Presentation & State Isolation
- **Finding (Acoplamiento):** `src/pages/admin/AdminMonitoring.tsx` had a direct import of `@/lib/supabase`, creating raw Realtime presence channels directly inside a UI page.
- **Finding (Acoplamiento):** `src/stores/wishlist.store.ts` had a direct import of `@/lib/supabase`, calling `supabase.auth.getUser()` in 5 methods, bypassing the service layer.
- **Remediation:**
  - Extracted presence subscription lifecycle to `subscribeToMonitoringPresence` in `src/services/monitoring.service.ts` with explicit types (`ActiveMonitoringUser`), lifecycle guards (`disposed`), and error callbacks.
  - Decoupled `src/stores/wishlist.store.ts` to consume `getCurrentUser()` from `src/services/auth.service.ts`.
  - Upgraded `src/services/__tests__/db-isolation-services.test.ts` to enforce zero runtime Supabase imports across `src/hooks/**`, `src/pages/**`, `src/components/**`, and `src/stores/**` (20/20 test assertions).

### 2.2 Error Handling & Modernization: Wishlist Store & Auth Service
- **Finding (Malas Prácticas):** `wishlist.store.ts` performed unsafe destructuring `{ data: { user } }` without checking `data`, risking `TypeError: Cannot read properties of undefined (reading 'user')` and unhandled promise rejections on network drop.
- **Finding (Rendimiento):** `syncToDb` executed sequential `for...of` awaits against the network instead of parallel batch settlement.
- **Finding (Manejo de Errores):** `auth.service.ts::getCurrentUser()` threw raw Supabase errors instead of returning `null` when no session was active, triggering uncaught promise rejections across callers.
- **Remediation:**
  - Hardened `getCurrentUser()` with `try/catch` returning `Promise<User | null>`.
  - Replaced sequential `for` loop in `syncToDb` with `Promise.allSettled`.
  - Protected all fire-and-forget sync calls with `void getCurrentUser().then(...).catch(...)`.
  - Expanded `src/stores/__tests__/wishlist.store.test.ts` from 7 to 14 tests, verifying local operations, batch sync, load merging, and resilience against network failures.

### 2.3 DB Fallback & Null Safety: Admin Auth Service
- **Finding (Excepciones No Deseadas):** `src/services/admin/admin-auth.service.ts` failed with `TypeError` if `user` was null/undefined, and used `.single()` for DB queries, emitting noisy `PGRST116` errors in PostgREST logs for non-admin users.
- **Remediation:**
  - Added defensive guards `if (!user || !user.id) return false;`.
  - Replaced `.single()` with `.maybeSingle()`, cleanly returning `null` without generating console or server error logs when a user is not an administrator.
  - Created `src/services/admin/__tests__/admin-auth.service.test.ts` with 6 unit tests validating null cases, JWT fast path, and database fallback.

### 2.4 Webhook Ingress Robustness: Mercado Pago Signed Requests
- **Finding (Bug Funcional en Edge Case):** `supabase/functions/mercadopago-webhook/signed-request.ts` parsed query params using `[...getAll("data.id"), ...getAll("id")]`. If Mercado Pago sent matching `data.id` and `id` in the same URL, `urlIds.length` was 2, causing valid webhooks to be rejected with 400.
- **Finding (Robustez):** An empty or whitespace-only body caused `JSON.parse` to throw and emit misleading "Invalid JSON" errors.
- **Remediation:**
  - Deduplicated query IDs via `Array.from(new Set(rawUrlIds))`.
  - Handled whitespace/empty bodies by returning `null` without throwing.
  - Created `supabase/functions/mercadopago-webhook/__tests__/signed-request.test.ts` with 14 unit tests covering HMAC-SHA256 signature verification, replay attacks (5m timestamp window), 16KB payload limits, request-id validation, and duplicate parameter handling.

### 2.5 Build Warning Eradication: Vite SVGO Config
- **Finding (Ruido en Build):** `vite.config.ts` configured `removeViewBox: false` in SVGO's `preset-default`, which has been invalid since SVGO v3 and emitted 16 console warnings during every production build.
- **Remediation:**
  - Removed the obsolete override, achieving completely silent, clean production builds in Vite.

---

## 3. Verification Evidence

| Verification Phase | Command | Result |
| :--- | :--- | :--- |
| **All Repository Tests** | `npm run test:run` | **151/151 files passed** (1,079/1,079 tests passing) |
| **Core & Typecheck** | `npm run test:quick` | **78/78 core test files passed** (722/722 tests), `tsc --noEmit` 0 errors |
| **Linter** | `npm run lint` | **0 errors** (322 existing explicit any warnings) |
| **Production Build** | `npm run build` | **Clean build** in 23s, 0 SVGO warnings, release artifacts generated (`v113-5c6c2519`) |
| **VSM Gate - Repo Baseline** | `node .vsm-workkit/tools/workflow/vsm-gate.mjs --lane repo-baseline` | **PASS** |
| **VSM Gate - Prompt** | `node .vsm-workkit/tools/workflow/vsm-gate.mjs --lane prompt` | **PASS** |
| **VSM Gate - Canon** | `node .vsm-workkit/tools/workflow/vsm-gate.mjs --lane canon` | **PASS** |

---

## 4. Trazabilidad & Residual Risks

- **Decoupling Invariant:** The architectural guard in `db-isolation-services.test.ts` now prevents future regressions across hooks, pages, components, and stores.
- **Residual Risk:** End-to-end webhook delivery in production relies on live Supabase secrets and Mercado Pago signing keys, which cannot be simulated in local unit tests without live credentials. Local crypto assertions verify exact HMAC-SHA256 conformance.
