# VSM STORE - AUDIT INDEX

> Compact chronological index of accepted audits and canon lanes.
> Focused current audit details live under `docs/audits/`.

## Archive Rules
- Each new accepted lane gets one compact index entry here.
- Detailed evidence goes in `docs/audits/YYYY-MM/<lane>.md`.
- Current technical truth is summarized in `AI_CONTEXT.md`.

## Current Detailed Audit Files
- `docs/audits/2026-07/checkout-page-modularization.md` (Modularization of monolithic `Checkout.tsx` layout from 320 to 144 lines into 4 domain subcomponents under `src/components/checkout/`)
- `docs/audits/2026-07/client-secrets-and-dependencies-security.md` (Audit of client bundle secrets isolation and resolution of 13 dependency security advisories via `npm audit fix`)
- `docs/audits/2026-07/ai-capsule-orchestrator-modularization.md` (Modularization of monolithic `ai-capsule-orchestrator.service.ts` from 1,684 to 6 lines delegating to `src/services/ai-capsules/` domain submodules)
- `docs/audits/2026-07/router-code-splitting-optimization.md` (Code-splitting optimization with lazy `AdminApp` and root `<Suspense>` fallback boundary)
- `docs/audits/2026-07/concierge-service-modularization.md` (Modularization of monolithic `concierge.service.ts` from 2,156 to 24 lines delegating to `src/services/concierge/` domain submodules)
- `docs/audits/2026-07/vitest-framer-motion-mock-repair.md` (Centralization of `framer-motion` mock in Vitest `src/test/setup.ts` including `m` export and cleanup of 21 redundant local mocks)
- `docs/audits/2026-06-28/god-classes-modularization.md` (Modularization of `orders.ts` and `product-search-capsule.ts` using zero-token AST extraction)

## Accepted Lanes (Chronological)
- **2026-07-22**: [ACCEPT] Modularization of `Checkout.tsx` layout (320 -> 144 lines) into `src/components/checkout/` (`26eb3839`). 6/6 tests pass, 0 TS errors (`tsc --noEmit`).
- **2026-07-22**: [ACCEPT] Client secrets isolation audit & dependency security patching (`416ea271`). Resolved 13 advisories (`protobufjs`, `tar`, `undici`, `vite`), 0 TS errors (`tsc --noEmit`).
- **2026-07-22**: [ACCEPT] Modularization of `ai-capsule-orchestrator.service.ts` (1,684 -> 6 lines) delegating to `src/services/ai-capsules/` (`a98894fd`). 15/15 AI capsule tests pass, 0 TS errors (`tsc --noEmit`).
- **2026-07-22**: [ACCEPT] Test mock stabilization in `admin-orders.service.test.ts` and `AIConcierge.test.tsx` (`cc688428`). 37/37 tests pass, 0 TS errors (`tsc --noEmit`).
- **2026-07-22**: [ACCEPT] Code-splitting & root Suspense optimization in `src/router.tsx` (`b0a9e108`). `AdminApp` dynamic import, production build verified (`v113-b0a9e108`), 0 TS errors (`tsc --noEmit`).
- **2026-07-22**: [ACCEPT] Modularization of `concierge.service.ts` (2,156 -> 24 lines) delegating to `src/services/concierge/` (`7d3a37cb`). 49/49 Cesarin tests pass, 0 TS errors (`tsc --noEmit`).
- **2026-07-22**: [ACCEPT] Centralization of `framer-motion` Vitest mock (`m` export) in `src/test/setup.ts` and cleanup of 21 test files (`65ea054a`). 155 framer-motion test regressions resolved, 0 TS errors (`tsc --noEmit`).
- **2026-06-28**: [ACCEPT] Modularization of God Classes (`orders.ts` and `product-search-capsule.ts`) into `src/lib/domain/orders/` and `src/lib/domain/product-search/` using AST split. Zero functional drift validated via `tsc --noEmit`.
