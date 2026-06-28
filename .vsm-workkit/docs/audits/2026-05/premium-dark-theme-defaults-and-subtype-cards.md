# Audit Log — Premium Dark Theme Defaults & Subtype Cards Visual Fix

* **Date**: 2026-05-29
* **Lane**: Premium Dark Theme Defaults & Subtype Cards Visual Fix
* **Verdict**: ACCEPT WITH RESIDUAL RISK

## Accepted Commit
* **Repository**: `F:\ivoy\ivoy1.6`
* **Commit**: `b392ecc58c5bf9343c7c88bdda4bda802143d8e3`
* **Message**: `fix(ui): stabilize premium dark theme defaults and subtype cards`

## Files Modified
* `components/SubtypeSelector.tsx`
* `contexts/BrandContext.tsx`

---

## 1. Subtype Cards Styling Mitigation
* **Finding**: The subtype selection buttons (used in flows such as Mensajería and Compras) previously used dynamic variables `bg-[var(--bg-secondary)]` and `border-[var(--border-color)]` for unselected options. When a light theme was loaded, these unselected cards turned flat white, resulting in invisible white-on-white text since the text was hardcoded to `text-white`.
* **Mitigation**: `SubtypeSelector.tsx` was refactored to replace light-theme variable dependencies with stable premium dark glassmorphism styling (`bg-[#0D111A]/85` with `backdrop-blur-xl` and `border-[#1479FF]/20`) and readable slate-gray description text (`text-slate-300`). Unselected buttons remain highly visible and contrastive under any theme fallback. Selected option state styles remain untouched.

## 2. Dynamic Default Theme Alignment
* **Finding**: `BrandContext.tsx` hardcoded light-theme settings (`background_color: '#f9fafb'`, `text_color: '#111827'`) in `DEFAULT_BRAND_SETTINGS`. During page mount, offline states, or slow database fetch queries, the provider fell back to this light config and cleared the `.dark` class from `document.documentElement`, triggering a flash of light mode.
* **Mitigation**: Updated the `DEFAULT_BRAND_SETTINGS` properties to enforce dark mode defaults (`background_color: '#080B11'`, `text_color: '#ffffff'`, and `sidebar_color: '#0D111A'`). This significantly reduces the risk of fallback flashes, aligning the initial render with the agreed Premium Dark Mobile App visual star. Dynamic Supabase remote settings still override defaults successfully when loaded.

---

## 3. Validation Performed
* **TypeScript Compilation**: `npx tsc --noEmit` completed successfully with zero compilation warnings or type errors.
* **Git Sanitation**: Staged changes were reviewed using git status and diff commands to verify only intended frontend source code was adjusted.

---

## 4. Residual Risks
* **Browser Visual QA Pending**: Visual E2E verification remains required/unproven for PWA mount flashes, PWA cache transitions, mobile viewport card rendering, subtype card readability, and dynamic theme overrides.
* **Database Dynamic Theme Overrides**: Dynamic custom theme settings fetched from the database will still override these defaults by intended design. If database settings are poorly configured (e.g. set to light or low-contrast values), visual styling regressions could theoretically reappear.
* **Mitigation Scoping**: This is a source/typecheck accepted mitigation, not a universal proof of absolute visual stability across every hardware, PWA, or browser state.

---

## 5. Non-Claims
* No DB migrations, schema adjustments, or RLS policies were modified.
* No changes to administrative operations modules, orders table inserts, or realtime publications.
* No payment sweeps, withdrawals, real-rider logistics, GPS coordinates tracking, or WhatsApp link triggers were touched.
* Do not claim all white-labeling or theming issues are completely eliminated.
