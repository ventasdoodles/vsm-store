# Acceptance Audit: Profile History Auth Hang Fix

## Core Details
* **Date**: 2026-05-29
* **Repo**: `ivoy1.6`
* **Commit**: `89988bf fix(auth): prevent infinite hang on Verificando acceso screen`
* **Files Modified**: 
  * `hooks/useAuth.tsx`
  * `components/ProtectedRoute.tsx`
* **Codex Verdict**: ACCEPT WITH RESIDUAL RISK

## Context
A recurring bug left the client app indefinitely stuck on the "Verificando acceso..." screen, specifically noted on the `/profile?tab=history` route. Antigravity diagnosed that `useAuthContext().isLoading` remained `true` due to a debounced `fetchProfile` call failing to clear the loading state when suspended indefinitely by network or browser conditions. 

## Safety Findings
- **Plausible Root Cause**: The diagnosis is valid based on React 18 / Supabase asynchronous patterns. A dropped or stalled API promise within the debouncer would keep `isLoading` true infinitely.
- **`useAuth.tsx` Safety**: A 5-second `setTimeout` guarantees that the loading state gets cleared even if `fetchProfile` hangs. It safely bounds the initial wait time. It clears itself upon `finally`, and respects the `isMounted` guard to avoid memory leaks.
- **`ProtectedRoute.tsx` Safety**: An 8-second escape hatch was added to display a "La verificación está tardando demasiado" error and a "Recargar página" button. This overrides the spinner without bypassing the auth boundary. Unresolved sessions *do not* render protected children.
- **Auth Preservation**: The fix is auth-adjacent and strictly frontend-only. No localStorage inspection, token extraction, or backend schema mutations occurred. 

## Validation Performed
- `git status -sb` and `git show --stat HEAD` confirmed scope was restricted entirely to the two frontend component files.
- `npx tsc --noEmit` passed with 0 errors.

## Residual Risks
- **Browser QA Required**: Direct manual browser QA of the `/profile?tab=history` reload button state is unproven.
- **Late Resolution Race**: The timeout mechanism creates a known but safe architectural artifact where `fetchProfile` could resolve *after* the 5-second threshold, technically returning state updates while the user is redirected to the Auth screen.

## Non-Claims
- This does not prove the exact network sequence that caused the underlying hang.
- This does not claim all profile or auth issues are resolved.
- This does not claim production readiness or full PWA offline resiliency.
