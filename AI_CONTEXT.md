# VSM STORE - CURRENT TECHNICAL CANON

> Live current-state technical source of truth for VSM Store.
> This file is current-state-first. Full historical detail lives in `AUDIT_LOG.md`, `docs/audits/`, and `docs/archive/`.

## Source-Of-Truth Hierarchy
1. Current user prompt and explicit authoritative state.
2. Applicable project canon in this file, `AUDIT_LOG.md`, and `docs/audits/`.

## Current Repository Baseline
- **Full Vitest UI & Router Suite Stabilization (2026-09-02):** Healed 99 previously failing UI tests across 32 files. Restored partial mocking with `importOriginal` for `VerticalPackContext` in `src/test/setup.ts`, engineered `TestRouterContext` in `src/lib/test-router.tsx` to handle parameter and route extraction, and provided resilient `@tanstack/react-router` hook bridges (`useLocation`, `useParams`, `useMatch`). Entire repository passes 100% of tests (145/145 test files, 926/926 tests) with 0 TypeScript errors.
- **Work-Kit Sanitation & GitHub Actions Quota Optimization (2026-09-02):** Purged 137 legacy Ya VOY delivery audits (777 KB) into archive, cleaned delivery residues across workkit docs, and unified all skills under `.vsm-workkit/skills/`. Optimized `deploy-functions.yml` with diff-based deployments (deploying only changed functions instead of all 15 sequentially) and concurrency cancellation. Tiered testing (`npm run test:core`, `npm run test:ui`, `npm run test:quick`) with 73/73 core test suites passing (626/626 tests) and 0 TypeScript errors.
- **Checkout Page Modularization (`Checkout.tsx`):** Refactored the monolithic 320-line `Checkout.tsx` file (`26eb3839`) down to 144 lines by extracting 4 domain subcomponents under `src/components/checkout/` (`CheckoutHeader.tsx`, `CheckoutMobileSummary.tsx`, `CheckoutDesktopSummary.tsx`, `CheckoutBlockedState.tsx`), passing 6/6 tests without TypeScript errors.
- **Client Secrets & Dependency Security (`package-lock.json`):** Conducted static client bundle secrets audit (`dc17da64`, 0 service role/secret leaks found) and applied non-breaking security patches via `npm audit fix` (`416ea271`), resolving 13 security advisories including critical vulnerabilities in `protobufjs`, `tar`, `undici`, `ws`, and `vite`.
- **AI Capsule Orchestrator Modularization (`ai-capsule-orchestrator.service.ts`):** Eradicated the monolithic 1,684-line `ai-capsule-orchestrator.service.ts` file (`a98894fd`) by delegating all 11 AI Capsule executors to domain sub-modules in `src/services/ai-capsules/`, reducing the facade file to 6 lines while passing 15/15 capsule tests without TypeScript errors.
- **Router Code-Splitting & Performance (`src/router.tsx`):** Converted `AdminApp` to dynamic `React.lazy()` import (`b0a9e108`) and added root `<Suspense fallback={<RootPageLoader />}>` boundary to prevent storefront customers from downloading admin assets on initial page load. Production bundle build verified (`v113-b0a9e108`).
- **Concierge Service Modularization (`concierge.service.ts`):** Eradicated the monolithic 2,156-line `concierge.service.ts` file (`7d3a37cb`) by delegating all operations to domain sub-modules in `src/services/concierge/` (`chat.ts`, `search.ts`, `preferences.ts`, `helpers.ts`, `types.ts`, `telemetry.ts`), reducing the facade file to 24 lines while passing 49/49 tests without TypeScript errors.
- **Vitest Mock Centralization (`framer-motion`):** Centralized global `framer-motion` mock (including `m`, `motion`, `AnimatePresence`, `LazyMotion`) in `src/test/setup.ts` (`65ea054a`), eliminating 21 redundant local mocks and resolving 155 test regressions without TypeScript errors.
- **Modularization / God Class Eradication (2026-06-28):** The monolithic `orders.ts` (900 lines) and `product-search-capsule.ts` (1,990 lines) files were mechanically split into modular folders (`src/lib/domain/orders/` and `src/lib/domain/product-search/`). Separation was achieved via zero-token AST extraction (`ts-morph`) and TypeScript Language Service auto-imports. Compilation (`tsc --noEmit`) passes cleanly. VSM Workkit protocols are strictly enforced.

## Active Architecture
- **Framework:** Next.js / React (Storefront).
- **Backend:** Supabase (Database, Auth, Edge Functions).
- **Core AI:** Cesarin (AI Concierge powered by Gemini Edge Functions).
- **Payment:** Mercado Pago integration for checkout.
