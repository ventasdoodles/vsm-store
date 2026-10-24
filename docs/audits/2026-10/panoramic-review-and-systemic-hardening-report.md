# VSM STORE - PANORAMIC REVIEW & SYSTEMIC HARDENING REPORT
**Date**: 2026-10-24  
**Audit Lane**: Implementation & Canon Hardening  
**Scope**: Full Codebase Panoramic Review, Architectural Decoupling, Security Hardening, Ingress Robustness, and Test Evidence Expansion  
**Status**: APPROVED & VERIFIED (155/155 test suites, 1,132/1,132 unit tests passing, 0 TypeScript errors, 0 ESLint errors, 0 build warnings)

---

## 1. Executive Summary

This audit and remediation pass systematically examined the entire VSM Store codebase following the VSM WorkKit protocol. While prior work successfully identified and addressed several surface issues, a rigorous adversarial review uncovered multiple critical defects, architectural violations, security holes, and testing voids:

1. **Security Vulnerability in Admin Role Verification**: In `src/services/admin/admin-auth.service.ts`, the database fallback query checked only for the presence of a row in `admin_users` (`.maybeSingle()`) without checking `data.role`. Consequently, non-administrative accounts (such as `role: 'viewer'` or read-only auditors) were granted full administrative access whenever JWT claims were absent.
2. **Incomplete Architectural Decoupling (§1.1 Isolation)**: Multiple key modules (`src/contexts/AuthContext.tsx`, `src/actions/checkout.ts`, `src/App.tsx`, and `src/lib/conversion-measurement.ts`) directly imported `@/lib/supabase`, bypassing domain services and creating architectural leakage across context and action boundaries.
3. **SSR & Node Runtime Crash Vector**: `src/services/auth.service.ts` unconditionally referenced `window.location.origin` inside `signUp` and `resetPassword`, crashing in SSR, background tasks, and Node test execution with `ReferenceError: window is not defined`. In addition, wildcard queries (`.select('*')`) violated database efficiency standards.
4. **Realtime Presence Cleanup & Unhandled Async Rejections**: In `src/services/monitoring.service.ts`, channel teardown called `channel.unsubscribe()` but omitted `supabase.removeChannel(channel)`, leaving lingering channel references. Realtime presence callbacks lacked async rejection guards, and presence identities lacked normalization for anonymous visitors in `LiveUsersPanel.tsx`.
5. **High-Volume Concurrency Risk in Wishlist Store**: When syncing offline wishlist items to the database upon login, `wishlist.store.ts` fired N concurrent network requests using `Promise.allSettled`, which under large lists could trigger rate limiting or connection pool exhaustion.
6. **Raw HTTP Ingress in Inventory Service**: `src/services/inventory.service.ts` manually executed raw HTTP `fetch` and crafted manual JWT `Authorization` headers instead of using the standardized, typed Supabase edge function invocation client (`supabase.functions.invoke`).
7. **Webhook Ingress Robustness Gaps**: In `supabase/functions/mercadopago-webhook/signed-request.ts`, query parameter matching was case-sensitive (`data.id` vs `data.Id`/`DATA.ID`), event type comparison was case-sensitive causing false null returns on uppercase types (`TYPE=PAYMENT`), and bodies containing `action: 'payment.*'` without query types were silently dropped.
8. **Testing Evidence Voids**: Several core services had zero dedicated unit test coverage (`auth.service.ts`, `wishlist.service.ts`, `inventory.service.ts`, `tracking.service.ts`), and `db-isolation-services.test.ts` only checked hooks, pages, components, and stores, leaving contexts, actions, and root application files unmonitored.

All issues have been thoroughly remediated, unit-tested, and verified against the full repository test suite and build pipeline.

---

## 2. Systematic Findings & Root Causes

### Finding 1: Admin Role Authorization Bypass
- **File**: `src/services/admin/admin-auth.service.ts`
- **Input**: User with row in `admin_users` having `role: 'viewer'` and no JWT app metadata role.
- **Expected**: `verifyAdminRole()` returns `false`.
- **Actual**: Returned `true`.
- **Root Cause**: The database fallback query checked `if (error || !data) return false; return true;` without checking `data.role === 'admin' || data.role === 'super_admin'`.
- **Fix**: Added explicit role check verifying `data.role === 'admin' || data.role === 'super_admin'`. Added unit test in `admin-auth.service.test.ts` covering non-admin roles (`viewer`, `guest`).

