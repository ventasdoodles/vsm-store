# Storefront AI Pilot Context

Tactical guide for the controlled rollout of the Cesarín AI assistant.

## Current Status
- **Phase:** Pilot Readiness (Restricted Exposure)
- **Status:** READY FOR OPERATIONAL PILOT
- **Slices Completed:** 1A, 1B, 1C, 2A, 2B, 2C

## Visibility Rules (Dual Gate)
The assistant appears in the storefront IFF BOTH are true:
1. **Global Kill Switch:** Enabled in Admin (Cesarin OS Header).
2. **Pilot Session Gate:** Activated per browser via URL param.

## Pilot Activation Steps
To enable the assistant for testing or a specific pilot user:
1. Open the storefront URL.
2. Append `?pilot=cesarin` to the path (e.g., `vsm-store.com/?pilot=cesarin`).
3. The parameter clears automatically, but access is persisted in `sessionStorage`.

## Recommended Manual Pilot Flow
1. **Activate:** Use the pilot URL param.
2. **Interact:** Test commercial inquiries (vapes, extracts, stock).
3. **Verify:** Check if the assistant follows the Sommelier persona rules.
4. **Audit:** Go to Admin > Cesarin OS > Piloto Operativo and log the pass/fail result.

## Known Constraints
- **Quota/Latency:** Free tier Gemini API may experience 429 errors or latency spikes.
- **Memory:** Session-only history; closing the tab or clearing session data resets context.

## Non-Negotiable Rules
- **DO NOT** disable the pilot gate for all users without high-level approval.
- **DO NOT** hardcode the pilot bypass in `App.tsx`.
- **DO NOT** leak raw technical error messages to the customer.

## Next Recommended Slice
- **Slice 2D — Storefront Degraded Experience Hardening:** Improve loading/failure UX for better pilot resilience.
