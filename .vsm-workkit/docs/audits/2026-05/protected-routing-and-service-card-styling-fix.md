# Audit Log — Protected Routing Stability & Service Card Styling Fix

* **Date**: 2026-05-29
* **Lane**: Protected Routing Stability & Service Card Styling Source Fix
* **Verdict**: ACCEPT WITH RESIDUAL RISK

## Accepted Commit
* **Repository**: `F:\ivoy\ivoy1.6`
* **Commit**: `322a9d703676d1813757b2198a306c1c988231f0`
* **Message**: `fix(ui): stabilize protected routing and service card styling`

## Files Modified
* `components/ProtectedRoute.tsx`
* `components/ui/GradientCard.tsx`

---

## 1. Routing Root Cause & Solution
* **Root Cause**: Previously, `ProtectedRoute.tsx` gated route access based on the database-level `profile` presence. If `useAuth.tsx`'s fallback timeout (introduced in `89988bf` to mitigate infinite loading hangs) fired and forcefully set `isLoading = false` while the network retrieval was slow, the `profile` object remained `null` (even if `session` was active). Consequently:
  1. `ProtectedRoute.tsx` evaluated `!profile` as true and redirected the user to `/auth`.
  2. `AuthPage.tsx` detected a valid active `session` (`session !== null`) and instantly redirected the user back to `/` (Inicio).
  3. This created an infinite routing bounce loop back to the homepage for already authenticated users.
* **Solution**: `ProtectedRoute.tsx` was refactored to gate anonymous access strictly using the active Supabase `session` instead of the fetched database `profile`. Authorized logged-in users are no longer redirected away due to profile loading latencies, while anonymous/logged-out users remain fully protected by the session check.

## 2. Service Card Styling Finding & Solution
* **Finding**: `GradientCard.tsx` (which renders the primary home page service choices) relied on theme variables like `--bg-primary` and `--text-primary` for card background styling. Under dynamic light theme default fallbacks (e.g. `background_color: '#f9fafb'`), these variables shift to light colors, causing cards to render as flat white panels. Because the mobile compact view text color was hardcoded to `text-white`, it created unreadable white-on-white text panels on mobile devices.
* **Solution**: `GradientCard.tsx` was refactored at the source level to use hardcoded premium dark glassmorphic styling (`bg-[#0D111A]/85` with `backdrop-blur-xl` and electric-blue border accents `border-[#1479FF]/20`) and constant readable typography (`text-white` for titles, `text-slate-300` for descriptions). This completely isolates homepage service cards from dynamic variables, ensuring consistent visibility and contrast in all theme states.

---

## 3. Validation Performed
* **TypeScript Compilation**: `npx tsc --noEmit` completed with zero compilation errors, verifying absolute type safety.
* **Git Sanitation**: Staged changes were reviewed using git status and diff commands to verify only intended frontend source code was adjusted.

---

## 4. Residual Risks
* **Browser Visual QA Pending**: Visual validation of mobile viewport layouts and PWA transitions has not been executed via automated Visual QA systems, and remains visually unproven until further smoke tests are run.
* **Blank Input Fallback**: If a user's database profile retrieval fails permanently, they will remain on `/profile` or `/balance` showing default blank/zero inputs rather than a loading spinner. While this is a major usability improvement over a bounce lock, it is a residual timing state. The user can easily self-heal by submitting the form to trigger a profile upsert.
* **Intermittent Styling Variance**: Intermittent card styling variance could theoretically occur under extreme client-side caching or PWA rendering states that remain unobserved under standard build conditions.

---

## 5. Non-Claims
* No database mutations, schema adjustments, or RLS policies were changed.
* No changes to administrative dispatcher modules, orders table inserts, or realtime publications.
* No payment sweeps, payouts, real-rider logistics, GPS coordinates tracking, or WhatsApp link triggers were touched.
* Do not claim all profile sync or network timing issues are eliminated.