### Finding 2: Direct Supabase Coupling across Contexts, Actions, and App
- **Files**: `src/contexts/AuthContext.tsx`, `src/actions/checkout.ts`, `src/App.tsx`, `src/lib/conversion-measurement.ts`
- **Expected**: Complete decoupling from `@/lib/supabase` per VSM WorkKit §1.1 isolation. Only modules under `src/services/**` should directly interact with Supabase clients.
- **Actual**: All four files imported `supabase` from `@/lib/supabase` directly.
- **Root Cause**: Incomplete migration during previous refactorings.
- **Fix**:
  - Exported `getAuthSession()` and `onAuthStateChange()` from `src/services/auth.service.ts` and refactored `AuthContext.tsx` to use them.
  - Exported `invokeCheckoutSubmit()` from `src/services/orders.service.ts` and `createMercadoPagoPayment()` from `src/services/payments/mercadopago.service.ts`, refactoring `src/actions/checkout.ts`.
  - Exported `isSupabaseConfigured` from `src/services/settings.service.ts` and refactored `src/App.tsx`.
  - Exported `insertConversationConversionEvent()` from `src/services/tracking.service.ts` and refactored `src/lib/conversion-measurement.ts`.

### Finding 3: SSR/Node ReferenceError in Auth Service
- **File**: `src/services/auth.service.ts`
- **Input**: Calling `signUp()` or `resetPassword()` in a Node.js test environment or SSR runtime.
- **Expected**: Clean execution with relative fallback URL.
- **Actual**: Threw `ReferenceError: window is not defined`.
- **Root Cause**: Unconditional access to `window.location.origin`.
- **Fix**: Added `typeof window !== 'undefined' ? `${window.location.origin}/...` : '/...'`. Replaced wildcard `.select('*')` on customer profiles with explicit column selector `CUSTOMER_PROFILE_SELECT`.

### Finding 4: Realtime Presence Lifecycle Leaks and Unhandled Rejections
- **Files**: `src/services/monitoring.service.ts`, `src/components/admin/monitoring/LiveUsersPanel.tsx`
- **Expected**: Clean removal of Supabase Realtime channel from the client manager on unmount, defensive handling of `TIMED_OUT` channel status, shielding against unhandled async callback rejections, and styled representation for anonymous users.
- **Actual**: `removeChannel` was omitted on unmount, `TIMED_OUT` was unhandled, async rejection in consumer callbacks crashed unhandled, and anonymous users lacked unified naming and avatar styling.
- **Fix**:
  - Added `supabase.removeChannel(channel)` in `subscribeToMonitoringPresence` and `unsubscribeChannel`.
  - Added `TIMED_OUT` channel status branch routing to `onError`.
  - Wrapped consumer callbacks in `Promise.resolve().catch(...)`.
  - Normalized anonymous fallback email to `'Anonimo'`.
  - Updated `LiveUsersPanel.tsx` to recognize `'Anonimo'`, `'Anónimo'`, and `'Desconocido'`, rendering "Visitante Anonimo" and neutral avatar.

### Finding 5: High-Volume Single-Row Mutations in Wishlist Sync
- **Files**: `src/services/wishlist.service.ts`, `src/stores/wishlist.store.ts`
- **Expected**: Single atomic batch database upsert when syncing offline items to the database upon user login.
- **Actual**: `syncToDb` fired N concurrent individual `addToWishlist` network requests via `Promise.allSettled`.
- **Fix**: Implemented `addItemsToWishlist(customerId: string, productIds: string[])` in `wishlist.service.ts` performing a single batch upsert with `onConflict: 'customer_id,product_id'`, and updated `syncToDb` in `wishlist.store.ts` to call this batch operation.

### Finding 6: Raw HTTP Ingress in Inventory Service
- **File**: `src/services/inventory.service.ts`
- **Expected**: Use standard `supabase.functions.invoke('inventory-oracle', ...)` client with built-in auth token propagation.
- **Actual**: Used raw `fetch(`${supabaseUrl}/functions/v1/inventory-oracle`, ...)` with manually extracted bearer headers.
- **Fix**: Refactored `inventory.service.ts` to invoke `supabase.functions.invoke('inventory-oracle', ...)`, added robust error logging and created a dedicated test suite with 4 passing tests.

