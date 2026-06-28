# VSM Store — Audit Record: Browser UI Auth Smoke

**Date**: 2026-05-27
**Lane**: REAL-SYSTEM QA / ACCEPTANCE AUDIT
**Verdict**: ACCEPT

## Objective
Validate the end-to-end unauthenticated to authenticated order submission flow on the browser, ensuring guest users are intercepted, authenticated, and their order seamlessly resumed.

## Baseline
- App repo: `ivoy1.6`
- Connected environment: Supabase Dev (`inlvpbiphrrfrdvsadnh.supabase.co`)
- Test methodology: Automated Browser QA (Puppeteer)

## Findings
1. **Interception**: Guest users clicking "Confirmar Envío" on the order form successfully trigger an intercept, storing `pendingOrderDraft` in `sessionStorage` and redirecting to `/auth` with history state.
2. **Authentication**: The UI successfully allows users to authenticate using valid Supabase Auth credentials.
3. **Auto-resume**: Upon redirect back to the app (`App.tsx` mount), the `useEffect` safely reads the `pendingOrderDraft`, fires the API submission, and deletes the draft.
4. **Database Insertion**: Supabase correctly allowed the POST request. The Row Level Security (RLS) policy `(auth.uid() = user_id)` matched successfully, generating a UUID (e.g. `5e6e4378-062d-4553-91ca-5c6563e2b15f`).
5. **Confirmation**: App successfully redirects the user to `/order/[UUID]`.

## Residual Risks
- **Stale Drafts**: If a user abandons the login screen and returns days later, the session draft could theoretically be stale.
- **Duplicate Submissions**: Network instability during auto-resume might cause duplicate submissions (requires future debouncing).

## Excluded Scope
- Payment integrations.
- Rider assignment algorithms.
- Tracking or delivery lifecycle endpoints.
- Production environment or live user data.
