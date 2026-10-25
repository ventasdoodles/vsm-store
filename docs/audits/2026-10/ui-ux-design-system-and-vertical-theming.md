# VSM STORE - UI/UX DESIGN SYSTEM, FRAMEWORK REUSABILITY & VERTICAL THEMING CHARTER
**Date**: 2026-10-24  
**Lane**: `ui-ux-design-system-and-vertical-theming`  
**Scope**: Full Storefront & Admin UI/UX Normalization, Design Tokens, Primitive Component Framework, Iconography Scale, and Dynamic Multi-Vertical Theme Engine  
**Status**: COMPLETED & VERIFIED (All 5 Milestones Passed 100%)

---

## 1. Lane Vision & Objectives

VSM Store is designed as a **multi-vertical e-commerce engine** configurable for any industry (Vape, 420/Herbal, Autoparts, Electronics, Fashion, etc.). To deliver a cohesive, premium, and fully customizable experience, this lane establishes:

1. **Strict Design Tokens Foundation**:
   - Zero hardcoded hex colors (`[#...]` or `style={{ color }}`).
   - Zero arbitrary pixel values (`w-[...]`, `h-[...]`, `blur-[...]`, `text-[...]`).
   - Unified `borderRadius` scale without property clobbering.
   - Semantic color system based on CSS Custom Properties (`--bg-primary`, `--accent-primary`, `--accent-secondary`, `--border-primary`, etc.).

2. **Primitive Component Framework (Universal Reusability)**:
   - Enforce usage of atomic components (`<Button>`, `<Heading>`, `<Card>`, `<Input>`, `<Badge>`).
   - Eradicate inline "utility-soup" class duplication across storefront and admin views.
   - Estandarizar layout containers (`container-storefront`, `container-admin`).

3. **Iconography & Visual Hierarchy Scale**:
   - Standardize all `lucide-react` icons to fixed scale (`size-3.5`, `size-4`, `size-5`, `size-6`, `size-8`).
   - Consistent stroke widths (`stroke-1.5` / `stroke-2`) avoiding visual clutter.

4. **Multi-Vertical Dynamic Theme Engine**:
   - Runtime Theme Injector allowing the store owner to select pre-configured industry themes or define custom brand colors directly from `store_settings`:
     - **Vape Neon**: Electric Blue (`#3b82f6`) & Cyan/Violet (`#8b5cf6`).
     - **Herbal / 420**: Emerald (`#10b981`) & Forest/Gold (`#059669`).
     - **Amber Motor / Industrial**: Amber Racing (`#f59e0b`) & Fire Orange (`#ea580c`).
     - **Monochrome Minimal**: Clean Zinc & Titanium.
     - **Cyber Crimson**: Crimson & Obsidian Dark.
     - **Custom**: User-defined RGB tokens applied to root CSS variables.

---

## 2. WorkKit Skill & Audit Procedure

The formal audit procedure is codified in:
👉 [`.vsm-workkit/skills/vsm-ui-framework-audit/SKILL.md`](file:///c:/dev/vsm-store-fresh/.vsm-workkit/skills/vsm-ui-framework-audit/SKILL.md)

### Verification Gates:
- Static AST/Regex scan for arbitrary brackets (`[#...]`, `[...px]`).
- TypeScript strict typecheck (`tsc --noEmit`).
- Vitest unit/integration test suites (155+ suites, 1,130+ tests).
- VSM Gate `canon` and `implementation` lanes.

---

## 3. Milestones & Implementation Roadmap

- [x] **Milestone 1: Skill Creation & Token Foundation**
  - Author and register `vsm-ui-framework-audit` skill.
  - Fix clobbered `borderRadius` key in `tailwind.config.js`.
  - Add semantic `maxWidth` tokens (`admin`, `storefront`).
  - Normalize `src/index.css` (.vsm-pill, .vsm-tag, .vsm-label, .container-admin).
- [x] **Milestone 2: Multi-Vertical Theme Engine Architecture**
  - Create `src/lib/theme/` (`types.ts`, `presets.ts`, `theme-injector.ts`, `index.ts`).
  - Implement 5 standard industry palettes: `vape-neon`, `herbal-420`, `amber-motor`, `monochrome-minimal`, `cyber-crimson` + `custom`.
  - Provide reactive `useTheme()` in `src/contexts/ThemeContext.tsx` with zero regression.
  - Mount visual interactive `ThemeCustomizationSettings.tsx` in Admin OS settings.
- [x] **Milestone 3: Admin OS UI Normalization**
  - Migrate all admin pages with `max-w-[1400px]` to `.container-admin` (6 pages).
  - Purge hardcoded `vape-` classes from `AdminLayout.tsx` replacing with semantic `accent-primary` / `accent-secondary` tokens.
  - Replace arbitrary `blur-[...px]` and dimension brackets with semantic design tokens.
- [x] **Milestone 4: Storefront UI/UX Normalization**
  - Swept 100% of arbitrary pixel dimensions (`w-[...px]`, `h-[...px]`, `blur-[...px]`, `[#...]`) across Storefront.
  - Replaced hardcoded vertical colors with semantic theme tokens in `Footer`, `BrandsCarousel`, `TrustBadges`, `WheelInvitation`, `AIConcierge`, and loaders.
  - Standardized Lucide iconography and typography scale.
- [x] **Milestone 5: Verification & Production Release**
  - Quick test suite pass: 83/83 files, 787/787 tests green.
  - Full test suite run: 157/157 files, 1,148/1,148 tests green.
  - TypeScript compiler: 0 errors (`tsc --noEmit`).
  - Production build: `npm run build` cleanly bundled and release artifacts validated.

---

## 4. Verification Evidence

```bash
# 1. Arbitrary Brackets Scan
$ git grep "px\]" src/        # 0 matches
$ git grep "blur-\[" src/     # 0 matches
$ git grep "\[#" src/         # 0 matches
$ git grep "max-w-\[1400px\]" # 0 matches

# 2. Test Execution
$ npm run test:run
Test Files  157 passed (157)
     Tests  1148 passed (1148)

# 3. TypeScript Compilation
$ npx tsc --noEmit            # 0 errors

# 4. Production Build
$ npm run build               # Exit code 0, artifacts verified
```
