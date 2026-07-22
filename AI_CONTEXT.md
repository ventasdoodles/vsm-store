# VSM STORE - CURRENT TECHNICAL CANON

> Live current-state technical source of truth for VSM Store.
> This file is current-state-first. Full historical detail lives in `AUDIT_LOG.md`, `docs/audits/`, and `docs/archive/`.

## Source-Of-Truth Hierarchy
1. Current user prompt and explicit authoritative state.
2. Applicable project canon in this file, `AUDIT_LOG.md`, and `docs/audits/`.

## Current Repository Baseline
- **Vitest Mock Centralization (`framer-motion`):** Centralized global `framer-motion` mock (including `m`, `motion`, `AnimatePresence`, `LazyMotion`) in `src/test/setup.ts` (`65ea054a`), eliminating 21 redundant local mocks and resolving 155 test regressions without TypeScript errors.
- **Modularization / God Class Eradication (2026-06-28):** The monolithic `orders.ts` (900 lines) and `product-search-capsule.ts` (1,990 lines) files were mechanically split into modular folders (`src/lib/domain/orders/` and `src/lib/domain/product-search/`). Separation was achieved via zero-token AST extraction (`ts-morph`) and TypeScript Language Service auto-imports. Compilation (`tsc --noEmit`) passes cleanly. VSM Workkit protocols are strictly enforced.

## Active Architecture
- **Framework:** Next.js / React (Storefront).
- **Backend:** Supabase (Database, Auth, Edge Functions).
- **Core AI:** Cesarin (AI Concierge powered by Gemini Edge Functions).
- **Payment:** Mercado Pago integration for checkout.