### Finding 7: Webhook Ingress Robustness & Event Normalization
- **File**: `supabase/functions/mercadopago-webhook/signed-request.ts`
- **Expected**: Ingress correctly authenticates and processes webhooks regardless of parameter key casing (`DATA.ID`, `ID`), duplicate identical query parameters, uppercase event types (`TYPE=PAYMENT`), and payload `action: 'payment.created'`.
- **Actual**: Casing mismatches caused authentication rejection or returned `null`, duplicate params threw errors, and missing query types with `action: 'payment.*'` payload were ignored.
- **Fix**: Implemented case-insensitive regex for query parameters (`/^(?:data\.)?id$/i`, `/^(?:type|topic)$/i`), normalized types to lowercase, deduplicated query IDs via `Set`, and inferred payment event type when `action` starts with `'payment.'`. Added 3 new test cases bringing test suite to 17/17 passing.

### Finding 8: Missing Test Evidence & Incomplete Architecture Guards
- **Files**: `src/services/__tests__/db-isolation-services.test.ts`, plus new test suites
- **Expected**: Automated test assertions verifying zero Supabase coupling across all presentation, context, action, and store layers; unit tests for every modified service.
- **Actual**: `db-isolation-services.test.ts` only asserted hooks, pages, components, and stores. No unit tests existed for `auth.service.ts`, `wishlist.service.ts`, `inventory.service.ts`, or `tracking.service.ts`.
- **Fix**:
  - Expanded `db-isolation-services.test.ts` to assert zero violations in `src/contexts`, `src/actions`, `src/App.tsx`, and `src/lib/conversion-measurement.ts` (24/24 tests pass).
  - Created `src/services/__tests__/auth.service.test.ts` (20 tests).
  - Created `src/services/__tests__/wishlist.service.test.ts` (11 tests).
  - Created `src/services/__tests__/inventory.service.test.ts` (4 tests).
  - Created `src/services/__tests__/tracking.service.test.ts` (7 tests).

---

## 3. Inventory of Changes

