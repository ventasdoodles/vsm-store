# VSM STORE - CURRENT TECHNICAL CANON

> Live current-state technical source of truth for VSM Store.
> This file is current-state-first. Full historical detail lives in `AUDIT_LOG.md`, `docs/audits/`, and `docs/archive/`.

## Source-Of-Truth Hierarchy
1. Current user prompt and explicit authoritative state.
2. Applicable project canon in this file, `AUDIT_LOG.md`, and `docs/audits/`.

## Current Repository Baseline
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
