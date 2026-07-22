# VSM STORE - AUDIT INDEX

> Compact chronological index of accepted audits and canon lanes.
> Focused current audit details live under `docs/audits/`.

## Archive Rules
- Each new accepted lane gets one compact index entry here.
- Detailed evidence goes in `docs/audits/YYYY-MM/<lane>.md`.
- Current technical truth is summarized in `AI_CONTEXT.md`.

## Current Detailed Audit Files
- `docs/audits/2026-07/vitest-framer-motion-mock-repair.md` (Centralization of `framer-motion` mock in Vitest `src/test/setup.ts` including `m` export and cleanup of 21 redundant local mocks)
- `docs/audits/2026-06-28/god-classes-modularization.md` (Modularization of `orders.ts` and `product-search-capsule.ts` using zero-token AST extraction)

## Accepted Lanes (Chronological)
- **2026-07-22**: [ACCEPT] Centralization of `framer-motion` Vitest mock (`m` export) in `src/test/setup.ts` and cleanup of 21 test files (`65ea054a`). 155 framer-motion test regressions resolved, 0 TS errors (`tsc --noEmit`).
- **2026-06-28**: [ACCEPT] Modularization of God Classes (`orders.ts` and `product-search-capsule.ts`) into `src/lib/domain/orders/` and `src/lib/domain/product-search/` using AST split. Zero functional drift validated via `tsc --noEmit`.