| File | Change Description |
|---|---|
| `src/services/admin/admin-auth.service.ts` | Enforced strict role check (`data.role === 'admin' \|\| data.role === 'super_admin'`) in DB fallback. |
| `src/services/admin/__tests__/admin-auth.service.test.ts` | Added tests verifying non-admin role (`viewer`) is rejected and `super_admin` is accepted. |
| `src/services/auth.service.ts` | Added `CUSTOMER_PROFILE_SELECT`, `getAuthSession`, `onAuthStateChange`, and SSR window guards. |
| `src/services/__tests__/auth.service.test.ts` | **NEW**: 20 comprehensive unit tests covering session, sign in/up, profile, and password reset. |
| `src/contexts/AuthContext.tsx` | Decoupled completely from `@/lib/supabase`, delegating to `authService`. |
| `src/contexts/__tests__/AuthContext.test.tsx` | Refactored mock from `@/lib/supabase` to `@/services`. |
| `src/actions/checkout.ts` | Decoupled from `@/lib/supabase`, calling `invokeCheckoutSubmit` and `createMercadoPagoPayment`. |
| `src/actions/__tests__/checkout.test.ts` | Refactored mock from `@/lib/supabase` to `@/services`. |
| `src/services/orders.service.ts` | Exported typed `invokeCheckoutSubmit` edge function wrapper with clean typing. |
| `src/services/payments/mercadopago.service.ts` | Exported `createMercadoPagoPayment` wrapper. |
| `src/services/settings.service.ts` | Re-exported `isSupabaseConfigured` from service layer. |
| `src/App.tsx` | Decoupled from `@/lib/supabase`, importing `isSupabaseConfigured` from `@/services`. |
| `src/services/tracking.service.ts` | Added `insertConversationConversionEvent` database wrapper. |
| `src/services/__tests__/tracking.service.test.ts` | **NEW**: 7 unit tests covering telemetry and conversion event tracking. |
| `src/lib/conversion-measurement.ts` | Decoupled from `@/lib/supabase`, calling `tracking.service.ts`. |
| `src/services/inventory.service.ts` | Migrated from raw `fetch` to `supabase.functions.invoke('inventory-oracle', ...)`. |
| `src/services/__tests__/inventory.service.test.ts` | **NEW**: 4 unit tests covering success, error, and timeout paths for inventory oracle. |
| `src/services/monitoring.service.ts` | Hardened unmount channel removal, `TIMED_OUT` status, async rejections, and `'Anonimo'` fallback. |
| `src/components/admin/monitoring/LiveUsersPanel.tsx` | Updated anonymous check to recognize `'Anonimo'` and display neutral avatar. |
| `src/services/__tests__/monitoring.service.test.ts` | Added tests for channel unmount removal, `TIMED_OUT` error handling, and `'Anonimo'` fallback. |
| `src/services/wishlist.service.ts` | Added atomic batch upsert `addItemsToWishlist`. |
| `src/services/__tests__/wishlist.service.test.ts` | **NEW**: 11 unit tests covering all wishlist CRUD and batch upsert operations. |
| `src/stores/wishlist.store.ts` | Refactored `syncToDb` to use atomic batch `addItemsToWishlist`. |
| `src/stores/__tests__/wishlist.store.test.ts` | Updated tests to assert single batch call. |
| `supabase/functions/mercadopago-webhook/signed-request.ts` | Added case-insensitive parameter extraction, lowercase event normalization, and action payload inference. |
| `supabase/functions/mercadopago-webhook/__tests__/signed-request.test.ts` | Added 3 tests for case-insensitivity, duplicate parameters, and action payload inference (17/17 pass). |
| `src/services/__tests__/db-isolation-services.test.ts` | Expanded architectural isolation guard to cover contexts, actions, App.tsx, and measurement (24/24 pass). |
| `AI_CONTEXT.md` | Updated current repository baseline. |
| `AUDIT_LOG.md` | Appended audit entry and accepted lane. |

---

## 4. Verification Evidence Matrix

### 4.1 Unit Test Suite Execution
- **Command**: `npm run test:run`
- **Output**:
  - `Test Files: 155 passed (155)`
  - `Tests: 1132 passed (1132)`
  - `Duration: 41.00s`
  - Zero failing tests across the entire monorepo.

### 4.2 TypeScript Typecheck
- **Command**: `npm run typecheck` (`tsc --noEmit`)
- **Output**: Clean exit code 0, zero type errors.

### 4.3 Static Code Analysis / ESLint
- **Command**: `npm run lint` (`eslint . --max-warnings 500`)
- **Output**: Clean exit code 0, 0 errors, 323 warnings (within threshold, zero new warnings introduced).

### 4.4 Production Bundle Compilation & Artifacts
- **Command**: `npm run build`
- **Output**:
  - Vite build completed in 28.09s.
  - Image optimization savings: 192.63 kB (30% reduction).
  - Runtime build manifest generated: `v113-ea1e2cca`.
  - Sitemap generated: 20 static URLs.
  - Validation script `validate-release-artifacts.js`: Verified release artifacts.

### 4.5 Whitespace & Git Quality Check
- **Command**: `git diff --check`
- **Output**: Clean exit code 0, zero trailing blank lines or whitespace violations.

---

## 5. Non-Claims & Residual Risks
1. **Live Supabase Realtime Network Broadcasts**: Realtime presence channel subscription logic and unmount lifecycle management are verified through unit and isolation tests. End-to-end WebSocket transport behavior under multi-tenant production latency cannot be fully simulated without live infrastructure.
2. **Production Mercado Pago Key Exchange**: HMAC-SHA256 signature verification in `signed-request.ts` is fully tested with valid cryptographic vectors, expired timestamps, malformed headers, and duplicate parameters. Live production webhook delivery requires active Mercado Pago webhook triggers.
3. **Storage Quota on Legacy Mobile Browsers**: While `addItemsToWishlist` eliminates concurrent network connection exhaustion, extreme localStorage sizes (>5MB) on memory-constrained mobile devices are subject to browser-level storage quotas (already guarded by `safe-storage.ts`).
